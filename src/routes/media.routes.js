// const { cloudinaryConfig } = require('../helper/cloudinary')
const { localUpload } = require('../helpers/localMulter')
const media = require('../controllers/media.controller.js')
// const { multerUploads } = require('../helper/multer')
// const expressUpload = require('express-fileupload')

module.exports = (app) => {
  var router = require('express').Router()
  // media route
  //   router.post('/upload', [cloudinaryConfig, multerUploads], media.upload)
  router.post('/upload', localUpload.single('image'), media.localUpload)
  // router.get('/all', cloudinaryConfig, media.media)

  app.use('/api/media', router)
}
