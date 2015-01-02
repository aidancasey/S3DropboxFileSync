var AWS = require('aws-sdk');
var config = require('./config/config');
var Q = require('q');
var Dropbox = require("dropbox");

function getToken() {
    var deferred = Q.defer();
    var params = {Bucket: config.aws.tokenBucket, Key: 'token'
    }

    var s3 = new AWS.S3();

    s3.getObject(params, function (err, data) {
        if (err) {
            console.log(err, err.stack);
            deferred.reject(err);
        }
        else {
            deferred.resolve(data.Body.toString());
        }
    });
    return deferred.promise;
};

function syncFile(fileName,fileStream, bearerToken) {
    var client = new Dropbox.Client({
        key: config.dropbox.appKey,
        secret: config.dropbox.appSecret,
        token: bearerToken
    });

    var result = client.writeFile(fileName, fileStream, function (error, stat) {
        if (error) {
            console.log(error);
        }
    });
    return result;
}

function getFile(bucketName, key) {

    var deferred = Q.defer();
    var params = {Bucket: bucketName,
                  Key: key
    }

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

exports.handler = function (event, context) {

    var srcBucket = event.Records[0].s3.bucket.name;
    var srcKey    = event.Records[0].s3.object.key;

    getToken().then(function (token) {
             getFile(srcBucket,srcKey)
            .then(function (fileStream) {
                foo = syncFile(srcKey,fileStream, token);
            })
            .catch(function (error) {
                console.log(error);
            })
    }).done();
};