const isBefore = require('date-fns/isBefore')
const { hashPassword, matchPassword } = require('../helpers/auth.password')
const {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshCookie,
} = require('../helpers/auth.cookies')
const db = require('../db')
const authGenerateOTP = require('../helpers/auth.generateOTP')
const addMinuteToDate = require('../helpers/addMinuteToDate')
const messages = require('../helpers/messages')
const checkBusinessEmail = require('../utils/checkBusinessEmail')
const sendSms = require('../helpers/sendSms')
const sendEmail = require('../helpers/sendEmail')
const User = db.users
const Otp = db.otps
const Notification = db.notifications
const tokenList = {}
let customErr = new Error()

const population = [
  {
    path: 'loan',
    model: 'Loan',
  },
  {
    path: 'bank',
    model: 'Bank',
  },
  {
    path: 'work',
    model: 'Work',
  },
  {
    path: 'debitCard',
    model: 'DebitCard',
  },
]

module.exports.create = async (req, res) => {
  // Object.values()
  let { body: bd } = req
  console.log('CHECKING :: ', Object.values(bd).length)

  try {
    if (!Object.values(bd)?.length) {
      customErr.message = 'Body Or Params can not be empty!'
      customErr.code = 400
      throw customErr
    }
    const userId = req.body.emailAddress
    const hash = await hashPassword(req.body.password)

    const genderAvatar =
      req.body.gender === 'male'
        ? process.env.AVATAR_MALE
        : process.env.AVATAR_FEMALE

    const payload = {
      ...req.body,
      password: hash,
      photoUrl: genderAvatar,
    }

    // CREATE USER
    const user = await new User(payload).save()

    const accessToken = generateAccessToken(userId)
    const refreshToken = generateRefreshToken(userId)

    const generatedOtp = authGenerateOTP()
    const now = new Date()
    const expiration_time = addMinuteToDate(now, 10)

    const otp = await new Otp({
      user: user.id,
      otp: parseInt(generatedOtp),
      expiration_time,
    }).save()

    console.log('>>> LAES', otp)

    // send OTP HERE
    await sendSms(otp.otp, req.body.emailAddress)
      .then((re) =>
        console.log('SUCCESS::: >> ', `${re.response} - ${re.data}`)
      )
      .catch((err) => console.log('ERROR :: >>> ', err))

    console.log('OTP ->', otp)

    const response = {
      status: true,
      message: 'Account Created Successfully.',
      accessToken,
      refreshToken,
    }

    tokenList[refreshToken] = response
    res.send(response)
  } catch (error) {
    let errors = {}
    let message = error?.message
    let errorCode

    console.log('ERROR ', errors)

    if (!error.code === 11000) {
      errorCode = 500
    } else {
      errorCode = error.code
    }

    if (error.code === 11000) {
      message = `An account has already been created with this ${
        Object.values(error?.keyValue)[0]
      } ${Object.keys(error?.keyValue)[0]}`
    } else {
      if (error?.errors) {
        Object.keys(error.errors).forEach((key) => {
          errors[key] = error.errors[key].message
        })
      }
    }

    res.status(500).json(
      message
        ? {
            message: message || 'Some error occurred while creating the User.',
          }
        : errors
    )
  }
}

// Login user
exports.login = async (req, res) => {
  try {
    // Validate request
    if (!Object.values(req.body).length) {
      customErr.message = 'Body Or Params can not be empty!'
      customErr.code = 400
      throw customErr
    }

    const { emailAddress, password, device } = req.body

    const user = await User.findOne({ emailAddress })

    if (!user) {
      customErr.message = 'Email Address or Password is Incorrect!'
      customErr.code = 403
      throw customErr
    }
    const matchedPassword = await matchPassword(password, user.password)

    if (!matchedPassword) {
      customErr.message = 'Email Address or Password is Incorrect!'
      customErr.code = 403
      throw customErr
    }

    if (!user.active) {
      user.active = true
      user.markModified('active')
      user.save()
    }

    const accessToken = generateAccessToken(user.emailAddress)
    const refreshToken = generateRefreshToken(user.emailAddress)

    await sendEmail(1234)

    let response = {
      status: true,
      message: 'Login success',
      accessToken,
      refreshToken,
    }

    if (device) {
      if (user.device.id !== device.id) {
        response['oldDevice'] = user.device
        user.device = device
        user.markModified('device')
        user.save()

        await new Notification({
          ...messages({ deviceName: device?.model }).deviceChanged,
          user: user.id,
          userRefType: 'User',
        }).save()
      }
    }

    tokenList[refreshToken] = response
    res.send(response)
  } catch (error) {
    // console.log('auth', err)
    res.status(500).send({
      message: error?.message || 'Some error occurred while signing in.',
    })
  }
}

