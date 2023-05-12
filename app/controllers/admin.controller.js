const { hashPassword, matchPassword } = require('../helpers/auth.password')
const {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshCookie,
} = require('../helpers/auth.cookies')

const db = require('../db')
const Admin = db.admins
const tokenList = {}
let customErr = new Error()

// Create admin
exports.create = async (req, res) => {
  try {
    // if (!req.decoded) {
    //   //forbidden
    //   customErr.message = 'You Are Forbidden!'
    //   customErr.code = 403
    //   throw customErr
    // }

    // Validate request
    if (!Object.values(req.body).length) {
      customErr.message = 'Content can not be empty!'
      customErr.code = 400
      throw customErr
    }

    // const admin = await Admin.findOne({ emailAddress: req.decoded.userId })

    // //VALIDATE PRIVILEGE
    // if (
    //   admin.privilege.role !== 'manager' &&
    //   admin.privilege.role !== 'developer'
    // ) {
    //   customErr.message = 'Sorry you are not privileged to perform this action!'
    //   customErr.code = 403
    //   throw customErr
    // }

    const { emailAddress, password } = req.body

    if (!emailAddress && !password) {
      customErr.message = 'provide all required fields'
      customErr.code = 400
      throw customErr
    }

    const hash = await hashPassword(password)
    // Create & Save admin in the database
    await new Admin({
      ...req.body,
      password: hash,
      photoUrl: process.env.AVATAR_ADMIN,
    }).save()

    const response = {
      status: true,
      message: 'Admin created successfully!.',
    }
    res.status(200).send(response)
  } catch (error) {
    let errors = {}
    let message = error?.message
    let errorCode

    if (!error?.code || error.code === 11000) {
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

    res.status(errorCode).json(
      message
        ? {
            message: message || 'Some error occurred while creating the User.',
          }
        : errors
    )
  }
}

// Login admin
exports.login = async (req, res) => {
  try {
    // Validate request
    if (!Object.values(req.body).length) {
      customErr.message = 'Content can not be empty!'
      customErr.code = 400
      throw customErr
    }

    const { emailAddress, password } = req.body

    if (!emailAddress && !password) {
      customErr.message = 'Email Address & Password is required'
      customErr.code = 400
      throw customErr
    }

    const admin = await Admin.findOne({ emailAddress })

    if (!admin) {
      customErr.message = 'Email Address or Password is Incorrect!'
      customErr.code = 403
      throw customErr
    }

    const matchedPassword = await matchPassword(password, admin.password)

    if (matchedPassword) {
      if (!admin.active) {
        admin.active = true
        admin.markModified('active')
        admin.save()
      }

      const accessToken = generateAccessToken(admin.emailAddress)
      const refreshToken = generateRefreshToken(admin.emailAddress)

      const response = {
        status: true,
        accessToken,
        refreshToken,
      }
      tokenList[refreshToken] = response
      res.status(200).send(response)
    } else {
      customErr.message = 'Email Address or Password is Incorrect!'
      customErr.code = 403
      throw customErr
    }
  } catch (error) {
    res.status(error?.code || 500).send({
      message: error?.message || 'Some error occurred while signing in.',
    })
  }
}

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
      customErr.message = 'You are forbidden!'
      customErr.code = 403
      throw customErr
    }

    const admin = await Admin.findOne({ emailAddress: req.decoded.userId })

    if (!admin) {
      customErr.message = 'No user found!'
      customErr.code = 404
      throw customErr
    }

    res.send(admin)

    //populate data
  } catch (error) {
    res.status(error?.code || 500).send({
      message: error?.message || 'Some error occurred while retrieving data.',
    })
  }
}

// Update Auth admin Account
exports.update = async (req, res) => {
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

    let body = req.body

    if (body.newPassword) {
      const admin = await Admin.findOne({ emailAddress: req.decoded.userId })

      const matchedPassword = await matchPassword(
        body.oldPassword,
        admin.password
      )

      if (!matchedPassword) {
        customErr.message = 'Your previous password is incorrect!'
        customErr.code = 400
        throw customErr
      }

      const hash = await hashPassword(body.newPassword)
      body = {
        password: hash,
      }
    }

    const update = await Admin.findOneAndUpdate(
      { emailAddress: req.decoded.userId },
      body,
      {
        useFindAndModify: false,
        new: true,
      }
    )
    if (!update) {
      customErr.message = `Cannot verify admin with emailAddress=${req.decoded.userId}. Maybe admin was not found!`
      customErr.code = 404
      throw customErr
    }
    res.send(update)
  } catch (error) {
    res.status(error?.code || 500).send({
      message:
        error?.message || 'Some error occurred while updating your profile.',
    })
  }
}

exports.admins = async (req, res) => {
  try {
    if (!req.decoded) {
      //forbidden
      customErr.message = 'You Are Forbidden!'
      customErr.code = 403
      throw customErr
    }

    const admin = await Admin.findOne({ emailAddress: req.decoded.userId })

    const result = await Admin.find({
      _id: { $nin: [admin.id] },
    })
      .populate(population)
      .sort({ createdAt: -1 })

    res.send(result)
  } catch (error) {
    console.log(error)
    res.status(error?.code || 500).send({
      message:
        error?.message || 'Some error occurred while updating your profile.',
    })
  }
}

exports.otherAdminUpdate = async (req, res) => {
  try {
    if (!req.decoded) {
      //forbidden
      customErr.message = 'You Are Forbidden!'
      customErr.code = 403
      throw customErr
    }

    // Validate request
    if (!Object.values(req.body).length || !req.params.id) {
      customErr.message = 'Content can not be empty!'
      customErr.code = 400
      throw customErr
    }

    const admin = await Admin.findOne({ emailAddress: req.decoded.userId })

    //VALIDATE PRIVILEGE
    if (
      admin.privilege.role !== 'manager' &&
      admin.privilege.role !== 'developer'
    ) {
      customErr.message = 'Sorry you are not privileged to perform this action!'
      customErr.code = 403
      throw customErr
    }

    const update = await Admin.findByIdAndUpdate(req.params.id, req.body, {
      useFindAndModify: false,
      new: true,
    })

    if (!update) {
      customErr.message = 'No Admin found to update!'
      customErr.code = 403
      throw customErr
    }

    res.send(update)
  } catch (error) {
    res.status(error?.code || 500).send({
      message:
        error?.message || 'Some error occurred while updating your admin.',
    })
  }
}

exports.otherAdminDelete = async (req, res) => {
  try {
    if (!req.decoded) {
      //forbidden
      customErr.message = 'You Are Forbidden!'
      customErr.code = 403
      throw customErr
    }

    const admin = await Admin.findOne({ emailAddress: req.decoded.userId })
    //VALIDATE PRIVILEGE
    if (
      admin.privilege.role !== 'manager' &&
      admin.privilege.role !== 'developer'
    ) {
      customErr.message = 'Sorry you are not privileged to perform this action!'
      customErr.code = 403
      throw customErr
    }

    await Admin.findByIdAndDelete(req.params.id)

    res.send({
      status: true,
      message: 'Admin deleted',
    })
  } catch (error) {
    res.status(error?.code || 500).send({
      message:
        error?.message || 'Some error occurred while deleting your admin.',
    })
  }
}

exports.logout = async (req, res) => {
  try {
    if (req.decoded) {
      await Admin.findOneAndUpdate(
        { emailAddress: req.decoded.userId },
        { active: false },
        {
          useFindAndModify: false,
        }
      )
    }
    res.send({ status: true })
  } catch (error) {
    res.status(500).send({
      message: error?.message || 'Some error occurred while signing out data.',
    })
  }
}
