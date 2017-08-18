var express = require('express');
var app = express();
var path = require('path');
var admin = require('./serve/Controller/AdminController.js');
var bodyParser = require('body-parser');
// 创建 application/x-www-form-urlencoded 编码解析
var urlencodedParser = bodyParser.urlencoded({ extended: false });

app.use(express.static(path.join(__dirname,'client')));

app.get('/', function (req, res) {
    res.sendFile( __dirname + "/client/views/login/" + "login.html" );
});
app.get('/home', function (req, res) {
    res.sendFile( __dirname + "/client/views/home/" + "index.html" );
});

// 用户登录
app.post('/user_login', urlencodedParser , function (req, res) {

    var response = {
        user_name:req.body.username,
        password:req.body.password
    };

    admin.AdminController(response).login(function (data) {
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

    admin.AdminController(response).register(function (data) {
        res.json(data);
    })

});

var server = app.listen(8888, function () {

    var host = server.address().address;
    var port = server.address().port;

    console.log("应用实例，访问地址为 http://%s:%s", host, port)

});