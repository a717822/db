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

var userNum = 0; // 人数
var sys_msg;    // 系统消息
var sys_obj = {};  // 系统消息
var userArr = new Array();  // 用户数组
var user = new Object();  // 用户信息

io.on('connection', function(socket){
    console.log('服务器连接成功');

    // 用户加入群聊
    socket.on('add_user',function (name) {
            user.name = name;
            user.socket = socket;
            user.online = '在线';

            if(userArr.length != 0){
                for(var i = 0;i<=userArr.length - 1;i++){
                    if(userArr[i].name != name){  // 避免同一用户多次添加
                        userArr.push(user);

                        userNum = userNum + 1;
                        sys_msg = name + '已经加入了房间';

                        sys_obj.num = userNum;
                        sys_obj.msg = sys_msg;
                    }
                }
            }else{
                userArr.push(user);

                userNum = 1;
                sys_msg = name + '已经加入了房间';

                sys_obj.num = userNum;
                sys_obj.msg = sys_msg;
            }


            console.log(sys_msg);

            socket.emit('system_msg', sys_obj);
            socket.broadcast.emit('broadcast',sys_msg);
    });

    // 发送消息
    socket.on('new_message', function(data){
        io.emit('new_message', data);
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
    socket.on('disconnect',function (name) {

        if(userArr.length != 0){
            // 断开连接时，删除该用户
            for(var i = 0;i<=userArr.length - 1;i++){
                if(userArr[i].name == name){
                    delete userArr[i];
                }
            }
        }else{
            userNum = 0;
            sys_msg = name + '已经离开了房间';

            sys_obj.num = userNum;
            sys_obj.msg = sys_msg;
        }


        socket.broadcast.emit('broadcast',sys_msg);
    });

});

http.listen(port, function(){
    console.log('listening on *:' + port);
});
