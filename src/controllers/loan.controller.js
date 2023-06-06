const { startOfDay, endOfDay } = require('date-fns')
//DB COLLECTIONS
const db = require('../db')
const messages = require('../helpers/messages')
const getPercentage = require('../utils/getPercentage')
const axios = require('axios')
const { v4 } = require('uuid')
const Admin = db.admins
const User = db.users
const Loan = db.loans
const LoanRequest = db.requests
const Bank = db.banks
const Work = db.works
const Notification = db.notifications
const Transaction = db.transactions
const Setting = db.settings

let customErr = new Error()

const axiosInstance = axios.create({
  baseURL: process.env.PAYSTACK_BASEURL,
  timeout: 10000,
  headers: {
    Authorization: 'Bearer ' + process.env.PAYSTACK_SECRET_KEY,
    'Content-Type': 'application/json',
  },
})

const population = [
  {
    path: 'user',
    select:
      'id status photoUrl firstName lastName phoneNumber emailAddress gender active accountStatus',
  },
]

const population2 = [
  {
    path: 'user',
    select:
      'id status photoUrl firstName lastName phoneNumber emailAddress gender active bank accountStatus',
    populate: {
      path: 'bank',
    },
  },
]

const userPopulation = [
  {
    path: 'loan',
    model: 'Loan',
  },
  {
    path: 'bank',
    model: 'Bank',
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

    let loan
    const payload = {
      ...req.body,
      status: 'pending',
      amountBorrowed: req.body.amount,
    }

    const activeLoan = await Loan.findOne({ user: user.id })

    if (activeLoan) {
      // check if activeloan is settled
      if (activeLoan.status !== 'settled') {
        customErr.message =
          'Kindly repay your active loan before you can request another'
        customErr.code = 400
        throw customErr
      }
      //update bank
      loan = await Loan.findOneAndUpdate({ user: user.id }, payload, {
        new: true,
      })
    } else {
      loan = await new Loan({ user: user.id, ...payload }).save()

      user.loan = loan._id
      user.markModified('loan')
      user.save()
    }
    const lreq = await LoanRequest.findOneAndUpdate(
      { user: user.id },
      { amountIssued: req.body.amountBorrowed }
    )

    console.log('Loan Create PAYLOAD >> ', payload)
    //Also save to transaction here

    const currentLoan = await Loan.findOne({ _id: loan._id }).populate(
      population
    )

    res.send(currentLoan)
  } catch (error) {
    // console.log('create-loan-error', error)
    res.status(500).send({
      message:
        error?.response?.data?.message ||
        error?.message ||
        'Some error occurred while creating loan.',
    })
  }
} 

