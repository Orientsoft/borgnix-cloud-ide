var express = require('express')
  , path = require('path')
  // , favicon = require('serve-favicon')
  , logger = require('morgan')
  , cookieParser = require('cookie-parser')
  , bodyParser = require('body-parser')
  , multer = require('multer')
  , fs = require('fs-extra')
  , _ = require('underscore')

var routes = require('./routes/index')
var users = require('./routes/users')

var config = fs.readJsonSync('config/config.json')

var app = express()

// view engine setup
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'jade')

// app.set('env', 'development')

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'))
app.use(logger('dev'))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(express.static(path.join(__dirname, 'public')))
app.use(multer({dest: './uploads'}))

var session = require('express-session')

var sessionStore

switch (config.session.store.type) {
  case 'redis':
    var RedisStore = require('connect-redis')(session)
    sessionStore = new RedisStore(_.omit(config.session.store, 'type'))
    break
  default:
    break
}

app.use(session({
  secret: config.session.secret
, name: 'app.sid'
, store: sessionStore
, resave: false
, saveUninitialized: false
}))

var arduino = require('arduino-compiler/router')(config)
  , projects = require('borgnix-project-manager/router')(config)

var auth = require('./routes/' + (config.singleUser ? 'single' : 'auth'))

app.use('*', auth)
app.use('/', routes)
app.use('/users', users)
app.use('/p', projects)
app.use('/c', arduino)

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found')
  err.status = 404
  next(err)
})

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res) {
    console.log(err.stack)
    res.status(err.status || 500)
    res.render('error', {
      message: err.message,
      error: err
    })
  })
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res) {
  res.status(err.status || 500)
  res.render('error', {
    message: err.message,
    error: {}
  })
})


module.exports = app
