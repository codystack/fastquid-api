const { startOfDay, endOfDay, isBefore } = require('date-fns')
const paystack = require('../services/payment.gateway')
const db = require('../db')
const messages = require('../helpers/messages')
const getPercentage = require('../utils/getPercentage')
const ObjectId = require('mongoose')

const Transaction = db.transactions
const User = db.users
const Loan = db.loans
const LoanRequest = db.requests
const DebitCard = db.debitCards
const Notification = db.notifications
let customErr = new Error()

const population = [
  {
    path: 'user',
    select:
      'id status photoUrl firstName lastName phoneNumber emailAddress gender active',
  },
]

const createTransaction = async (user, response, type, message, status) => {
  await new Transaction({
    user: user.id,
    type: type,
    domain: response?.data.data?.domain,
    status,
    reference: response?.data.data?.reference,
    amount: response?.data.data?.amount,
    message,
    gateway_response: response?.data.data?.gateway_response,
    channel: response?.data.data?.channel,
    currency: response?.data.data?.currency,
    ip_address: response?.data.data?.ip_address,
  }).save()
}

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

    let debitCard
    let responsePayload
    //validate bank from flutterwave
    const response = await paystack.get(
      `transaction/verify/${req.body.reference}`
    )
    if (response?.data?.status) {
      const { authorization, reference, amount } = response?.data.data

      if (reference.toLowerCase().includes('loan_repayment')) {
        // const currentLoan = await Loan.findOne({ user: user.id })
        // create loan history
        const loan = await Loan.findOneAndUpdate(
          { user: user.id },
          { status: 'settled', amountBorrowed: 0, totalAmountDue: 0 },
          {
            new: true,
          }
        )
        await LoanRequest.findOneAndUpdate(
          { user: user.id },
          { status: 'settled', paymentDate: new Date().toISOString() }
        )

        // INCREASE LOAN LEVEL
        if (loan.type === 'personal loan') {
          // check if loan was paid on time
          const isValidDueDate = isBefore(new Date(loan.dueDate), new Date())
          if (!isValidDueDate) {
            const inCrementAmount = getPercentage(
              parseInt(
                process.env.DEFAULT_PERSONAL_LOAN_AMOUNT_PERCENTAGE_ADDED
              ),
              user.loanLevelAmount
            )
            user.loanLevelAmount = inCrementAmount + user.loanLevelAmount
            user.markModified('loanLevelAmount')
            user.save()
          }
        }

        createTransaction(user, response, 'loan', 'Loan Settled', 'settled')
        //format amount
        await new Notification({
          ...messages({ amount: parseInt(amount) / 100 }).loanFullPayment,
          user: user.id,
          userRefType: 'User',
        }).save()

        responsePayload = loan
      } else {
        //for now later check for credit loan
        const currentDebitCard = await DebitCard.findOne({ user: user.id })

        if (currentDebitCard) {
          debitCard = await DebitCard.findOneAndUpdate(
            { user: user.id },
            authorization,
            {
              new: true,
            }
          )
        } else {
          debitCard = await new DebitCard({
            user: user.id,
            ...authorization,
          }).save()

          //update user bank
          user.debitCard = debitCard._id
          user.markModified('debitCard')
          user.save()
        }

        createTransaction(
          user,
          response,
          'account',
          'Linked DebitCard',
          'success'
        )

        responsePayload = debitCard
      }
    }

    res.send(responsePayload)
  } catch (error) {
    console.log('transaction-error', error?.response)
    res.status(500).send({
      message:
        error?.response?.data?.message ||
        error?.message ||
        'Some error occurred while creating loan.',
    })
  }
}

exports.single = async (req, res) => {
  try {
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

    console.log('TRANSACTION > ', user.id)

    // const query = { user: new ObjectId(user.id) };
    // const query = { user: { $eq: new ObjectId(user.id) } };
    // const result = await Transaction.find(query).toArray();

    // console.log('TRANSACTION DATA ', result)

    const transaction = await Transaction.find({ user: user.id })
      .populate(population)
      .sort({
        createdAt: -1,
      })

    res.send(transaction)
  } catch (error) {
    res.status(500).send({
      message:
        error?.response?.data?.message ||
        error?.message ||
        'Some error occurred while creating loan.',
    })
  }
}

exports.all = async (req, res) => {
  try {
    if (!req.decoded) {
      //forbidden
      customErr.message = 'You Are Forbidden!'
      customErr.code = 403
      throw customErr
    }
    let query
    const { page = 1, range, limit = process.env.DEFAULT_LIMIT } = req.query

    if (range === 'recent') {
      query = {
        createdAt: {
          $gte: startOfDay(new Date()),
          $lte: endOfDay(new Date()),
        },
      }
    } else {
      query = {}
    }

    const options = {
      sort: { createdAt: -1 },
      populate: population,
      page,
      limit,
    }
    const transactions = await Transaction.paginate(query, options)

    res.send(transactions)
  } catch (error) {
    res.status(500).send({
      message:
        error?.response?.data?.message ||
        error?.message ||
        'Some error occurred while fetching loan.',
    })
  }
}
