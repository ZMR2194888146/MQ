const express = require('express');
const app = express();
app.use(express.static(__dirname));
var http = require('http').Server(app);
var io = require('socket.io')(http);

var users = new Array();
var PORT = 80;

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/index.html');
});

io.on('connection', function (socket) {

    io.emit('inline', getUsersString());
    console.log("publish inline user's name");

    //用户登录
    socket.on("login", function (str) {
        socket.userName = str; 
        users.push(str);
        console.log(getUsersString());
        io.emit('inline', getUsersString());   
        console.log("[" + str + "]:login");
    });

    //用户发送信息
    socket.on('message', function (str) {
        io.emit("message", "[" + socket.userName + "]:" + str);
        console.log('[' + socket.userName + ']:' + str);
    });

    socket.on('leave', function () {
        var j = users.indexOf(socket.userName);
        users.splice(j, j + 1);  
        io.emit('inline', getUsersString()); 
        console.log("[" + socket.userName + "]:leaved");
    });

    socket.on('disconnect', function () {       
        io.emit('leave', socket.userName);
        console.log("[" + socket.userName + "]:leaved");
    });
});

function getUsersString() {
    console.log(users.length);
    var usersStr = "";
    for (var i = 0; i < users.length; i++) {
        usersStr += '<p>' + users[i] + '</p>';
        
    }
    return usersStr;
}

http.listen(PORT, function () {
    console.log('listening on *:' + PORT);
});