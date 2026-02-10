#!/usr/bin/env tsx

/**
 * Seed Quick Links into Database
 *
 * Run: npm run db:seed-links
 */

import { getDb } from './src/lib/db';
import { seedQuickLinks } from './src/lib/db/seed-quick-links';

async function main() {
  console.log('[Seed] Starting quick links seed...');

  try {
    const db = getDb();

    // Check if links already exist
    const existing = db.prepare('SELECT COUNT(*) as count FROM quick_links').get() as { count: number };

    if (existing.count > 0) {
      console.log(`[Seed] Found ${existing.count} existing links.`);
      const readline = require('readline').createInterface({
        input: process.stdin,
        output: process.stdout,
      });

      const answer = await new Promise<string>((resolve) => {
        readline.question('Clear existing links and re-seed? (y/N): ', (answer: string) => {
          readline.close();
          resolve(answer.toLowerCase());
        });
      });

      if (answer === 'y' || answer === 'yes') {
        db.prepare('DELETE FROM quick_links').run();
        console.log('[Seed] Cleared existing links.');
      } else {
        console.log('[Seed] Skipping seed. Exiting.');
        process.exit(0);
      }
    }

    // Seed links
    const count = seedQuickLinks(db);
    console.log(`[Seed] Successfully seeded ${count} quick links!`);

  } catch (error) {
    console.error('[Seed] Error seeding quick links:', error);
    process.exit(1);
  }
}

main();
