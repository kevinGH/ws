var WebSocket = require('ws');
var ws = new WebSocket('ws://localhost:8888');

ws.on('open', function open() {
    var now = new Date(), start, end;
    now.setMilliseconds(0);
    oldStart = new Date(now.getTime());
    oldStart.setMilliseconds(0);
    oldStart.setSeconds(0);
    oldStart.setMinutes(0);
    oldStart.setMinutes(-6);
    start = new Date(oldStart.getTime());
    end = new Date(now.getTime());
    end.setMilliseconds(0);
    end.setSeconds(0);
    end.setMinutes(66);

    var msg = {
        "wsRequestEventTimestamp": new Date().getTime(),
        "scale": 1,
        "start": start.getTime(),
        "end": end.getTime()
    };
    ws.send(JSON.stringify(msg), function ack(error) {
    });
});

ws.on('message', function (data, flags) {
    // flags.binary will be set if a binary data is received.
    // flags.masked will be set if the data was masked.
    console.log(JSON.stringify(data));
});

ws.on('close', function close() {
    console.log('disconnected');
});