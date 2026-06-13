import type { MigrationInterface, QueryRunner } from "typeorm";

/**
 * Baseline corrections for existing Eventify databases.
 * - Replaces runtime organizerName SQL hack
 * - Enforces one organizer profile per user
 * - Enforces one payment per booking
 */
export class SchemaCorrectionsBaseline1740000000000
  implements MigrationInterface
{
  name = "SchemaCorrectionsBaseline1740000000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    // --- organizerName (formerly ensured at app startup) ---
    await queryRunner.query(
      `ALTER TABLE organizers ADD COLUMN IF NOT EXISTS "organizerName" character varying`
    );
    await queryRunner.query(
      `UPDATE organizers
       SET "organizerName" = COALESCE(
         NULLIF(TRIM("organizerName"), ''),
         "organizationName",
         'Organizer'
       )
       WHERE "organizerName" IS NULL`
    );
    await queryRunner.query(
      `ALTER TABLE organizers ALTER COLUMN "organizerName" SET NOT NULL`
    );

    // --- one organizer per user: keep oldest row, drop duplicates ---
    await queryRunner.query(
      `DELETE FROM organizers o1
       USING organizers o2
       WHERE o1."userId" = o2."userId"
         AND o1.id > o2.id`
    );
    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_indexes
          WHERE schemaname = 'public'
            AND tablename = 'organizers'
            AND indexdef LIKE '%"userId"%'
        ) THEN
          CREATE UNIQUE INDEX "UQ_organizers_userId" ON organizers ("userId");
        END IF;
      END $$;
    `);

    // --- one payment per booking ---
    await queryRunner.query(
      `DELETE FROM payments p1
       USING payments p2
       WHERE p1."bookingId" = p2."bookingId"
         AND p1.id > p2.id`
    );
    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_indexes
          WHERE schemaname = 'public'
            AND tablename = 'payments'
            AND indexdef LIKE '%"bookingId"%'
        ) THEN
          CREATE UNIQUE INDEX "UQ_payments_bookingId" ON payments ("bookingId");
        END IF;
      END $$;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "UQ_payments_bookingId"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "UQ_organizers_userId"`);
    // organizerName column and NOT NULL left in place to avoid data loss
  }
}
