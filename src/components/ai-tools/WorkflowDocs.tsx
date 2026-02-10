'use client';

import { ArrowRight, Code2, Sparkles, Eye, Share2, BarChart3, BookOpen } from 'lucide-react';

const workflowSteps = [
  {
    number: 1,
    title: 'IDEATION',
    icon: Sparkles,
    description: 'Brain suggests topics based on patterns',
    details: ['Health, career, content domains', 'Signal history analysis', 'Trending topics detection'],
    color: 'text-purple-400',
  },
  {
    number: 2,
    title: 'CREATION',
    icon: Code2,
    description: 'Generate content with Arkeus skills',
    details: ['/blog "AI sycophancy patterns"', '/thread "5 findings from research"', 'Uses Claude Sonnet for generation'],
    color: 'text-blue-400',
  },
  {
    number: 3,
    title: 'VOICE FILTER',
    icon: Eye,
    description: 'Apply refraction lens for authentic voice',
    details: [
      '/voice "Draft in my voice" --profile thought-leadership',
      'Applies refraction lens from ~/.arkeus/refraction/',
      'Filters sycophancy and generic patterns',
    ],
    color: 'text-cyan-400',
  },
  {
    number: 4,
    title: 'SCORE',
    icon: BarChart3,
    description: 'Rate authenticity against target',
    details: ['/score "Rate authenticity" --target 0.8', '40/30/30 weighting: deletions/additions/structure', 'Reject if score < target'],
    color: 'text-green-400',
  },
  {
    number: 5,
    title: 'VISUAL',
    icon: Sparkles,
    description: 'Generate featured image',
    details: ['Leonardo.ai API: Generate image', 'Prompt: "Abstract visualization of [topic]"', 'Commercial license included'],
    color: 'text-yellow-400',
  },
  {
    number: 6,
    title: 'VIDEO (optional)',
    icon: Code2,
    description: 'Create video content',
    details: ['Runway Gen-3: B-roll footage (10s clips)', 'HeyGen: AI avatar talking head', 'Descript: Edit and transcribe'],
    color: 'text-pink-400',
  },
  {
    number: 7,
    title: 'DISTRIBUTE',
    icon: Share2,
    description: 'Multi-platform scheduling',
    details: [
      '/distribute "LinkedIn, X, Substack" --schedule "2026-02-10 09:00"',
      'Creates entries in Content Studio calendar',
      'Tracks status per platform',
    ],
    color: 'text-orange-400',
  },
  {
    number: 8,
    title: 'MONITOR',
    icon: BarChart3,
    description: 'Track engagement metrics',
    details: ['Social Monitoring Dashboard', 'Views, saves, shares, comments', 'Sentiment analysis'],
    color: 'text-red-400',
  },
  {
    number: 9,
    title: 'LEARN',
    icon: BookOpen,
    description: 'Update refraction lens from outcomes',
    details: [
      'Learner records outcomes',
      'If post rejected: high weight signal',
      'Lens updates weekly or on 5+ rejections',
    ],
    color: 'text-indigo-400',
  },
];

const arkeusSkills = [
  {
    name: '/blog',
    purpose: 'Generate blog post in Ryan&apos;s voice',
    example: '/blog "AI sycophancy patterns in RLHF training"',
    output: 'Full article with title, sections, conclusion',
  },
  {
    name: '/thread',
    purpose: 'Generate X (Twitter) thread',
    example: '/thread "5 findings from factorial testing"',
    output: '8-12 tweet thread with hooks and CTAs',
  },
  {
    name: '/voice',
    purpose: 'Apply refraction lens (voice filter)',
    example: '/voice "Draft email" --profile executive',
    output: 'Content rewritten in authentic voice',
  },
  {
    name: '/score',
    purpose: 'Rate authenticity (0-1.0)',
    example: '/score "Check this draft"',
    output: 'Score + breakdown (deletions 40%, additions 30%, structure 30%)',
  },
  {
    name: '/distribute',
    purpose: 'Multi-platform scheduling',
    example: '/distribute "LinkedIn, X" --schedule "tomorrow 9am"',
    output: 'Creates entries in Content Studio calendar',
  },
];

const toolIntegrations = [
  {
    tool: 'Leonardo.ai',
    purpose: 'Image Generation',
    code: `// Leonardo.ai Image Generation Request
const response = await fetch('https://cloud.leonardo.ai/api/rest/v1/generations', {
  method: 'POST',
  headers: {
    'Authorization': \`Bearer \${LEONARDO_API_KEY}\`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    prompt: "Abstract visualization of AI alignment patterns, purple and cyan gradient",
    num_images: 1,
    width: 1280,
    height: 720,
    modelId: "6b645e3a-d64f-4341-a6d8-7a3690fbf042" // Leonardo Diffusion XL
  })
});`,
  },
  {
    tool: 'Runway Gen-3',
    purpose: 'Video Generation',
    code: `// Runway Gen-3 Video Generation
const response = await fetch('https://api.runwayml.com/v1/generate', {
  method: 'POST',
  headers: {
    'Authorization': \`Bearer \${RUNWAY_API_KEY}\`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    prompt: "Abstract particles forming neural network connections",
    duration: 10,
    resolution: "1280x768",
    model: "gen-3-alpha"
  })
});`,
  },
  {
    tool: 'HeyGen',
    purpose: 'AI Avatar Video',
    code: `// HeyGen Avatar Video Creation
const response = await fetch('https://api.heygen.com/v1/video.generate', {
  method: 'POST',
  headers: {
    'X-Api-Key': HEYGEN_API_KEY,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    video_inputs: [{
      character: {
        type: "avatar",
        avatar_id: "your-avatar-id"
      },
      voice: {
        type: "text",
        input_text: "AI sycophancy is a structural problem in RLHF training...",
        voice_id: "your-voice-id"
      }
    }],
    dimension: { width: 1920, height: 1080 }
  })
});`,
  },
];

