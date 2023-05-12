//Middleware
const support = require('../controllers/support.controller')
const { verifyCookie } = require('../helpers/middlewares')

module.exports = (app) => {
  const router = require('express').Router()

  // admin route
  router.post('/create', verifyCookie, support.create)

  app.use('/api/support', router)
}
