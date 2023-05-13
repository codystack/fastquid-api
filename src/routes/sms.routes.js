//Middleware
const sms = require('../controllers/sms.controller')

module.exports = (app) => {
  const router = require('express').Router()

  // admin route
  router.post('/create', sms.create)

  app.use('/api/sms', router)
}
