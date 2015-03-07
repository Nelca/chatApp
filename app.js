/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var user = require('./routes/user');
var http = require('http');
var path = require('path');
var MongoStore = require('connect-mongo')(express);

var app = express();


// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(express.cookieParser('your secret here'));
app.use(express.session());
app.use(express.cookieParser()); //追加
app.use(express.session({
    secret: 'secret',
    store: new MongoStore({
        db: 'session',
        host: 'localhost',
        clear_interval: 60 * 60
    }),
    cookie: {
        httpOnly: false,
        maxAge: new Date(Date.now() + 60 * 60 * 1000)
    }
})); //追加
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

//認証用のバリデータ関数
var loginCheck = function(req, res, next) {
    if(req.session.user){
      next();
    }else{
      res.redirect('/login');
    }
};

//ルーティング設定
app.get('/', loginCheck, routes.index);
app.get('/login', routes.login);
app.post('/add', routes.add);
app.get('/logout', function(req, res){
  req.session.destroy();
  console.log('deleted sesstion');
  res.redirect('/');
});

//Original Code
//app.get('/', routes.index);

app.get('/users', user.list);

//Original Code
//http.createServer(app).listen(app.get('port'), function(){
//  console.log('Express server listening on port ' + app.get('port'));
//});


server = http.createServer(app);
var socketio = require('socket.io');
var io = socketio.listen(server);
 
server.listen(app.get('port'), function(){
  console.log("server listening on port " + app.get('port'));
});
 
io.sockets.on('connection', function (socket) {
  var address = socket.handshake.address;
  console.log("connected from " + address.address + ":" + address.port);
   
  socket.on('msg', function(data){
    //console.log(data);
    var now = new Date();
    var year = now.getFullYear();
    var month = ("0" + (now.getMonth() + 1)).slice(-2);
    var day = ("0" + now.getDate()).slice(-2);
    var hour = ("0" + now.getHours()).slice(-2);
    var minute = ("0" + now.getMinutes()).slice(-2);
    var second = ("0" + now.getSeconds()).slice(-2);
    var date = year + "-" + month + "-" + day + " " + hour + ":" + minute + ":" + second;
    var userName = data.userName;
    var message = data.message;
    var image = data.image;
  
    io.sockets.emit("msg", {date : date, message : message, userName : userName, image : image});
  });
   
  socket.on('disconnect', function () {
    console.log("disconnectted from " + address.address + ":" + address.port)
  });
});

// リクエストが来たら、index.ejsの内容をクライアントに出力する
app.get('/', function(req, res){
  res.render('index.ejs', {
    layout: false
  });
});
