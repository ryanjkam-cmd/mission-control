/**
 * Quick Links Seed Data
 * Pre-populated links for the Quick Links Manager
 */

export interface QuickLink {
  title: string;
  url: string;
  category: 'Notion' | 'Google' | 'External' | 'Tool';
  tags: string[];
}

export const quickLinksSeedData: QuickLink[] = [
  // Notion (10 links)
  {
    title: 'Master Context DB',
    url: 'https://www.notion.so/28e9ff7ef9a681c392ccd4a6a3af3044',
    category: 'Notion',
    tags: ['context', 'core', 'system'],
  },
  {
    title: 'Decisions Log',
    url: 'https://www.notion.so/2869ff7ef9a6810e8dffee96dc32046b',
    category: 'Notion',
    tags: ['decisions', 'tracking', 'governance'],
  },
  {
    title: 'Tasks & Calendar',
    url: 'https://www.notion.so/2e09ff7ef9a6813dabe2000bb80572fa',
    category: 'Notion',
    tags: ['tasks', 'calendar', 'planning'],
  },
  {
    title: 'Career Tracker',
    url: 'https://www.notion.so/career-tracker',
    category: 'Notion',
    tags: ['career', 'jobs', 'companies'],
  },
  {
    title: 'Companies DB',
    url: 'https://www.notion.so/2fd9ff7ef9a681e091e3cd632514c227',
    category: 'Notion',
    tags: ['career', 'companies', 'opportunities'],
  },
  {
    title: 'Recruiters DB',
    url: 'https://www.notion.so/2fd9ff7ef9a68149920fcc43b4d244e8',
    category: 'Notion',
    tags: ['career', 'recruiters', 'outreach'],
  },
  {
    title: 'CMO Talking Points',
    url: 'https://www.notion.so/2fd9ff7ef9a681ba88a0d2a42b83f858',
    category: 'Notion',
    tags: ['career', 'talking-points', 'frameworks'],
  },
  {
    title: 'Journal DB',
    url: 'https://www.notion.so/2e09ff7ef9a6818290000b6bea0209',
    category: 'Notion',
    tags: ['journal', 'personal', 'reflection'],
  },
  {
    title: 'People DB',
    url: 'https://www.notion.so/2e39ff7ef9a68190944fe609f914db63',
    category: 'Notion',
    tags: ['contacts', 'people', 'relationships'],
  },
  {
    title: 'Clothing DB',
    url: 'https://www.notion.so/2e39ff7ef9a681c8a607000b1f56b2cb',
    category: 'Notion',
    tags: ['shopping', 'clothing', 'personal'],
  },

  // Google (5 links)
  {
    title: 'Google Calendar',
    url: 'https://calendar.google.com',
    category: 'Google',
    tags: ['calendar', 'scheduling', 'events'],
  },
  {
    title: 'Gmail',
    url: 'https://mail.google.com',
    category: 'Google',
    tags: ['email', 'communication'],
  },
  {
    title: 'Google Drive',
    url: 'https://drive.google.com',
    category: 'Google',
    tags: ['storage', 'files', 'documents'],
  },
  {
    title: 'Google Tasks',
    url: 'https://tasks.google.com',
    category: 'Google',
    tags: ['tasks', 'todo', 'planning'],
  },
  {
    title: 'Google Sheets - Clothing',
    url: 'https://docs.google.com/spreadsheets/d/1aM0gC_aFpTVJ-2Ubzf4pZd1Mogd889jIlXH0EgjMeYc/edit',
    category: 'Google',
    tags: ['shopping', 'clothing', 'tracking'],
  },

  // External (5 links)
  {
    title: 'Substack Dashboard',
    url: 'https://arkeussystems.substack.com',
    category: 'External',
    tags: ['writing', 'content', 'thought-leadership'],
  },
  {
    title: 'LinkedIn Profile',
    url: 'https://www.linkedin.com/in/ryankam',
    category: 'External',
    tags: ['career', 'professional', 'networking'],
  },
  {
    title: 'X (Twitter) Profile',
    url: 'https://x.com/ryankam',
    category: 'External',
    tags: ['social', 'content', 'engagement'],
  },
  {
    title: 'GitHub',
    url: 'https://github.com/ryanjkam-cmd',
    category: 'External',
    tags: ['development', 'code', 'repositories'],
  },
  {
    title: 'Monarch Money',
    url: 'https://app.monarchmoney.com',
    category: 'External',
    tags: ['finances', 'budget', 'tracking'],
  },

  // Tools (5 links)
  {
    title: 'Canva',
    url: 'https://www.canva.com',
    category: 'Tool',
    tags: ['design', 'graphics', 'content-creation'],
  },
  {
    title: 'Leonardo.ai',
    url: 'https://leonardo.ai',
    category: 'Tool',
    tags: ['ai', 'image-generation', 'content-creation'],
  },
  {
    title: 'Runway',
    url: 'https://runwayml.com',
    category: 'Tool',
    tags: ['ai', 'video-generation', 'content-creation'],
  },
  {
    title: 'HeyGen',
    url: 'https://heygen.com',
    category: 'Tool',
    tags: ['ai', 'avatar-video', 'content-creation'],
  },
  {
    title: 'Buffer',
    url: 'https://buffer.com',
    category: 'Tool',
    tags: ['social-media', 'scheduling', 'distribution'],
  },
];

/**
 * Seed quick links into database
 */
export function seedQuickLinks(db: any) {
  console.log('[Seed] Seeding quick links...');

  const insertStmt = db.prepare(`
    INSERT INTO quick_links (title, url, category, tags)
    VALUES (?, ?, ?, ?)
  `);

  let count = 0;
  for (const link of quickLinksSeedData) {
    try {
      insertStmt.run(link.title, link.url, link.category, JSON.stringify(link.tags));
      count++;
    } catch (error) {
      console.error(`[Seed] Failed to insert link ${link.title}:`, error);
    }
  }

  console.log(`[Seed] Seeded ${count} quick links`);
  return count;
}
