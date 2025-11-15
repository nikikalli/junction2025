import swat
import requests
import os
from dotenv import load_dotenv
import pandas as pd

load_dotenv()


class AdvancedCampaignAnalytics:
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

    def analyze_segment_consistency(self):
        print("Analyzing segment response consistency...")
        self.conn.fedsql.execdirect(query='''
            CREATE TABLE segment_consistency AS
            SELECT
                segment_id,
                COUNT(DISTINCT campaign_id) AS campaigns_reached,
                AVG(conversion_rate) AS avg_conversion,
                STDDEV(conversion_rate) AS conversion_volatility,
                AVG(engagement_rate) AS avg_engagement,
                STDDEV(engagement_rate) AS engagement_volatility,
                MIN(conversion_rate) AS min_conversion,
                MAX(conversion_rate) AS max_conversion,
                (1 - STDDEV(conversion_rate) / NULLIF(AVG(conversion_rate), 0)) AS consistency_score
            FROM campaign_metrics
            GROUP BY segment_id
        ''')
        print("Segment consistency analyzed\n")

    def analyze_attribute_effectiveness(self):
        print("Analyzing campaign attribute effectiveness...")
        self.conn.fedsql.execdirect(query='''
            CREATE TABLE attribute_effectiveness AS
            SELECT
                c.campaign_type,
                c.channel,
                c.message_sentiment,
                c.value_theme,
                COUNT(*) AS segment_count,
                AVG(m.conversion_rate) AS avg_conversion,
                AVG(m.engagement_rate) AS avg_engagement,
                AVG(m.sales_vs_benchmark) AS avg_vs_benchmark,
                STDDEV(m.conversion_rate) AS conversion_std,
                STDDEV(m.conversion_rate) / SQRT(COUNT(*)) AS std_error
            FROM campaign_metrics m
            JOIN campaigns c ON m.campaign_id = c.campaign_id
            GROUP BY c.campaign_type, c.channel, c.message_sentiment, c.value_theme
        ''')
        print("Attribute effectiveness analyzed\n")

    def analyze_interaction_effects(self):
        print("Analyzing interaction effects...")

        self.conn.fedsql.execdirect(query='''
            CREATE TABLE campaign_type_baseline AS
            SELECT
                c.campaign_type,
                AVG(m.conversion_rate) AS type_avg_conversion
            FROM campaign_metrics m
            JOIN campaigns c ON m.campaign_id = c.campaign_id
            GROUP BY c.campaign_type
        ''')

        self.conn.fedsql.execdirect(query='''
            CREATE TABLE channel_baseline AS
            SELECT
                c.channel,
                AVG(m.conversion_rate) AS channel_avg_conversion
            FROM campaign_metrics m
            JOIN campaigns c ON m.campaign_id = c.campaign_id
            GROUP BY c.channel
        ''')

        self.conn.fedsql.execdirect(query='''
            CREATE TABLE interaction_effects AS
            SELECT
                c.campaign_type,
                c.channel,
                COUNT(*) AS sample_size,
                AVG(m.conversion_rate) AS actual_conversion,
                AVG(m.engagement_rate) AS actual_engagement,
                tb.type_avg_conversion,
                cb.channel_avg_conversion,
                (tb.type_avg_conversion + cb.channel_avg_conversion) / 2 AS expected_conversion,
                AVG(m.conversion_rate) - ((tb.type_avg_conversion + cb.channel_avg_conversion) / 2) AS interaction_lift,
                (AVG(m.conversion_rate) - ((tb.type_avg_conversion + cb.channel_avg_conversion) / 2)) /
                    NULLIF(((tb.type_avg_conversion + cb.channel_avg_conversion) / 2), 0) * 100 AS interaction_lift_pct
            FROM campaign_metrics m
            JOIN campaigns c ON m.campaign_id = c.campaign_id
            JOIN campaign_type_baseline tb ON c.campaign_type = tb.campaign_type
            JOIN channel_baseline cb ON c.channel = cb.channel
            GROUP BY c.campaign_type, c.channel, tb.type_avg_conversion, cb.channel_avg_conversion
        ''')
        print("Interaction effects analyzed\n")

    def export_results(self):
        print("Exporting Phase 1 results...")

        consistency = self.conn.CASTable('segment_consistency').to_frame()
        consistency.columns = consistency.columns.str.lower()
        consistency.to_csv('data/output/segment_consistency.csv', index=False)
        print(f"✓ Exported segment_consistency.csv ({len(consistency)} segments)")

        effectiveness = self.conn.CASTable('attribute_effectiveness').to_frame()
        effectiveness.columns = effectiveness.columns.str.lower()
        effectiveness.to_csv('data/output/attribute_effectiveness.csv', index=False)
        print(f"✓ Exported attribute_effectiveness.csv ({len(effectiveness)} configurations)")

        interactions = self.conn.CASTable('interaction_effects').to_frame()
        interactions.columns = interactions.columns.str.lower()
        interactions.to_csv('data/output/interaction_effects.csv', index=False)
        print(f"✓ Exported interaction_effects.csv ({len(interactions)} combinations)\n")

    def print_insights(self):
        print("=" * 60)
        print("PHASE 1 INSIGHTS")
        print("=" * 60)

        consistency = self.conn.CASTable('segment_consistency').to_frame()
        consistency.columns = consistency.columns.str.lower()

        print("\n1. SEGMENT CONSISTENCY:")
        print(f"   High consistency (>0.7): {len(consistency[consistency['consistency_score'] > 0.7])} segments")
        print(f"   Low consistency (<0.3): {len(consistency[consistency['consistency_score'] < 0.3])} segments")
        print(f"\n   Most consistent segments:")
        top_consistent = consistency.nlargest(3, 'consistency_score')[['segment_id', 'consistency_score', 'avg_conversion']]
        for _, row in top_consistent.iterrows():
            print(f"   - Segment {int(row['segment_id'])}: {row['consistency_score']:.2f} consistency, {row['avg_conversion']:.2%} avg conversion")

        effectiveness = self.conn.CASTable('attribute_effectiveness').to_frame()
        effectiveness.columns = effectiveness.columns.str.lower()

        print("\n2. BEST PERFORMING CONFIGURATIONS:")
        top_configs = effectiveness.nlargest(3, 'avg_conversion')
        for _, row in top_configs.iterrows():
            print(f"   - {row['campaign_type']}/{row['channel']}/{row['message_sentiment']}/{row['value_theme']}")
            print(f"     Conversion: {row['avg_conversion']:.2%}, Engagement: {row['avg_engagement']:.2%}, vs Benchmark: {row['avg_vs_benchmark']:.2f}x")

        interactions = self.conn.CASTable('interaction_effects').to_frame()
        interactions.columns = interactions.columns.str.lower()

        print("\n3. STRONGEST INTERACTION EFFECTS:")
        top_interactions = interactions.nlargest(3, 'interaction_lift_pct')
        for _, row in top_interactions.iterrows():
            print(f"   - {row['campaign_type']} + {row['channel']}: {row['interaction_lift_pct']:.1f}% lift")
            print(f"     Expected: {row['expected_conversion']:.2%}, Actual: {row['actual_conversion']:.2%}")

        print("\n" + "=" * 60)

    def close(self):
        self.conn.close()


if __name__ == "__main__":
    try:
        analytics = AdvancedCampaignAnalytics()
        analytics.load_data()
        analytics.analyze_segment_consistency()
        analytics.analyze_attribute_effectiveness()
        analytics.analyze_interaction_effects()
        analytics.export_results()
        analytics.print_insights()
        analytics.close()
        print("\nPhase 1 Complete")
    except Exception as e:
        print(f"Error: {e}")
        print("\nSet env vars: VIYA_HOSTNAME, VIYA_CLIENT_ID, VIYA_CLIENT_SECRET")
