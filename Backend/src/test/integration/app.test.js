const request = require('supertest');
const app = require('../src/app'); // นำเข้า app

describe('API Testing', () => {
  test('GET /token/test should return { message: "pong" }', async () => {
    const res = await request(app.callback()).get('/token/test');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ message: 'pong' });
  });
});








afterAll(async () => {
    await closeKnexConnectionForTest();
});
