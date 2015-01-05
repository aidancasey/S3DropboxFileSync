'use strict';

var config = require('../config/config');
var Q = require('q');
var AWS = require('aws-sdk');
AWS.config.region = 'eu-west-1';

//AWS SDK relies on these env settings getting set,

process.env['AWS_ACCESS_KEY_ID'] = config.aws.accessKey;
process.env['AWS_SECRET_ACCESS_KEY'] = config.aws.secretKey;

exports.storeToken = function (token) {

    var deferred = Q.defer();
    var s3bucket = new AWS.S3({params: {Bucket: config.aws.tokenBucket}});
    var data = {Key: 'token', Body: token };

    return s3bucket.putObject(data, function (error, data) {
        if (error) {
            deferred.reject(error);
        } else {
            deferred.resolve(token);
        }
    });
};

exports.getFile = function (name) {
    var deferred = Q.defer();
    var params = {Bucket: config.aws.fileUploadBucket, Key: name}
    var s3 = new AWS.S3();

    s3.getObject(params, function (err, data) {
        if (err) {
            console.log(err, err.stack);
            deferred.reject(err);
        }
        else {
            deferred.resolve(data.Body)
        }
    });
    return deferred.promise;
};


exports.postToS3 = function (buffer, filename, mimetype) {
    var s3bucket = new AWS.S3({params: {Bucket: config.aws.fileUploadBucket}}),
        deferred = Q.defer(),
        dataToPost = {
            Bucket: config.aws.fileUploadBucket,
            Key: filename,
            ACL: 'public-read',
            ContentType: mimetype
        };

    console.log(dataToPost);

    dataToPost.Body = buffer;
    s3bucket.putObject(dataToPost, function (err, data) {
        if (err) {
            deferred.reject(err.message);
        } else {
            deferred.resolve(data);
        }
    });
    return deferred.promise;
};

exports.getSignedUrl = function (fileName) {
    var s3 = new AWS.S3();
    var params = {Bucket: config.aws.fileUploadBucket, Key : fileName, Expires :20};
    return s3.getSignedUrl('getObject', params);
};