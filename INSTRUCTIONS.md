# Basileia Pay - Local Deployment Instructions

## Running the Platform locally

To start the platform correctly, you must boot the backend, frontend, and the background services.

### 1. API Services (Laravel)
The API runs on PHP/Laravel and requires database connections. Ensure you copy `.env.example` to `.env` and configure your database variables.

```bash
cd apps/api
php artisan serve
```

### 2. Frontend Services (Next.js)
```bash
npm run dev -- --filter=dashboard
```

### 3. Background Services (Queues and Scheduler)
Crucial: Basileia Pay depends on queue workers for processing webhooks, sending emails, and handling retries.
**You must run the queue worker locally**, otherwise webhooks will be queued and stuck forever.

Open a new terminal tab and run:
```bash
cd apps/api
php artisan queue:work
```

For scheduled tasks (like checking expired PIX or subscriptions), you must run the scheduler:
```bash
cd apps/api
php artisan schedule:work
```
