const isDev = process.env.NODE_ENV === 'development' ? true : false
const jwt = require('jsonwebtoken')

function notFound(req, res, next) {
  res.status(404)
  const error = new Error(`🔍 - Not Found - ${isDev ? req.originalUrl : ''}`)
  next(error)
}

/* eslint-disable no-unused-vars */
function errorHandler(err, req, res, next) {
  /* eslint-enable no-unused-vars */
  // console.log('isDev', isDev)
  const statusCode = res.statusCode !== 200 ? res.statusCode : 500
  res.status(statusCode)
  res.json({
    message: err.message,
    stack: isDev ? err.stack : '🥞',
  })
}

function verifyCookie(req, res, next) {
  //check accesspro api key first process.env.ACCESSPRO_API_KEY
  const token = req.headers['authorization']?.split(' ')[1]
  // console.log('token', token)

  // decode token
  if (token) {
    // verifies secret and checks exp
    jwt.verify(token, process.env.JWT_SECRET, function (err, decoded) {
      if (err) {
        // console.log('token err: ', err)
        return res.status(401).send({
          message: 'Unauthorized access.',
        })
      }
      req.decoded = decoded
      // console.log('decoded', decoded)
      next()
    })
  } else {
    // if there is no token
    // return an error
    return res.status(403).send({
      message: 'No token provided.',
    })
  }
}

function verifyAdmin(req, res, next) {
  const secret = req.headers['secret-key']
  // verifies secret
  if (secret && secret === process.env.APP_SECRET) {
    next()
  } else {
    // return an error
    return res.status(403).send({
      message: 'You are forbidden from this application.',
    })
  }
}

module.exports = {
  notFound,
  errorHandler, 
  verifyCookie,
  verifyAdmin,
}
