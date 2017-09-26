var express = require('express');
var path = require('path');
var favicon = require('static-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var routes = require('./routes/index');
var users = require('./routes/users');
var albums = require('./routes/album');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(favicon());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

/* App locals setup */
const disconnectConfig = require('./disconnect-config.json');
const disconnect = new require('disconnect').Client(disconnectConfig.agent, disconnectConfig.keys);
const Search = require('./routes/album/search');
const Throxy = require('throxy');
const throxy = new Throxy(disconnect.database(), 1100);
app.locals.discogify = new Search(throxy
);
const SpotifyWebApi = require('spotify-web-api-node');
const spotifyConfig = require('./spotify-config.json');
const spotifyApi = new SpotifyWebApi({
    clientId: spotifyConfig.keys.consumer,
    clientSecret: spotifyConfig.keys.secret,
    redirectUri: spotifyConfig.urls.redirect
});
app.locals.spotifyApi = new Promise(function (resolve, reject) {
    spotifyApi.clientCredentialsGrant().then(response => {
        if (response.statusCode == 200) {
            const token = response.body.access_token;
            spotifyApi.setAccessToken(token);
            console.log('Spotify client authenticated succesfully');
            resolve(spotifyApi)
        } else {
            console.log('ERRROR AUTHENTICATING ' + JSON.stringify(response));
            reject(response);
        }
    });
});

app.use('/', routes);
app.use('/users', users);
app.use('/data/album', albums);

/// catch 404 and forwarding to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

/// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

module.exports = app;
