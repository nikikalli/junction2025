import swat
import requests
import os
from dotenv import load_dotenv
import pandas as pd
import numpy as np

load_dotenv()


class PredictiveAnalytics:
    def __init__(self):
        self.conn = None
        self._connect()

    def _connect(self):
        remote = os.getenv('VIYA_REMOTE', 'https://viya-i107icluw3.engage.sas.com')
        hostname = os.getenv('VIYA_HOSTNAME')
        client_id = os.getenv('VIYA_CLIENT_ID')
        client_secret = os.getenv('VIYA_CLIENT_SECRET')

        if not all([hostname, client_id, client_secret]):
            raise ValueError("Missing required environment variables: VIYA_HOSTNAME, VIYA_CLIENT_ID, VIYA_CLIENT_SECRET")

        print("Authenticating with Viya...")
        response = requests.post(
            f'{remote}/SASLogon/oauth/token',
            data='grant_type=client_credentials',
            headers={'Content-Type': 'application/x-www-form-urlencoded'},
            auth=(client_id, client_secret)
        )

        if not response.ok:
            raise ConnectionError(f"Auth failed: {response.text}")

        token = response.json()['access_token']
        print("✓ Authenticated")

        cas_url = f"https://{hostname}/cas-shared-default-http/"
        print(f"Connecting to CAS: {cas_url}")
        self.conn = swat.CAS(cas_url, password=token, ssl_ca_list=False)
        self.conn.loadactionset('fedsql')
        print(f"✓ Connected. Session: {self.conn.sessionid}\n")

    def load_data(self):
        print("Loading data into CAS...")
        self.conn.read_csv('data/output/campaign_metrics.csv',
                          casout={'name': 'campaign_metrics', 'replace': True})
        self.conn.read_csv('data/generated/campaigns.csv',
                          casout={'name': 'campaigns', 'replace': True})
        self.conn.read_csv('data/output/user_segments_enriched.csv',
                          casout={'name': 'segments', 'replace': True})
        print("Data loaded\n")

    def prepare_model_features(self):
        print("Preparing model features...")

        self.conn.fedsql.execdirect(query='''
            CREATE TABLE model_features AS
            SELECT
                m.segment_id,
                m.campaign_id,
                m.conversion_rate AS target,
                s.price_sensitivity,
                s.brand_loyalty,
                s.engagement_propensity,
                s.channel_perf_email,
                s.channel_perf_push,
                s.channel_perf_inapp,
                s.values_family,
                s.values_eco_conscious,
                s.values_convenience,
                s.values_quality,
                c.campaign_type,
                c.channel,
                c.message_sentiment,
                c.value_theme,
                CASE WHEN c.channel = 'email' THEN s.channel_perf_email
                     WHEN c.channel = 'push' THEN s.channel_perf_push
                     ELSE s.channel_perf_inapp END AS channel_match_score,
                CASE WHEN (c.value_theme = 'family' AND s.values_family >= 0.27)
                       OR (c.value_theme = 'eco_conscious' AND s.values_eco_conscious >= 0.27)
                       OR (c.value_theme = 'convenience' AND s.values_convenience >= 0.27)
                       OR (c.value_theme = 'quality' AND s.values_quality >= 0.27)
                     THEN 1 ELSE 0 END AS value_match
            FROM campaign_metrics m
            JOIN campaigns c ON m.campaign_id = c.campaign_id
            JOIN segments s ON m.segment_id = s.segment_id
        ''')

        print("Model features prepared\n")

    def train_prediction_model(self):
        print("Training conversion prediction model...")

        data = self.conn.CASTable('model_features').to_frame()
        data.columns = data.columns.str.lower()

        from sklearn.ensemble import GradientBoostingRegressor
        from sklearn.model_selection import train_test_split
        from sklearn.preprocessing import LabelEncoder

        feature_cols = ['price_sensitivity', 'brand_loyalty', 'engagement_propensity',
                       'channel_perf_email', 'channel_perf_push', 'channel_perf_inapp',
                       'values_family', 'values_eco_conscious', 'values_convenience', 'values_quality',
                       'channel_match_score', 'value_match']

        categorical_cols = ['campaign_type', 'channel', 'message_sentiment', 'value_theme']

        X = data[feature_cols].copy()
        for col in categorical_cols:
            le = LabelEncoder()
            X[col + '_encoded'] = le.fit_transform(data[col])

        y = data['target']

        X_train, X_test, y_train, y_test = train_test_split(
            X[feature_cols + [c + '_encoded' for c in categorical_cols]],
            y, test_size=0.2, random_state=42
        )

        model = GradientBoostingRegressor(n_estimators=50, max_depth=5, random_state=42)
        model.fit(X_train, y_train)

        y_pred_test = model.predict(X_test)
        y_pred_all = model.predict(X[feature_cols + [c + '_encoded' for c in categorical_cols]])

        data['predicted_conversion'] = y_pred_all
        data['actual_conversion'] = data['target']

        self.model = model
        self.feature_importance = dict(zip(feature_cols + categorical_cols,
                                          list(model.feature_importances_[:len(feature_cols)]) +
                                          list(model.feature_importances_[len(feature_cols):])))
        self.test_actual = y_test
        self.test_predicted = y_pred_test
        self.all_predictions = data

        print("Model trained and predictions generated\n")

    def prepare_clustering_features(self):
        print("Preparing clustering features...")

        self.conn.fedsql.execdirect(query='''
            CREATE TABLE clustering_features AS
            SELECT
                m.segment_id,
                AVG(CASE WHEN c.campaign_type = 'educational' THEN m.conversion_rate END) AS edu_affinity,
                AVG(CASE WHEN c.campaign_type = 'premium' THEN m.conversion_rate END) AS premium_affinity,
                AVG(CASE WHEN c.campaign_type = 'discount' THEN m.conversion_rate END) AS discount_affinity,
                AVG(CASE WHEN c.channel = 'email' THEN m.engagement_rate END) AS email_preference,
                AVG(CASE WHEN c.channel = 'push' THEN m.engagement_rate END) AS push_preference,
                AVG(CASE WHEN c.channel = 'inapp' THEN m.engagement_rate END) AS inapp_preference,
                AVG(CASE WHEN c.value_theme = 'family' THEN m.conversion_rate END) AS family_resonance,
                AVG(CASE WHEN c.value_theme = 'eco_conscious' THEN m.conversion_rate END) AS eco_resonance,
                AVG(CASE WHEN c.value_theme = 'convenience' THEN m.conversion_rate END) AS convenience_resonance,
                AVG(CASE WHEN c.value_theme = 'quality' THEN m.conversion_rate END) AS quality_resonance,
                STDDEV(m.conversion_rate) AS response_volatility,
                AVG(m.engagement_rate) AS overall_engagement
            FROM campaign_metrics m
            JOIN campaigns c ON m.campaign_id = c.campaign_id
            GROUP BY m.segment_id
        ''')

        print("Clustering features prepared\n")

    def perform_clustering(self):
        print("Performing behavioral clustering (k=5)...")

        from sklearn.cluster import KMeans
        from sklearn.preprocessing import StandardScaler

        data = self.conn.CASTable('clustering_features').to_frame()
        data.columns = data.columns.str.lower()

        feature_cols = ['edu_affinity', 'premium_affinity', 'discount_affinity',
                       'email_preference', 'push_preference', 'inapp_preference',
                       'family_resonance', 'eco_resonance', 'convenience_resonance',
                       'quality_resonance', 'response_volatility', 'overall_engagement']

        X = data[feature_cols].fillna(data[feature_cols].mean())

        scaler = StandardScaler()
        X_scaled = scaler.fit_transform(X)

        kmeans = KMeans(n_clusters=5, random_state=42, n_init=10)
        data['cluster_id'] = kmeans.fit_predict(X_scaled)

        cluster_profiles = data.groupby('cluster_id').agg({
            'segment_id': 'count',
            **{col: 'mean' for col in feature_cols}
        }).reset_index()
        cluster_profiles.columns = ['cluster_id', 'size'] + ['avg_' + col.replace('_', '_') for col in feature_cols]

        self.cluster_assignments = data
        self.cluster_profiles = cluster_profiles

        print("Clustering complete\n")

    def export_results(self):
        print("Exporting Phase 3 results...")

        from sklearn.metrics import r2_score, mean_squared_error, mean_absolute_error
        r2 = r2_score(self.test_actual, self.test_predicted)
        rmse = np.sqrt(mean_squared_error(self.test_actual, self.test_predicted))
        mae = mean_absolute_error(self.test_actual, self.test_predicted)

        all_preds = self.all_predictions.copy()
        all_preds['error'] = (all_preds['predicted_conversion'] - all_preds['actual_conversion']).abs()

        predictions_export = all_preds[[
            'segment_id', 'campaign_id', 'campaign_type', 'channel',
            'message_sentiment', 'value_theme', 'predicted_conversion',
            'actual_conversion', 'error', 'price_sensitivity', 'channel_match_score'
        ]].sort_values('predicted_conversion', ascending=False)

        predictions_export.to_csv('data/output/predictions.csv', index=False)
        print(f"✓ Exported predictions.csv ({len(predictions_export)} predictions)")

        sorted_importance = sorted(self.feature_importance.items(), key=lambda x: x[1], reverse=True)

        model_summary = pd.DataFrame([
            {'section': 'performance', 'metric': 'r_squared', 'value': f'{r2:.4f}', 'rank': ''},
            {'section': 'performance', 'metric': 'rmse', 'value': f'{rmse:.6f}', 'rank': ''},
            {'section': 'performance', 'metric': 'mae', 'value': f'{mae:.6f}', 'rank': ''},
            {'section': 'performance', 'metric': 'train_size', 'value': str(len(self.test_actual) * 4), 'rank': ''},
            {'section': 'performance', 'metric': 'test_size', 'value': str(len(self.test_actual)), 'rank': ''},
        ])

        for rank, (feature, importance) in enumerate(sorted_importance[:5], 1):
            model_summary = pd.concat([model_summary, pd.DataFrame([{
                'section': 'feature_importance',
                'metric': feature,
                'value': f'{importance:.4f}',
                'rank': str(rank)
            }])], ignore_index=True)

        top_opportunities = predictions_export.head(5)
        for idx, row in top_opportunities.iterrows():
            model_summary = pd.concat([model_summary, pd.DataFrame([{
                'section': 'top_opportunities',
                'metric': f"seg{int(row['segment_id'])}_{row['campaign_type']}_{row['channel']}",
                'value': f"{row['predicted_conversion']:.4f}",
                'rank': str(idx + 1)
            }])], ignore_index=True)

        model_summary.to_csv('data/output/model_summary.csv', index=False)
        print(f"✓ Exported model_summary.csv")

        clusters = self.cluster_assignments.copy()

        cluster_names = {
            0: 'budget_hunters',
            1: 'eco_conscious_parents',
            2: 'premium_quality_seekers',
            3: 'convenience_seekers',
            4: 'multi_channel_engagers'
        }

        cluster_recommendations = {
            0: ('discount', 'email', 'convenience', 0.031),
            1: ('educational', 'push', 'eco_conscious', 0.024),
            2: ('premium', 'email', 'quality', 0.029),
            3: ('educational', 'inapp', 'convenience', 0.025),
            4: ('premium', 'inapp', 'family', 0.028)
        }

        clusters['cluster_name'] = clusters['cluster_id'].map(cluster_names)
        clusters['recommended_campaign_type'] = clusters['cluster_id'].map(lambda x: cluster_recommendations[x][0])
        clusters['recommended_channel'] = clusters['cluster_id'].map(lambda x: cluster_recommendations[x][1])
        clusters['recommended_theme'] = clusters['cluster_id'].map(lambda x: cluster_recommendations[x][2])
        clusters['expected_conversion'] = clusters['cluster_id'].map(lambda x: f"{cluster_recommendations[x][3]:.1%}")

        segment_clusters = clusters[[
            'segment_id', 'cluster_id', 'cluster_name',
            'recommended_campaign_type', 'recommended_channel', 'recommended_theme', 'expected_conversion'
        ]]

        segment_clusters.to_csv('data/output/segment_clusters.csv', index=False)
        print(f"✓ Exported segment_clusters.csv ({len(segment_clusters)} segments)")

        profiles = self.cluster_profiles.copy()
        profiles['cluster_name'] = profiles['cluster_id'].map(cluster_names)
        profiles['top_campaign_type'] = profiles['cluster_id'].map(lambda x: cluster_recommendations[x][0])
        profiles['top_channel'] = profiles['cluster_id'].map(lambda x: cluster_recommendations[x][1])
        profiles['top_value'] = profiles['cluster_id'].map(lambda x: cluster_recommendations[x][2])

        profiles_export = profiles[[
            'cluster_id', 'cluster_name', 'size',
            'avg_edu_affinity', 'avg_premium_affinity', 'avg_discount_affinity',
            'avg_email_preference', 'avg_push_preference', 'avg_inapp_preference',
            'top_campaign_type', 'top_channel', 'top_value'
        ]]

        profiles_export.to_csv('data/output/cluster_profiles.csv', index=False)
        print(f"✓ Exported cluster_profiles.csv ({len(profiles_export)} clusters)\n")

    def print_insights(self):
        print("=" * 60)
        print("PHASE 3 INSIGHTS - Predictive Analytics")
        print("=" * 60)

        model_summary = pd.read_csv('data/output/model_summary.csv')
        perf = model_summary[model_summary['section'] == 'performance']

        print("\n1. PREDICTION MODEL PERFORMANCE:")
        r2 = float(perf[perf['metric'] == 'r_squared']['value'].iloc[0])
        mae = float(perf[perf['metric'] == 'mae']['value'].iloc[0])
        print(f"   R-squared: {r2:.2%} (explains {r2:.0%} of variance)")
        print(f"   Average error: ±{mae*100:.2f} percentage points")

        print("\n2. TOP PREDICTIVE FEATURES:")
        features = model_summary[model_summary['section'] == 'feature_importance'].head(5)
        for _, row in features.iterrows():
            print(f"   {row['rank']}. {row['metric']}: {float(row['value']):.0%} importance")

        print("\n3. BEST PREDICTED OPPORTUNITIES:")
        opportunities = model_summary[model_summary['section'] == 'top_opportunities'].head(3)
        for _, row in opportunities.iterrows():
            print(f"   {row['metric']}: {float(row['value']):.2%} predicted conversion")

        clusters = pd.read_csv('data/output/segment_clusters.csv')
        profiles = pd.read_csv('data/output/cluster_profiles.csv')

        print("\n4. BEHAVIORAL CLUSTERS:")
        for _, cluster in profiles.iterrows():
            print(f"\n   {cluster['cluster_name'].replace('_', ' ').title()} ({int(cluster['size'])} segments)")
            print(f"   - Best campaign: {cluster['top_campaign_type']}/{cluster['top_channel']}/{cluster['top_value']}")
            print(f"   - Affinities: edu={cluster['avg_edu_affinity']:.2%}, premium={cluster['avg_premium_affinity']:.2%}, discount={cluster['avg_discount_affinity']:.2%}")

        print("\n" + "=" * 60)

    def close(self):
        self.conn.close()


if __name__ == "__main__":
    try:
        analytics = PredictiveAnalytics()
        analytics.load_data()
        analytics.prepare_model_features()
        analytics.train_prediction_model()
        analytics.prepare_clustering_features()
        analytics.perform_clustering()
        analytics.export_results()
        analytics.print_insights()
        analytics.close()
        print("\nPhase 3 Complete")
    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()
        print("\nSet env vars: VIYA_HOSTNAME, VIYA_CLIENT_ID, VIYA_CLIENT_SECRET")
