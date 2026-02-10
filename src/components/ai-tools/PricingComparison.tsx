'use client';

import { useState } from 'react';
import { Check, X, Sparkles } from 'lucide-react';

interface Tool {
  name: string;
  price: string;
  priceNumeric: number;
  features: string[];
  limits?: string;
}

interface Tier {
  name: string;
  price: string;
  priceNumeric: number;
  recommended?: boolean;
  tools: Tool[];
}

const pricingTiers: Tier[] = [
  {
    name: 'Free',
    price: '$0',
    priceNumeric: 0,
    tools: [
      {
        name: 'Leonardo.ai Free',
        price: '$0/mo',
        priceNumeric: 0,
        features: ['150 images/mo', 'Basic models'],
        limits: 'No API access',
      },
      {
        name: 'Stable Diffusion',
        price: '$0',
        priceNumeric: 0,
        features: ['Unlimited images', 'Local install', 'Full control'],
        limits: 'Requires GPU (M1/M2 Mac or dedicated GPU)',
      },
      {
        name: 'OBS Studio',
        price: '$0',
        priceNumeric: 0,
        features: ['Screen recording', 'Live streaming', 'Professional features'],
        limits: 'None',
      },
      {
        name: 'DaVinci Resolve',
        price: '$0',
        priceNumeric: 0,
        features: ['Video editing', 'Color grading', 'Professional tools'],
        limits: 'None',
      },
      {
        name: 'Canva Free',
        price: '$0/mo',
        priceNumeric: 0,
        features: ['Limited templates', 'Basic design tools'],
        limits: '5GB storage',
      },
    ],
  },
  {
    name: 'Starter',
    price: '$35',
    priceNumeric: 35,
    recommended: true,
    tools: [
      {
        name: 'Canva Pro',
        price: '$13/mo',
        priceNumeric: 13,
        features: ['100M+ stock photos', 'Brand kit', 'Remove background', 'Unlimited templates'],
      },
      {
        name: 'Leonardo.ai',
        price: '$12/mo',
        priceNumeric: 12,
        features: ['480 images/mo', 'API access', 'Custom models', 'Commercial license'],
      },
      {
        name: 'Pika Labs',
        price: '$10/mo',
        priceNumeric: 10,
        features: ['700 credits/mo', 'Video generation', 'Up to 3s clips', 'HD output'],
      },
    ],
  },
  {
    name: 'Professional',
    price: '$131',
    priceNumeric: 131,
    tools: [
      {
        name: 'Midjourney',
        price: '$30/mo',
        priceNumeric: 30,
        features: ['Unlimited images', 'Max quality', 'Commercial license', 'Fast generation'],
      },
      {
        name: 'Runway Gen-3',
        price: '$35/mo',
        priceNumeric: 35,
        features: ['5 videos/mo at 10s', '1280×768', 'Watermark-free', 'Gen-3 Alpha model'],
      },
      {
        name: 'HeyGen',
        price: '$29/mo',
        priceNumeric: 29,
        features: ['AI avatars', '15 min video/mo', '1080p export', 'Multiple voices'],
      },
      {
        name: 'Canva Pro',
        price: '$13/mo',
        priceNumeric: 13,
        features: ['100M+ stock photos', 'Brand kit', 'Remove background'],
      },
      {
        name: 'Descript',
        price: '$24/mo',
        priceNumeric: 24,
        features: ['Video editing', 'Transcription', 'AI voices', '10 hrs/mo transcription'],
      },
    ],
  },
];

