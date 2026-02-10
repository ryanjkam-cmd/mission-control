/**
 * Seed script for Action Queue test data
 * Run with: npx tsx scripts/seed-queue.ts
 */

import { createAction } from '../src/lib/db/queue';
import type { CreateActionRequest } from '../src/lib/types/queue';

const SAMPLE_ACTIONS: CreateActionRequest[] = [
  // Email reply - low risk
  {
    action_type: 'email_reply',
    risk_level: 'low',
    confidence: 0.85,
    action_data: {
      action: 'draft_email_reply',
      tool: 'gmail',
      result: 'Draft created for recruiter inquiry',
      details: 'Drafted polite decline for Amazon recruiter position - not interested in relocation to Seattle',
      parameters: {
        to: 'recruiter@amazon.com',
        subject: 'Re: Senior Product Marketing Manager - Amazon Web Services',
        body: 'Thank you for reaching out about this opportunity. While I appreciate the consideration, I am not currently open to relocation. I wish you the best in your search.',
      },
    },
    context_data: {
      context: 'User has preference: "Always draft email replies, never auto-send"',
    },
  },

  // iMessage - medium risk (family)
  {
    action_type: 'imessage',
    risk_level: 'medium',
    confidence: 0.72,
    action_data: {
      action: 'send_imessage',
      tool: 'apple_messages',
      result: 'Message drafted to Janelle about dinner plans',
      details: 'Responded to Janelle about dinner tonight - confirmed 7pm reservation at Boulevard',
      parameters: {
        recipient: 'Janelle',
        message: 'Confirmed - 7pm at Boulevard. Got the reservation. See you there!',
      },
    },
    context_data: {
      context: 'Original message from Janelle: "Did you get the reservation for tonight?"',
    },
  },

  // Calendar block - low risk
  {
    action_type: 'calendar_block',
    risk_level: 'low',
    confidence: 0.91,
    action_data: {
      action: 'block_focus_time',
      tool: 'google_calendar',
      result: 'Created 2-hour focus block for deep work',
      details: 'Blocked tomorrow 9-11am for writing quarterly OKRs - no meetings scheduled in that window',
      parameters: {
        title: 'Focus: Quarterly OKRs Draft',
        start: '2026-02-11T09:00:00-08:00',
        end: '2026-02-11T11:00:00-08:00',
        description: 'Deep work session for Q1 planning',
      },
    },
    context_data: {
      context: 'User has recurring preference to block morning focus time when calendar is open',
    },
  },

  // Health suggestion - low risk
  {
    action_type: 'health_suggestion',
    risk_level: 'low',
    confidence: 0.68,
    action_data: {
      action: 'suggest_workout',
      tool: 'apple_reminders',
      result: 'Created reminder for afternoon workout',
      details: 'User has missed 3 consecutive workouts - suggesting 30-minute session at 4pm today',
      parameters: {
        title: 'Quick 30-min workout',
        due: '2026-02-10T16:00:00-08:00',
        list: 'Health',
      },
    },
    context_data: {
      context: 'Last workout: Feb 6. Calendar shows 4-5pm window is free today.',
    },
  },

  // Reminder - high risk (work commitment)
  {
    action_type: 'reminder_create',
    risk_level: 'high',
    confidence: 0.58,
    action_data: {
      action: 'create_work_reminder',
      tool: 'apple_reminders',
      result: 'Created reminder to follow up with CEO on Q1 budget',
      details: 'CEO mentioned needing updated forecast in last 1:1 (3 days ago) - no follow-up sent yet',
      parameters: {
        title: 'Send updated Q1 forecast to CEO',
        due: '2026-02-11T10:00:00-08:00',
        priority: 'high',
        list: 'Work',
      },
    },
    context_data: {
      context: 'From 1:1 notes: "Need updated numbers by end of week" - Friday is tomorrow',
    },
  },

  // Trip planning - medium risk
  {
    action_type: 'trip_plan',
    risk_level: 'medium',
    confidence: 0.75,
    action_data: {
      action: 'research_weekend_trip',
      tool: 'perplexity',
      result: 'Researched family-friendly weekend getaways near SF',
      details: 'Found 3 options: Monterey Aquarium weekend, Napa hot air balloon, Lake Tahoe cabin rental',
      parameters: {
        destination: 'Northern California',
        dates: '2026-02-22 to 2026-02-24',
        travelers: 'Family (2 adults, 1 child)',
      },
    },
    context_data: {
      context: 'Janelle mentioned wanting a weekend trip in iMessage yesterday',
    },
  },

  // Task creation - low risk
  {
    action_type: 'task_create',
    risk_level: 'low',
    confidence: 0.82,
    action_data: {
      action: 'create_task_from_email',
      tool: 'notion',
      result: 'Created task for contract review',
      details: 'Vendor contract received - needs review by Friday',
      parameters: {
        title: 'Review vendor contract - deadline Friday',
        database: 'Tasks',
        status: 'To Do',
        priority: 'Medium',
      },
    },
    context_data: {
      context: 'Email from procurement: "Please review by EOW"',
    },
  },

  // Notion update - medium risk
  {
    action_type: 'notion_update',
    risk_level: 'medium',
    confidence: 0.64,
    action_data: {
      action: 'update_crm_contact',
      tool: 'notion',
      result: 'Updated contact info for Neal Higa',
      details: 'Added new phone number from email signature, updated company to "Self-Employed"',
      parameters: {
        database: 'People',
        contact: 'Neal Higa',
        updates: {
          phone: '+1-415-555-0123',
          organization: 'Self-Employed',
        },
      },
    },
    context_data: {
      context: 'Email from Neal had new contact info in signature',
    },
  },
];

async function seed() {
  console.log('Seeding action queue with sample data...\n');

  for (const action of SAMPLE_ACTIONS) {
    try {
      const id = createAction(action);
      console.log(`✓ Created action ${id}: ${action.action_type} (${action.risk_level} risk)`);
    } catch (error) {
      console.error(`✗ Failed to create action: ${action.action_type}`, error);
    }
  }

  console.log('\nSeed completed!');
  console.log(`Total actions created: ${SAMPLE_ACTIONS.length}`);
  console.log('\nBreakdown:');
  console.log(`- Low risk: ${SAMPLE_ACTIONS.filter(a => a.risk_level === 'low').length}`);
  console.log(`- Medium risk: ${SAMPLE_ACTIONS.filter(a => a.risk_level === 'medium').length}`);
  console.log(`- High risk: ${SAMPLE_ACTIONS.filter(a => a.risk_level === 'high').length}`);
}

seed().catch(console.error);
