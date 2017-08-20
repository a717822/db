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

io.on('connection', function(socket){
    socket.on('chat message', function(msg){
        io.emit('chat message', msg);
    });
});

http.listen(port, function(){
    console.log('listening on *:' + port);
});
