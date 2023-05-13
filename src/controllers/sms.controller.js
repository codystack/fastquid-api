const sendSms = require('../helpers/sendSms')
let customErr = new Error()

exports.create = async (req, res) => {
  try {
    const { otp: code, phoneNumber: phone } = req.body

    if (!code && !phone) {
      customErr.message = 'OTP Code and PhoneNumber is required'
      customErr.code = 400
      throw customErr
    }

    const response = await sendSms(code, phone)

    res.send(response.data)
  } catch (error) {
    res.status(500).send({
      message:
        error?.response?.data?.message ||
        error?.message ||
        'Some error occurred while creating loan.',
    })
  }
}
