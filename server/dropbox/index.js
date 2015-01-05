'use strict';

module.exports = function(app) {
      var  router = require('express').Router(),
          dropbox = require('./dropbox');



    router.get('/authorise', function(req, res, next) {
        dropbox.authenticate(req, res);
    });


    router.get('/callback', function(req, res, next) {
        dropbox.getBearerToken(req, res)
            .then(function (token) {
                aws.storeToken(token)
            })
            .then(function () {
                res.send(200);
            })
            .catch(function (error) {
                console.log(error);
                res.send(error);
            })
    });


    return router;
};


