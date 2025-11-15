import pandas as pd
import json
import os

class CampaignSpecificationGenerator:
    def __init__(self):
        base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
        self.output_dir = os.path.join(base_dir, 'data', 'output')
        os.makedirs(self.output_dir, exist_ok=True)

    def load_phase3_results(self):
        """Load clustering and prediction results from Phase 3"""
        print("\nLoading Phase 3 results...")

        self.segment_clusters = pd.read_csv(f'{self.output_dir}/segment_clusters.csv')
        self.cluster_profiles = pd.read_csv(f'{self.output_dir}/cluster_profiles.csv')

        print(f"Loaded {len(self.segment_clusters)} segment assignments")
        print(f"Loaded {len(self.cluster_profiles)} cluster profiles")

    def load_segment_attributes(self):
        """Load enriched segment attributes"""
        print("Loading segment attributes...")

        self.segments = pd.read_csv(f'{self.output_dir}/user_segments_enriched.csv')
        print(f"Loaded {len(self.segments)} segments with attributes")

    def get_tone_guidance(self, cluster_name, sentiment):
        """Generate tone guidance based on cluster and sentiment"""
        tone_map = {
            'budget_hunters': {
                'friendly': 'warm and supportive, emphasize savings',
                'urgent': 'direct and action-oriented, highlight limited-time offer',
                'informative': 'practical and helpful, focus on value'
            },
            'eco_conscious_parents': {
                'friendly': 'caring and earth-conscious, emphasize sustainability',
                'urgent': 'passionate about environmental impact',
                'informative': 'educational about eco-benefits'
            },
            'eco_warriors': {
                'friendly': 'caring and earth-conscious, emphasize sustainability',
                'urgent': 'passionate about environmental impact',
                'informative': 'educational about eco-benefits'
            },
            'premium_quality_seekers': {
                'friendly': 'reassuring and trust-building',
                'urgent': 'exclusive and premium',
                'informative': 'detailed and credible, quality-focused'
            },
            'convenience_seekers': {
                'friendly': 'helpful and time-saving focused',
                'urgent': 'efficiency-oriented',
                'informative': 'clear and straightforward about ease-of-use'
            },
            'multi_channel_engagers': {
                'friendly': 'engaging and versatile',
                'urgent': 'dynamic and action-oriented',
                'informative': 'comprehensive and multi-faceted'
            }
        }

        return tone_map.get(cluster_name, {}).get(sentiment, 'professional and helpful')

    def get_key_messages(self, campaign_type, value_theme):
        """Generate key message themes"""
        messages = []

        if campaign_type == 'discount':
            messages.append('special offer')
        elif campaign_type == 'premium':
            messages.append('premium quality')
        elif campaign_type == 'educational':
            messages.append('expert tips')

        theme_messages = {
            'family': 'family moments',
            'eco_conscious': 'environmental care',
            'convenience': 'time-saving',
            'quality': 'trusted protection'
        }
        messages.append(theme_messages.get(value_theme, 'product benefits'))

        if campaign_type != 'educational':
            messages.append('easy shopping')

        return ', '.join(messages)

    def get_content_guidelines(self, segment_attrs, campaign_type, cluster_name):
        """Generate dos and don'ts for content creation"""
        dos = []
        donts = []

        if segment_attrs['price_sensitivity'] > 0.6:
            dos.append('highlight discount percentage and savings')
            donts.append('use premium/luxury positioning')
        else:
            dos.append('emphasize quality and premium features')
            donts.append('focus primarily on price/discounts')

        if segment_attrs['brand_loyalty'] > 0.6:
            dos.append('reinforce brand trust and quality reputation')
        else:
            dos.append('include social proof and testimonials')

        if campaign_type == 'educational':
            dos.append('provide valuable parenting tips and insights')
            donts.append('be overly sales-focused')

        dos.append('use simple, clear language')
        donts.append('use technical jargon or complex terms')

        return {
            'dos': dos,
            'donts': donts,
            'formatted': f"DO: {'; '.join(dos)}; DONT: {'; '.join(donts)}"
        }

    def get_channel_constraints(self, channel):
        """Get channel-specific creative constraints"""
        constraints = {
            'email': {
                'subject_line_max': 50,
                'body_max': 400,
                'structure': 'hero image, brief intro, 3 key benefits, clear CTA',
                'visual_style': 'bright, clean, family-friendly'
            },
            'push': {
                'title_max': 50,
                'body_max': 120,
                'structure': 'attention-grabbing title, concise benefit, direct CTA',
                'visual_style': 'bold, clear, mobile-optimized'
            },
            'inapp': {
                'title_max': 60,
                'body_max': 300,
                'structure': 'product image, benefit headline, supporting details, soft CTA',
                'visual_style': 'app-native, seamless integration'
            }
        }
        return constraints.get(channel, constraints['email'])

    def build_content_prompt(self, segment_spec, segment_attrs, guidelines):
        """Build comprehensive prompt for LLM content generation"""

        persona_desc = segment_spec['segment_context']
        campaign_type = segment_spec['campaign_type']
        channel = segment_spec['channel']
        sentiment = segment_spec['message_sentiment']
        value_theme = segment_spec['value_theme']

        campaign_type_focus = {
            'discount': f"emphasize {segment_spec['key_messages'].split(',')[0]} with clear savings message",
            'premium': 'highlight premium features, quality, and brand trust',
            'educational': 'provide valuable parenting insights that build trust'
        }

        prompt = f"Create {channel} content for {persona_desc.lower()}. "
        prompt += f"Campaign focus: {campaign_type_focus.get(campaign_type, 'product benefits')}. "
        prompt += f"Tone: {segment_spec['tone_guidance']}. "
        prompt += f"Value theme: {value_theme.replace('_', ' ')}. "
        prompt += f"Emphasize: {segment_spec['key_messages']}. "
        prompt += f"Avoid: {', '.join(guidelines['donts'])}."

        return prompt

    def generate_creative_guidelines(self, channel, campaign_type, value_theme):
        """Generate channel-specific creative guidelines"""
        constraints = self.get_channel_constraints(channel)

        cta_map = {
            ('discount', 'email'): 'Shop Now - Save 20%',
            ('discount', 'push'): 'Get Your Discount',
            ('discount', 'inapp'): 'Claim Offer',
            ('premium', 'email'): 'Discover Premium Quality',
            ('premium', 'push'): 'Explore Premium',
            ('premium', 'inapp'): 'Learn More',
            ('educational', 'email'): 'Read Expert Tips',
            ('educational', 'push'): 'Get Parenting Tips',
            ('educational', 'inapp'): 'Learn More'
        }

        cta = cta_map.get((campaign_type, channel), 'Learn More')

        guidelines = {
            'call_to_action': cta,
            'visual_style': constraints['visual_style']
        }

        if channel == 'email':
            guidelines['subject_line_style'] = 'benefit-focused'
            guidelines['email_structure'] = constraints['structure']
            guidelines['max_body_length'] = constraints['body_max']
        elif channel == 'push':
            guidelines['max_title_length'] = constraints['title_max']
            guidelines['max_body_length'] = constraints['body_max']
        else:
            guidelines['max_title_length'] = constraints['title_max']
            guidelines['max_detail_length'] = constraints['body_max']
            guidelines['in_app_structure'] = constraints['structure']

        return guidelines

    def generate_specifications(self):
        """Generate campaign specifications for all segments"""
        print("\nGenerating campaign specifications for all segments...")

        specs_list = []
        prompts_dict = {}

        for _, seg_cluster in self.segment_clusters.iterrows():
            segment_id = seg_cluster['segment_id']
            cluster_name = seg_cluster['cluster_name']

            segment_row = self.segments[self.segments['segment_id'] == segment_id].iloc[0]

            campaign_type = seg_cluster['recommended_campaign_type']
            channel = seg_cluster['recommended_channel']
            sentiment = 'friendly' if segment_row['engagement_propensity'] > 0.6 else 'informative'

            value_theme = seg_cluster['recommended_theme']

            tone = self.get_tone_guidance(cluster_name, sentiment)
            key_msgs = self.get_key_messages(campaign_type, value_theme)

            segment_attrs = {
                'price_sensitivity': segment_row['price_sensitivity'],
                'brand_loyalty': segment_row['brand_loyalty'],
                'engagement_propensity': segment_row['engagement_propensity']
            }

            guidelines = self.get_content_guidelines(segment_attrs, campaign_type, cluster_name)

            cluster_profile = self.cluster_profiles[
                self.cluster_profiles['cluster_name'] == cluster_name
            ].iloc[0]

            persona_map = {
                'budget_hunters': 'Budget-conscious parents who prioritize value and convenience',
                'eco_conscious_parents': 'Environmentally-conscious parents who value sustainability',
                'eco_warriors': 'Environmentally-conscious parents who value sustainability',
                'premium_quality_seekers': 'Quality-focused parents who prioritize premium products and brand trust',
                'convenience_seekers': 'Busy parents who prioritize time-saving solutions',
                'multi_channel_engagers': 'Highly engaged parents who interact across multiple channels'
            }

            segment_context = persona_map.get(cluster_name, 'Parents seeking quality baby products')

            expected_conv_str = seg_cluster['expected_conversion']
            expected_conv = float(expected_conv_str.rstrip('%')) if isinstance(expected_conv_str, str) else expected_conv_str

            confidence = 0.85 if segment_row['engagement_propensity'] > 0.6 else 0.75

            spec = {
                'segment_id': segment_id,
                'cluster_name': cluster_name,
                'campaign_type': campaign_type,
                'channel': channel,
                'message_sentiment': sentiment,
                'value_theme': value_theme,
                'tone_guidance': tone,
                'key_messages': key_msgs,
                'content_guidelines': guidelines['formatted'],
                'segment_context': segment_context,
                'expected_conversion': expected_conv,
                'expected_engagement': round(segment_row['engagement_propensity'] * 10, 1),
                'confidence_score': confidence
            }

            specs_list.append(spec)

            creative_guidelines = self.generate_creative_guidelines(channel, campaign_type, value_theme)
            content_prompt = self.build_content_prompt(spec, segment_attrs, guidelines)

            prompts_dict[f'segment_{segment_id}'] = {
                'persona': segment_context,
                'behavioral_traits': {
                    'price_sensitivity': round(segment_attrs['price_sensitivity'], 2),
                    'brand_loyalty': round(segment_attrs['brand_loyalty'], 2),
                    'engagement_propensity': round(segment_attrs['engagement_propensity'], 2),
                    'channel_preference': channel
                },
                'campaign_spec': {
                    'type': campaign_type,
                    'channel': channel,
                    'sentiment': sentiment,
                    'value_theme': value_theme
                },
                'content_prompt': content_prompt,
                'creative_guidelines': creative_guidelines,
                'message_dos': guidelines['dos'],
                'message_donts': guidelines['donts'],
                'expected_performance': {
                    'conversion_rate': round(expected_conv / 100, 4),
                    'engagement_rate': round(segment_row['engagement_propensity'], 4),
                    'confidence_score': confidence
                }
            }

        return pd.DataFrame(specs_list), prompts_dict

    def save_outputs(self, specs_df, prompts_dict):
        """Save specifications and prompts to files"""
        print("\nSaving outputs...")

        csv_path = f'{self.output_dir}/campaign_specifications.csv'
        specs_df.to_csv(csv_path, index=False)
        print(f"Saved: {csv_path}")

        json_path = f'{self.output_dir}/content_generation_prompts.json'
        with open(json_path, 'w') as f:
            json.dump(prompts_dict, f, indent=2)
        print(f"Saved: {json_path}")

        print(f"\nGenerated specifications for {len(specs_df)} segments")
        print(f"\nCluster distribution:")
        print(specs_df['cluster_name'].value_counts())
        print(f"\nCampaign type distribution:")
        print(specs_df['campaign_type'].value_counts())
        print(f"\nChannel distribution:")
        print(specs_df['channel'].value_counts())

    def run(self):
        """Execute complete recommendation engine pipeline"""
        print("=" * 60)
        print("PHASE 4: AI-READY CAMPAIGN SPECIFICATION GENERATOR")
        print("=" * 60)

        try:
            self.load_phase3_results()
            self.load_segment_attributes()

            specs_df, prompts_dict = self.generate_specifications()
            self.save_outputs(specs_df, prompts_dict)

            print("\n" + "=" * 60)
            print("PHASE 4 COMPLETE")
            print("=" * 60)
            print("\nOutputs ready for generative AI integration:")
            print("  - campaign_specifications.csv (structured data)")
            print("  - content_generation_prompts.json (LLM-ready prompts)")

        except Exception as e:
            print(f"Error: {e}")
            import traceback
            traceback.print_exc()

if __name__ == '__main__':
    generator = CampaignSpecificationGenerator()
    generator.run()
