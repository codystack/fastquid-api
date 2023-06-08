const crypto = require('crypto')
const db = require('../db')
const Company = db.companys
const Admin = db.admins
let customErr = new Error()

const population = [
  {
    path: 'user',
    select:
      'id status photoUrl firstName lastName phoneNumber emailAddress gender active',
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

    const company = await new Company({
      ...req.body,
    }).save()

    res.send({ message: 'New company added successfully', data: company })
  } catch (error) {
    res.status(500).send({
      message:
        error?.response?.data?.message ||
        error?.message ||
        'Some error occurred while adding company.',
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

    if (!Object.values(req.body).length) {
      customErr.message = 'Content can not be empty!'
      customErr.code = 400
      throw customErr
    }

    let body = req.body

    const update = await Company.findOneAndUpdate({ _id: req.params.id }, body, {
      useFindAndModify: false,
      new: true,
    })
    if (!update) {
      customErr.message = `Cannot update company=${body?.name}. Maybe company was not found!`
      customErr.code = 404
      throw customErr
    }
    res.send(update)
  } catch (error) {
    res.status(error?.code || 500).send({
      message: error?.message || 'Some error occurred while updating company.',
    })
  }
}

exports.delete = async (req, res) => {
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

    await Company.findByIdAndDelete(req.params.id)

    res.send({
      status: true,
      message: 'Company deleted successfully',
    })
  } catch (error) {
    res.status(error?.code || 500).send({
      message:
        error?.message || 'Some error occurred while deleting company.',
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
      page,
      limit,
    }
    const companies = await Company.paginate(query, options)

    res.send(companies)
  } catch (error) {
    res.status(500).send({
      message:
        error?.response?.data?.message ||
        error?.message ||
        'Some error occurred while creating loan.',
    })
  }
}
