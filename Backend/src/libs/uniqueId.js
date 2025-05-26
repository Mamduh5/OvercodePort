const crypto = require('crypto');

const generateUniqueId = (length) => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const characterCount = characters.length;
    let result = '';
    for (let i = 0; i < length; i++) {
        const randomIndex = crypto.randomInt(0, characterCount);
        result += characters[randomIndex];
    }
    return result;
};

const generateUniqueIdSpecial = (length) => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%&/';
    const characterCount = characters.length;
    let result = '';
    for (let i = 0; i < length; i++) {
        const randomIndex = crypto.randomInt(0, characterCount);
        result += characters[randomIndex];
    }
    return result;
};

module.exports = { generateUniqueId, generateUniqueIdSpecial }