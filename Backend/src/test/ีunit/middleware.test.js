const request = require('supertest');
const Koa = require('koa');
const basicAuthentication = require('../src/middleware/basicAuthentication');
const xPlatformValidate = require('../src/middleware/xPlatformValidate');

describe('Middleware Testing', () => {
  let app;

  beforeEach(() => {
    app = new Koa();
    app.use(basicAuthentication());
    app.use(xPlatformValidate());
    app.use(ctx => {
      ctx.body = { success: true };
    });
  });

  test('basicAuthentication should fail if no credentials', async () => {
    const res = await request(app.callback()).get('/');
    expect(res.status).toBe(401);
  });

  test('xPlatformValidate should fail if invalid platform', async () => {
    const res = await request(app.callback()).get('/').set('x-platform', 'invalid');
    expect(res.status).toBe(400);
  });
});
