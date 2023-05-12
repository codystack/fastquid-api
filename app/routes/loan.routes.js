//Middleware
const loan = require('../controllers/loan.controller')
const { verifyCookie, verifyAdmin } = require('../helpers/middlewares')

module.exports = (app) => {
  const router = require('express').Router()

  // admin route
  router.post('/create', verifyCookie, loan.create)
  router.post('/request', verifyCookie, loan.request)
  router.post('/check-eligibility', verifyCookie, loan.checkEligibility)
  router.get('/single', verifyCookie, loan.single)

  app.use('/api/loan', router)
}
