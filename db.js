// nodejs 连接数据库的方法
import mysql from 'mysql'

let pool;

// 获取配置信息
import config from '../Config/config'

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

exports.sql = {
    name: null,
    w: null,

    table:function(newName){
        this.name = config.config.prefix + newName;
        return this;
    },

    where:function (where) {
        if(where){
            if(typeof where === 'object'){
                let arr = [];
                for (let key in where) {
                    arr.push(key + "='" + where[key] + "'");
                }

                this.w = arr.join(' AND ');
            }else{
                this.w = where;
            }

            return this;
        }

    },

    /**
     * 查询数据库
     * @param setting Obj
     * setting = {
     *      field:'',    // string
     *      order:'',   // string
     *      limit:'',  // string
     * }
     */
    querySql: function(setting){
        let sqlExpression;

        setting = setting || {};
        setting.field = setting.field || '';
        setting.order = setting.order || '';
        setting.limit = setting.limit || '';

        if(setting.field){
            sqlExpression = 'SELECT ' + setting.field +' FROM ' + this.name;
        }else{
            sqlExpression = 'SELECT * FROM ' + this.name;
        }


        if(setting.join){
            sqlExpression += setting.join
        }

        if(this.w !== null){
            sqlExpression += ' WHERE ' + this.w;
        }

        // 是否有排序参数
        if(setting.order){
            sqlExpression += ' ORDER BY ' + setting.order;
        }

        // 是否有分页参数
        if(setting.limit){
            sqlExpression += ' LIMIT ' + setting.limit;
        }

        return  new Promise((resolve,reject) => {

            pool.getConnection((err, connection)=>{

                connection.query(sqlExpression , (err, result) => {

                    if(err){

                        reject(new Error('查询失败：' + err.message));

                    }else{

                        // 将RowDataPacket对象装化成json字符串
                        let string = JSON.stringify(result);

                        // 将json字符串转化成json数组
                        let data = JSON.parse(string);

                        resolve (data);
                    }

                });

                //释放数据库连接
                connection.release();
            })
        }).then((json) =>{

            this.w = null;
            this.name = null;
            return json;

        }, (error) => {

            throw new Error('查询失败：' + error);

        });
    },

    /**
     * 添加数据
     * @param config  添加的对象
     * eg: var obj = {
     *      username:'admin',
     *      password:'123456',
     *      add_time:'new Date()'
     * }
     * 需要注意：对象的key一定要和数据表的字段一致
     */
    addData:function(config){

        let keyName = [] , sqlExpression ,
            keyString , valueString , value = [] , sqlData = [];

        //  清空数组
        keyName.length = 0;
        sqlData.length = 0;
        value.length = 0;

        for (let key in config) {
            keyName.push(key);
            sqlData.push(config[key]);
        }
        keyString = '(' + keyName.join(',') + ')';

        for(let i = 0; i < keyName.length;i++){
            value.push('?');
        }
        valueString = '(' + value.join(',') + ')';

        sqlExpression = 'INSERT INTO ' + this.name + keyString + ' VALUES' + valueString;

        return new Promise((resolve, reject) => {
            pool.getConnection(function(err, connection){
                connection.query(sqlExpression , sqlData , function(err, result){

                    if(err){
                        reject(new Error('添加失败：' + err.message));
                    }else{

                        // 将RowDataPacket对象装化成json字符串
                        let string = JSON.stringify(result);

                        // 将json字符串转化成json数组
                        let data = JSON.parse(string);

                        if(data.affectedRows === 1){
                            resolve(true);
                        }else{
                            resolve(false);
                        }
                    }
                });

                //释放数据库连接
                connection.release();
            });
        }).then((data) =>{

            return data;

        }, (error) => {

            throw new Error('添加失败：' + error);

        });
    },

    /**
     * 查询该数据库的数量
     */
    count:function () {
        let sqlExpression;

        sqlExpression = 'SELECT count(*) FROM ' + this.name;

        if(this.w !== null){
            sqlExpression += ' WHERE ' + this.w;
        }

        return new Promise((resolve, reject) => {

            pool.getConnection((err, connection)=>{

                connection.query(sqlExpression , (err, result) => {

                    if(err){

                        reject(new Error('查询失败：' + err.message));

                    }else{

                        // 将RowDataPacket对象装化成json字符串
                        let string = JSON.stringify(result);

                        // 将json字符串转化成json数组
                        let data = JSON.parse(string);

                        resolve (data[0]['count(*)']);
                    }

                });

                //释放数据库连接
                connection.release();
            })
        }).then((json) =>{

            this.w = null;
            this.name = null;
            return json;

        }, (error) => {

            throw new Error('查询失败：' + error);

        });
    },

    /**
     * 删除数据
     */
    delete:function () {
        let sqlExpression;

        if(this.w !== null){
            sqlExpression = 'DELETE FROM '+ this.name + ' where ' + this.w;
        }else{
            sqlExpression = 'DELETE FROM '+ this.name;
        }

        return new Promise((resolve, reject) => {

            pool.getConnection((err, connection)=>{

                connection.query(sqlExpression , (err, result) => {

                    if(err){
                        reject(new Error('删除失败：' + err.message));
                    }else{

                        // 将RowDataPacket对象装化成json字符串
                        let string = JSON.stringify(result);

                        // 将json字符串转化成json数组
                        let data = JSON.parse(string);

                        if(data.affectedRows === 1){
                            resolve(true);
                        }else{
                            resolve(false);
                        }
                    }

                })
            })
        }).then((data) =>{

            return data;

        }, (error) => {

            throw new Error('删除失败：' + error);

        });
    },

    /**
     * 修改数据
     * @param obj  修改的字段和数值
     * eg: var obj = {
     *      username:'admin2',
     * }
     */
    update:function (obj) {
        let keyName = [] ,sqlData = [] , keyString ,sqlExpression;

        for (let key in obj) {
            keyName.push(key+'=?');
            sqlData.push(obj[key]);
        }
        keyString = keyName.join(',');

        // 获取where的key,和值
        if(this.w !== null){

            let reg = /\'(.*?)\'/;
            let len = this.w.match(reg).length;
            for(let i = 0;i<len;i++){
                this.w = this.w.replace(this.w.match(reg)[0],'?');
                sqlData.push(RegExp.$1)
            }
        }


        sqlExpression = 'UPDATE '+ this.name +' SET '+ keyString +' WHERE ' + this.w;

        return new Promise((resolve, reject) => {
            pool.getConnection(function(err, connection){
                connection.query(sqlExpression , sqlData , function(err, result){

                    if(err){
                        reject(new Error('修改失败：' + err.message));
                    }else{

                        // 将RowDataPacket对象装化成json字符串
                        let string = JSON.stringify(result);

                        // 将json字符串转化成json数组
                        let data = JSON.parse(string);

                        if(data.affectedRows === 1){
                            resolve(true);
                        }else{
                            resolve(false);
                        }
                    }
                });

                //释放数据库连接
                connection.release();
            });
        }).then((data) =>{

            return data;

        }, (error) => {

            throw new Error('修改失败：' + error);

        });
    }
};