//TOKEN

exports.token = async (req, res) => {
  // refresh the damn token
  const postData = req.body
  // if refresh token exists
  if (postData.refreshToken && postData.refreshToken in tokenList) {
    const decoded = verifyRefreshCookie(postData.refreshToken, res) //verifies refresh token
    if (decoded) {
      const accessToken = generateAccessToken(decoded.userId)
      const response = {
        accessToken,
      }
      // update the token in the list
      tokenList[postData.refreshToken].accessToken = accessToken
      res.status(200).json(response)
    }
  } else {
    res.status(400).send({ message: 'Invalid request' })
  }
}

// get self profile
exports.profile = async (req, res) => {
  try {
    if (!req.decoded) {
      //forbidden
      customErr.message = 'You Are Forbidden!'
      customErr.code = 403
      throw customErr
    }

    const user = await User.findOne({
      emailAddress: req.decoded.userId,
    }).populate(population)

    if (!user) {
      customErr.message = 'User not found!'
      customErr.code = 404
      throw customErr
    }

    res.send(user)
  } catch (error) {
    res.status(500).send({
      message: error?.message || 'Some error occurred while retrieving data.',
    })
  }
}

// Update Auth User Account
exports.update = async (req, res) => {
  try {
    if (!req.decoded) {
      //forbidden
      customErr.message = 'You Are Forbidden!'
      customErr.code = 403
      throw customErr
    }
    let payload = req.body

    const user = await User.findOne({ emailAddress: req.decoded.userId })

    if ('newPassword' in payload) {
      //check if current password matches
      const matchedPassword = await matchPassword(
        payload.oldPassword,
        user.password
      )
      if (!matchedPassword) {
        customErr.message =
          'The password you entered does not match your current password!'
        customErr.code = 400
        throw customErr
      }
      //change password
      const hash = await hashPassword(payload.newPassword)
      payload = {
        password: hash,
      }
    }

    const updated = await User.findOneAndUpdate(
      { emailAddress: req.decoded.userId },
      payload,
      {
        new: true,
      }
    )

    if (!updated) {
      customErr.message = `Cannot update User with this email (${req.decoded.userId})!`
      customErr.code = 404
      throw customErr
    }
    if ('newPassword' in payload) {
      await new Notification({
        ...messages({}).passwordChanged,
        image: updated.photoUrl,
        user: updated._id,
        userRefType: 'User',
      }).save()
    }
    res.send(updated)
  } catch (error) {
    console.log('error', error)
    res.status(500).send({
      message:
        error?.message || 'Some error occurred while updating your profile.',
    })
  }
}

//SEND OTP
exports.sendOtp = async (req, res) => {
  try {
    if (!Object.values(req.body).length) {
      customErr.message = 'Email Address is required!'
      customErr.code = 400
      throw customErr
    }

    const user = await User.findOne({ emailAddress: req.body?.emailAddress })

    if (!user) {
      customErr.message = `No user found with this email (${req.body.emailAddress})`
      customErr.code = 404
      throw customErr
    }

    if (req.body?.companyEmailAddress) {
      //send to work email
      if (checkBusinessEmail(req.body.companyEmailAddress)) {
        customErr.message = 'Please provide a valid business email address'
        customErr.code = 400
        throw customErr
      }
    }

    const generatedOtp = authGenerateOTP()
    const now = new Date()
    const expiration_time = addMinuteToDate(now, 10)

    const otp = await new Otp({
      user: user.id,
      otp: parseInt(generatedOtp),
      expiration_time,
    }).save()

    console.info('Sent OTP: ', otp)
    if (req.body?.companyEmailAddress) {
      await sendSms(
        otp.otp,
        req.body.companyEmailAddress,
        user.firstName,
        'work'
      )
      await sendEmail(otp.otp)
      res.send({
        status: true,
        message: `'OTP sent to ${req.body.companyEmailAddress}.`,
      })
    } else {
      await sendSms(otp.otp, req.body.emailAddress, user.firstName, 'personal')

      //send OTP HERE

      res.send({
        status: true,
        message: 'OTP sent.',
      })
    }
  } catch (error) {
    res.status(500).send({
      message:
        error.message || 'Some error occurred while verifying your account.',
    })
  }
}

