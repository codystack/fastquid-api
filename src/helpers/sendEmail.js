const { default: axios } = require('axios')
// const nodemailer = require('nodemailer')
// const verifyemailTemp = require('../templates/verifyemail')

// const Termii = require('req')
// const termiiInstance = Termii()
// var request = require('request')

const instance = axios.create({
  baseURL: 'https://api.ng.termii.com',
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
})

// const API_KEY = process.env.TERMII_API_KEY

// termiiInstance.setApi(process.env.TERMII_API_KEY)
//Send SMS
// termiiInstance.send_sms('234THE_TARGET_NUMBER','Your message','SENDER_ID').

// const instance = axios.create({
//   headers: {'X-Custom-Header': 'foobar'}
// });

// const termii = new Termii('TLY2OAr9Rb0MZlNAsjZymMl9t5mS7ZvCDfeg7W9loRcSYz8xwBlJlXRpawf23g', 'FastQuid');

module.exports = async (code) => {
  var data = {
    api_key: 'TLY2OAr9Rb0MZlNAsjZymMl9t5mS7ZvCDfeg7W9loRcSYz8xwBlJlXRpawf23g',
    message_type: 'NUMERIC',
    to: '2348093869330',
    from: 'FastQuid',
    channel: 'dnd',
    pin_attempts: 10,
    pin_time_to_live: 10,
    pin_length: 4,
    pin_placeholder: 'The pin ',
    message_text: `Your otp code is ${code}`,
    pin_type: 'NUMERIC',
  }

  //   return await termii.sendSMS('2348093869330', `Your otp code is ${code}`);

  //   var options = {
  //     method: 'POST',
  //     url: 'https://api.ng.termii.com/api/sms/otp/send',
  //     headers: {
  //       'Content-Type': ['application/json', 'application/json'],
  //     },
  //     body: JSON.stringify(data),
  //   }

  //   return //transporter.sendMail(msg)
  // .then((res) => {
  // console.log(`EMAIL SENT RESPONSE:: ${verificationCode} `, res.response);
  // 	// return res.response
  // 	// 	.status(200)
  // 	// 	.send({ success: true, message: "Email sent successfully" });
  // })
  // .catch((error) => console.log("error: ", error));

  //   return  axios({
  //       method: 'post',
  //       url: 'https://api.ng.termii.com/api/sms/otp/send',
  //       data: JSON.stringify(data),
  //       headers: {
  //         'Content-Type': 'application/json',
  //       },
  //     })

  return instance
    .post('/api/sms/otp/send', JSON.stringify(data))
    .then((res) => {
      console.log(res.data)
    })
    .catch((error) => {
      console.log('sms ERR >> ', error?.response?.data?.message)
    })

  // return await axios.post('https://api.ng.termii.com/api/sms/otp/send', data, {
  //   // headers: {
  //   //   // Authorization: `Bearer ${AuthToken}`,
  //   //   // Content-Type: 'application/json',
  //   // },
  // })
}
