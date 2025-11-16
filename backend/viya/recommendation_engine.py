import pandas as pd
import json
import os


class GeminiPromptGenerator:
    def __init__(self):
        base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
        self.output_dir = os.path.join(base_dir, 'data', 'output')
        os.makedirs(self.output_dir, exist_ok=True)
        self.segments = None

        prompt_blocks_path = os.path.join(os.path.dirname(__file__), 'prompt_blocks.json')
        with open(prompt_blocks_path, 'r') as f:
            self.prompt_blocks = json.load(f)

    def load_segments(self):
        print("\nLoading segment data...")
        self.segments = pd.read_csv(f'{self.output_dir}/user_segments_enriched.csv')
        print(f"Loaded {len(self.segments)} segments")

    def _categorize_score(self, score):
        if score > 0.6:
            return "high"
        elif score < 0.4:
            return "low"
        else:
            return "medium"

    def _rank_value_drivers(self, segment):
        values = {
            'family_orientation': segment['values_family'],
            'eco_consciousness': segment['values_eco_conscious'],
            'convenience_preference': segment['values_convenience'],
            'quality_focus': segment['values_quality']
        }

        sorted_values = sorted(values.items(), key=lambda x: x[1], reverse=True)
        return sorted_values[0][0], sorted_values[1][0]

    def _select_channel(self, segment):
        if segment['channel_perf_push'] > segment['channel_perf_inapp']:
            channel = "push_notification"
        else:
            channel = "in_app_message"

        constraints = self.prompt_blocks["channel_constraints"][channel]
        return channel, constraints

    def _calculate_timing(self, frequency_tolerance):
        base_interval = 7
        timing = max(1, min(14, int(base_interval / max(frequency_tolerance, 0.2))))
        return timing

    def _find_best_prompt_block(self, segment):
        price_cat = self._categorize_score(segment['price_sensitivity'])
        loyalty_cat = self._categorize_score(segment['brand_loyalty'])
        engagement_cat = self._categorize_score(segment['engagement_propensity'])
        primary_value, _ = self._rank_value_drivers(segment)

        blocks = self.prompt_blocks["behavioral_combinations"]

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

    def generate_prompt(self, segment):
        channel, constraints = self._select_channel(segment)
        timing = self._calculate_timing(segment['contact_frequency_tolerance'])
        prompt_block = self._find_best_prompt_block(segment)
        primary_value, secondary_value = self._rank_value_drivers(segment)

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

    def run(self):
        print("=" * 60)
        print("PHASE 4: GEMINI PROMPT GENERATION")
        print("=" * 60)

        try:
            self.load_segments()

            print("\nGenerating Gemini prompts for all segments...")
            prompts = []

            for _, segment in self.segments.iterrows():
                prompt = self.generate_prompt(segment)
                prompts.append(prompt)

            output_path = f'{self.output_dir}/gemini_prompts.json'
            with open(output_path, 'w') as f:
                json.dump(prompts, f, indent=2)

            print(f"\nSaved {len(prompts)} prompts to {output_path}")

            channel_dist = pd.Series([p['delivery_settings']['channel'] for p in prompts])
            print(f"\nChannel distribution:")
            print(channel_dist.value_counts())

            timing_dist = pd.Series([p['delivery_settings']['send_timing_days_from_today'] for p in prompts])
            print(f"\nTiming distribution (days from today):")
            print(timing_dist.describe())

            print("\n" + "=" * 60)
            print("PHASE 4 COMPLETE")
            print("=" * 60)
            print("\nOutput ready for Gemini integration:")
            print(f"  - gemini_prompts.json ({len(prompts)} segment prompts)")

        except Exception as e:
            print(f"Error: {e}")
            import traceback
            traceback.print_exc()


if __name__ == '__main__':
    generator = GeminiPromptGenerator()
    generator.run()
