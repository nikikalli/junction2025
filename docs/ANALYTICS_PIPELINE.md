# Analytics Pipeline Technical Documentation

## Overview

The analytics pipeline uses SAS Viya Cloud Analytic Services (CAS) to process campaign performance data, derive behavioral insights, and generate AI-ready segment profiles for automated marketing campaign personalization.

## Architecture

```
Input Data
  ├── user_segments.csv (raw segment demographics)
  ├── campaigns.csv (campaign definitions)
  └── campaign_results.csv (performance metrics)
       ↓
[SAS Viya CAS Platform]
  ├── Core Metrics (segment enrichment)
  ├── Phase 1: Pattern Detection
  ├── Phase 2: Cross-Campaign Analysis
  └── Phase 3: Predictive Analytics
       ↓
Output Data
  ├── user_segments_enriched.csv
  ├── campaign_metrics.csv
  ├── predictions.csv
  ├── segment_clusters.csv
  └── [analytics CSVs]
       ↓
[Gemini Prompt Generation]
       ↓
[Braze Campaign Automation]
```

## Technology Stack

### SAS Viya Components
- **SWAT (SAS Wrapper for Analytics Transfer)**: Python-to-CAS interface
- **CAS (Cloud Analytic Services)**: Distributed in-memory processing
- **FedSQL**: Distributed SQL engine for analytics queries
- **CAS Data Step**: SAS programming language for data manipulation

### Python Libraries
- swat: SAS Viya connection
- pandas: Data manipulation
- scikit-learn: ML models (GradientBoosting, KMeans)
- numpy: Numerical operations

## Pipeline Phases

### Core Campaign Metrics (Segment Enrichment)
**Module**: `backend/viya/core_campaign_metrics.py`

**Purpose**: Transform raw campaign performance into enriched behavioral attributes

**Process**:
1. Load segments, campaigns, and results into CAS tables
2. Calculate engagement and conversion metrics
3. Compute performance vs language/campaign-type benchmarks
4. Apply rolling window (last 100 campaigns) to derive segment attributes
5. Export enriched segments

**Key Metrics Derived**:
```python
engagement_propensity = (avg_engagement - 0.05) / 0.10  # normalized 0.2-0.9
price_sensitivity = compare(discount_response, premium_response)  # 0.3/0.5/0.8
brand_loyalty = premium_response > discount_response ? 0.7 : 0.4
channel_perf_* = normalized_channel_engagement  # email/push/inapp
values_* = normalized_value_theme_response  # family/eco/convenience/quality
```

**Outputs**:
- `user_segments_enriched.csv`: 40 segments with 16 behavioral attributes
- `campaign_metrics.csv`: 2000 campaign-segment performance records

**SQL Example**:
```sql
CREATE TABLE campaign_results AS
SELECT
    r.campaign_id, r.segment_id, r.impressions, r.clicks, r.conversions,
    CAST(r.clicks AS DOUBLE) / r.impressions AS engagement_rate,
    CAST(r.conversions AS DOUBLE) / r.impressions AS conversion_rate,
    CASE WHEN c.channel = 'email' THEN s.channel_perf_email
         WHEN c.channel = 'push' THEN s.channel_perf_push
         ELSE s.channel_perf_inapp END AS channel_match_score
FROM campaign_results_raw r
JOIN campaigns c ON r.campaign_id = c.campaign_id
JOIN segments s ON r.segment_id = s.segment_id
```

### Phase 1: Pattern Detection
**Module**: `backend/viya/pattern_detection.py`

**Purpose**: Identify consistent behavioral patterns and optimal campaign configurations

**Analyses**:

1. **Segment Consistency**
   - Measures response volatility across campaigns
   - Consistency score: 1 - (std_dev / mean)
   - High consistency (>0.7) indicates predictable segments

2. **Attribute Effectiveness**
   - Tests campaign_type x channel x sentiment x value_theme combinations
   - Identifies top-performing configurations
   - Calculates statistical significance via std error

3. **Interaction Effects**
   - Detects synergies between campaign attributes
   - Compares actual vs expected performance (additive baseline)
   - Interaction lift = (actual - expected) / expected

**Outputs**:
- `segment_consistency.csv`: Volatility and consistency metrics
- `attribute_effectiveness.csv`: Performance by campaign configuration
- `interaction_effects.csv`: Synergy analysis

**Key Insight**: discount + email shows +4.1% interaction lift

### Phase 2: Cross-Campaign Analysis
**Module**: `backend/viya/cross_campaign_analysis.py`

**Purpose**: Uncover sequential and thematic campaign patterns

**Analyses**:

1. **Campaign Type Affinity**
   - Classifies segments: edu_premium_affinity / discount_preference / balanced
   - Identifies natural campaign type preferences

2. **Educational Priming**
   - Tests if early educational engagement improves later premium conversions
   - Segments by exposure level: high/medium/low
   - Measures priming lift vs baseline

3. **Value Alignment**
   - Matches segment values to campaign themes
   - Calculates alignment lift when values match themes
   - Identifies dominant value drivers per segment

