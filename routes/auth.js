var express = require('express')
var router = express.Router()

/* GET home page. */
router.all('*', function(req, res, next) {
  // res.render('index', { title: 'Express' })
  console.log(req.session)
  // next()
  // res.render('error', new Error('not authed'))
  // res.redirect('/')
  if (req.path === '/') next()
  else res.redirect('/')
  console.log(req.path)
})

module.exports = router
