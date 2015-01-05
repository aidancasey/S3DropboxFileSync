'use strict';

var crypto = require('crypto'),
    url = require('url'),
    request = require('request'),
    Dropbox = require("dropbox"),
    Q = require('q');

var config = require('../config/config');
var APP_KEY = config.dropbox.appKey;
var APP_SECRET = config.dropbox.appSecret;

function generateCSRFToken() {
    return crypto.randomBytes(18).toString('base64')
        .replace(/\//g, '-').replace(/\+/g, '_');
}

function generateRedirectURI(req) {
    return url.format({
        protocol: req.protocol,
        host: req.headers.host,
        pathname: req.app.path() + '/api/dropbox/callback'
    });
}

exports.authenticate = function (req, res) {
    var csrfToken = generateCSRFToken();
    res.cookie('csrf', csrfToken);
    res.redirect(url.format({
        protocol: 'https',
        hostname: 'www.dropbox.com',
        pathname: '1/oauth2/authorize',
        query: {
            client_id: APP_KEY,
            response_type: 'code',
            state: csrfToken,
            redirect_uri: generateRedirectURI(req)
        }
    }));
};

exports.getBearerToken = function (req, res) {
    var deferred = Q.defer();

    if (req.query.error) {
        deferred.resolve(req.query.error);
    }

    Q.fcall(request.post, 'https://api.dropbox.com/1/oauth2/token', {
        form: {
            code: req.query.code,
            grant_type: 'authorization_code',
            redirect_uri: generateRedirectURI(req)
        },
        auth: {
            user: APP_KEY,
            pass: APP_SECRET
        }}, function (error, response, body) {
        if (error) {
            console.log(error)
            deferred.reject(error);
        } else {
            var data = JSON.parse(body);
            if (data.error) {
                deferred.reject(data.error);
            }
            deferred.resolve(data.access_token);
        }
    })
        .done();
    return deferred.promise;
}
