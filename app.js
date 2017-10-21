const fs = require('fs');
const path = require('path');
const express = require('express');
const app = express();

const config = require('./config.json');


app.use('/images/', express.static('images'));
app.use('/', express.static('www'));

app.get('/data', function(req, res) {
    fs.readdir('images', function(err, filenames) {
        // Get an array of all images
        let images = getImages(filenames);
        // Reply to the request
        res.json({
            images: images,
            config: {
                delay: config.delay,
                showTime: config.showTime,
                showDate: config.showDate
            }
        });
    });
});

app.listen(config.port, function() {
    console.log('Slideshow available on port ' + config.port);
});

// Accepts an array of filenames as strings
// Returns an array of images as strings
function getImages(files) {
    let images = [];
    for (let filename of files) {
        // Ignore any files that begind with a period
        if (filename.charAt(0) == '.') continue;
        if (!isImage(filename)) continue;
        
        images.push(filename);
    }
    return images;
}

// Accepts a filename string
// Returns true if the file extension is jpg or png
function isImage(filename) {
    let ext = filename.split('.');
    ext = ext[ext.length - 1].toLowerCase();
    if (ext == 'jpg' || ext == 'png') return true;
    return false;
}