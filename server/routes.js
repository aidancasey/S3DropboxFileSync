module.exports = function (app) {
    var dropbox = require('./dropbox');
    var aws = require('./aws');

    app.use('/api/dropbox', require('./dropbox')(app));
    app.use('/api/upload', require('./aws')(app));

}

