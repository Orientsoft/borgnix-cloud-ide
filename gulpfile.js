var gulp = require('gulp')
  , browserify = require('browserify')
  , babelify = require('babelify')
  , watchify = require('watchify')
  , source = require('vinyl-source-stream')
  , streamify = require('gulp-streamify')
  , minifyify = require('minifyify')
  , less = require('gulp-less')
  , path = require('path')
  , fs = require('fs-extra')
  , exec = require('child_process').exec
  , uglify = {
      js: require('gulp-uglify')
    , css: require('gulp-uglifycss')
    }

function printErrorStack(err) {
  console.log(err.stack)
}

gulp.task('install', function () {
  gulp.src(['./node_modules/bootstrap/dist/**'])
    .pipe(gulp.dest('./public/vendor/bootstrap'))
  gulp.src(['./node_modules/material-design-icons/iconfont/**'])
    .pipe(gulp.dest('./public/vendor/material-design-icons'))
  gulp.src(['./config/default.json'])
    .pipe(gulp.dest('./config'))
})

gulp.task('production', function () {
  browserify({
    entries: ['./app-new-ui/main.js']
  , transform: [babelify]
  , debug: false
  })
  .bundle()
  .pipe(source('main.js'))
  .pipe(streamify(uglify.js()))
  .pipe(gulp.dest('./public/js'))

  gulp.src('./less/main.less')
      .pipe(less({paths: [path.join(__dirname, 'less')]}))
      .pipe(uglify.css())
      .pipe(gulp.dest('./public/css'))
})

gulp.task('uglify', function () {
  gulp.src('./public/js/**.js')
      .pipe(uglify.js())
      .pipe(gulp.dest('./public/js'))

  gulp.src('./public/css/**.css')
      .pipe(uglify.css())
      .pipe(gulp.dest('./public/css'))
})

gulp.task('watch', function () {
  var bundler = browserify({
    entries: ['./app-new-ui/main.js']
  , transform: [babelify]
  , debug: true
  , cache: {}
  , packageCache: {}
  // , fullPaths: true
  })

  var watcher = watchify(bundler)

  watcher.build = function () {
    console.log('start build')
    watcher.bundle()
           .pipe(source('main.js'))
          //  .pipe(streamify(uglify.js()))
           .pipe(gulp.dest('./public/js'))
  }

  watcher.on('error', printErrorStack)
         .on('update', watcher.build)
         .on('time', function (time) {
           console.log('building took:', time)
         })

  gulp.watch('./less/**.less', ['less'])

  watcher.build()
  gulp.start('less')
})

gulp.task('browserify', function () {
  browserify({
    entries: ['./app-new-ui/main.js']
  , transform: [babelify]
  , debug: true
  , cache: {}
  , packageCache: {}
  , fullPaths: true
  }).on('error', printErrorStack)
    .bundle()
    .pipe(source('main.js'))
    .pipe(gulp.dest('./public/js'))
})

gulp.task('less', function () {
  gulp.src('./less/main.less')
      .pipe(less({paths: [path.join(__dirname, 'less')]}))
      .pipe(gulp.dest('./public/css'))
})

gulp.task('link', function () {
  fs.symlink( path.join(__dirname, '../borgnix-arduino-compiler')
            , path.join(__dirname, 'node_modules/arduino-compiler'))
  fs.symlink( path.join(__dirname, '../borgnix-project-manager')
            , path.join(__dirname, 'node_modules/borgnix-project-manager'))
})

gulp.task('unlink', function () {
  fs.removeSync(path.join(__dirname, 'node_modules/arduino-compiler'))
  fs.removeSync(path.join(__dirname, 'node_modules/borgnix-project-manager'))
})

gulp.task('git-install', function () {
  var deps = require('./package.json').dependencies
  var cmd = [ 'npm i'
            , deps['arduino-compiler']
            , deps['borgnix-project-manager']
            ].join(' ')
  exec(cmd)
})

gulp.task('default', ['watch'])
