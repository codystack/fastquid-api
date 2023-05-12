const multer = require('multer')

//Configuration for Multer
const multerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads')
  },
  filename: (req, file, cb) => {
    // console.log('type', req.query.type)
    let path
    const ext = file.mimetype.split('/')[1]

    if (req.query.type === 'user') {
      path = `/users/${file.originalname.replace(
        `.${ext}`,
        ''
      )}-${Date.now()}.${ext}`
    } else {
      path = `/${file.originalname.replace(`.${ext}`, '')}-${Date.now()}.${ext}`
    }
    cb(null, path)
  },
})

// Multer Filter
const multerFilter = (req, file, cb) => {
  if (
    file.mimetype === 'image/jpeg' ||
    file.mimetype === 'image/jpg' ||
    file.mimetype === 'image/png'
  ) {
    cb(null, true)
  } else {
    //reject file
    cb({ message: 'Unsupported file format' }, false)
  }
}

//Calling the "multer" Function
const localUpload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
})

module.exports = { localUpload }
