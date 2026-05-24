#!/usr/bin/env node
/**
 * Legacy User Migration Script
 *
 * Migrates existing Prisma User records (created via the legacy POST /api/users endpoint)
 * to mark them as email-verified. This allows them to use the Better Auth setup-password
 * flow without going through email verification.
 *
 * Usage:
 *   npx tsx scripts/migrate-legacy-users.ts              # Preview (dry-run)
 *   npx tsx scripts/migrate-legacy-users.ts --execute     # Apply migration
 *   npx tsx scripts/migrate-legacy-users.ts --rollback    # Rollback migration
 *   npx tsx scripts/migrate-legacy-users.ts --help        # Show help
 *
 * Safety:
 *   - Default mode is DRY RUN (no changes)
 *   - --execute is required to actually modify data
 *   - --rollback reverses the migration
 *   - All changes are logged to stdout
 */

import pg from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config({ path: path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '.env') });

const { Pool } = pg;

// ─── Configuration ───────────────────────────────────────────────────────────

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error('[ERROR] DATABASE_URL not found in environment or .env file');
  process.exit(1);
}

const pool = new Pool({ connectionString: DATABASE_URL });

// ─── CLI Argument Parsing ────────────────────────────────────────────────────

const args = process.argv.slice(2);
const mode = args.includes('--execute')
  ? 'execute'
  : args.includes('--rollback')
    ? 'rollback'
    : args.includes('--help')
      ? 'help'
      : 'dry-run';

if (mode === 'help') {
  console.log(`
Legacy User Migration Script
=============================

Migrates existing Prisma User records to mark them as email-verified.

Modes:
  (no flags)          Dry run - preview changes without applying
  --execute           Apply the migration
  --rollback          Reverse the migration (set emailVerified=false)
  --help              Show this help message

What it does:
  - Finds all User records where passwordHash is empty ("")
  - Sets emailVerified=true, emailVerifiedAt=now()
  - Logs each migrated user and the total count

Safety:
  - Default is dry-run mode (read-only)
  - No data is modified without --execute or --rollback
`);
  process.exit(0);
}

// ─── Main Logic ──────────────────────────────────────────────────────────────

async function main() {
  const client = await pool.connect();

  try {
    if (mode === 'dry-run') {
      console.log('========================================');
      console.log('  DRY RUN - No changes will be made');
      console.log('========================================');
      console.log();
    }

    // Find legacy users: passwordHash is empty
    const legacyUsers = await client.query(
      `SELECT id, email, name, "emailVerified", "emailVerifiedAt", "createdAt"
       FROM "User"
       WHERE "passwordHash" = '' OR "passwordHash" IS NULL
       ORDER BY "createdAt" ASC`,
    );

    const users = legacyUsers.rows as Array<{
      id: string;
      email: string;
      name: string | null;
      emailVerified: boolean;
      emailVerifiedAt: Date | null;
      createdAt: Date;
    }>;

    console.log(`Found ${users.length} legacy user(s):\n`);

    if (users.length === 0) {
      console.log('No legacy users to migrate. Exiting.');
      return;
    }

    for (const u of users) {
      console.log(`  - ${u.email} (${u.name || 'unnamed'})`);
      console.log(`    Created: ${u.createdAt.toISOString()}`);
      console.log(`    Currently emailVerified: ${u.emailVerified}`);
      if (u.emailVerifiedAt) {
        console.log(`    emailVerifiedAt: ${u.emailVerifiedAt.toISOString()}`);
      }
    }
    console.log();

    if (mode === 'dry-run') {
      console.log('DRY RUN complete. Run with --execute to apply changes.');
      return;
    }

    if (mode === 'execute') {
      console.log('Applying migration...');
      console.log();

      // Begin transaction
      await client.query('BEGIN');

      try {
        const result = await client.query(
          `UPDATE "User"
           SET "emailVerified" = true, "emailVerifiedAt" = NOW()
           WHERE "passwordHash" = '' OR "passwordHash" IS NULL
           RETURNING id, email, name`,
        );

        const migrated = result.rows as Array<{
          id: string;
          email: string;
          name: string | null;
        }>;

        for (const u of migrated) {
          console.log(`  [MIGRATED] ${u.email} (${u.name || 'unnamed'})`);
        }

        await client.query('COMMIT');

        console.log();
        console.log('========================================');
        console.log(`  Migration complete: ${migrated.length} user(s) migrated`);
        console.log('========================================');
      } catch (err) {
        await client.query('ROLLBACK');
        console.error('[ERROR] Migration failed, transaction rolled back:', err);
        process.exit(1);
      }
    }

    if (mode === 'rollback') {
      console.log('Rolling back migration...');
      console.log();

      await client.query('BEGIN');

      try {
        // Only rollback users who were migrated (emailVerified=true AND emailVerifiedAt IS NOT NULL)
        const result = await client.query(
          `UPDATE "User"
           SET "emailVerified" = false, "emailVerifiedAt" = NULL
           WHERE ("passwordHash" = '' OR "passwordHash" IS NULL)
             AND "emailVerified" = true
             AND "emailVerifiedAt" IS NOT NULL
           RETURNING id, email, name`,
        );

        const rolledback = result.rows as Array<{
          id: string;
          email: string;
          name: string | null;
        }>;

        for (const u of rolledback) {
          console.log(`  [ROLLED BACK] ${u.email} (${u.name || 'unnamed'})`);
        }

        await client.query('COMMIT');

        console.log();
        console.log('========================================');
        console.log(`  Rollback complete: ${rolledback.length} user(s) rolled back`);
        console.log('========================================');
      } catch (err) {
        await client.query('ROLLBACK');
        console.error('[ERROR] Rollback failed, transaction rolled back:', err);
        process.exit(1);
      }
    }
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((err) => {
  console.error('[FATAL] Unexpected error:', err);
  pool.end().finally(() => process.exit(1));
});
