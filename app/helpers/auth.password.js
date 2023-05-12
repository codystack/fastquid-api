const bcrypt = require('bcryptjs')

const ITERATIONS = 12

exports.hashPassword = async (password) => {
  const hash = await bcrypt.hash(password, ITERATIONS)
  return hash
}

exports.matchPassword = async (password, hash) => {
  const match = await bcrypt.compare(password, hash)
  return match
}
