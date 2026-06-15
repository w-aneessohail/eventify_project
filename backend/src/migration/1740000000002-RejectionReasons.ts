import type { MigrationInterface, QueryRunner } from "typeorm";

export class RejectionReasons1740000000002 implements MigrationInterface {
  name = "RejectionReasons1740000000002";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE organizers
      ADD COLUMN IF NOT EXISTS "rejectionReason" text
    `);
    await queryRunner.query(`
      ALTER TABLE events
      ADD COLUMN IF NOT EXISTS "rejectionReason" text
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE events DROP COLUMN IF EXISTS "rejectionReason"
    `);
    await queryRunner.query(`
      ALTER TABLE organizers DROP COLUMN IF EXISTS "rejectionReason"
    `);
  }
}
