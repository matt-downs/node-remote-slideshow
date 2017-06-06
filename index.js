const fs = require('fs');
const path = require('path');
const express = require('express');
const app = express();

app.use('/images/', express.static('images'))

app.get('/images', function(req, res) {
    fs.readdir('images', function(err, files) {
        let images = [];
        for (let filename of files) {
            let ext = filename.split('.');
            ext = ext[ext.length - 1].toLowerCase();
            if (ext == 'jpg' || ext == 'png') images.push(filename);
        }
        res.json({images: images});
    });
});

app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(3000, function() {
    console.log('Slideshow available on port 3000!');
});