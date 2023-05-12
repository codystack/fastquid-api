const db = require('../db')
const User = db.users
const Notification = db.notifications

const population = [
  {
    path: 'user',
    select:
      'id status photoUrl firstName lastName phoneNumber emailAddress gender active',
  },
]

exports.create = async (req, res) => {
  try {
    const notification = await new Notification(req.body).save()
    res.send(notification)
  } catch (error) {
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

    const notification = await Notification.find({ user: user.id })
      .populate(population)
      .sort({
        createdAt: -1,
      })

    res.send(notification)
  } catch (error) {
    res.status(500).send({
      message:
        error?.response?.data?.message ||
        error?.message ||
        'Some error occurred while creating loan.',
    })
  }
}

exports.updateMany = async (req, res) => {
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
    const updatedNotification = await Notification.updateMany(
      { user: user.id, read: false },
      { $set: req.body },
      { multi: true }
    )

    res.send(updatedNotification)
  } catch (error) {
    res.status(500).send({
      message:
        error?.response?.data?.message ||
        error?.message ||
        'Some error occurred while creating loan.',
    })
  }
}
