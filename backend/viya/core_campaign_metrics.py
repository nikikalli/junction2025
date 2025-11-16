import swat
import requests
import os
from dotenv import load_dotenv
from .config import (
    DATA_DIR_INPUT, DATA_DIR_GENERATED, DATA_DIR_OUTPUT,
    SEGMENTS_INPUT_FILE, SEGMENTS_OUTPUT_FILE,
    CAMPAIGNS_FILE, RESULTS_FILE, METRICS_FILE,
    DEFAULT_ENGAGEMENT, DEFAULT_CONVERSION,
    ENGAGEMENT_MIN, ENGAGEMENT_SCALE,
    PRICE_SENSITIVITY_HIGH, PRICE_SENSITIVITY_MED, PRICE_SENSITIVITY_LOW,
    BRAND_LOYALTY_HIGH, BRAND_LOYALTY_LOW,
    CHANNEL_SCALE
)

load_dotenv()


class ViyaCampaignAnalytics:
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
        self.conn.loadactionset('datastep')
        print(f"✓ Connected. Session: {self.conn.sessionid}\n")

    def load_data(self):
        print("Loading data into CAS...")
        self.conn.read_csv(f'{DATA_DIR_OUTPUT}/{SEGMENTS_OUTPUT_FILE}',
                          casout={'name': 'segments', 'replace': True})
        self.conn.read_csv(f'{DATA_DIR_GENERATED}/{CAMPAIGNS_FILE}',
                          casout={'name': 'campaigns', 'replace': True})
        self.conn.read_csv(f'{DATA_DIR_GENERATED}/{RESULTS_FILE}',
                          casout={'name': 'campaign_results_raw', 'replace': True})
        print("Data loaded\n")

    def calculate_metrics(self):
        print("Calculating engagement metrics...")
        self.conn.fedsql.execdirect(query='''
            CREATE TABLE campaign_results AS
            SELECT
                r."campaign_id", r."segment_id", r."impressions", r."clicks", r."conversions",
                c."campaign_type", c."channel", c."message_sentiment", c."value_theme",
                s."language", s."price_sensitivity", s."brand_loyalty", s."engagement_propensity",
                s."channel_perf_email", s."channel_perf_push", s."channel_perf_inapp",
                s."values_family", s."values_eco_conscious", s."values_convenience", s."values_quality",
                CAST(r."clicks" AS DOUBLE) / r."impressions" AS engagement_rate,
                CAST(r."conversions" AS DOUBLE) / r."impressions" AS conversion_rate,
                CASE WHEN c."channel" = 'email' THEN s."channel_perf_email"
                     WHEN c."channel" = 'push' THEN s."channel_perf_push"
                     ELSE s."channel_perf_inapp" END AS channel_match_score
            FROM campaign_results_raw r
            JOIN campaigns c ON r."campaign_id" = c."campaign_id"
            JOIN segments s ON r."segment_id" = s."segment_id"
        ''')

        print("Calculating benchmarks...")
        self.conn.fedsql.execdirect(query='''
            CREATE TABLE benchmarks AS
            SELECT "language", "campaign_type",
                   AVG("conversion_rate") AS baseline_conversion,
                   AVG("engagement_rate") AS baseline_engagement,
                   STDDEV("conversion_rate") AS conversion_std
            FROM campaign_results
            GROUP BY "language", "campaign_type"
            HAVING COUNT(*) >= 5
        ''')

        print("Calculating performance vs benchmark...")
        self.conn.fedsql.execdirect(query='''
            CREATE TABLE campaign_results_vs_benchmark AS
            SELECT r.*,
                   b.baseline_conversion, b.baseline_engagement,
                   r."conversion_rate" / NULLIF(b.baseline_conversion, 0) AS sales_vs_benchmark
            FROM campaign_results r
            LEFT JOIN benchmarks b ON r."language" = b."language" AND r."campaign_type" = b."campaign_type"
        ''')
        print("Metrics calculated\n")

    def build_campaign_metrics(self):
        print("Building campaign metrics per segment...")
        self.conn.fedsql.execdirect(query='''
            CREATE TABLE campaign_segment_metrics AS
            SELECT "campaign_id", "segment_id",
                   "impressions", "clicks", "conversions",
                   "engagement_rate", "conversion_rate",
                   baseline_engagement, baseline_conversion,
                   sales_vs_benchmark
            FROM campaign_results_vs_benchmark
        ''')
        print("Campaign metrics built\n")

    def derive_segment_attributes(self):
        print("Deriving segment attributes from campaign performance...")
        print("Using rolling window of last 100 campaigns per segment...")

        print("Filtering to recent campaigns using CAS data step...")
        self.conn.datastep.runcode(code='''
            data campaign_results_ranked;
                set campaign_results_vs_benchmark;
                by segment_id campaign_id;
                retain campaign_rank;
                if first.segment_id then campaign_rank = 1;
                else campaign_rank + 1;
                if campaign_rank <= 100;
            run;
        ''')

        self.conn.fedsql.execdirect(query=f'''
            CREATE TABLE segment_patterns AS
            SELECT "segment_id",
                   AVG("engagement_rate") AS avg_engagement,
                   AVG(CASE WHEN "campaign_type" = 'discount' THEN "conversion_rate" END) AS discount_response,
                   AVG(CASE WHEN "campaign_type" = 'premium' THEN "conversion_rate" END) AS premium_response,
                   MAX(CASE WHEN "channel" = 'email' THEN "engagement_rate" ELSE 0 END) AS email_perf,
                   MAX(CASE WHEN "channel" = 'push' THEN "engagement_rate" ELSE 0 END) AS push_perf,
                   MAX(CASE WHEN "channel" = 'inapp' THEN "engagement_rate" ELSE 0 END) AS inapp_perf,
                   AVG(CASE WHEN "value_theme" = 'family' THEN "conversion_rate" END) AS family_resp,
                   AVG(CASE WHEN "value_theme" = 'eco_conscious' THEN "conversion_rate" END) AS eco_resp,
                   AVG(CASE WHEN "value_theme" = 'convenience' THEN "conversion_rate" END) AS conv_resp,
                   AVG(CASE WHEN "value_theme" = 'quality' THEN "conversion_rate" END) AS qual_resp,
                   COUNT(*) AS campaign_count
            FROM campaign_results_ranked
            GROUP BY "segment_id"
        ''')

        self.conn.fedsql.execdirect(query=f'''
            CREATE TABLE segments_learned AS
            SELECT s."segment_id", s."language", s."parent_age", s."parent_gender",
                   s."baby_count",

                   (COALESCE(p.avg_engagement, {DEFAULT_ENGAGEMENT}) - {ENGAGEMENT_MIN}) / {ENGAGEMENT_SCALE} AS engagement_propensity,

                   CASE WHEN COALESCE(p.discount_response, {DEFAULT_CONVERSION}) > COALESCE(p.premium_response, {DEFAULT_CONVERSION}) * 1.3 THEN {PRICE_SENSITIVITY_HIGH}
                        WHEN COALESCE(p.discount_response, {DEFAULT_CONVERSION}) < COALESCE(p.premium_response, {DEFAULT_CONVERSION}) * 0.7 THEN {PRICE_SENSITIVITY_LOW}
                        ELSE {PRICE_SENSITIVITY_MED} END AS price_sensitivity,

                   CASE WHEN COALESCE(p.premium_response, {DEFAULT_CONVERSION}) > COALESCE(p.discount_response, {DEFAULT_CONVERSION}) THEN {BRAND_LOYALTY_HIGH}
                        ELSE {BRAND_LOYALTY_LOW} END AS brand_loyalty,

                   COALESCE(p.email_perf, {DEFAULT_ENGAGEMENT}) /
                       (COALESCE(p.email_perf, {DEFAULT_ENGAGEMENT}) + COALESCE(p.push_perf, {DEFAULT_ENGAGEMENT}) + COALESCE(p.inapp_perf, {DEFAULT_ENGAGEMENT})) * {CHANNEL_SCALE} AS channel_perf_email,
                   COALESCE(p.push_perf, {DEFAULT_ENGAGEMENT}) /
                       (COALESCE(p.email_perf, {DEFAULT_ENGAGEMENT}) + COALESCE(p.push_perf, {DEFAULT_ENGAGEMENT}) + COALESCE(p.inapp_perf, {DEFAULT_ENGAGEMENT})) * {CHANNEL_SCALE} AS channel_perf_push,
                   COALESCE(p.inapp_perf, {DEFAULT_ENGAGEMENT}) /
                       (COALESCE(p.email_perf, {DEFAULT_ENGAGEMENT}) + COALESCE(p.push_perf, {DEFAULT_ENGAGEMENT}) + COALESCE(p.inapp_perf, {DEFAULT_ENGAGEMENT})) * {CHANNEL_SCALE} AS channel_perf_inapp,

                   COALESCE(p.family_resp, {DEFAULT_CONVERSION}) / (COALESCE(p.family_resp, {DEFAULT_CONVERSION}) + COALESCE(p.eco_resp, {DEFAULT_CONVERSION}) +
                       COALESCE(p.conv_resp, {DEFAULT_CONVERSION}) + COALESCE(p.qual_resp, {DEFAULT_CONVERSION})) AS values_family,
                   COALESCE(p.eco_resp, {DEFAULT_CONVERSION}) / (COALESCE(p.family_resp, {DEFAULT_CONVERSION}) + COALESCE(p.eco_resp, {DEFAULT_CONVERSION}) +
                       COALESCE(p.conv_resp, {DEFAULT_CONVERSION}) + COALESCE(p.qual_resp, {DEFAULT_CONVERSION})) AS values_eco_conscious,
                   COALESCE(p.conv_resp, {DEFAULT_CONVERSION}) / (COALESCE(p.family_resp, {DEFAULT_CONVERSION}) + COALESCE(p.eco_resp, {DEFAULT_CONVERSION}) +
                       COALESCE(p.conv_resp, {DEFAULT_CONVERSION}) + COALESCE(p.qual_resp, {DEFAULT_CONVERSION})) AS values_convenience,
                   COALESCE(p.qual_resp, {DEFAULT_CONVERSION}) / (COALESCE(p.family_resp, {DEFAULT_CONVERSION}) + COALESCE(p.eco_resp, {DEFAULT_CONVERSION}) +
                       COALESCE(p.conv_resp, {DEFAULT_CONVERSION}) + COALESCE(p.qual_resp, {DEFAULT_CONVERSION})) AS values_quality,

                   (COALESCE(p.avg_engagement, {DEFAULT_ENGAGEMENT}) - {ENGAGEMENT_MIN}) / {ENGAGEMENT_SCALE} * 0.8 AS contact_frequency_tolerance,
                   (COALESCE(p.avg_engagement, {DEFAULT_ENGAGEMENT}) - {ENGAGEMENT_MIN}) / {ENGAGEMENT_SCALE} * 0.9 AS content_engagement_rate

            FROM segments s
            LEFT JOIN segment_patterns p ON s."segment_id" = p."segment_id"
        ''')

        print("Segment attributes derived\n")

    def export_segments(self):
        print("Exporting updated segments...")
        learned = self.conn.CASTable('segments_learned').to_frame()

        learned.columns = learned.columns.str.lower()

        learned['engagement_propensity'] = learned['engagement_propensity'].clip(0.2, 0.9)
        learned['channel_perf_email'] = learned['channel_perf_email'].clip(0, 1.0)
        learned['channel_perf_push'] = learned['channel_perf_push'].clip(0, 1.0)
        learned['channel_perf_inapp'] = learned['channel_perf_inapp'].clip(0, 1.0)
        learned['contact_frequency_tolerance'] = learned['contact_frequency_tolerance'].clip(0.1, 1.0)
        learned['content_engagement_rate'] = learned['content_engagement_rate'].clip(0.1, 1.0)

        output_path = f'{DATA_DIR_OUTPUT}/{SEGMENTS_OUTPUT_FILE}'
        learned.to_csv(output_path, index=False)
        print(f"Exported {len(learned)} segments to {output_path}\n")

        print("Summary:")
        print(learned[['engagement_propensity', 'price_sensitivity', 'brand_loyalty']].describe())

    def export_campaign_metrics(self):
        print("Exporting campaign metrics...")
        metrics = self.conn.CASTable('campaign_segment_metrics').to_frame()
        metrics.columns = metrics.columns.str.lower()
        output_path = f'{DATA_DIR_OUTPUT}/{METRICS_FILE}'
        metrics.to_csv(output_path, index=False)
        print(f"Exported {len(metrics)} campaign-segment metrics to {output_path}\n")

    def close(self):
        self.conn.close()


if __name__ == "__main__":
    try:
        analytics = ViyaCampaignAnalytics()
        analytics.load_data()
        analytics.calculate_metrics()
        analytics.build_campaign_metrics()
        analytics.derive_segment_attributes()
        analytics.export_segments()
        analytics.export_campaign_metrics()
        analytics.close()
        print("\nComplete")
    except Exception as e:
        print(f"Error: {e}")
        print("\nSet env vars: VIYA_HOSTNAME, VIYA_CLIENT_ID, VIYA_CLIENT_SECRET")
