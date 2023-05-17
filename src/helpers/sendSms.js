const { default: axios } = require('axios')
const nodemailer = require('nodemailer')
import verifyemailTemp from '../templates/verifyemail'

// axios();

// const Termii = require('termii');
// const termiiInstance = Termii();
// var request = require('request')

// const Version = process.env.FB_VERSION
// const PhoneNumberId = process.env.FB_PHONE_NUMBER_ID
// const AuthToken = process.env.FB_AUTH_TOKEN

// module.exports = (code, phone) => {
//   const endpoint = `https://graph.facebook.com/${Version}/${PhoneNumberId}/messages`
//   const data = {
//     messaging_product: 'whatsapp',
//     to: phone,
//     type: 'template',
//     template: {
//       name: 'verify_otp',
//       language: {
//         code: 'en',
//       },
//       components: [
//         {
//           type: 'body',
//           parameters: [
//             {
//               type: 'text',
//               text: code,
//             },
//             {
//               type: 'text',
//               text: 'FastQuid',
//             },
//           ],
//         },
//       ],
//     },
//   }

//   return axios.post(endpoint, data, {
//     headers: {
//       Authorization: `Bearer ${AuthToken}`,
//     },
//   })
// }

// const instance = axios.create({
//   baseURL: 'https://some-domain.com/api/',
//   timeout: 1000,
//   headers: { 'X-Custom-Header': 'foobar' },
// })

// const API_KEY = process.env.TERMII_API_KEY

// termiiInstance.setApi(process.env.TERMII_API_KEY)
//Send SMS
// termiiInstance.send_sms('234THE_TARGET_NUMBER','Your message','SENDER_ID').

// const instance = axios.create({
//   headers: {'X-Custom-Header': 'foobar'}
// });

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  auth: {
    user: process.env.MAILER_ID, //"info.prohelpng@gmail.com",
    pass: process.env.MAILER_PASS, ///"anwabldujrrjfcbi",
  },
})

module.exports = async (code, userEmail) => {
  // var data = {
  //   api_key: 'TLY2OAr9Rb0MZlNAsjZymMl9t5mS7ZvCDfeg7W9loRcSYz8xwBlJlXRpawf23g',
  //   message_type: 'NUMERIC',
  //   to: '07040277958',
  //   from: 'FastQuid',
  //   channel: 'dnd',
  //   pin_attempts: 10,
  //   pin_time_to_live: 5,
  //   pin_length: 4,
  //   pin_placeholder: `<${code}>`,
  //   message_text: `Your pin is ${code}`,
  //   pin_type: 'NUMERIC',
  // }
  // var options = {
  //   method: 'POST',
  //   url: 'https://api.ng.termii.com/api/sms/otp/send',
  //   headers: {
  //     'Content-Type': ['application/json', 'application/json'],
  //   },
  //   body: JSON.stringify(data),
  // }
  // console.log(data)

  // return request(options, function (error, response) {
  //   if (error) throw new Error(error)
  //   console.log(response.body)
  // })
  // const instance = axios.create({
  //   baseURL: 'https://api.ng.termii.com/api',
  //   timeout: 10000,
  //   // headers: { Authorization: 'Bearer ' + process.env.TERMII_API_KEY },
  // })

  // let message, subject

  // var mail = {
  //   body: {
  //     name: 'Dummy user',
  //     intro:
  //       message ||
  //       "Welcome to FastQuid! We're very excited to have you on board \n" +
  //         verificationCode,
  //     outro: 'Need our help? Contact our customer support',
  //   },
  // }

  // var emailBody = MailGenerator.generate(mail)

  let msg = {
    from: process.env.MAILER_ID,
    to: userEmail,
    subject: 'Account Verification!',
    html: verifyemailTemp,
  }

  // Send the email message
  //   const info = await transporter.sendMail(msg);
  //   console.log(`Email sent: ${info.messageId}`);
  return transporter.sendMail(msg)
  // .then((res) => {
  // console.log(`EMAIL SENT RESPONSE:: ${verificationCode} `, res.response);
  // 	// return res.response
  // 	// 	.status(200)
  // 	// 	.send({ success: true, message: "Email sent successfully" });
  // })
  // .catch((error) => console.log("error: ", error));

  // return instance.post('/sms/otp/send', JSON.stringify(data))
  // axios({
  //   method: 'post',
  //   url: 'https://api.ng.termii.com/api/sms/otp/send',
  //   data: JSON.stringify(data),
  //   headers: {
  //     'Content-Type': 'application/json',
  //   },
  // })

  // return await axios.post('https://api.ng.termii.com/api/sms/otp/send', data, {
  //   // headers: {
  //   //   // Authorization: `Bearer ${AuthToken}`,
  //   //   // Content-Type: 'application/json',
  //   // },
  // })
}
