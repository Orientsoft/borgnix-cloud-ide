console.log("inside of the master controller");
console.log("node version = ", process.versions);
var fs = require('fs');
var os = require('os');
var path = require('path');
var compile = require('./compile');
console.log("about to load the serial port");
try {
var sp = require('serialport');
} catch(e) {
    console.log("error loading serial port");
    console.log(e);
    console.log(e.stack);
}
var uploader = require('./uploader');
var sketches = require('./sketches.js');
var serial = require('./serial.js');
var platform = require('./platform');
var LIBS   = require('./libraries');
var BOARDS = require('./boards').loadBoards();
var OPTIONS = {
    userlibs: platform.getSettings().userlibs
}
console.log('settings',platform.getSettings());
console.log("options",OPTIONS);


function makeCleanDir(outpath) {
    if(fs.existsSync(outpath)) {
        fs.readdirSync(outpath).forEach(function(file) {
            fs.unlinkSync(outpath+'/'+file);
        })
        fs.rmdirSync(outpath);
    }
    fs.mkdirSync(outpath);
    return outpath;
}


exports.listPorts = function(cb) {
    sp.list(function(err,list) {
        // format the data (workaround serialport issue on Win (&*nix?))
        try {
          list.forEach(function(port) {
              if(port.pnpId){
                  var data = /^USB\\VID_([a-fA-F0-9]{4})\&PID_([a-fA-F0-9]{4})/.exec(port.pnpId);
                  if(data){
                      port.vendorId = port.vendorId || '0x'+data[1];
                      port.productId = port.productId || '0x'+data[2];
                  }
              }
          });
        }
        catch (e) {
          console.log(e)
        }

        cb(err,list);
    });

}


exports.getBoards = function() {
    return BOARDS;
}


exports.doCompile = function(code,board,sketch, cb, publishEvent) {
    var BUILD_DIR = os.tmpdir() + '/build';
    publishEvent({ type:'compile', message:BUILD_DIR});
    console.log("compiling with build dir:", BUILD_DIR);
    //create output dir
    if(!fs.existsSync(BUILD_DIR)) {
        fs.mkdirSync(BUILD_DIR);
    }
    var outpath    = makeCleanDir(BUILD_DIR+'/out');
    var sketchpath = makeCleanDir(BUILD_DIR+"/tmp");
    var inoFile = path.join(sketchpath, sketch + '.ino');
    fs.writeFileSync(inoFile, code);

    publishEvent({ type:'compile', message:'writing to ' + inoFile });

    var foundBoard = null;
    BOARDS.forEach(function(bd) {
        if(bd.id == board) foundBoard = bd;
    })
    OPTIONS.device = foundBoard;
    OPTIONS.platform = platform.getPlatform(OPTIONS.device);
    OPTIONS.platform.installIfNeeded(function() {
        OPTIONS.name = sketch;
        compile.compile(sketchpath,outpath,OPTIONS, publishEvent,
                path.join(OPTIONS.platform.getUserSketchesDir(), sketch), cb);
    }, function(per) {
        console.log("percentage = ",per);
    });
}

exports.getSketch = function (path, cb) {
    sketches.getSketch(path,cb);
}

exports.saveSketch = function (args, cb) {
    if(!args.file) throw new Error('missing filename');
    if(!args.code) throw new Error('missing code');
    sketches.saveSketch(args.file, args.code,cb);
}
exports.listSketches = function(cb) {
    sketches.listSketchesFull(cb);
}

exports.makeNewSketch = function(name,cb) {
    sketches.makeNewSketch(name,cb);
}
exports.deleteSketch = function(name,cb) {
    sketches.deleteSketch(name,cb);
}

exports.searchLibraries = function(query,cb) {
    LIBS.search(query,cb);
}

exports.upload = function(sketch, port, pub, cb) {
    uploader.upload(sketch,port,OPTIONS,pub,cb);
}

exports.getSettings = function(args,cb) {
    console.log("master doing get settings");
    cb(platform.getSettings());
}
exports.setSettings = function(args,cb) {
    console.log("master doing set settings");
    platform.setSettings(args,cb);
}
