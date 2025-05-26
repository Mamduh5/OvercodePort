module.exports = {
  service: {
    api: '/api/v1',
    version: '0.0.1',
    allow: {
      origin: '*',
      method: 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
      header: 'Origin, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Response-Time, Authorization, x-access-token, x-firebase-token, x-platform, x-otp, x-firebase-auth-token',
      credential: true
    }
  }
}
