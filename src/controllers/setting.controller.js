const db = require('../db')
const Setting = db.settings
const Admin = db.admins
let customErr = new Error()

module.exports.create = async (req, res) => {
  try {
    const setting = await new Setting(req.body).save()
    res.send(setting)
  } catch (error) {}
}

exports.load = async (req, res) => {
  try {
    // if (!req.decoded) {
    //   //forbidden
    //   customErr.message = 'You Are Forbidden!'
    //   customErr.code = 403
    //   throw customErr
    // }
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
    const settings = await Setting.paginate(query, options)

    res.send(settings)
  } catch (error) {
    res.status(500).send({
      message:
        error?.response?.data?.message ||
        error?.message ||
        'Some error occurred while creating loan.',
    })
  }
}

exports.update = async (req, res) => {
  try {
    console.log("CHEKISON");
    // if (!req.decoded) {
    //   //forbidden
    //   customErr.message = 'You Are Forbidden!'
    //   customErr.code = 403
    //   throw customErr
    // }

    console.log("CHEKISON@W");


    if (!Object.values(req.body).length) {
      customErr.message = 'Content can not be empty!'
      customErr.code = 400
      throw customErr
    }

    //Check admin here
    // const admin = await Admin.findOne({ emailAddress: req.decoded.userId })

    // if (!admin) {
    //   customErr.message = 'No Admin was found'
    //   customErr.code = 400
    //   throw customErr
    // }

    // if (
    //   admin.privilege.role !== 'developer' &&
    //   admin.privilege.role !== 'manager'
    // ) {
    //   customErr.message =
    //     "Sorry you don't have the privilege to perform this action!"
    //   customErr.code = 403
    //   throw customErr
    // }

    let body = req.body

    const update = await Setting.findOneAndUpdate(
      { id: req.params.id },
      body,
      {
        useFindAndModify: false,
        new: true,
      }
    )
    if (!update) {
      customErr.message = `Cannot update settings!`
      customErr.code = 404
      throw customErr
    }
    res.send(update)
  } catch (error) {
    res.status(error?.code || 500).send({
      message: error?.message || 'Some error occurred while updating settings.',
    })
  }
}
