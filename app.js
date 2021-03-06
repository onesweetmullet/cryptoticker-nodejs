var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var apicache = require('apicache').options({ debug: true }).middleware;

var routes = require('./routes/index');
var users = require('./routes/users');

var app = express();

var tradePair = require('./routes/tradepair');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.get('/tradepair/get/:exchange/:prefix/:suffix', apicache('30 seconds'), tradePair.getRaw);
app.get('/tradepair/get/:exchange/:prefix/:suffix/formatted', apicache('30 seconds'), tradePair.getFormatted);

app.get('/tradepair/getall/:prefix/:suffix', apicache('30 seconds'), tradePair.getAll);
app.get('/tradepair/getall/:prefix/:suffix/formatted', apicache('30 seconds'), tradePair.getAllFormatted);

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

//app.use('/', routes);
app.use('/users', users);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
