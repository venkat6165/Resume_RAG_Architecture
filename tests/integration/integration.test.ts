import app from '../../src/app';
import http from 'http';

describe('Integration Tests — Ingestion Module APIs (Phase 16)', () => {
  let server: http.Server;
  let baseUrl: string;

  beforeAll((done) => {
    server = app.listen(0, () => {
      const address = server.address() as any;
      baseUrl = `http://localhost:${address.port}`;
      done();
    });
  });

  afterAll((done) => {
    if (server) {
      server.close(done);
    } else {
      done();
    }
  });

  test('GET /v1/health returns app status', async () => {
    const res = await fetch(`${baseUrl}/v1/health`);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.status).toBe('ok');
    expect(body.app).toBe('resume-rag-backend');
  });

  test('POST /v1/resume/clean cleans raw text', async () => {
    const res = await fetch(`${baseUrl}/v1/resume/clean`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rawText: '  Test   Text \t\n ' }),
    });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.cleanText).toBe('Test Text');
  });

  test('POST /v1/resume/skills detects skills', async () => {
    const res = await fetch(`${baseUrl}/v1/resume/skills`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rawText: 'Experience in Selenium WebDriver and Python' }),
    });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.skills).toContain('Selenium WebDriver');
  });

  test('POST /v1/resume/ingest returns 400 FILE_REQUIRED when file is missing', async () => {
    const res = await fetch(`${baseUrl}/v1/resume/ingest`, {
      method: 'POST',
    });
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.success).toBe(false);
    expect(body.errorCode).toBe('FILE_REQUIRED');
    expect(body.requestId).toBeDefined();
  });
});
