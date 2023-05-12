const db = require('../db')
const paystack = require('../services/payment.gateway')
const Bank = db.banks
const User = db.users
let customErr = new Error()

const population = [
  {
    path: 'user',
    select:
      'id status passport firstName lastName phoneNumber emailAddress gender active',
  },
]

exports.create = async (req, res) => {
  try {
    if (!Object.values(req.body).length) {
      customErr.message = 'Content can not be empty!'
      customErr.code = 400
      throw customErr
    }
    if (!req.decoded) {
      //forbidden
      customErr.message = 'You Are Forbidden!'
      customErr.code = 403
      throw customErr
    }

    const user = await User.findOne({ emailAddress: req.decoded.userId })

    if (!user) {
      customErr.message = 'No User found'
      customErr.code = 400
      throw customErr
    }

    //validate bank from flutterwave
    const response = await paystack.get(
      `/bank/resolve?account_number=${req.body.accountNumber}&bank_code=${req.body.bankCode}`
    )
    let bank
    const payload = {
      accountName: response?.data.data.account_name,
      accountNumber: response?.data.data.account_number,
      bankName: req.body.bankName,
      bankCode: response?.data.bankCode,
    }
    const currentBank = await Bank.findOne({ user: user.id })

    if (currentBank) {
      bank = await Bank.findOneAndUpdate({ user: user.id }, payload, {
        new: true,
      })
    } else {
      bank = await new Bank({
        user: user.id,
        ...payload,
      }).save()

      user.bank = bank._id
      user.markModified('bank')
      user.save()
    }

    res.send(bank)
  } catch (error) {
    res.status(500).send({
      message:
        error?.response?.data?.message ||
        error?.message ||
        'Some error occurred while adding bank.',
    })
  }
}

exports.resolve = async (req, res) => {
  try {
    if (!req.decoded) {
      //forbidden
      customErr.message = 'You Are Forbidden!'
      customErr.code = 403
      throw customErr
    }
    if (!Object.values(req.body).length) {
      customErr.message = 'Content can not be empty!'
      customErr.code = 400
      throw customErr
    }

    //validate bank from flutterwave
    const response = await paystack.get(
      `/bank/resolve?account_number=${req.body.accountNumber}&bank_code=${req.body.bankCode}`
    )
    if (!response.data?.status) {
      customErr.message = response.data?.message
      customErr.code = 400
      throw customErr
    }
    res.send(response.data)
  } catch (error) {
    // console.log(error)
    res.status(500).send({
      message:
        error?.response?.data?.message ||
        error?.message ||
        'Some error occurred while fetching an banks!.',
    })
  }
}

exports.listBanks = async (_, res) => {
  try {
    let banks = []
    const response = await paystack.get('/bank')
    if (response.status === 200) {
      banks = response.data.data
    }
    res.send(banks)
  } catch (error) {
    res.status(500).send({
      message:
        error?.response?.data?.message ||
        error?.message ||
        'Some error occurred while fetching an banks!.',
    })
  }
}

exports.banks = async (req, res) => {
  try {
    if (!req.decoded) {
      //forbidden
      customErr.message = 'You Are Forbidden!'
      customErr.code = 403
      throw customErr
    }
    const banks = await Bank.find({})
      .populate(population)
      .sort({ createdAt: -1 })

    res.send(banks)
  } catch (error) {
    res.status(500).send({
      message:
        error?.message || 'Some error occurred while fetching an banks!.',
    })
  }
}
