//Middleware
const transaction = require('../controllers/transaction.controller')
const { verifyCookie, verifyAdmin } = require('../helpers/middlewares')

module.exports = (app) => {
  const router = require('express').Router()

  // admin route
  router.post('/create', verifyCookie, transaction.create)
  router.get('/single', verifyCookie, transaction.single)
  router.get('/all', [verifyCookie, verifyAdmin], transaction.all)

  app.use('/api/transaction', router)
}
