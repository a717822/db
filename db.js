// nodejs 连接数据库的方法
var mysql =  require('mysql');
var pool , sqlexpression , keyString , valueString;
var keyName = [];
var value = [];
var sqlData = [];

// 获取配置信息
var config = require('../Config/config');

// 自动连接数据库,此为自执行函数
(function init() {
    pool =  mysql.createPool({
            host: config.config.host,
            user: config.config.user,
            password: config.config.password,
            database : config.config.database,
            port: config.config.port
    });
})();

/**
 * 得到数据表
 * @param tableName  数据表名
 */
function sql(tableName) {
    this.tableName = config.config.prefix + tableName;

    /**
     * 查询对应的数据 / 可用来查询唯一性
     * @param obj 需要查询的字段以及字段值
     * eg: var query = {
     *      username:'admin',
     * }
     * @param callback 回调函数
     * @param order 排序
     * eg: order = 'add_time';
     * @param limit 分页参数
     * eg: limit = '0,10';
     */
    this.querySql = function (obj , order , limit ,  callback) {
        sqlexpression = 'SELECT * FROM ' + this.tableName;

        if(obj){
            var arr = [];
            for (var key in obj) {
                arr.push(key + "='" + obj[key] + "'");
            }

            var where = arr.join(' AND ');

            sqlexpression += ' WHERE ' + where;
        }

        // 是否有排序参数
        if(order){
            sqlexpression += ' ORDER BY ' + order;
        }

        // 是否有分页参数
        if(limit){
            sqlexpression += ' LIMIT ' + limit;
        }

        sqlConnection(sqlexpression , function (data) {
            if(data){
                callback (data);
            }else{
                callback ('');
            }
        })
    };

    /**
     * 查询该数据库的数量
     * @param callback 回调函数
     * @param where
     */
    this.count = function (where , callback) {
        sqlexpression = 'SELECT count(*) FROM ' + this.tableName;

        if(where){
            sqlexpression += ' WHERE ' + where;
        }

        sqlConnection(sqlexpression ,function (data) {
            if(data){
                callback (data[0]['count(*)']);
            }else{
                callback ('');
            }
        })
    };

    /**
     * 添加数据
     * @param callback  回调函数
     * @param obj  添加的对象
     * eg: var add = {
     *      username:'admin',
     *      password:'123456',
     *      add_time:'new Date()'
     * }
     * 需要注意：对象的key一定要和数据表的字段一致
     */
    this.addData = function (obj , callback) {
        //  清空数组
        keyName.length = 0;
        sqlData.length = 0;
        value.length = 0;

        var _this = this;

        if(obj){
            for (var key in obj) {
                keyName.push(key);
                sqlData.push(obj[key]);
            }
            keyString = '(' + keyName.join(',') + ')';
            for(var i = 0;i<=keyName.length - 1;i++){
                value.push('?');
            }
            valueString = '(' + value.join(',') + ')';

            sqlexpression = 'INSERT INTO ' + _this.tableName + keyString + ' VALUES' + valueString;

            sqlParamsConnection(sqlexpression , sqlData , function (data) {
                if(data.affectedRows == 1){
                    callback(JSON.stringify(data));
                }else{
                    callback(data);
                }

            });
        }
    };

    /**
     * 删除数据
     * @param obj 删除对象
     * eg: var add = {
     *      username:'admin2',
     * }
     * @param callback 回调函数
     */
    this.delete = function (obj , callback) {
        var del_arr = [];
        if(obj){
            for (var key in obj) {
                del_arr.push(key+'='+obj[key]);
            }
        }
        var del_where = del_arr.join(',');

        sqlexpression = 'DELETE FROM '+ this.tableName + ' where ' + del_where;

        sqlConnection(sqlexpression , function (data) {
            if(data.affectedRows == 1){  // 删除成功
                callback (data);
            }else{    // 删除失败
                callback ('');
            }

        });
    };

    /**
     * 修改数据
     * @param obj  修改的字段和数值
     * eg: var add = {
     *      username:'admin2',
     * }
     * @param where 在哪里修改
     * eg:var where = {
     *      id: id
     * }
     * @param callback 回调函数
     */
    this.updateData = function (obj , where , callback) {
        var _this = this;
        keyName.length = 0;
        sqlData.length = 0;

        if(obj){
            for (var key in obj) {
                keyName.push(key+'=?');
                sqlData.push(obj[key]);
            }
            keyString = keyName.join(',');

            // 获取where的key,和值
            var w_key = [];
            if(where){
                for (var k in where) {
                    w_key.push(k+'=?');
                    sqlData.push(where[k]);
                }
            }
            var w_keystr = w_key.join(',');

            sqlexpression = 'UPDATE '+_this.tableName+' SET '+ keyString +' WHERE ' + w_keystr;

            sqlParamsConnection(sqlexpression , sqlData , function (data) {
                if(data.affectedRows == 1){
                    callback (data);
                }else{
                    callback ('');
                }
            });
        }
    };
}

/**
 * 数据连接池连接数据库(无参数)
 * @param sql  数据表达式
 * @param callback  回调函数
 */
function sqlConnection(sql , callback) {
    pool.getConnection(function(err, connection){
            connection.query(sql ,  function(err, result){

                if(err){
                    callback (err.message);
                    return;
                }

                // 将RowDataPacket对象装化成json字符串
                var string = JSON.stringify(result);

                // 将json字符串转化成json数组
                var data = JSON.parse(string);

                callback (data);

            });

            //释放数据库连接
            connection.release();
    });
}

/**
 *
 * @param sql 数据表达式
 * @param params  参数
 * @param callback 回调函数
 */
function sqlParamsConnection(sql , params , callback) {
    pool.getConnection(function(err, connection){
        connection.query(sql , params , function(err, result){

            if(err){
                callback (err.message);
                return;
            }

            // 将RowDataPacket对象装化成json字符串
            var string = JSON.stringify(result);

            // 将json字符串转化成json数组
            var data = JSON.parse(string);

            callback (data);
        });

        //释放数据库连接
        connection.release();
    });
}

var db = function (tableName) {
    return new sql(tableName);
};

exports.db = db;