var express = require('express');
var app = express();
var path = require('path');
var admin = require('./serve/Controller/AdminController.js');
var IM = require('./serve/Controller/IMController.js');
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

var sys_msg;    // 系统消息
var sys_obj = {};  // 系统消息
var userArr = new Array();  // 用户数组

io.on('connection', function(socket){
    console.log('服务器连接成功');

    // 用户加入群聊
    socket.on('add_user',function (name) {
            var user = new Object();  // 用户信息
            user.name = name;
            user.socket = socket;
            user.online = '在线';
            userArr.push(user);

            console.log(userArr);

            sys_msg = name + '已经加入了房间';
            sys_obj.num = userArr.length;
            sys_obj.msg = sys_msg;

            console.log(sys_msg);
            socket.emit('system_msg', sys_obj);
            socket.broadcast.emit('broadcast',sys_msg);
    });

    // 发送消息
    socket.on('new_message', function(data){
        io.emit('new_message', data);
        IM.IMController(data).sendMsg(function (res) {
            console.log(res);
        });
    });

    // 私聊
    socket.on('private_message',function (from,to,msg) {
        for(var i = 0;i<=userArr.length - 1;i++){
            if(userArr[i].name == to){
                var socketId = userArr[i].socket;
                socketId.emit('private_message',msg);
            }
        }
    });

    // 断开连接
    socket.on('disconnect',function () {
        socket.broadcast.emit('broadcast','离开房间');
    });

});

// 获取历史消息
app.post('/getMsg',urlencodedParser,function (req,res) {
    var response = {
        send_id:req.body.send_id,
        type:req.body.type
    };

    IM.IMController(response).getMsg(function (data) {
        res.json(data);
    });
});

http.listen(port, function(){
    console.log('listening on *:' + port);
});
