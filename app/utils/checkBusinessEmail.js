const emailProviders = require('email-providers/all.json')
const parser = require('tld-extract')

module.exports = (email) => {
  // 2. Extract the domain
  const broken = email.split('@')
  const address = `http://${broken[broken.length - 1]}`
  const { domain } = parser(address)

  const result = emailProviders.includes(domain)

  console.log('result', result)

  // 3. And check!
  return result
}
