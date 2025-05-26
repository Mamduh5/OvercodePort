const argon2 = require('argon2');

const Argon2hashPassword = async (value) => {
    try {
        const hash = await argon2.hash(value, {
            type: argon2.argon2id, // เลือกประเภท Argon2id (แนะนำ)
            memoryCost: 2 ** 16,   // ปริมาณหน่วยความจำที่ใช้ (64 MB)
            timeCost: 5,           // จำนวนรอบการแฮช
            parallelism: 1         // จำนวน thread
        });
        return hash;
    } catch  {
        return false;
    }
}

async function Argon2verifyPassword(password , hash) {
    try {
      return await argon2.verify(hash, password);
    } catch {
        return false;
    }
  }
module.exports = {  Argon2hashPassword,Argon2verifyPassword}