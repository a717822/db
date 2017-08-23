/**
 * Created by by on 2017/7/24.
 */
var db = require("../db/db.js");
var md5 = require("../tool/MD5.js");

function admin(params) {
    this.params = params;

    /**
     * 用户注册
     * @param callback 回调函数
     */
    this.register = function (callback) {
        // 返回到前台的值
        var ret = new  Object();

        if((this.params.user_name == '') || (this.params.password == '') || (this.params.email == '')){
            ret.id = -1;
            ret.msg = '用户名、密码、邮箱不得为空';

            callback (ret);
        }else{
            var _pw =  md5.Md5(this.params.password);
            var addSql = [this.params.user_name,'',_pw,'',
                this.params.email,0,1,new Date(),'','',0];

            var is_unique = false;
            var where  = "username = " + "'"+this.params.user_name + "'";

            db.database.db('admin').querySql(where,function (data) {
                if(data.join('')){
                    is_unique = true;
                }else{
                    is_unique = false;
                }

                if(is_unique == true){
                    ret.id = -1;
                    ret.msg = '用户已注册，请重新登录';

                    callback (ret);
                }else{
                    db.database.db('admin').addData(addSql,function (data) {
                        if(data){

                            ret.id = 0;
                            ret.msg = '用户注册成功，请登录';

                            callback (ret);
                        }else{

                            ret.id = -1;
                            ret.msg = '用户注册失败，请联系工作人员';

                            callback (ret);
                        }

                    });
                }

            });
        }
    },


    /**
     * 用户登陆
     * @param callback 回调函数
     */
    this.login = function (callback) {
        var ret = new  Object();
        var _this = this;
        if((this.params.user_name == '') || (this.params.password == '')){
            ret.id = -1;
            ret.msg = '用户名和密码不得为空';

            callback (ret);
        }else{
            var where  = "username = " + "'"+this.params.user_name + "'";
            db.database.db('admin').querySql(where , function (data) {

                if(data.length != 0){
                    if(data[0].password == md5.Md5(_this.params.password)){
                        ret.id = 0;
                        ret.msg = '登录成功';
                        ret.user = data[0];
                    }else{
                        ret.id = -1;
                        ret.msg = '登录失败，输入密码错误';
                    }
                }else{
                    ret.id = -1;
                    ret.msg = '该用户未注册';
                }

                callback(ret);
            })
        }
    },
}

exports.AdminController = function (params) {
    return new admin(params);
};
