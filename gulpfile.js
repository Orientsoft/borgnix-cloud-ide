var gulp = require('gulp')
  , path = require('path')
  , fs = require('fs-extra')

require('shelljs/global')

gulp.task('install', function () {
  exec('bower install')
  exec('node_modules/.bin/bower-installer')
  ln('-s'
    , path.join(__dirname, 'node_modules')
    , path.join(__dirname, 'public/node_modules'))
  if (!fs.existsSync(path.join(__dirname, 'config/config.json')))
    cp('config/default.json', 'config/config.json')
  cp('-r', 'bower_components/bootstrap/fonts', 'public/vendor')
})

gulp.task('dev-install', function () {
  var bpmPath = path.join( __dirname, 'node_modules/borgnix-project-manager')
  fs.removeSync(bpmPath)
  var bpmDevPath = path.join(__dirname, '../borgnix-project-manager')
  if (fs.existsSync(bpmDevPath))
    ln('-s', bpmDevPath, bpmPath)

  var bacPath = path.join( __dirname, 'node_modules/arduino-compiler')
  fs.removeSync(bacPath)
  var bacDevPath = path.join(__dirname, '../borgnix-arduino-compiler')
  if (fs.existsSync(bacDevPath))
    ln('-s', bacDevPath, bacPath)
})

gulp.task('production-install', function () {
  exec('npm i git+https://github.com/Orientsoft/borgnix-project-manager.git')
  exec('npm i git+https://github.com/Orientsoft/borgnix-arduino-compiler.git')
})

gulp.task('clean:installation', function () {
  rm('-rf', ['public/vendor', 'public/node_modules', 'node_modules', 'bower_components'])
})

gulp.task('clean:uploads', function () {
  fs.emptyDirSync('uploads')
})
