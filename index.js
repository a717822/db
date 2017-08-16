var express = require('express');
var app = express();
var db = require("./db.js");
var user = require('./Model/userController.js');
var bodyParser = require('body-parser');
// 创建 application/x-www-form-urlencoded 编码解析
var urlencodedParser = bodyParser.urlencoded({ extended: false });

app.get('/index.html', function (req, res) {
    res.sendFile( __dirname + "/" + "index.html" );
    // var data= {
    //     username:'nodejs test',
    //     realname:'nodejs'
    // };
    //
    // for (var key1 in data) {
    //     if (data.hasOwnProperty(key1)){
    //         keyName.push(key1 + ' = ?');
    //     }
    //
    //     modSqlParams.push(data[key1]);
    // }
    //
    // keyString = keyName.join(',');
    //
    // db.database.db('admin').update(modSqlParams , keyString ,'id = 29' , function (data) {
    //     if(data){
    //         res.send(data);
    //     }else{
    //         res.send('更新失败');
    //     }
    //
    // })
});

// 用户登录
app.post('/user_login', urlencodedParser , function (req, res) {

    var response = {
        user_name:req.body.username,
        password:req.body.password
    };

    user.userController.user(response).login(function (data) {
        res.json(data);
    });
});

// 用户注册
app.post('/user_register',urlencodedParser,function (req,res) {
    var response = {
        user_name:req.body.username,
        password:req.body.password,
        email:req.body.email
    };

    user.userController.user(response).register(function (data) {
        res.json(data);
    })

});

var server = app.listen(8888, function () {

    var host = server.address().address;
    var port = server.address().port;

    console.log("应用实例，访问地址为 http://%s:%s", host, port)

});