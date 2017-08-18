var crypto = require('crypto');

// MD5加密
exports.Md5 = function (text) {
    return crypto.createHash('md5').update(text).digest('hex');
};