var ffmpeg = require('fluent-ffmpeg');
var command = new ffmpeg('rtsp://admin:123456@10.144.183.183:80/');
command.on('error', function (err, stdout, stderr) {
    console.log('Cannot process video: ' + err.message);
}).screenshots({
    filename: 'thumbnail-at-%s-seconds.png',
    timestamps: 'hh:mm:ss.xxx',
    folder: 'D:\\testFFMPEG'
});