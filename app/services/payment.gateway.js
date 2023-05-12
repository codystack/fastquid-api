const { default: axios } = require('axios')

const paystack = axios.create({
  baseURL: process.env.PAYSTACK_BASEURL,
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
  },
})

module.exports = paystack
