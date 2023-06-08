//Middleware
const company = require('../controllers/company.controller')
const { verifyCookie, verifyAdmin } = require('../helpers/middlewares')

module.exports = (app) => {
  const router = require('express').Router()

  // admin route
  router.post('/create', verifyCookie, company.create)
  router.get('/all', verifyCookie, company.all)
  router.patch('/update/:id', verifyCookie, company.update)
  router.delete('/delete/:id', [verifyAdmin, verifyCookie], company.delete)

  app.use('/api/company', router)
}
