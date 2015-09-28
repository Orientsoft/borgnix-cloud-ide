var gulp = require('gulp')
  , browserify = require('browserify')
  , babelify = require('babelify')
  , watchify = require('watchify')
  , source = require('vinyl-source-stream')
  , streamify = require('gulp-streamify')
  , less = require('gulp-less')
  , path = require('path')
  , fs = require('fs-extra')
  , child_process = require('child_process')
  , exec = child_process.exec
  , spawn = child_process.spawn
  , uglify = {
      js: require('gulp-uglify')
    , css: require('gulp-uglifycss')
    }

var argv = require('minimist')(process.argv.slice(2))

function printErrorStack(err) {
  if (err) console.log(err.stack || err)
}

// move required resource in to vendor directory

gulp.task('install', function () {
  gulp.src(['./node_modules/bootstrap/dist/**'])
    .pipe(gulp.dest('./public/vendor/bootstrap'))
  gulp.src(['./node_modules/material-design-icons/iconfont/**'])
    .pipe(gulp.dest('./public/vendor/material-design-icons'))
  gulp.src(['./config/default.json'])
    .pipe(gulp.dest('./config'))
  // gulp.src(['./node_modules/highlight.js/styles/**'])
  //   .pipe(gule.dest('./public/vendor/highlight.js'))
})

// usage: gulp production [-f filename(default: ./app-new-ui/main.js)]
// build a minified bundle against the given entry file

gulp.task('production', function () {
  browserify({
    entries: [argv.f || './app-new-ui/main.js']
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

// usage: gulp watch [-f filename(default: ./app-reflux/test.js)]
//                   [-o outputDir(default: ./public/js)]

gulp.task('watch', function () {
  var file = argv.f || './app-reflux/test.js'
  var outdir = argv.o || './public/js'
  var bundler = browserify({
    entries: [file]
  , transform: [babelify]
  , debug: true
  , cache: {}
  , packageCache: {}
  // , fullPaths: true
  })

  console.log('Start watching', file)

  var watcher = watchify(bundler)

  watcher.build = function () {
    console.log('Start building')
    watcher.bundle()
           .on('error', printErrorStack)
           .pipe(source(file))
           .pipe(require('gulp-rename')({dirname: ''}))
           .pipe(gulp.dest(outdir))
  }

  watcher.on('error', printErrorStack)
         .on('update', watcher.build)
         .on('time', function (time) {
           console.log('Finished building after', time, 'ms')
         })

  watcher.build()
})

gulp.task('watch-less', function () {
  gulp.watch('./less/**.less', ['less'])
  gulp.start('less')
})

gulp.task('less', function () {
  gulp.src('./less/main.less')
      .pipe(less({paths: [path.join(__dirname, 'less')]}))
      .pipe(gulp.dest('./public/css'))
})

gulp.task('test', function () {
  spawn('mocha', [ '--compilers'
                 , 'js:babel/register'
                 , 'app-reflux/headless-test'
                 ], {stdio: 'inherit'})
})

// task link, unlink and git-install are used when modifying
// borgnix-project-manager and borgnix-arduino-compiler

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
