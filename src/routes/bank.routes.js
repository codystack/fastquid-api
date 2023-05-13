//Middleware
const bank = require('../controllers/bank.controller')
const { verifyCookie, verifyAdmin } = require('../helpers/middlewares')

module.exports = (app) => {
  const router = require('express').Router()

  // admin route
  router.post('/create', verifyCookie, bank.create)
  router.post('/resolve', verifyCookie, bank.resolve)
  router.get('/all', [verifyAdmin, verifyCookie], bank.banks)
  router.get('/list', bank.listBanks)

  app.use('/api/bank', router)
}
