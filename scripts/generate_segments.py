"""
Generate enriched user segments from base segment data.

Creates mock demographic and behavioral attributes for each segment
based on their event history and characteristics.
"""
import pandas as pd
import numpy as np

RANDOM_SEED = 42
INPUT_FILE = 'data/input/user_segments.csv'
OUTPUT_FILE = 'data/output/user_segments_enriched.csv'

COLUMNS_TO_DROP = ['events_array', 'registration', 'sourceId',
                   'parent_allergies', 'MPN', 'baby_dob_1']

AGE_MIN = 18
AGE_MAX = 45
GENDER_PROBABILITIES = [0.15, 0.85]
BABY_COUNT_PROBABILITIES = [0.65, 0.30, 0.05]

ENGAGEMENT_WEIGHT = 0.7
ENGAGEMENT_NOISE_STD = 0.15
PRICE_BASE = 0.5
PRICE_NOISE_STD = 0.2
BABY_AGE_IMPACT = 0.1
WEEKS_PER_YEAR = 52
LOYALTY_WEIGHT = 0.6
LOYALTY_NOISE_STD = 0.2

CHANNEL_ALPHA = [3, 3, 4]
CHANNEL_SCALE = 1.5
VALUE_ALPHA = [3, 2, 2, 2]

CONTACT_FREQ_WEIGHT = 0.5
CONTACT_FREQ_NOISE_STD = 0.2
CONTENT_ENG_WEIGHT = 0.8
CONTENT_ENG_NOISE_STD = 0.1

CLIP_MIN = 0.1
CLIP_MAX = 1.0
VALUE_MIN = 0.0


def load_segments(filepath):
    """Load base segment data from CSV."""
    df = pd.read_csv(filepath)
    print(f"Loaded {len(df)} segments")
    return df


def clean_segments(df):
    """Remove unnecessary columns and rename."""
    df = df.drop(columns=COLUMNS_TO_DROP)
    df = df.rename(columns={'alias_index': 'segment_id'})
    return df


def add_demographics(df):
    """Add demographic attributes."""
    df['parent_age'] = np.random.randint(AGE_MIN, AGE_MAX, len(df))
    df['parent_gender'] = np.random.choice(['M', 'F'], len(df), p=GENDER_PROBABILITIES)
    df['baby_count'] = np.random.choice([1, 2, 3], len(df), p=BABY_COUNT_PROBABILITIES)
    return df


def add_behavioral_attributes(df):
    """Add behavioral propensity scores."""
    event_normalized = df['event_count'] / df['event_count'].max()
    df['engagement_propensity'] = np.clip(
        event_normalized * ENGAGEMENT_WEIGHT + np.random.normal(0, ENGAGEMENT_NOISE_STD, len(df)),
        CLIP_MIN, CLIP_MAX
    )

    baby_age_normalized = np.abs(df['baby_age_week_1']) / WEEKS_PER_YEAR
    df['price_sensitivity'] = np.clip(
        PRICE_BASE + np.random.normal(0, PRICE_NOISE_STD, len(df)) - (baby_age_normalized * BABY_AGE_IMPACT),
        VALUE_MIN, CLIP_MAX
    )

    df['brand_loyalty'] = np.clip(
        df['engagement_propensity'] * LOYALTY_WEIGHT + np.random.normal(0, LOYALTY_NOISE_STD, len(df)),
        CLIP_MIN, CLIP_MAX
    )

    return df


def add_channel_preferences(df):
    """Add channel performance scores."""
    channel_scores = np.random.dirichlet(alpha=CHANNEL_ALPHA, size=len(df))
    df['channel_perf_email'] = np.clip(channel_scores[:, 0] * CHANNEL_SCALE, VALUE_MIN, CLIP_MAX)
    df['channel_perf_push'] = np.clip(channel_scores[:, 1] * CHANNEL_SCALE, VALUE_MIN, CLIP_MAX)
    df['channel_perf_inapp'] = np.clip(channel_scores[:, 2] * CHANNEL_SCALE, VALUE_MIN, CLIP_MAX)
    return df


def add_value_preferences(df):
    """Add value theme preferences."""
    value_profiles = np.random.dirichlet(alpha=VALUE_ALPHA, size=len(df))
    df['values_family'] = value_profiles[:, 0]
    df['values_eco_conscious'] = value_profiles[:, 1]
    df['values_convenience'] = value_profiles[:, 2]
    df['values_quality'] = value_profiles[:, 3]
    return df


def add_engagement_metrics(df):
    """Add engagement-related metrics."""
    df['contact_frequency_tolerance'] = np.clip(
        df['engagement_propensity'] * CONTACT_FREQ_WEIGHT + np.random.normal(0, CONTACT_FREQ_NOISE_STD, len(df)),
        CLIP_MIN, CLIP_MAX
    )

    df['content_engagement_rate'] = np.clip(
        df['engagement_propensity'] * CONTENT_ENG_WEIGHT + np.random.normal(0, CONTENT_ENG_NOISE_STD, len(df)),
        CLIP_MIN, CLIP_MAX
    )

    return df


def save_segments(df, filepath):
    """Save enriched segments to CSV."""
    df.to_csv(filepath, index=False)
    print(f"\nEnrichment complete!")
    print(f"Saved to {filepath}")


def print_summary(df):
    """Print summary of enrichment."""
    print(f"\nRemoved columns: {', '.join(COLUMNS_TO_DROP)}")
    print("Renamed: alias_index -> segment_id")
    print("\nPopulated demographic fields:")
    print(f"- parent_age ({AGE_MIN}-{AGE_MAX-1})")
    print("- parent_gender (M/F)")
    print("- baby_count (1-3)")
    print("\nNew behavioral attributes:")
    print("- engagement_propensity, price_sensitivity, brand_loyalty")
    print("- channel_perf_email/push/inapp")
    print("- values_family/eco_conscious/convenience/quality")
    print("- contact_frequency_tolerance, content_engagement_rate")

    print("\nSample statistics:")
    key_metrics = ['engagement_propensity', 'price_sensitivity', 'brand_loyalty',
                   'contact_frequency_tolerance', 'content_engagement_rate']
    print(df[key_metrics].describe())


def main():
    """Main execution flow."""
    np.random.seed(RANDOM_SEED)

    df = load_segments(INPUT_FILE)
    df = clean_segments(df)
    df = add_demographics(df)
    df = add_behavioral_attributes(df)
    df = add_channel_preferences(df)
    df = add_value_preferences(df)
    df = add_engagement_metrics(df)

    save_segments(df, OUTPUT_FILE)
    print_summary(df)


if __name__ == "__main__":
    main()
