
const crypto = require('crypto');
const encryptSha512 = async (data) => {
  const hash = crypto.createHash('sha512').update(data).digest('hex'); // แปลงผลลัพธ์เป็น Hex (lowercase)
  return hash;
};


const toBase64UrlSafe = (str) => {
  return str.replace(/\+/g, '-').replace(/\//g, '_').split('=')[0];
};


const encryptAES256 = async (data, secretKey , iv = null) => {
  const key = crypto.createHash('sha256').update(secretKey).digest();
  if(iv === null){
     iv = crypto.randomBytes(16);
  }
  const cipher = crypto.createCipheriv("AES-256-GCM", key, iv);
  let encrypted = cipher.update(JSON.stringify(data), 'utf8', 'base64');
  encrypted += cipher.final('base64');
  return {
    encryptData: toBase64UrlSafe(encrypted),
    iv: iv.toString('hex')
  };
};

const decryptAES256 = async (encryptedData, iv, secretKey) => {
  const key = crypto.createHash('sha256').update(secretKey).digest();
  const decipher = crypto.createDecipheriv("AES-256-GCM", key, Buffer.from(iv, 'hex'));
  let decrypted = decipher.update(Buffer.from(encryptedData, 'hex'), 'hex', 'utf8'); // แก้ 'base64' เป็น 'hex'
  decrypted += decipher.final('utf8');
  return JSON.parse(decrypted);
};


module.exports = { encryptSha512, encryptAES256, decryptAES256 }