export function PricingComparison() {
  const [selectedTier, setSelectedTier] = useState<string>('Starter');

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-mc-text mb-2">AI Content Tools Pricing</h2>
        <p className="text-mc-text-secondary">
          Choose the tier that matches your content production volume
        </p>
      </div>

      {/* Pricing Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {pricingTiers.map((tier) => (
          <div
            key={tier.name}
            className={`relative rounded-lg border ${
              tier.recommended
                ? 'border-mc-accent-purple shadow-lg shadow-mc-accent-purple/20'
                : 'border-mc-border'
            } bg-mc-bg-secondary p-6 transition-all duration-200 hover:scale-[1.02]`}
          >
            {/* Recommended Badge */}
            {tier.recommended && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-mc-accent-purple to-mc-accent-cyan text-white text-sm font-bold rounded-full flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                Recommended
              </div>
            )}

            {/* Tier Header */}
            <div className="text-center mb-6 mt-2">
              <h3 className="text-xl font-bold text-mc-text mb-2">{tier.name}</h3>
              <div className="flex items-baseline justify-center gap-1">
                <span className="text-4xl font-bold text-mc-text">{tier.price}</span>
                <span className="text-mc-text-secondary">/month</span>
              </div>
            </div>

            {/* Tools List */}
            <div className="space-y-4 mb-6">
              {tier.tools.map((tool, i) => (
                <div key={i} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-mc-text">{tool.name}</span>
                    <span className="text-sm text-mc-accent-cyan">{tool.price}</span>
                  </div>
                  <ul className="space-y-1">
                    {tool.features.map((feature, j) => (
                      <li key={j} className="flex items-start gap-2 text-sm text-mc-text-secondary">
                        <Check className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                    {tool.limits && (
                      <li className="flex items-start gap-2 text-sm text-mc-text-secondary">
                        <X className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                        <span>{tool.limits}</span>
                      </li>
                    )}
                  </ul>
                </div>
              ))}
            </div>

            {/* CTA Button */}
            <button
              onClick={() => setSelectedTier(tier.name)}
              className={`w-full py-3 rounded-lg font-semibold transition-all ${
                tier.recommended
                  ? 'bg-gradient-to-r from-mc-accent-purple to-mc-accent-cyan text-white hover:opacity-90'
                  : 'bg-mc-bg border border-mc-border text-mc-text hover:bg-mc-bg-tertiary'
              }`}
            >
              {selectedTier === tier.name ? 'Selected' : 'Get Started'}
            </button>
          </div>
        ))}
      </div>

      {/* Feature Comparison Table */}
      <div className="rounded-lg border border-mc-border bg-mc-bg-secondary p-6">
        <h3 className="text-xl font-bold text-mc-text mb-4">Feature Comparison</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-mc-border">
                <th className="text-left py-3 px-4 text-mc-text font-semibold">Feature</th>
                <th className="text-center py-3 px-4 text-mc-text font-semibold">Free</th>
                <th className="text-center py-3 px-4 text-mc-text font-semibold">Starter</th>
                <th className="text-center py-3 px-4 text-mc-text font-semibold">Professional</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-mc-border">
              <tr>
                <td className="py-3 px-4 text-mc-text">Image Generation</td>
                <td className="py-3 px-4 text-center">
                  <span className="text-mc-text-secondary text-sm">Limited (150/mo)</span>
                </td>
                <td className="py-3 px-4 text-center">
                  <span className="text-mc-text-secondary text-sm">480/mo + API</span>
                </td>
                <td className="py-3 px-4 text-center">
                  <Check className="w-5 h-5 text-green-400 mx-auto" />
                </td>
              </tr>
              <tr>
                <td className="py-3 px-4 text-mc-text">Video Generation</td>
                <td className="py-3 px-4 text-center">
                  <X className="w-5 h-5 text-red-400 mx-auto" />
                </td>
                <td className="py-3 px-4 text-center">
                  <span className="text-mc-text-secondary text-sm">700 credits/mo</span>
                </td>
                <td className="py-3 px-4 text-center">
                  <Check className="w-5 h-5 text-green-400 mx-auto" />
                </td>
              </tr>
              <tr>
                <td className="py-3 px-4 text-mc-text">AI Avatars</td>
                <td className="py-3 px-4 text-center">
                  <X className="w-5 h-5 text-red-400 mx-auto" />
                </td>
                <td className="py-3 px-4 text-center">
                  <X className="w-5 h-5 text-red-400 mx-auto" />
                </td>
                <td className="py-3 px-4 text-center">
                  <Check className="w-5 h-5 text-green-400 mx-auto" />
                </td>
              </tr>
              <tr>
                <td className="py-3 px-4 text-mc-text">Commercial License</td>
                <td className="py-3 px-4 text-center">
                  <span className="text-mc-text-secondary text-sm">Limited</span>
                </td>
                <td className="py-3 px-4 text-center">
                  <Check className="w-5 h-5 text-green-400 mx-auto" />
                </td>
                <td className="py-3 px-4 text-center">
                  <Check className="w-5 h-5 text-green-400 mx-auto" />
                </td>
              </tr>
              <tr>
                <td className="py-3 px-4 text-mc-text">Advanced Editing</td>
                <td className="py-3 px-4 text-center">
                  <Check className="w-5 h-5 text-green-400 mx-auto" />
                </td>
                <td className="py-3 px-4 text-center">
                  <X className="w-5 h-5 text-red-400 mx-auto" />
                </td>
                <td className="py-3 px-4 text-center">
                  <Check className="w-5 h-5 text-green-400 mx-auto" />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Recommendation */}
      <div className="rounded-lg border border-mc-accent-purple/30 bg-mc-accent-purple/10 p-6">
        <h3 className="text-lg font-bold text-mc-text mb-2">Our Recommendation</h3>
        <p className="text-mc-text-secondary mb-4">
          Start with the <strong className="text-mc-accent-purple">Starter tier ($35/mo)</strong> for the first month to test content volume and engagement.
          Upgrade to Professional if you&apos;re producing 50+ posts/month with video content or need AI avatars.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <h4 className="font-semibold text-mc-text mb-2">Upgrade to Professional if:</h4>
            <ul className="space-y-1 text-mc-text-secondary">
              <li>• Creating 3+ videos per week</li>
              <li>• Need AI avatars for talking heads</li>
              <li>• Require advanced editing (podcasts/interviews)</li>
              <li>• Want unlimited image generation</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-mc-text mb-2">Stick with Starter if:</h4>
            <ul className="space-y-1 text-mc-text-secondary">
              <li>• 10-20 posts per month</li>
              <li>• Image-focused content</li>
              <li>• Testing content strategy</li>
              <li>• Building initial audience</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
