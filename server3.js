var WebSocketServer = require('ws').Server,
    wss = new WebSocketServer({ port: 8888 }),
    fs = require('fs');

wss.on('connection', function connection(ws) {
    ws.on('message', function incoming(message) {
        var jsonMsg = JSON.parse(message);
        var queryStart = jsonMsg.start,
            queryEnd = jsonMsg.end,
            queryTimestamp = jsonMsg.wsRequestEventTimestamp,
            queryScale = jsonMsg.scale,
            responseData = [];
        console.log('date: %s, scale: %s, start: %s, end: %s', queryTimestamp, queryScale, new Date(queryStart), new Date(queryEnd));

        
        
        
       

        queryEvents('D:\\video\\10144183183\\grabs', queryStart, queryEnd, function done(events) {
            jsonMsg['events'] = events;
            console.log(JSON.stringify(jsonMsg));
            ws.send(JSON.stringify(jsonMsg), function ack(error) { });
        });

        ws.on('close', function () {
            console.log('stopping client interval');
            
        });
    });


});

function queryEvents(filePath, queryStart, queryEnd, callback) {
    var previousTimestamp = 0, currentTimestamp = 0;
    var events = [], eventStart = 0, eventEnd = 0, firstEventStart = 0, firstEventEnd = 0;

    fs.readdir(filePath, function (err, files) {
        for (var i = 0; i < files.length; i++) {
            currentTimestamp = new Date(files[i].substring(0, 10) + ' ' + files[i].substring(11, 23).replace(/-/gi, ':').replace('_', ':')).getTime();

            if (currentTimestamp >= queryStart && currentTimestamp <= queryEnd) {
                if (currentTimestamp - previousTimestamp >= 500) {
                    //if (firstEventStart == 0)  // first event
                    //    firstEventStart = currentTimestamp;

                    events.push({ "start": eventStart, "end": eventEnd });
                    eventStart = currentTimestamp;
                }
                else {
                    //if (events.length == 0 && firstEventStart != 0)
                    //    firstEventEnd = currentTimestamp;
                    
                    eventEnd = currentTimestamp;
                }

                previousTimestamp = currentTimestamp;
            }
        }
        console.log(JSON.stringify(events));
        if (events.length > 0) {
            //events[0] = { "start": firstEventStart, "end": firstEventEnd};
            events.splice(0, 1);
        }
        
        callback(events);

    });
}