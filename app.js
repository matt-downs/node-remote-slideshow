const fs = require('fs');
const path = require('path');
const shortid = require('shortid');
const sharp = require('sharp');
const express = require('express');
const app = express();
const fileUpload = require('express-fileupload');
const config = require('./config.json');


app.set('view engine', 'pug');
app.use(fileUpload());
app.use('/display/', express.static('display'));
app.use('/images/', express.static('images'));


app.get('/data', (req, res) => {
    getImages()
        .then(images => {
            res.json({
                images: images,
                config: config.client
            });
        })
        .catch(err => res.status(500).send(err));
});

// app.get('/sensorData', (req, res) => {
//     res.json({ "energy": 123.43, "temp": 26.00, "humidity": 60.00 });
// });


app.get('/', (req, res) => {
    getImages()
        .then(images => {
            res.render('test', { images: images });
        })
        .catch(err => res.status(500).send(err));
});


app.post('/uploadImage', (req, res) => {
    if (req.files && req.files.image && isImage(req.files.image.name)) {
        let savePath = './images/' + shortid.generate() + '.' + getExt(req.files.image.name);
        sharp(req.files.image.data)
            .rotate()
            .toFile(savePath)
            .then(() => {
                // Clear the image file cache
                imageCache.updatedAt = 0;
                return res.redirect('/');
            })
            .catch((err) => res.status(500).send(err));
    } else res.redirect('/');
});


app.get('/deleteImage/:filename', (req, res) => {
    // Make sure the request it legit
    let fileFound = false;
    for (image of imageCache.files) {
        if (req.params.filename == image) {
            fileFound = true;
            break;
        }
    }
    if (!fileFound) return res.redirect('/');

    // Make sure the image exists on the fs
    fs.stat('./images/' + req.params.filename, function(err, stats) {
        if (!stats) return res.redirect('/test');
        if (err) return res.status(500).send(err);

        // Delete the image
        fs.unlink('./images/' + req.params.filename, function(err) {
            if (err) return res.status(500).send(err);

            // Clear the image file cache
            imageCache.updatedAt = 0;
            return res.redirect('/');

            res.redirect('/');
        });
    });
});


let imageCache = {
    updatedAt: 0,
    files: []
};

function getImages() {
    return new Promise((resolve, reject) => {
        // Only pull images from the fs once every minute
        if (imageCache.updatedAt < Date.now() - 1000 * 60) {
            fs.readdir('images', (err, filenames) => {
                if (err) return reject(err);

                imageCache.files = onlyImages(filenames)
                resolve(imageCache.files);
            });
        } else resolve(imageCache.files);
    });
}


// Accepts an array of filenames as strings
// Returns an array of images as strings
function onlyImages(files) {
    let images = [];
    for (let filename of files) {
        // Ignore any files that begin with a period
        if (filename.charAt(0) == '.') continue;
        if (!isImage(filename)) continue;

        images.push(filename);
    }
    return images;
}


// Accepts a filename string
// Returns true if the file extension is jpg or png
function isImage(filename) {
    let ext = getExt(filename);
    if (ext == 'jpg' || ext == 'jpeg' || ext == 'png') return true;
    return false;
}


function getExt(filename) {
    let ext = filename.split('.');
    return ext[ext.length - 1].toLowerCase();
}


app.listen(config.server.port, () => {
    console.log('Slideshow available on port ' + config.server.port);
});