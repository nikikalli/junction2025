import pandas as pd
import numpy as np

np.random.seed(42)

df = pd.read_csv('data/input/user_segments.csv')

print(f"Loaded {len(df)} segments")

df = df.drop(columns=['events_array', 'registration', 'sourceId', 'parent_allergies', 'MPN', 'baby_dob_1'])

df = df.rename(columns={'alias_index': 'segment_id'})

df['parent_age'] = np.random.randint(18, 45, len(df))

df['parent_gender'] = np.random.choice(['M', 'F'], len(df), p=[0.15, 0.85])

df['baby_count'] = np.random.choice([1, 2, 3], len(df), p=[0.65, 0.30, 0.05])

df['engagement_propensity'] = np.clip(
    (df['event_count'] / df['event_count'].max()) * 0.7 + np.random.normal(0, 0.15, len(df)),
    0.1, 1
)

baby_age_normalized = np.abs(df['baby_age_week_1']) / 52
df['price_sensitivity'] = np.clip(
    0.5 + np.random.normal(0, 0.2, len(df)) - (baby_age_normalized * 0.1),
    0, 1
)

df['brand_loyalty'] = np.clip(
    df['engagement_propensity'] * 0.6 + np.random.normal(0, 0.2, len(df)),
    0.1, 1
)

channel_scores = np.random.dirichlet(alpha=[3, 3, 4], size=len(df))
df['channel_perf_email'] = np.clip(channel_scores[:, 0] * 1.5, 0, 1)
df['channel_perf_push'] = np.clip(channel_scores[:, 1] * 1.5, 0, 1)
df['channel_perf_inapp'] = np.clip(channel_scores[:, 2] * 1.5, 0, 1)

df['contact_frequency_tolerance'] = np.clip(
    df['engagement_propensity'] * 0.5 + np.random.normal(0, 0.2, len(df)),
    0.1, 1
)

value_profiles = np.random.dirichlet(alpha=[3, 2, 2, 2], size=len(df))
df['values_family'] = value_profiles[:, 0]
df['values_eco_conscious'] = value_profiles[:, 1]
df['values_convenience'] = value_profiles[:, 2]
df['values_quality'] = value_profiles[:, 3]

df['content_engagement_rate'] = np.clip(
    df['engagement_propensity'] * 0.8 + np.random.normal(0, 0.1, len(df)),
    0.1, 1
)

df.to_csv('data/output/user_segments_enriched.csv', index=False)

print("\nEnrichment complete!")
print(f"Saved to data/output/user_segments_enriched.csv")
print(f"\nRemoved columns: events_array, registration, sourceId, parent_allergies, MPN, baby_dob_1")
print(f"Renamed: alias_index -> segment_id")
print("\nPopulated demographic fields:")
print("- parent_age (18-44)")
print("- parent_gender (M/F/Other)")
print("- baby_count (1-3)")
print("\nNew sentiment/preference columns:")
print("- engagement_propensity (0-1)")
print("- price_sensitivity (0-1)")
print("- brand_loyalty (0-1)")
print("- channel_perf_email (0-1)")
print("- channel_perf_push (0-1)")
print("- channel_perf_inapp (0-1)")
print("- contact_frequency_tolerance (0-1)")
print("- values_family (0-1)")
print("- values_eco_conscious (0-1)")
print("- values_convenience (0-1)")
print("- values_quality (0-1)")
print("- content_engagement_rate (0-1)")

print("\nSample statistics:")
print(df[['engagement_propensity', 'price_sensitivity', 'brand_loyalty',
          'contact_frequency_tolerance', 'content_engagement_rate']].describe())
