const { DateTime } = require('luxon')

const redis = require('redis');
const config = require('config')
const appConfig = require('../../configLoader'); 

const { host, port, password } = appConfig.redis || {}

const client = redis.createClient({
  socket: {
    host,
    port
  },
  password,
  detect_buffers: true
});

client.on('error', function (err) {
  console.log(DateTime.utc().toFormat('yyyy-MM-dd HH:mm:ss') + ' UTC+00:00' + ' Redis error: ' + err);
});

client.on('connect', function () {
  console.log('Connected to Redis server');
});


class Chaching {
  async connectClient() {
    if (!client.isOpen) {
      await client.connect();
    }
  }

  async closeClient() {
    if (client.isOpen) {
      await client.quit();
      console.log('Redis connection closed');
    }
  }

  getClient() {
    return client;
  }

  // ฟังก์ชันในการตั้งค่า Cache
  async setCache(key, value, timer = '10800') {
    await this.connectClient();
    await client.setEx(key, timer, value);
  }

  // ฟังก์ชันในการตั้งค่า Cache โดยไม่มีการหมดอายุ
  async setCacheExpireNone(key, value) {
    await this.connectClient();
    await client.set(key, value);
  }

  // ฟังก์ชันในการดึงข้อมูลจาก Cache
  async getCache(key) {
    await this.connectClient();
    const result = await client.get(key);
    return result;
  }

  // ฟังก์ชันในการลบข้อมูลทั้งหมดจาก Redis
  async flushAllRedis() {
    await this.connectClient();
    console.log('----> Flush all redis keys is: success!!');
    return await client.flushDb();
  }
}

module.exports = new Chaching();
