import os

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
DATA_DIR_INPUT = os.path.join(BASE_DIR, 'data', 'input')
DATA_DIR_GENERATED = os.path.join(BASE_DIR, 'data', 'generated')
DATA_DIR_OUTPUT = os.path.join(BASE_DIR, 'data', 'output')

SEGMENTS_INPUT_FILE = 'user_segments.csv'
SEGMENTS_OUTPUT_FILE = 'user_segments_enriched.csv'
CAMPAIGNS_FILE = 'campaigns.csv'
RESULTS_FILE = 'campaign_results.csv'
METRICS_FILE = 'campaign_metrics.csv'

DEFAULT_ENGAGEMENT = 0.08
DEFAULT_CONVERSION = 0.02
ENGAGEMENT_MIN = 0.05
ENGAGEMENT_SCALE = 0.10

PRICE_SENSITIVITY_HIGH = 0.8
PRICE_SENSITIVITY_MED = 0.5
PRICE_SENSITIVITY_LOW = 0.3

BRAND_LOYALTY_HIGH = 0.7
BRAND_LOYALTY_LOW = 0.4

CHANNEL_SCALE = 1.5
