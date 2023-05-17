const crypto = require('crypto')
const db = require('../db')
const Contact = db.contacts
const User = db.users
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

    const user = await User.findOne({ emailAddress: req.decoded.userId })

    if (!user) {
      customErr.message = 'No User found'
      customErr.code = 400
      throw customErr
    }

    //create a ticket id
    const ticketId = crypto.randomBytes(4).toString('hex').toUpperCase()
    const support = await new Contact({ ...req.body, user: user.id, ticketId }).save();
    // new User().

    res.send({message: "support tiket created successfully", data: support});
  } catch (error) {
    res.status(500).send({
      message:
        error?.response?.data?.message ||
        error?.message ||
        'Some error occurred while creating loan.',
    })
  }
}
