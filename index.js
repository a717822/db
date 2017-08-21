var express = require('express');
var app = express();
var path = require('path');
var admin = require('./serve/Controller/AdminController.js');
var bodyParser = require('body-parser');
// 创建 application/x-www-form-urlencoded 编码解析
var urlencodedParser = bodyParser.urlencoded({ extended: false });

var http = require('http').Server(app);
var io = require('socket.io')(http);
var port = process.env.PORT || 8888;

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

var userNum = 0;
var users = new Array();
var server_msg;
var obj = {}

// 群聊功能
io.on('connection', function(socket){

    // 添加用户
    socket.on('add_user',function (name) {
        users.push(name);
        userNum = userNum + 1;
        server_msg = name + '已经加入了房间';

        obj.num = userNum;
        obj.msg = server_msg;
        console.log(server_msg);

        socket.emit('add_user',obj);
    });

    // 发送消息
    socket.on('new_message', function(data){
        io.emit('new_message', data);
    });

    // 断开连接
    socket.on('disconnect',function (name) {
        server_msg = name + '已经离开了房间';
        userNum--;

        obj.num = userNum;
        obj.msg = server_msg;

        console.log(name + '已经离开了房间');
    });


});

http.listen(port, function(){
    console.log('listening on *:' + port);
});
