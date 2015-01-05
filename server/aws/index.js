'use strict';

module.exports = function(app) {
    var  router = require('express').Router(),
        aws = require('./aws');


    router.post('/', function (req, res) {

        req.pipe(req.busboy);
        req.busboy.on('file', function (fieldname, file, filename, encoding, mimetype) {
            if (!filename) {
                // If filename is not truthy it means there's no file
                return;
            }
            // Create the initial array containing the stream's chunks
            file.fileRead = [];

            file.on('data', function (chunk) {
                this.fileRead.push(chunk);
            });

            file.on('error', function (err) {
                console.log('Error while buffering the stream: ', err);
                res.send(error);
            });

            file.on('end', function () {
                var finalBuffer = Buffer.concat(this.fileRead);

                aws.postToS3(finalBuffer, filename, mimetype)
                    .then(function (data) {
                        res.send(200)
                    })
                    .catch(function (error) {
                        console.log(error);
                        res.send(error);
                    })
            });
        });
    });





    return router;
};