exports.request = async (req, res) => {
  try {
    if (!req.decoded) {
      //forbidden
      customErr.message = 'You Are Forbidden!'
      customErr.code = 403
      throw customErr
    }

    let bank
    let work

    const user = await User.findOne({ emailAddress: req.decoded.userId })

    if (!user) {
      customErr.message = 'No User found'
      customErr.code = 400
      throw customErr
    }

    const userPayload = {
      bvn: req.body.bvn,
      maritalStatus: req.body.maritalStatus,
      education: req.body.education,
      children: req.body.children,
      location: {
        address: req.body.address,
        city: req.body.city,
        state: req.body.state,
      },
    }
    const bankPayload = {
      accountName: req.body.accountName,
      accountNumber: req.body.accountNumber,
      bankCode: req.body.bankCode,
      bankName: req.body.bankName,
    }
    const workPayload = {
      employmentStatus: req.body.employmentStatus,
      companyName: req.body.companyName,
      companyLocation: req.body.companyLocation,
      companyPhoneNumber: req.body.companyPhoneNumber,
      companyEmailAddress: req.body.companyEmailAddress,
      isCompanyEmailVerified: req.body.isCompanyEmailVerified,
      jobTitle: req.body.jobTitle,
      monthlyIncome: req.body.monthlyIncome,
      payDay: req.body.payDay,
    }
    //Update user profile
    await User.findOneAndUpdate(
      { emailAddress: req.decoded.userId },
      userPayload,
      {
        new: true,
      }
    )

    //check is account already created
    const currentBank = await Bank.findOne({ user: user.id })

    if (req.body.type === 'pay day loan') {
      const currentWork = await Work.findOne({ user: user.id })

      if (currentWork) {
        //update work
        await Work.findOneAndUpdate({ user: user.id }, workPayload, {
          new: true,
        })
      } else {
        work = await new Work({
          user: user.id,
          ...workPayload,
        }).save()
        //update user  work
        user.work = work._id
        user.markModified('work')
      }
    }

    if (currentBank) {
      //update bank
      await Bank.findOneAndUpdate({ user: user.id }, bankPayload, {
        new: true,
      })
    } else {
      bank = await new Bank({
        user: user.id,
        ...bankPayload,
      }).save()
      //update user  bank
      user.bank = bank._id
      user.markModified('bank')
    }

    user.save()

    const currentLoanRequest = await Loan.findOne({ user: user.id })

    if (currentLoanRequest) {
      if (currentLoanRequest?.status !== 'settled') {
        customErr.message = `You have an active loan that's not settled yet!`
        customErr.code = 403
        throw customErr
      }
    }

    const loanRequest = await new LoanRequest({
      user: user.id,
      type: req.body.type,
      duration: req.body.duration,
      amount: req.body.amount,
      reason: req.body.reason,
    }).save()

    await new Notification({
      ...messages().loanRequest,
      user: user.id,
      userRefType: 'User',
    }).save()

    res.send(loanRequest)
  } catch (error) {
    console.log('request-loan-error', error)

    res.status(500).send({
      message:
        error?.response?.data?.message ||
        error?.message ||
        'Some error occurred while fetching loan.',
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
    const loan = await Loan.find({ user: user.id })
      .populate(population)
      .sort({ createdAt: -1 })

    res.send(loan)
  } catch (error) {
    res.status(500).send({
      message:
        error?.response?.data?.message ||
        error?.message ||
        'Some error occurred while fetching loan.',
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
      populate: population2,
      page,
      limit,
    }

    const loans = await Loan.paginate(query, options)

    res.send(loans)
  } catch (error) {
    res.status(500).send({
      message:
        error?.response?.data?.message ||
        error?.message ||
        'Some error occurred while fetching loan.',
    })
  }
}

exports.update = async (req, res) => {
  try {
    if (!req.decoded) {
      //forbidden
      customErr.message = 'You Are Forbidden!'
      customErr.code = 403
      throw customErr
    }

    console.log('CHECK1')
    //Check admin here
    const admin = await Admin.findOne({ emailAddress: req.decoded.userId })

    if (!admin) {
      customErr.message = 'No Admin was found'
      customErr.code = 400
      throw customErr
    }

    console.log('CHECK2')

    if (
      admin.privilege.role !== 'developer' &&
      admin.privilege.role !== 'manager'
    ) {
      customErr.message =
        "Sorry you don't have the privilege to perform this action!"
      customErr.code = 403
      throw customErr
    }

    console.log('CHECK3')

    const { action } = req.query
    const { user } = req.body

    // find user
    const userAccount = await User.findById(user).populate(userPopulation)

    if (!userAccount) {
      customErr.message = 'No User found'
      customErr.code = 400
      throw customErr
    }

    console.log('CHECK4')

    let amount = userAccount.loan.amountBorrowed
    if (action === 'grant-loan') {
      //credit user (TRANSFER AMOUNT)
      //create transaction
      await new Transaction({
        user: userAccount.id,
        type: 'loan',
        amount: amount * 100,
        currency: 'NGN',
        status: 'credited',
        reference: 'CREDIT_DG4uishudoq90LD',
        domain: 'test',
        gateway_response: 'Successful',
        message: 'Loan Credited',
        channel: 'bank',
        ip_address: '41.1.25.1',
      }).save()

      await new Notification({
        ...messages({
          amount,
          firstName: userAccount?.firstName,
          dueDate: userAccount?.loan?.dueDate,
        }).loanApproved,
        user: userAccount.id,
        userRefType: 'User',
      }).save()

      await new Notification({
        ...messages({
          amount,
          firstName: userAccount?.firstName,
          bankName: userAccount?.bank?.bankName,
          accountName: userAccount?.bank?.accountName,
        }).loanReceived,
        user: userAccount.id,
        userRefType: 'User',
      }).save()
    }
    if (action === 'deny-loan') {
      await new Notification({
        ...messages({
          firstName: userAccount?.firstName,
        }).loanDeclined,
        user: userAccount.id,
        userRefType: 'User',
      }).save()
    }

    const updated = await Loan.findOneAndUpdate({ user }, req.body, {
      new: true,
    })

    LoanRequest.findOneAndUpdate({ user }, req.body, {
      new: true,
    })

    res.send(updated)
  } catch (error) {
    res.status(500).send({
      message:
        error?.response?.data?.message ||
        error?.message ||
        'Some error occurred while fetching loan.',
    })
  }
}

exports.checkEligibility = async (req, res) => {
  try {
    if (!Object.values(req.body).length) {
      customErr.message = 'Loan Duration & Loan Type are required!'
      customErr.code = 400
      throw customErr
    }
    if (!req.decoded) {
      //forbidden
      customErr.message = 'You Are Forbidden!'
      customErr.code = 403
      throw customErr
    }

    const setting = await Setting.findOne({}, {}).sort({ createdAt: -1 })
    const user = await User.findOne({ emailAddress: req.decoded.userId })

    if (!user) {
      customErr.message = 'No User found'
      customErr.code = 400
      throw customErr
    }

    const { duration, type, monthlyIncome } = req.body

    let dueDate
    let amount
    let interest
    const date = new Date()

    if (duration === '1 month') {
      dueDate = date.setMonth(date.getMonth() + 1)
    } else if (duration === '2 month') {
      dueDate = date.setMonth(date.getMonth() + 2)
    } else {
      dueDate = date.setMonth(date.getMonth() + 3)
    }

    if (type === 'personal loan') {
      amount = parseInt(user?.loanLevelAmount)
      interest = parseFloat(setting.paydayLoanInterest)
    } else {
      amount = getPercentage(
        setting.paydayLoanAmountPercentage,
        parseInt(monthlyIncome)
      )
      interest = parseFloat(setting.personalLoanInterest)
    }

    const interestAmount = getPercentage(interest, amount)
    const totalAmountDue = amount + interestAmount

    res.send({
      type,
      amount,
      duration,
      dueDate: new Date(dueDate).toISOString(),
      totalAmountDue,
      interestAmount,
      interest,
    })
  } catch (error) {
    res.status(500).send({
      message:
        error?.response?.data?.message ||
        error?.message ||
        'Some error occurred while fetching loan.',
    })
  }
}

exports.disburseLoan = async (req, res) => {
  try {
    const { loan, userId } = req.body

    const user = User.findOne({ _id: userId })

    if (!user) {
      return res.status(404).json({ message: 'User is not found' })
    }
    //Create transfer recipient
    const params = {
      type: 'nuban',
      name: loan?.user?.fullName,
      account_number: loan?.user?.bank?.accountNumber,
      bank_code: loan?.user?.bank?.bankCode,
      currency: 'NGN',
    }

    axiosInstance
      .post('/transferrecipient', params, {})
      .then(function (response) {
        // return res.status(200).json({ message: `${response?.data?.message}`, data: response?.data })

        //receipient code from response (response.data?.data?.recipient_code)  = RCP_vqakn8j8lvfrgfm

        // Now make another trip (Generate a transfer reference)
        const params2 = {
          source: 'balance',
          amount: loan?.amountBorrowed * 100,
          reference: loan?.user?._id + '_' + v4(),
          recipient: response.data?.data?.recipient_code,
          reason:
            'Loan disbursement to ' + loan?.user?.fullName + "'s bank account",
        }

        axiosInstance
          .post('/transfer', params2, {})
          .then(async (resl) => {
            console.log('FINAL TRANSFER ', resl)
            //Create transasction here
            try {
              const transact = await new Transaction({
                user: loan?.user?._id,
                type: 'loan',
                domain: resl?.data?.data?.domain,
                status: 'success',
                reference: resl?.data?.data?.reference,
                amount: resl?.data?.data?.amount,
                message: resl?.data?.data?.reason,
                gateway_response: resl?.data?.message,
                channel: 'loan',
                currency: resl?.data?.data?.currency,
                ip_address: '',
                transfer_code: resl?.data?.data?.transfer_code,
              }).save()

              //Now update loan
              // await Loan.fin({_id: loan?._id})
              await Loan.findByIdAndUpdate(
                loan?.id,
                {
                  $set: { status: 'credited' },
                },
                { new: true }
              )

              res.status(200).json({
                message:
                  'You have successfully credited ' + loan?.user?.fullName,
              })
            } catch (error) {
              console.log('TRANS ERROR', error)
              return res.status(500).json({ message: 'Failed', data: error })
            }
          })
          .catch(function (err) {
            console.log('TRANSFER ERROR', err)
            return res.status(500).json({ message: 'Failed', data: err })
          })
      })
      .catch(function (error) {
        console.log('TRANS RECEIPIENT ERROR', error)
        return res.status(500).json({ message: 'Failed', data: error })
      })
  } catch (error) {
    console.log('TRANS RECEIPIENT ERROR OUTER', error)
    return res.status(500).json({ message: 'Failed Outer', data: error })
  }
}
