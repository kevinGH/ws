var WebSocketServer = require('ws').Server
  , wss = new WebSocketServer({ port: 9999 })
 , fs = require('fs');

wss.on('connection', function connection(ws) {
    ws.on('message', function incoming(message) {
        console.log('received: %s', message);
        //ws.send('something');
        fs.readFile('D:\\video\\10144183183\\grabs\\' + '2015-02-03_15-11-06_422.jpg', function (err, data) {
            //var img = new Buffer(data, 'binary').toString('base64');
            //ws.contentType('data:image/jpeg;base64');
            ws.send(new Buffer(data, 'binary').toString('base64'));
        });
    });


});