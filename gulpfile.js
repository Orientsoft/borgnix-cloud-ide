var gulp = require('gulp')
  , browserify = require('browserify')
  , babelify = require('babelify')
  , watchify = require('watchify')
  , source = require('vinyl-source-stream')
  , concat = require('gulp-concat')
  , uglify = require('gulp-uglify')
  , streamify = require('gulp-streamify')

gulp.task('install', function () {
  gulp.src(['./node_modules/bootstrap/dist/**'])
    .pipe(gulp.dest('./public/vendor/bootstrap'))
  gulp.src(['./node_modules/material-design-icons/iconfont/**'])
    .pipe(gulp.dest('./public/vendor/material-design-icons'))
})

gulp.task('browserify', function () {
  var bundler = browserify({
    entries: ['./app-new-ui/main.js']
  , transform: [babelify]
  , debug: true
  , cache: {}
  , packageCache: {}
  , fullPaths: true
  })

  var watcher = watchify(bundler)

  return watcher
    .on('update', function () { // When any files update
        var updateStart = Date.now()
        console.log('Updating!')
        watcher.bundle()// Create new bundle that uses the cache for high performance
        .on('error', function (err) {
          console.error(err.stack)
        })
        .pipe(source('main.js'))
        .pipe(streamify(uglify()))
    // This is where you add uglifying etc.
        .pipe(gulp.dest('./public/build/'))
        console.log('Updated!', (Date.now() - updateStart) + 'ms')
    })
    .bundle() // Create the initial bundle when starting the task
    .on('error', function (err) {
      console.error(err.stack || err)
    })
    .pipe(source('main.js'))
    .pipe(gulp.dest('./public/build/'))
})

gulp.task('default', ['browserify'])
