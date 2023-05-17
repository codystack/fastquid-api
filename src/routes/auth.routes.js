const { verifyCookie } = require('../helpers/middlewares')
const auth = require('../controllers/auth.controller.js')
var router = require('express').Router()

module.exports = (app) => {
  // auth route
  router.post('/create', auth.create)
  router.post('/login', auth.login) 
  router.post('/token', auth.token)

  router.get('/profile', verifyCookie, auth.profile)
  router.patch('/update', verifyCookie, auth.update)
  router.post('/verify-otp', auth.verifyOtp)
  router.post('/send-otp', auth.sendOtp)
  router.patch('/reset-password', auth.resetPassword)
  router.patch('/logout', verifyCookie, auth.logout)

  app.use('/api/auth', router)
}
