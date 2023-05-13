const jwt = require('jsonwebtoken')

const { JWT_SECRET, TOKEN_LIFE, REFRESH_TOKEN_LIFE } = process.env

//Generate AccessToken
exports.generateAccessToken = (userId) =>
  jwt.sign({ userId }, JWT_SECRET, { expiresIn: TOKEN_LIFE })

//Generate RefreshToken
exports.generateRefreshToken = (userId) =>
  jwt.sign({ userId }, JWT_SECRET, { expiresIn: REFRESH_TOKEN_LIFE })

//Verify Token
exports.verifyRefreshCookie = (token, res) => {
  return jwt.verify(token, JWT_SECRET, function (err, decoded) {
    if (err) {
      // console.log('token err: ', err)
      return res.status(401).send({
        message: 'Unauthorized access.',
      })
    }
    return decoded
  })
}