export function WorkflowDocs() {
  return (
    <div className="space-y-12">
      {/* Workflow Diagram */}
      <div>
        <h2 className="text-3xl font-bold text-mc-text mb-6 text-center">Content Creation Workflow</h2>
        <div className="space-y-6">
          {workflowSteps.map((step, index) => (
            <div key={step.number}>
              <div className="flex items-start gap-6">
                {/* Step Number & Icon */}
                <div className="flex-shrink-0">
                  <div className={`w-16 h-16 rounded-full border-2 border-mc-border bg-mc-bg-secondary flex items-center justify-center ${step.color} font-bold text-2xl`}>
                    {step.number}
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 rounded-lg border border-mc-border bg-mc-bg-secondary p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <step.icon className={`w-6 h-6 ${step.color}`} />
                    <h3 className="text-xl font-bold text-mc-text">{step.title}</h3>
                  </div>
                  <p className="text-mc-text-secondary mb-4">{step.description}</p>
                  <ul className="space-y-2">
                    {step.details.map((detail, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <ArrowRight className={`w-4 h-4 mt-0.5 flex-shrink-0 ${step.color}`} />
                        <span className="text-mc-text-secondary font-mono">{detail}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Arrow to next step */}
              {index < workflowSteps.length - 1 && (
                <div className="flex justify-center my-4">
                  <ArrowRight className="w-6 h-6 text-mc-text-secondary rotate-90" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Arkeus Skills Integration */}
      <div className="rounded-lg border border-mc-border bg-mc-bg-secondary p-6">
        <h3 className="text-2xl font-bold text-mc-text mb-6">Arkeus Skills Integration</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {arkeusSkills.map((skill) => (
            <div key={skill.name} className="rounded-lg border border-mc-border bg-mc-bg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Code2 className="w-5 h-5 text-mc-accent-purple" />
                <h4 className="text-lg font-bold text-mc-text font-mono">{skill.name}</h4>
              </div>
              <p className="text-sm text-mc-text-secondary mb-3">{skill.purpose}</p>
              <div className="space-y-2">
                <div className="text-xs text-mc-text-secondary font-semibold">Example:</div>
                <code className="block px-3 py-2 bg-mc-bg-tertiary rounded text-sm text-mc-accent-cyan font-mono">
                  {skill.example}
                </code>
                <div className="text-xs text-mc-text-secondary">
                  <strong>Output:</strong> {skill.output}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tool Integration Examples */}
      <div className="rounded-lg border border-mc-border bg-mc-bg-secondary p-6">
        <h3 className="text-2xl font-bold text-mc-text mb-6">Tool Integration Examples</h3>
        <div className="space-y-6">
          {toolIntegrations.map((integration) => (
            <div key={integration.tool} className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-lg font-bold text-mc-text">{integration.tool}</h4>
                <span className="text-sm text-mc-accent-cyan">{integration.purpose}</span>
              </div>
              <pre className="bg-mc-bg-tertiary rounded-lg p-4 overflow-x-auto">
                <code className="text-sm text-mc-text font-mono">{integration.code}</code>
              </pre>
            </div>
          ))}
        </div>
      </div>

      {/* Best Practices */}
      <div className="rounded-lg border border-mc-accent-cyan/30 bg-mc-accent-cyan/10 p-6">
        <h3 className="text-xl font-bold text-mc-text mb-4">Best Practices</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold text-mc-text mb-2">✅ Do:</h4>
            <ul className="space-y-2 text-sm text-mc-text-secondary">
              <li>• Always run /voice and /score before publishing</li>
              <li>• Use thought-leadership profile for public content</li>
              <li>• Track outcomes in Learner for lens updates</li>
              <li>• Schedule posts during peak engagement hours</li>
              <li>• Monitor sentiment after publishing</li>
              <li>• Keep image prompts consistent with brand</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-mc-text mb-2">❌ Don&apos;t:</h4>
            <ul className="space-y-2 text-sm text-mc-text-secondary">
              <li>• Skip voice filtering for speed</li>
              <li>• Accept authenticity scores below 0.7</li>
              <li>• Use AI avatars for personal content</li>
              <li>• Over-rely on generic stock images</li>
              <li>• Ignore negative sentiment patterns</li>
              <li>• Publish without reviewing final output</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
