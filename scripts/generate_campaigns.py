import pandas as pd
import numpy as np

np.random.seed(42)

segments = pd.read_csv('data/output/user_segments_enriched.csv')
print(f"Loaded {len(segments)} segments")

campaign_types = ['discount', 'premium', 'educational']
channels = ['email', 'push', 'inapp']
message_sentiments = ['urgent', 'friendly', 'informative']
value_themes = ['family', 'eco_conscious', 'convenience', 'quality']
offer_types = ['percentage_discount', 'bundle', 'premium', 'none']

campaigns = []
campaign_id = 1

for i in range(50):
    campaign_type = np.random.choice(campaign_types)

    if campaign_type == 'discount':
        offer_type = 'percentage_discount'
        discount = np.random.choice([10, 15, 20, 25, 30, 40])
        sentiment = np.random.choice(['urgent', 'friendly'])
    elif campaign_type == 'premium':
        offer_type = np.random.choice(['bundle', 'premium'])
        discount = 0
        sentiment = 'informative'
    else:
        offer_type = 'none'
        discount = 0
        sentiment = 'friendly'

    campaigns.append({
        'campaign_id': f'CAMP_{campaign_id:03d}',
        'campaign_type': campaign_type,
        'channel': np.random.choice(channels),
        'message_sentiment': sentiment,
        'value_theme': np.random.choice(value_themes),
        'offer_type': offer_type,
        'discount_percentage': discount if discount > 0 else None
    })
    campaign_id += 1

campaigns_df = pd.DataFrame(campaigns)
campaigns_df.to_csv('data/generated/campaigns.csv', index=False)
print(f"\nCreated {len(campaigns_df)} campaigns")

results = []

for _, campaign in campaigns_df.iterrows():
    for _, segment in segments.iterrows():

        base_impressions = np.random.randint(8000, 12000)

        base_click_rate = 0.08
        base_conversion_rate = 0.02

        click_multiplier = 1.0
        conversion_multiplier = 1.0

        if campaign['channel'] == 'email' and segment['channel_perf_email'] > 0.6:
            click_multiplier *= 1.3
        elif campaign['channel'] == 'push' and segment['channel_perf_push'] > 0.6:
            click_multiplier *= 1.3
        elif campaign['channel'] == 'inapp' and segment['channel_perf_inapp'] > 0.6:
            click_multiplier *= 1.3

        if campaign['campaign_type'] == 'discount' and segment['price_sensitivity'] > 0.6:
            conversion_multiplier *= 1.4
        elif campaign['campaign_type'] == 'premium' and segment['brand_loyalty'] > 0.6:
            conversion_multiplier *= 1.3

        value_cols = {
            'family': segment['values_family'],
            'eco_conscious': segment['values_eco_conscious'],
            'convenience': segment['values_convenience'],
            'quality': segment['values_quality']
        }
        if campaign['value_theme'] in value_cols:
            if value_cols[campaign['value_theme']] > 0.4:
                conversion_multiplier *= 1.25

        if segment['engagement_propensity'] > 0.5:
            click_multiplier *= 1.2

        actual_click_rate = np.clip(
            base_click_rate * click_multiplier * np.random.uniform(0.85, 1.15),
            0.01, 0.4
        )
        actual_conversion_rate = np.clip(
            base_conversion_rate * conversion_multiplier * np.random.uniform(0.8, 1.2),
            0.001, 0.15
        )

        clicks = int(base_impressions * actual_click_rate)
        conversions = int(clicks * (actual_conversion_rate / actual_click_rate))

        results.append({
            'campaign_id': campaign['campaign_id'],
            'segment_id': segment['segment_id'],
            'impressions': base_impressions,
            'clicks': clicks,
            'conversions': conversions
        })

results_df = pd.DataFrame(results)
results_df.to_csv('data/generated/campaign_results.csv', index=False)
print(f"Created {len(results_df)} campaign results")

print("\nCampaign type distribution:")
print(campaigns_df['campaign_type'].value_counts())

print("\nSample campaigns:")
print(campaigns_df.head())

print("\nSample results:")
print(results_df.head(10))

print("\nResults statistics:")
print(results_df[['impressions', 'clicks', 'conversions']].describe())
