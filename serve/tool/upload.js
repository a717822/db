
/**
 * 上传文件方法
 * @param file 上次的文件
 * @param type  这里我是以上传日期 + 运用图片类型 + user_id 命名的
 * @returns {string}
 */
function upload(file , type) {

    var name = file.originalname;
    var nameArray = name.split('.');

    // 删除原文件名
    delete nameArray[0];

    // 获取文件格式
    var mime = nameArray.join(',').substring(1);

    // 这里我是以上传日期 + 图片类型 + user_id 命名的
    var date = new Date();
    var year = date.getFullYear().toString();

    var month = date.getMonth() + 1;
    // 小于9时
    if(month < 9){
        month = '0' + month;
    }

    var day = date.getDate();
    // 小于9时
    if(day < 9){
        day = '0' + day;
    }

    var  filename = year + month.toString() + day.toString() + type + '.'+ mime;

    return filename;
}

module.exports = {
    upload: upload
}