4. **Channel Versatility**
   - Multi-channel vs single-channel segment classification
   - Measures engagement variance across channels

**Outputs**:
- `campaign_type_affinity.csv`: Segment affinity classifications
- `educational_priming.csv`: Priming effect measurements
- `priming_effect_summary.csv`: Aggregate priming insights
- `value_theme_alignment.csv`: Value-theme matching analysis
- `value_alignment_impact.csv`: Alignment lift summary
- `channel_versatility.csv`: Multi-channel behavior

**Key Insight**: Value alignment delivers +12-19% conversion lift

### Phase 3: Predictive Analytics
**Module**: `backend/viya/predictive_analytics.py`

**Purpose**: Build ML models for conversion prediction and behavioral clustering

**Process**:

1. **Feature Engineering (in CAS)**
   ```sql
   CREATE TABLE model_features AS
   SELECT
       s.price_sensitivity, s.brand_loyalty, s.engagement_propensity,
       s.channel_perf_*, s.values_*,
       CASE WHEN c.channel = 'email' THEN s.channel_perf_email ... END AS channel_match_score,
       CASE WHEN (c.value_theme = 'family' AND s.values_family >= 0.27) ... END AS value_match,
       m.conversion_rate AS target
   FROM campaign_metrics m
   JOIN campaigns c ON m.campaign_id = c.campaign_id
   JOIN segments s ON m.segment_id = s.segment_id
   ```

2. **Conversion Prediction Model**
   - Algorithm: GradientBoostingRegressor (n_estimators=50, max_depth=5)
   - Features: 12 numeric + 4 categorical (encoded)
   - Train/test split: 80/20
   - Performance: R² = 0.57, MAE = 0.0022

3. **Behavioral Clustering**
   - Algorithm: K-Means (k=5, standardized features)
   - Features: campaign affinity, channel preference, value resonance, volatility
   - Output: 5 named clusters with recommendations

**Clusters Identified**:
```
budget_hunters (6 seg):      discount/email/convenience
eco_conscious_parents (12):  educational/push/eco_conscious
premium_quality_seekers (13): premium/email/quality
convenience_seekers (6):     educational/inapp/convenience
multi_channel_engagers (3):  premium/inapp/family
```

**Outputs**:
- `predictions.csv`: 2000 segment-campaign conversion predictions
- `model_summary.csv`: Model performance and feature importance
- `segment_clusters.csv`: Cluster assignments with recommendations
- `cluster_profiles.csv`: Cluster centroids and characteristics

**Key Insight**: campaign_type and value_match are top predictors (32% importance each)

## Data Flow

### Input Schema

**user_segments.csv**:
```
segment_id, language, parent_age, parent_gender, baby_count
```

**campaigns.csv**:
```
campaign_id, campaign_type, channel, message_sentiment, value_theme, offer_type, discount_percentage
```

**campaign_results.csv**:
```
campaign_id, segment_id, impressions, clicks, conversions
```

### Output Schema

**user_segments_enriched.csv** (core attributes):
```
segment_id, language, parent_age, parent_gender, baby_count,
engagement_propensity,           # 0.2-0.9 (likelihood to engage)
price_sensitivity,               # 0.3/0.5/0.8 (discount responsiveness)
brand_loyalty,                   # 0.4/0.7 (premium affinity)
channel_perf_email,              # 0-1 (email effectiveness)
channel_perf_push,               # 0-1 (push notification effectiveness)
channel_perf_inapp,              # 0-1 (in-app message effectiveness)
values_family,                   # 0-1 (family theme resonance)
values_eco_conscious,            # 0-1 (eco theme resonance)
values_convenience,              # 0-1 (convenience theme resonance)
values_quality,                  # 0-1 (quality theme resonance)
contact_frequency_tolerance,     # 0.1-1.0 (contact frequency tolerance)
content_engagement_rate          # 0.1-1.0 (content engagement propensity)
```

## Usage

### Running the Full Pipeline

```bash
# From project root
python3 -m backend.viya.core_campaign_metrics
python3 -m backend.viya.pattern_detection
python3 -m backend.viya.cross_campaign_analysis
python3 -m backend.viya.predictive_analytics
```

### Environment Variables Required

```bash
VIYA_HOSTNAME=viya-xxx.engage.sas.com
VIYA_CLIENT_ID=your_client_id
VIYA_CLIENT_SECRET=your_client_secret
VIYA_REMOTE=https://viya-xxx.engage.sas.com  # optional, defaults to hostname
```

### Running Individual Analyses

```python
from backend.viya.core_campaign_metrics import ViyaCampaignAnalytics

analytics = ViyaCampaignAnalytics()
analytics.load_data()
analytics.calculate_metrics()
analytics.derive_segment_attributes()
analytics.export_segments()
analytics.close()
```

## Key Algorithms

### Segment Attribute Derivation

**Engagement Propensity**:
```python
engagement_propensity = (avg_engagement - 0.05) / 0.10
engagement_propensity = clip(engagement_propensity, 0.2, 0.9)
```

