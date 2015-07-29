var gulp = require('gulp')
  , browserify = require('browserify')
  , babelify = require('babelify')
  , watchify = require('watchify')
  , source = require('vinyl-source-stream')
  , streamify = require('gulp-streamify')
  , minifyify = require('minifyify')
  , less = require('gulp-less')
  , path = require('path')
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
  gulp.watch('./app-new-ui/**.js', ['browserify'])
  gulp.watch('./less/**.less', ['less'])
})

gulp.task('browserify', function () {
  browserify({
    entries: ['./app-new-ui/main.js']
  , transform: [babelify]
  , debug: true
  , cache: {}
  , packageCache: {}
  , fullPaths: true
  }).bundle()
    .pipe(source('main.js'))
    .pipe(gulp.dest('./public/js'))
})

gulp.task('less', function () {
  gulp.src('./less/main.less')
      .pipe(less({paths: [path.join(__dirname, 'less')]}))
      .pipe(gulp.dest('./public/css'))
})

gulp.task('default', ['watch'])
