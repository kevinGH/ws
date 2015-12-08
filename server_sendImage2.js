var WebSocketServer = require('ws').Server
    , wss = new WebSocketServer({ port: 9999 })
    , fs = require('fs');

wss.on('connection', function connection(ws) {
    ws.on('message', function incoming(message) {
        var request = JSON.parse(message);
        var command = request.command,
            start = request.start;
        end = request.end;

        console.log('received: %s', message);


        switch (command) {
            case "connect":
                var response = {
                    status: "1"
                };
                ws.send(JSON.stringify(response));
                break;
            case "play":
                var fileDirPath = 'D:\\video\\10144183183\\grabs';
                var playIndex = 0;

                play(fileDirPath, start, end, function readFileFinished(events) {

                    if (events.length != 0) {

                        var id = setInterval(function () {
                            var item = events[playIndex];
                            console.log(item.filename);

                            fs.readFile(fileDirPath + '\\' + item.filename, function (err, data) {
                                playIndex++;
                                var responseMsg = {
                                    "command": "img",
                                    "timestamp": item.timestamp,
                                    "filename": item.filename,
                                    "data": new Buffer(data, 'binary').toString('base64')
                                };
                                ws.send(JSON.stringify(responseMsg), function ack(error) {
                                    if (error != undefined) {
                                        clearInterval(id);
                                        console.log(error);
                                    }
                                });

                                if (playIndex == events.length) {
                                    clearInterval(id);
                                    //playIndex = 0;
                                    var responseMsg = {
                                        "command": "finished"
                                    };
                                    ws.send(JSON.stringify(responseMsg), function ack(error) { });
                                }
                            });
                        }, 1000);

                    }
                    else {
                        var responseMsg = {
                            "command": "empty"
                        };
                        ws.send(JSON.stringify(responseMsg), function ack(error) { });
                    }
                });
                break;
        }

    });
});



function play(fileDirPath, s, e, readFileFinished) {
    var events = [];
    var currentTimestamp;

    fs.readdir(fileDirPath, function (err, files) {
        for (var i = 0; i < files.length; i++) {
            currentTimestamp = new Date(files[i].substring(0, 10) + ' ' + files[i].substring(11, 23).replace(/-/gi, ':').replace('_', ':')).getTime();
            if (currentTimestamp >= s && currentTimestamp <= e)
                events.push({ "timestamp": currentTimestamp, "filename": files[i] });
        }

        readFileFinished(events);

    });
}

function padStr(i) {
    return (i < 10) ? "0" + i : "" + i;
}