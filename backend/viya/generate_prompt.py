import json
import sys
import os

script_dir = os.path.dirname(os.path.abspath(__file__))
prompt_blocks_path = os.path.join(script_dir, 'prompt_blocks.json')

with open(prompt_blocks_path, 'r') as f:
    PROMPT_BLOCKS = json.load(f)


def categorize_score(score):
    if score > 0.5:
        return "high"
    elif score < 0.35:
        return "low"
    else:
        return "medium"


def rank_value_drivers(segment):
    values = {
        'family_orientation': segment['values_family'],
        'eco_consciousness': segment['values_eco_conscious'],
        'convenience_preference': segment['values_convenience'],
        'quality_focus': segment['values_quality']
    }
    sorted_values = sorted(values.items(), key=lambda x: x[1], reverse=True)
    return sorted_values[0][0], sorted_values[1][0]


def select_channel(segment, is_email_campaign=False):
    if is_email_campaign:
        channel = "email"
    else:
        if segment['channel_perf_push'] > segment['channel_perf_inapp']:
            channel = "push_notification"
        else:
            channel = "in_app_message"

    constraints = PROMPT_BLOCKS["channel_constraints"][channel]
    return channel, constraints


def calculate_timing(frequency_tolerance):
    if frequency_tolerance >= 0.5:
        return 7
    elif frequency_tolerance >= 0.35:
        return 10
    else:
        return 14


def find_best_prompt_block(segment):
    price_cat = categorize_score(segment['price_sensitivity'])
    loyalty_cat = categorize_score(segment['brand_loyalty'])
    engagement_cat = categorize_score(segment['engagement_propensity'])
    primary_value, _ = rank_value_drivers(segment)

    blocks = PROMPT_BLOCKS["behavioral_combinations"]

    if price_cat == "high" and primary_value == "family_orientation":
        return blocks["price_driven_family_focused"]
    elif loyalty_cat == "high" and primary_value == "quality_focus":
        return blocks["quality_focused_loyal"]
    elif engagement_cat == "low" and primary_value == "convenience_preference":
        return blocks["convenience_seeker_low_engagement"]
    elif engagement_cat == "high" and primary_value == "eco_consciousness":
        return blocks["eco_conscious_engaged"]
    elif price_cat == "high" and primary_value == "convenience_preference":
        return blocks["price_driven_convenience_seeker"]
    elif loyalty_cat == "high" and primary_value == "eco_consciousness":
        return blocks["quality_focused_eco_conscious"]
    elif engagement_cat == "high" and primary_value == "family_orientation":
        return blocks["engaged_family_focused"]
    elif engagement_cat == "low" and primary_value == "quality_focus":
        return blocks["low_engagement_quality_seeker"]
    elif price_cat == "medium" and engagement_cat == "medium":
        return blocks["balanced_moderate"]
    else:
        return blocks["default_balanced"]


def generate_prompt(segment, is_email_campaign=False):
    channel, constraints = select_channel(segment, is_email_campaign)
    timing = calculate_timing(segment['contact_frequency_tolerance'])
    prompt_block = find_best_prompt_block(segment)
    primary_value, secondary_value = rank_value_drivers(segment)

    value_names = {
        'family_orientation': 'family moments and bonding experiences',
        'eco_consciousness': 'environmental impact and sustainability',
        'convenience_preference': 'time-saving and easy solutions',
        'quality_focus': 'premium quality and reliability'
    }

    return {
        "delivery_settings": {
            "channel": channel,
            "send_timing_days_from_today": timing,
            "message_constraints": constraints
        },
        "audience_profile": {
            "behavioral_summary": prompt_block["behavioral_summary"],
            "primary_value_driver": value_names[primary_value],
            "secondary_value_driver": value_names[secondary_value],
            "motivational_triggers": prompt_block["motivational_triggers"]
        },
        "content_guidance": {
            "recommended_tone": prompt_block["tone"],
            "messaging_approach": prompt_block["messaging_approach"],
            "what_resonates": prompt_block["what_resonates"],
            "what_to_avoid": prompt_block["what_to_avoid"]
        }
    }


def validate_segment(segment):
    required_fields = [
        'language', 'parent_age', 'parent_gender', 'baby_count',
        'engagement_propensity', 'price_sensitivity', 'brand_loyalty',
        'contact_frequency_tolerance', 'content_engagement_rate',
        'channel_perf_email', 'channel_perf_push', 'channel_perf_inapp',
        'values_family', 'values_eco_conscious', 'values_convenience', 'values_quality'
    ]

    missing_fields = [field for field in required_fields if field not in segment]
    if missing_fields:
        raise ValueError(f"Missing required fields: {', '.join(missing_fields)}")

    numeric_fields = [
        'engagement_propensity', 'price_sensitivity', 'brand_loyalty',
        'contact_frequency_tolerance', 'content_engagement_rate',
        'channel_perf_email', 'channel_perf_push', 'channel_perf_inapp',
        'values_family', 'values_eco_conscious', 'values_convenience', 'values_quality'
    ]

    for field in numeric_fields:
        if segment[field] is None:
            raise ValueError(f"Field '{field}' cannot be null")
        if not isinstance(segment[field], (int, float)):
            raise ValueError(f"Field '{field}' must be a number, got {type(segment[field]).__name__}")
        if not 0 <= segment[field] <= 1:
            raise ValueError(f"Field '{field}' must be between 0 and 1, got {segment[field]}")


if __name__ == "__main__":
    try:
        input_data = sys.stdin.read().strip()
        if not input_data:
            raise ValueError("No input data provided")

        input_json = json.loads(input_data)

        segment_data = input_json.get('segment', input_json)
        is_email_campaign = input_json.get('is_email_campaign', False)

        validate_segment(segment_data)
        prompt = generate_prompt(segment_data, is_email_campaign)
        print(json.dumps(prompt, indent=2))
    except json.JSONDecodeError as e:
        error_response = {"error": f"Invalid JSON: {str(e)}"}
        print(json.dumps(error_response), file=sys.stderr)
        sys.exit(1)
    except ValueError as e:
        error_response = {"error": f"Validation error: {str(e)}"}
        print(json.dumps(error_response), file=sys.stderr)
        sys.exit(1)
    except Exception as e:
        error_response = {"error": f"Unexpected error: {str(e)}"}
        print(json.dumps(error_response), file=sys.stderr)
        sys.exit(1)
