var express = require('express')
var router = express.Router()

const BORGNIX_HOME = 'http://voyager.orientsoft.cn'

// check for user login, if user's not logged in, redirect to login page
router.all('*', function(req, res, next) {
  console.log(req.session)
  if (req.session.user) next()
  else res.redirect(BORGNIX_HOME)
})

module.exports = router
