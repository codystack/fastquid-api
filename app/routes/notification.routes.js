//Middleware
const notification = require('../controllers/notification.controller')
const { verifyCookie } = require('../helpers/middlewares')

module.exports = (app) => {
  const router = require('express').Router()

  // admin route
  router.post('/create', notification.create)
  router.get('/single', verifyCookie, notification.single)
  router.patch('/update-all', verifyCookie, notification.updateMany)
  //   router.get('/all', [verifyCookie, verifyAdmin], notification.all)

  app.use('/api/notification', router)
}
