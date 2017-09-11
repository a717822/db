/**
 * IM （即时通信）
 * @param params 参数
 * @constructor
 */
var db = require("../db/db.js");
var upload = require("../tool/upload.js");
var fs = require('fs');


var IM = function (params) {
    this.params = params;

    /**
     * 将发送的消息存到数据库中
     * @param callback 回调函数
     */
    this.sendMsg = function (callback) {
        var userInfo = this.params.user;
        var msgBody = this.params.msgbody;

        // 参数
        var send_id = userInfo.id;
        var send_name = userInfo.username;
        var message_content = msgBody.msg;
        var add_time = msgBody.time;
        var type = msgBody.type;  // type为1为群聊，type为2时为私聊

            // 添加到数据库
            var addSql = [send_name,send_id,message_content,add_time,type];

            db.database.db('message').addData(addSql , function (data) {
                if(data){
                    callback('消息添加成功');
                }else{
                    callback('消息添加失败');
                }
            });
        };

    /**
     * 得到消息，主要是获取历史记录的 时候使用
     * @param callback 回调函数
     */
    this.getMsg = function (callback) {
        var ret = new Object();

        if(this.params.type == ''){
            ret.id = -1;
            ret.msg = '聊天类型不得为空';

            callback (ret);
        }else{
            var where  = "type = " + "'"+this.params.type + "'";

            db.database.db('message').querySql(where,function (data) {
                if(data.length != 0){
                    ret.id = 0;
                    ret.msg = '有聊天数据';
                    ret.msgBody = data;
                }else{
                    ret.id = -1;
                    ret.msg = '暂无聊天数据';
                }

                callback(ret);
            })
        }
    };

    /**
     * 上传用户图片
     * @param callback 回调函数
     */
    this.uploadImg = function (callback) {
        // 获取文件
        var file = this.params.file;

        // 获取user_id
        var user_id = this.params.user_id;

        var type = 'avatar_' + user_id;
        var filename = upload.upload(file,type);

        var updateData = {
            useravatar:filename
        };

        var where = 'id = ' + user_id;
        db.database.db('admin').update(updateData, where , function (data) {
            if(data){
                callback('图片上传成功');
                fs.renameSync('./serve/upload/' + file.filename , './serve/upload/' + filename);
            }else{
                callback('图片上传失败');
            }
        })
    };

    /**
     * 加入到一个房间
     * @param callback 回调函数
     */
    this.CreateRoom = function (callback) {
        var userInfo = this.params.user;

        var s_id = userInfo.id;
        var r_id = this.params.r_id;


    }
};

exports.IMController = function (params) {
    return new IM(params);
};