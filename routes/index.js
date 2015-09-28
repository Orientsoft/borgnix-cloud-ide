var express = require('express')
var router = express.Router()

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', { main: 'main' })
})

router.get('/test', function (req, res) {
  res.render('index', { main: 'test' })
})

router.get('/mocha', function (req, res) {
  res.render('test')
})

module.exports = router
