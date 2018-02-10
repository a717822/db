# db

一、引入该JS文件

# var db = ('/db/db.js');

二、如何调用

这里我用user数据表做例子；

1、写入数据表名

db.db('user');

2、查询数据
/**
  * 查询对应的数
  * @param obj 需要查询的字段以及字段值
  * @param order 排序
  * @param limit 分页参数
*/

var obj = {
  username:'admin'
};

var order = 'add_time desc';
var limit = '0,10';

db.db('user').querySql(obj,order,limit,function (data) {
    console.log(data)
}

如果order和limit为空时，则：
db.db('user').querySql(obj,'','',function (data) {
    console.log(data)
}

3、添加数据
/**
  * 添加数据
  * @param obj  添加的对象
  * 需要注意：对象的key一定要和数据表的字段一致
  */

var obj = {
  username:'admin2',
  password:'123456',
  add_time:'new Date()'
};

db.db('user').addData(obj,function (data) {
    console.log(data)
}

4、删除数据
/**
  * 删除数据
  * @param obj 删除对象
  * @param callback 回调函数
  */
     
var delete = {
    id:1
};

db.db('user').delete(delete,function (data) {
    console.log(data)
}

5、修改数据
/**
  * 修改数据
  * @param obj  修改的字段和数值
  * @param where 在哪里修改
  */
var update = {
    username:'admin3'
}
var where = {
  id:1
}
db.db('user').updateData(update,where,function (data) {
    console.log(data)
}