//validate user account
exports.verifyOtp = async (req, res) => {
  try {
    if (!Object.values(req.body).length) {
      customErr.message = 'Email address is required!'
      customErr.code = 400
      throw customErr
    }
    const { otp: requestOtp } = req.body

    const user = await User.findOne({ emailAddress: req.body.emailAddress })

    if (!user) {
      customErr.message = `No user found with this email (${req.body.emailAddress})`
      customErr.code = 404
      throw customErr
    }

    const userOtp = await Otp.findOne({ user: user.id }).sort({ createdAt: -1 })

    if (!userOtp) {
      customErr.message = 'No OTP found! try sending another'
      customErr.code = 400
      throw customErr
    }

    let validateOtp = isBefore(new Date(userOtp.expiration_time), new Date())

    if (validateOtp) {
      await Otp.deleteMany({ user: user.id })
      customErr.message = 'Sorry this OTP has expired! Try sending another'
      customErr.code = 400
      throw customErr
    }

    if (parseInt(requestOtp) !== parseInt(userOtp.otp)) {
      customErr.message = 'Wrong OTP code!'
      customErr.code = 400
      throw customErr
    }

    if (req.body?.companyEmailAddress) {
      //update work email

      await new Notification({
        ...messages({}).companyEmailVerified,
        user: user.id,
        userRefType: 'User',
      }).save()
    } else {
      if (!user.isEmailVerified) {
        user.isEmailVerified = true
        user.markModified('isEmailVerified')
        user.save()
        //DELETE OTP AFTER VERIFIED
        userOtp.remove()
      }
      await new Notification({
        ...messages({}).emailVerified,
        user: user.id,
        userRefType: 'User',
      }).save()
    }

    res.send({
      status: true,
      message: 'Email Address is verified successfully!',
      user: user.id,
    })
  } catch (error) {
    res.status(500).send({
      message:
        error.message || 'Some error occurred while verifying your account.',
    })
  }
}

//reset password
exports.resetPassword = async (req, res) => {
  try {
    if (!Object.values(req.body).length) {
      customErr.message = 'Email Address is required!'
      customErr.code = 400
      throw customErr
    }

    const user = await User.findOne({ emailAddress: req.body.emailAddress })

    if (!user) {
      customErr.message = `No User was found retry the forgotten password process again!`
      customErr.code = 404
      throw customErr
    }

    const hash = await hashPassword(req.body.password)

    user.password = hash
    user.markModified('password')
    user.save()

    res.send({
      status: true,
      message: 'Password reset was successful!',
    })
  } catch (error) {
    res.status(500).send({
      message:
        error.message || 'Some error occurred while verifying your account.',
    })
  }
}

// Logout a user
exports.logout = async (req, res) => {
  // Validate request
  if (!req.decoded) {
    //forbidden
    customErr.message = 'You Are Forbidden!'
    customErr.code = 403
    throw customErr
  }
  try {
    const user = await User.findOne({ emailAddress: req.decoded.userId })
    if (!user) {
      customErr.message = 'No user found!'
      customErr.code = 404
      throw customErr
    }
    if (user.active) {
      user.active = false
      user.markModified('active')
      user.save()
    }
    res.send({ success: true })
  } catch (error) {
    res.status(500).send({
      message: error.message || 'Some error occurred while logging out.',
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
    const loans = await User.paginate(query, options)

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
