import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 50 },  // Ramp up to 50 users
    { duration: '1m', target: 50 },   // Stay at 50 users
    { duration: '30s', target: 100 }, // Ramp up to 100 users
    { duration: '1m', target: 100 },  // Stay at 100 users
    { duration: '30s', target: 0 },   // Ramp down to 0
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests must complete below 500ms
    http_req_failed: ['rate<0.01'],   // Error rate must be less than 1%
  },
};

export default function () {
  // Target URL (replace with actual production URL or localhost:80 for Docker)
  const BASE_URL = __ENV.TARGET_URL || 'http://localhost';

  // 1. Load HTML (Main App)
  const resHtml = http.get(`${BASE_URL}/index.html`);
  check(resHtml, {
    'status is 200': (r) => r.status === 200,
  });

  // 2. Health check endpoint ping
  const resHealth = http.get(`${BASE_URL}/health`);
  check(resHealth, {
    'status is 200': (r) => r.status === 200,
    'health check OK': (r) => r.body.includes('OK'),
  });

  // Simulate user reading time
  sleep(1);
}
