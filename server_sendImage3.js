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
            //case "connect":
            //    var response = {
            //        status: "1"
            //    };
            //    ws.send(JSON.stringify(response));
            //    break;
            case "play":
                var fileDirPath = 'D:\\video\\10144183183\\grabs';

                play(fileDirPath, start, end, function readFileFinished(events) {

                    if (events.length != 0) {
                        send(ws, events, 0);
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


function send(ws, events, playIndex) {
    var fileDirPath = 'D:\\video\\10144183183\\grabs';
    

    if (playIndex < events.length) {
        
        var item = events[playIndex];
        var sendStart = new Date();
        //console.log(sendStart.getTime() + " " + item.timestamp);

        fs.readFile(fileDirPath + '\\' + item.filename, function (err, data) {
            var responseMsg = {
                "command": "img",
                "timestamp": item.timestamp,
                "filename": item.filename,
                "data": new Buffer(data, 'binary').toString('base64')
            };
            
            

            ws.send(JSON.stringify(responseMsg), function ack(error) {
                if (error != undefined) {
                    //clearTimeout(id);
                    console.log(error);
                }
                else {
                    var sendExecTime = new Date() - sendStart;
                    console.log(item.timestamp + " delta=" + sendExecTime);

                    if (playIndex + 1 < events.length) {
                        var nextFrame = events[playIndex + 1];
                        var deltaInterval = nextFrame.timestamp - item.timestamp - sendExecTime;

                        setTimeout(function () {
                            send(ws, events, ++playIndex);
                        }, deltaInterval);


                        // 補中間沒有的時間
                        //if (deltaInterval >= 1000) {
                        //    sendSpaceTimestamp(ws, item.timestamp, nextFrame.timestamp);
                        //}
                    }
                }
            });
        });
    }
}

function sendSpaceTimestamp(ws, start, end) {
    var delta = end - start;

    var responseMsg = {
        "command": "rest",
        "timestamp": start
    };

    ws.send(JSON.stringify(responseMsg), function ack(error) {
        if (error != undefined) {
            console.log(error);
        }
        else {
            var deltaInterval = end - start;

            if (deltaInterval > 1000)
                deltaInterval = 1000;

            if (start + deltaInterval <= end) {
                setTimeout(function () {
                    sendSpaceTimestamp(ws, start + deltaInterval, end);
                }, deltaInterval);
            }
        }
    });

}

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