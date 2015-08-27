var express = require('express')
var router = express.Router()

// check for user login, if user's not logged in, redirect to login page
router.all('*', function(req, res, next) {
  req.session = req.session || {}
  if (!req.session.user)
    req.session.user = {uid: 'single-user'}
  next()
})

module.exports = router
