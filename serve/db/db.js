// nodejs 连接数据库的方法
var mysql =  require('mysql');
var pool , sqlexpression , keyString , valueString;
var keyName = new Array();
var value = new  Array();

// 自动连接数据库,此为自执行函数
(function init() {
    pool =  mysql.createPool({
            host:'localhost',
            user:'root',
            password:'root',
            database : 'yangzilong',
            port:'3306'
    });
})();

/**
 * 得到数据表
 * @param tableName  数据表名
 */
function sql(tableName) {
    this.tableName = 'yzl_' + tableName;
}

/**
 * 查询该数据库所有信息
 * @param callback 回调函数
 */
sql.prototype.queryAll = function (callback) {
        sqlexpression = 'SELECT * FROM ' + this.tableName;

        sqlConnection(sqlexpression , function (data) {
            if(data){
                callback (data);
            }else{
                callback ('');
            }
        })
    };

/**
 * 查询对应的数据 / 可用来查询唯一性
 * @param where 关键词
 * @param callback 回调函数
 */
sql.prototype.querySql = function (where , callback) {
    sqlexpression = 'SELECT * FROM ' + this.tableName + ' WHERE ' + where;

    sqlConnection(sqlexpression , function (data) {
        if(data){
            callback (data);
        }else{
            callback ('');
        }

    })
};

/**
 * 查询该数据库的所有值
 * @param callback  回调函数
 */
sql.prototype.count = function (callback) {
    sqlexpression = 'SELECT count(*) FROM ' + this.tableName;

    sqlConnection(sqlexpression ,function (data) {
        if(data){
            callback (data);
        }else{
            callback ('');
        }
    })
};

/**
 * 添加数据
 * @param callback  回调函数
 * @param v  添加的值
 */
sql.prototype.addData = function (v , callback) {
    var querySql = 'SELECT COLUMN_NAME from information_schema.COLUMNS where table_name='+"'"+this.tableName+"'";
    var _this = this;
    sqlConnection(querySql , function (data) {  // 获取选中数据库的键值对
        for(var i = 0;i<=data.length-1;i++){
            var key = data[i].COLUMN_NAME;
            keyName.push(key);
        }

        keyString = '(' + keyName.join(',') + ')';

        for(var i = 0;i<=keyName.length - 1 ;i++){
            value.push('?');
        }
        value[0] = 0; //将数组第一个值赋值为0
        valueString = '(' + value.join(',') + ')';

        sqlexpression = 'INSERT INTO ' + _this.tableName + keyString + ' VALUES' + valueString;

        sqlParamsConnection(sqlexpression , v , function (data) {
            if(data.affectedRows == 1){
                callback(JSON.stringify(data));
            }else{
                callback('');
            }

        });

        // 添加完成后，清空数组
        if(keyName.length != 0 || value.length != 0){
            keyName.length = 0;
            value.length = 0;
        }
    });
};

/**
 * 删除数据
 * @param callback 回调函数
 */
sql.prototype.delete = function (id , callback) {
    sqlexpression = 'DELETE FROM '+ this.tableName + ' where id=' + id;

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
 * @param v  修改的数据
 * @param set 需要修改的字段
 * @param where 在哪里修改
 * @param callback 回调函数
 */
sql.prototype.update = function (v , set , where , callback) {

        sqlexpression = 'UPDATE '+this.tableName+' SET '+ set +' WHERE ' + where;

        sqlParamsConnection(sqlexpression , v , function (data) {
            if(data.affectedRows == 1){
                callback (data);
            }else{
                callback ('');
            }
        });

};

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

var database = {
    db:function (tableName) {
        return new sql(tableName);
    }
};

exports.database = database;