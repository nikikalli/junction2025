import swat
import requests
import os
from dotenv import load_dotenv
import pandas as pd

load_dotenv()


class CrossCampaignAnalytics:
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

    def analyze_campaign_type_affinity(self):
        print("Analyzing campaign type affinity...")
        self.conn.fedsql.execdirect(query='''
            CREATE TABLE campaign_type_affinity AS
            SELECT
                m.segment_id,
                AVG(CASE WHEN c.campaign_type = 'educational' THEN m.conversion_rate END) AS edu_conversion,
                AVG(CASE WHEN c.campaign_type = 'educational' THEN m.engagement_rate END) AS edu_engagement,
                AVG(CASE WHEN c.campaign_type = 'premium' THEN m.conversion_rate END) AS premium_conversion,
                AVG(CASE WHEN c.campaign_type = 'discount' THEN m.conversion_rate END) AS discount_conversion,
                -- Pattern classification
                CASE
                    WHEN AVG(CASE WHEN c.campaign_type = 'educational' THEN m.engagement_rate END) > 0.10
                     AND AVG(CASE WHEN c.campaign_type = 'premium' THEN m.conversion_rate END) > 0.025
                    THEN 'edu_premium_affinity'
                    WHEN AVG(CASE WHEN c.campaign_type = 'discount' THEN m.conversion_rate END) >
                         AVG(CASE WHEN c.campaign_type = 'premium' THEN m.conversion_rate END) * 1.3
                    THEN 'discount_preference'
                    ELSE 'balanced'
                END AS response_pattern
            FROM campaign_metrics m
            JOIN campaigns c ON m.campaign_id = c.campaign_id
            GROUP BY m.segment_id
        ''')
        print("Campaign type affinity analyzed\n")

    def analyze_educational_priming(self):
        print("Analyzing educational priming effect...")

        self.conn.fedsql.execdirect(query='''
            CREATE TABLE educational_priming AS
            SELECT
                m.segment_id,
                -- Educational engagement (earlier campaigns CAMP_001-006)
                AVG(CASE WHEN c.campaign_type = 'educational'
                         AND c.campaign_id <= 'CAMP_006'
                         THEN m.engagement_rate END) AS early_edu_engagement,
                -- Premium conversion (later campaigns CAMP_007-012)
                AVG(CASE WHEN c.campaign_type = 'premium'
                         AND c.campaign_id > 'CAMP_006'
                         THEN m.conversion_rate END) AS later_premium_conversion,
                -- Premium conversion (all campaigns)
                AVG(CASE WHEN c.campaign_type = 'premium'
                         THEN m.conversion_rate END) AS overall_premium_conversion,
                -- Educational exposure level
                CASE
                    WHEN AVG(CASE WHEN c.campaign_type = 'educational'
                                  AND c.campaign_id <= 'CAMP_006'
                                  THEN m.engagement_rate END) > 0.10
                    THEN 'high_edu_exposure'
                    WHEN AVG(CASE WHEN c.campaign_type = 'educational'
                                  AND c.campaign_id <= 'CAMP_006'
                                  THEN m.engagement_rate END) > 0.08
                    THEN 'medium_edu_exposure'
                    ELSE 'low_edu_exposure'
                END AS edu_exposure_level
            FROM campaign_metrics m
            JOIN campaigns c ON m.campaign_id = c.campaign_id
            GROUP BY m.segment_id
        ''')

        self.conn.fedsql.execdirect(query='''
            CREATE TABLE priming_effect_summary AS
            SELECT
                edu_exposure_level,
                COUNT(*) AS segment_count,
                AVG(later_premium_conversion) AS avg_later_premium_conv,
                AVG(overall_premium_conversion) AS avg_overall_premium_conv,
                AVG(early_edu_engagement) AS avg_edu_engagement
            FROM educational_priming
            WHERE edu_exposure_level IS NOT NULL
            GROUP BY edu_exposure_level
        ''')

        print("Educational priming analyzed\n")

    def analyze_value_alignment(self):
        print("Analyzing value theme alignment...")
        self.conn.fedsql.execdirect(query='''
            CREATE TABLE value_theme_alignment AS
            SELECT
                s.segment_id,
                s.values_family, s.values_eco_conscious, s.values_convenience, s.values_quality,
                AVG(CASE WHEN c.value_theme = 'family' THEN m.conversion_rate END) AS family_theme_response,
                AVG(CASE WHEN c.value_theme = 'eco_conscious' THEN m.conversion_rate END) AS eco_theme_response,
                AVG(CASE WHEN c.value_theme = 'convenience' THEN m.conversion_rate END) AS convenience_theme_response,
                AVG(CASE WHEN c.value_theme = 'quality' THEN m.conversion_rate END) AS quality_theme_response,
                AVG(m.conversion_rate) AS overall_conversion,
                -- Determine dominant value
                CASE
                    WHEN s.values_family >= s.values_eco_conscious
                     AND s.values_family >= s.values_convenience
                     AND s.values_family >= s.values_quality
                    THEN 'family'
                    WHEN s.values_eco_conscious >= s.values_convenience
                     AND s.values_eco_conscious >= s.values_quality
                    THEN 'eco_conscious'
                    WHEN s.values_convenience >= s.values_quality
                    THEN 'convenience'
                    ELSE 'quality'
                END AS dominant_value
            FROM campaign_metrics m
            JOIN campaigns c ON m.campaign_id = c.campaign_id
            JOIN segments s ON m.segment_id = s.segment_id
            GROUP BY s.segment_id, s.values_family, s.values_eco_conscious,
                     s.values_convenience, s.values_quality
        ''')

        self.conn.fedsql.execdirect(query='''
            CREATE TABLE value_alignment_impact AS
            SELECT
                dominant_value,
                COUNT(*) AS segment_count,
                -- Matched theme performance
                AVG(CASE
                    WHEN dominant_value = 'family' THEN family_theme_response
                    WHEN dominant_value = 'eco_conscious' THEN eco_theme_response
                    WHEN dominant_value = 'convenience' THEN convenience_theme_response
                    ELSE quality_theme_response
                END) AS aligned_theme_conversion,
                AVG(overall_conversion) AS baseline_conversion
            FROM value_theme_alignment
            GROUP BY dominant_value
        ''')

        print("Value alignment analyzed\n")

    def analyze_channel_versatility(self):
        print("Analyzing channel versatility...")
        self.conn.fedsql.execdirect(query='''
            CREATE TABLE channel_versatility AS
            SELECT
                m.segment_id,
                COUNT(DISTINCT c.channel) AS channels_engaged,
                AVG(CASE WHEN c.channel = 'email' THEN m.engagement_rate END) AS email_engagement,
                AVG(CASE WHEN c.channel = 'push' THEN m.engagement_rate END) AS push_engagement,
                AVG(CASE WHEN c.channel = 'inapp' THEN m.engagement_rate END) AS inapp_engagement,
                STDDEV(m.engagement_rate) AS engagement_variance,
                AVG(m.conversion_rate) AS avg_conversion,
                -- Multi-channel vs single-channel
                CASE
                    WHEN COUNT(DISTINCT CASE WHEN m.engagement_rate > 0.10 THEN c.channel END) >= 2
                    THEN 'multi_channel'
                    ELSE 'single_channel'
                END AS channel_strategy
            FROM campaign_metrics m
            JOIN campaigns c ON m.campaign_id = c.campaign_id
            GROUP BY m.segment_id
        ''')

        print("Channel versatility analyzed\n")

    def export_results(self):
        print("Exporting Phase 2 results...")

        affinity = self.conn.CASTable('campaign_type_affinity').to_frame()
        affinity.columns = affinity.columns.str.lower()
        affinity.to_csv('data/output/campaign_type_affinity.csv', index=False)
        print(f"✓ Exported campaign_type_affinity.csv ({len(affinity)} segments)")

        priming = self.conn.CASTable('educational_priming').to_frame()
        priming.columns = priming.columns.str.lower()
        priming.to_csv('data/output/educational_priming.csv', index=False)
        print(f"✓ Exported educational_priming.csv ({len(priming)} segments)")

        priming_summary = self.conn.CASTable('priming_effect_summary').to_frame()
        priming_summary.columns = priming_summary.columns.str.lower()
        priming_summary.to_csv('data/output/priming_effect_summary.csv', index=False)
        print(f"✓ Exported priming_effect_summary.csv")

        value_alignment = self.conn.CASTable('value_theme_alignment').to_frame()
        value_alignment.columns = value_alignment.columns.str.lower()
        value_alignment.to_csv('data/output/value_theme_alignment.csv', index=False)
        print(f"✓ Exported value_theme_alignment.csv ({len(value_alignment)} segments)")

        alignment_impact = self.conn.CASTable('value_alignment_impact').to_frame()
        alignment_impact.columns = alignment_impact.columns.str.lower()
        alignment_impact.to_csv('data/output/value_alignment_impact.csv', index=False)
        print(f"✓ Exported value_alignment_impact.csv")

        versatility = self.conn.CASTable('channel_versatility').to_frame()
        versatility.columns = versatility.columns.str.lower()
        versatility.to_csv('data/output/channel_versatility.csv', index=False)
        print(f"✓ Exported channel_versatility.csv ({len(versatility)} segments)\n")

    def print_insights(self):
        print("=" * 60)
        print("PHASE 2 INSIGHTS - Cross-Campaign Patterns")
        print("=" * 60)

        affinity = self.conn.CASTable('campaign_type_affinity').to_frame()
        affinity.columns = affinity.columns.str.lower()

        print("\n1. CAMPAIGN TYPE AFFINITY PATTERNS:")
        pattern_counts = affinity['response_pattern'].value_counts()
        for pattern, count in pattern_counts.items():
            pct = count / len(affinity) * 100
            print(f"   {pattern}: {count} segments ({pct:.1f}%)")

        edu_premium = affinity[affinity['response_pattern'] == 'edu_premium_affinity']
        if len(edu_premium) > 0:
            print(f"\n   Edu-Premium Affinity segments:")
            print(f"   - Avg educational engagement: {edu_premium['edu_engagement'].mean():.2%}")
            print(f"   - Avg premium conversion: {edu_premium['premium_conversion'].mean():.2%}")

        priming_summary = self.conn.CASTable('priming_effect_summary').to_frame()
        priming_summary.columns = priming_summary.columns.str.lower()

        print("\n2. EDUCATIONAL PRIMING EFFECT:")
        for _, row in priming_summary.iterrows():
            print(f"   {row['edu_exposure_level']}:")
            print(f"   - Segments: {int(row['segment_count'])}")
            print(f"   - Later premium conversion: {row['avg_later_premium_conv']:.2%}")
            if row['edu_exposure_level'] == 'high_edu_exposure':
                baseline = priming_summary[priming_summary['edu_exposure_level'] == 'low_edu_exposure']
                if len(baseline) > 0:
                    lift = (row['avg_later_premium_conv'] / baseline['avg_later_premium_conv'].iloc[0] - 1) * 100
                    print(f"   - Priming lift vs low exposure: +{lift:.1f}%")

        alignment_impact = self.conn.CASTable('value_alignment_impact').to_frame()
        alignment_impact.columns = alignment_impact.columns.str.lower()

        print("\n3. VALUE THEME ALIGNMENT IMPACT:")
        for _, row in alignment_impact.iterrows():
            lift = (row['aligned_theme_conversion'] / row['baseline_conversion'] - 1) * 100
            print(f"   {row['dominant_value']} value → {row['dominant_value']} theme:")
            print(f"   - Aligned conversion: {row['aligned_theme_conversion']:.2%}")
            print(f"   - Baseline: {row['baseline_conversion']:.2%}")
            print(f"   - Alignment lift: {lift:+.1f}%")

        versatility = self.conn.CASTable('channel_versatility').to_frame()
        versatility.columns = versatility.columns.str.lower()

        print("\n4. CHANNEL VERSATILITY:")
        strategy_counts = versatility['channel_strategy'].value_counts()
        for strategy, count in strategy_counts.items():
            avg_conv = versatility[versatility['channel_strategy'] == strategy]['avg_conversion'].mean()
            print(f"   {strategy}: {count} segments, {avg_conv:.2%} avg conversion")

        print("\n" + "=" * 60)

    def close(self):
        self.conn.close()


if __name__ == "__main__":
    try:
        analytics = CrossCampaignAnalytics()
        analytics.load_data()
        analytics.analyze_campaign_type_affinity()
        analytics.analyze_educational_priming()
        analytics.analyze_value_alignment()
        analytics.analyze_channel_versatility()
        analytics.export_results()
        analytics.print_insights()
        analytics.close()
        print("\nPhase 2 Complete")
    except Exception as e:
        print(f"Error: {e}")
        print("\nSet env vars: VIYA_HOSTNAME, VIYA_CLIENT_ID, VIYA_CLIENT_SECRET")
