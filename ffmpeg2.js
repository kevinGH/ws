var formidable = require('formidable'),
        http = require('http'),
        sys = require('sys'),
        spawn = require('child_process').spawn;

function spawnFfmpeg(exitCallback) {
    var args = ['-i', 'pipe:0', '-c:v', 'mjpeg', '-ss', '00:00:13', '-vframes', '1', '-s', '100x80', 'thumbnail.jpg']
    var ffmpeg = spawn('ffmpeg', args);
    console.log('Spawning ffmpeg ' + args.join(' '));

    ffmpeg.on('exit', exitCallback);
    ffmpeg.stderr.on('data', function (data) {
        console.log('grep stderr: ' + data);
    });
    return ffmpeg;
}

http.createServer(function (req, res) {
    if (req.url == '/' && req.method.toLowerCase() == 'get') {
        // show a file upload form
        res.writeHead(200, { 'content-type': 'text/html' });
        res.end
                ('<form action="/upload" enctype="multipart/form-data" method="post">'
                        + '<input type="text" name="title"><br>'
                        + '<input type="file" name="upload" multiple="multiple"><br>'
                        + '<input type="submit" value="Upload">'
                        + '</form>'
                        );
    } else if (req.url == '/upload' && req.method.toLowerCase() == 'post') {
        // parse a file upload
        var form = new formidable.IncomingForm();
        form.maxFieldsSize = 29 * 1024 * 1024;
        // Handle each part of the multi-part post
        var ffmpeg = spawnFfmpeg(function (code) {
            console.log('child process exited with code ' + code);
            res.end();
        });

        var form = new formidable.IncomingForm();
        // Handle each part of the multi-part post
        form.onPart = function (part) {
            // Handle each data chunk as data streams in
            part.addListener('data', function (data) {
                /*
                 * This only one line was the solution of my problem now all works really fast !! 500mbit like transloadit it does
                 */
                ffmpeg.stdin.write(data);
            });
        };

        // Do it
        form.parse(req);
        return;
    }
}).listen(80, "127.0.0.1");

process.on('uncaughtException', function (err) {
});