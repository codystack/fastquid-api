//Middleware
const { verifyCookie, verifyAdmin } = require('../helpers/middlewares')
const admin = require('../controllers/admin.controller')
const loan = require('../controllers/loan.controller')
const transaction = require('../controllers/transaction.controller')
const setting = require('../controllers/setting.controller')

module.exports = (app) => {
  const router = require('express').Router()

  // admin route
  router.post('/create', [verifyAdmin], admin.create)
  router.post('/login', verifyAdmin, admin.login)
  router.post('/token', admin.token)
  router.get('/profile', [verifyAdmin, verifyCookie], admin.profile)
  router.patch('/profile', [verifyAdmin, verifyCookie], admin.update)
  router.patch('/logout', verifyCookie, admin.logout)
  router.get('/all', [verifyAdmin, verifyCookie], admin.admins)
  router.patch(
    '/update/:id',
    [verifyAdmin, verifyCookie],
    admin.otherAdminUpdate
  )

  router.delete(
    '/delete/:id',
    [verifyAdmin, verifyCookie],
    admin.otherAdminDelete
  )

  router.patch('/loan/update', [verifyCookie, verifyAdmin], loan.update)
  router.get('/loan/all', [verifyCookie, verifyAdmin], loan.all)
  router.get('/transaction/all', [verifyCookie, verifyAdmin], transaction.all)
  router.post('/setting/create', setting.create)

  app.use('/api/admin', router)
}