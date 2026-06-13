import type { MigrationInterface, QueryRunner } from "typeorm";

/**
 * Separates booking lifecycle from payment lifecycle.
 * Maps legacy payment-status values on bookings:
 *   success  -> confirmed
 *   failed   -> cancelled
 *   pending  -> pending
 */
export class BookingStatusSeparation1740000000001
  implements MigrationInterface
{
  name = "BookingStatusSeparation1740000000001";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'booking_status_enum') THEN
          CREATE TYPE booking_status_enum AS ENUM ('pending', 'confirmed', 'cancelled');
        END IF;
      END $$;
    `);

    await queryRunner.query(`
      ALTER TABLE bookings
      ALTER COLUMN status DROP DEFAULT
    `);

    await queryRunner.query(`
      ALTER TABLE bookings
      ALTER COLUMN status TYPE booking_status_enum
      USING (
        CASE status::text
          WHEN 'success' THEN 'confirmed'::booking_status_enum
          WHEN 'failed' THEN 'cancelled'::booking_status_enum
          ELSE 'pending'::booking_status_enum
        END
      )
    `);

    await queryRunner.query(`
      ALTER TABLE bookings
      ALTER COLUMN status SET DEFAULT 'pending'::booking_status_enum
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE bookings
      ALTER COLUMN status DROP DEFAULT
    `);

    await queryRunner.query(`
      ALTER TABLE bookings
      ALTER COLUMN status TYPE varchar
      USING (
        CASE status::text
          WHEN 'confirmed' THEN 'success'
          WHEN 'cancelled' THEN 'failed'
          ELSE 'pending'
        END
      )
    `);

    await queryRunner.query(`
      ALTER TABLE bookings
      ALTER COLUMN status SET DEFAULT 'pending'
    `);

    await queryRunner.query(`DROP TYPE IF EXISTS booking_status_enum`);
  }
}