**Price Sensitivity**:
```python
if discount_response > premium_response * 1.3:
    price_sensitivity = 0.8  # high
elif discount_response < premium_response * 0.7:
    price_sensitivity = 0.3  # low
else:
    price_sensitivity = 0.5  # medium
```

**Channel Performance Normalization**:
```python
total_channel_perf = email_perf + push_perf + inapp_perf
channel_perf_email = (email_perf / total_channel_perf) * 1.5
channel_perf_email = clip(channel_perf_email, 0, 1.0)
```

### Rolling Window Pattern (CAS Data Step)

```sas
data campaign_results_ranked;
    set campaign_results_vs_benchmark;
    by segment_id campaign_id;
    retain campaign_rank;
    if first.segment_id then campaign_rank = 1;
    else campaign_rank + 1;
    if campaign_rank <= 100;  /* last 100 campaigns only */
run;
```

### Value Alignment Detection

```sql
CASE
    WHEN (c.value_theme = 'family' AND s.values_family >= 0.27)
      OR (c.value_theme = 'eco_conscious' AND s.values_eco_conscious >= 0.27)
      OR (c.value_theme = 'convenience' AND s.values_convenience >= 0.27)
      OR (c.value_theme = 'quality' AND s.values_quality >= 0.27)
    THEN 1 ELSE 0
END AS value_match
```

## Performance Characteristics

### Processing Times (typical)
- Core Metrics: 5-10 seconds (2000 records)
- Pattern Detection: 3-5 seconds
- Cross-Campaign Analysis: 4-6 seconds
- Predictive Analytics: 8-12 seconds (includes ML training)

### Scalability
- CAS distributed processing handles 100K+ segments
- In-memory analytics eliminate I/O bottlenecks
- FedSQL optimizes query execution across nodes

### Data Volumes
- Current: 40 segments, 50 campaigns, 2000 results
- Production capacity: 10K+ segments, 1K+ campaigns, 10M+ results

## Integration Points

### Downstream Consumers

**Gemini Prompt Generation** (`backend/viya/generate_prompt.py`):
- Reads: `user_segments_enriched.csv`
- Uses segment attributes to construct personalized prompts
- Outputs: `gemini_prompts.json`

**Recommendation Engine** (`backend/viya/recommendation_engine.py`):
- Reads: `segment_clusters.csv`, `predictions.csv`
- Generates campaign recommendations per segment
- Integrates with Braze API

### Upstream Data Sources
- User demographic data (CRM exports)
- Campaign definitions (marketing team)
- Historical performance metrics (Braze API)

## Error Handling

### Connection Failures
```python
if not all([hostname, client_id, client_secret]):
    raise ValueError("Missing required environment variables")

if not response.ok:
    raise ConnectionError(f"Auth failed: {response.text}")
```

### Data Quality Checks
- Null value handling via COALESCE with defaults
- Clipping to valid ranges (engagement_propensity: 0.2-0.9)
- Minimum sample size requirements (HAVING COUNT(*) >= 5)

### Session Management
```python
try:
    analytics = ViyaCampaignAnalytics()
    # ... processing
finally:
    analytics.close()  # ensures CAS session cleanup
```

## Monitoring and Observability

### Execution Logs
Each phase prints:
- Authentication status
- CAS connection details
- Table creation confirmations
- Row counts
- Summary statistics

### Output Validation
```python
# Example from core_campaign_metrics.py
print(f"Exported {len(learned)} segments to {output_path}")
print(learned[['engagement_propensity', 'price_sensitivity', 'brand_loyalty']].describe())
```

## Troubleshooting

### Common Issues

**Import Error: "attempted relative import with no known parent package"**
```bash
# Solution: Run as module, not script
python3 -m backend.viya.core_campaign_metrics
# NOT: python3 backend/viya/core_campaign_metrics.py
```

**Connection Timeout**
- Check VIYA_HOSTNAME is accessible
- Verify client credentials are valid
- Ensure CAS service is running

**Missing Data Files**
- Run `scripts/generate_campaigns.py` first to create synthetic data
- Verify data directory structure: data/input/, data/generated/, data/output/

**Low Model Performance**
- Ensure sufficient campaign history (100+ per segment)
- Check data quality (nulls, outliers)
- Validate feature engineering logic

## Future Enhancements

### Planned Improvements
1. Real-time prediction API endpoint
2. Incremental learning (update models without full retraining)
3. A/B test result integration
4. Multi-language content optimization
5. Time-series forecasting for seasonal patterns

### Scalability Roadmap
1. Partition CAS tables by language/country
2. Implement data retention policies (rolling 12-month window)
3. Distributed model training across CAS workers
4. Cache frequently-accessed segment profiles

## References

### SAS Viya Documentation
- [SWAT Python API](https://sassoftware.github.io/python-swat/)
- [FedSQL Reference](https://documentation.sas.com/doc/en/pgmsascdc/v_048/casref/titlepage.htm)
- [CAS Action Sets](https://documentation.sas.com/doc/en/pgmsascdc/v_048/casref/titlepage.htm)

### Internal Resources
- `backend/viya/config.py`: Configuration constants
- `backend/viya/prompt_blocks.json`: Prompt templates
- `.env.example`: Required environment variables
