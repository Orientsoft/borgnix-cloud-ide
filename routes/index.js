var express = require('express')
var router = express.Router()

// var master = require('../lib/master')

var fs = require('fs')
  , path = require('path')
  // , multer = require('multer')
  , os = require('os')

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' })
})

// router.get('/ports',function(req,res) {
//   master.listPorts(function(err, list) {
//     res.json(list).end()
//   })
// })
//
// router.get('/boards',function(req,res) {
//   res.json(master.getBoards()).end()
// })
//
// router.post('/compile',function(req,res) {
//   console.log("code = ",req.body)
//   if(!req.body.board) return res.json({status:'missing board name'}).end()
//   try {
//     master.doCompile(req.body.code, req.body.board, req.body.sketch, function(err) {
//       if(err) return res.json({status:'error',message:err}).end()
//       res.json({status:'okay'}).end()
//     }, publishEvent)
//
//   } catch(e) {
//     console.log("compilation error",e)
//     console.log(e.output)
//     publishEvent({ type:'error', message: e.toString(), output: e.output})
//     res.json({status:'error',output:e.output, message: e.toString()}).end()
//   }
// })
//
// router.get('/download-hex/:name', function (req, res) {
//   var hex = path.join(os.tmpdir(), 'build', 'out', req.params.name+'.hex')
//   console.log('HEX FILE:', hex)
//   res.download(hex)
// })
//
// router.post('/sketches_new',function(req,res) {
//   console.log("getting some new sketches",req.body)
//   master.makeNewSketch(req.body.name, function(result){ res.json(result).end() })
// })
// router.post('/sketches_delete',function(req,res) {
//   console.log("deleting a sketch",req.body)
//   master.deleteSketch(req.body.name, function(result){ res.json(result).end() })
// })
//
// router.get('/sketches',function(req,res) {
//   master.listSketches(function(list) {
//     res.json(list).end()
//   })
// })
//
//
// router.post('/get_settings',function(req,res) {
//   master.getSettings({},function(result){ res.json(result).end() })
// })
// router.post('/set_settings',function(req,res) {
//   master.setSettings(req.body,function(result){ res.json(result).end() })
// })
//
//
// router.post('/save',function(req, res) {
//   //console.log(req.body)
//   master.saveSketch(req.body,function(results) {
//     res.json({status:'okay'}).end()
//   })
// })
//
//
// router.get('/sketch',function(req, res) {
//   var path = req.query.id.substring(0,req.query.id.lastIndexOf('/'))
//   master.getSketch(path, function(sketch) {
//     res.json(sketch).end()
//   })
// })
//
// router.get('/search',function(req,res){
//   master.searchLibraries(req.query.query, function(results) {
//     res.json(results).end()
//   })
// })


module.exports = router
