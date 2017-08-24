/**
 * IM （即时通信）
 * @param params 参数
 * @constructor
 */
var db = require("../db/db.js");

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
};

exports.IMController = function (params) {
    return new IM(params);
};