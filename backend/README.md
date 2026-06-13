# Eventify Backend

## Database setup

1. Copy `.env.example` to `.env` and set PostgreSQL credentials.
2. Run `npm install`.
3. Start the API: `npm run dev`.

### Schema and migrations

- **`synchronize` is disabled.** Schema is managed via TypeORM migrations.
- **Empty database:** on first startup, the app runs a **one-time** `synchronize` bootstrap to create tables, then applies migrations automatically (`migrationsRun: true`).
- **Existing database:** migrations run on startup; no manual step required unless you prefer CLI:

```bash
npm run migration:run
npm run migration:show
npm run migration:revert
```

The baseline migration (`SchemaCorrectionsBaseline`) replaces the old runtime `organizerName` SQL hack and adds unique constraints for one organizer per user and one payment per booking.
