const textToUpperCase = require('../utils/textToUpperCase')
const formatCurrency = require('./formatCurrency')

/**
 *
 * @param {{
 * firstName: String,
 * lastName: String,
 * photoUrl: String,
 * deviceName: String,
 * bankName: String,
 * accountName: String,
 * amount: String,
 * dueDate: Date
 * }} props
 * @returns Object
 */

module.exports = (props) => {
  const COMPANY = process.env.COMPANY
  const LOGO = process.env.LOGO
  return {
    welcome: {
      title: `Welcome to ${COMPANY}`,
      message: [
        `Dear ${props?.firstName},`,
        `Our goal at ${COMPANY} is to give everyone easy access to loans within 30 minutes. We want to see people pursue their dreams, quickly sort out any personal financial need and become successful. We're here to make the happy endings come quicker.`,
        'To get a quick loan, please click the button below to get started.',
      ],
      button: {
        title: 'Apply For A Loan Now',
        link: `${process.env.DOMAIN}/sign-up`,
      },
      image: LOGO,
    },
    passwordChanged: {
      title: 'Password Changed',
      message: [`We noticed your ${COMPANY} password was recently changed.`],
      image: LOGO,
    },
    phoneVerified: {
      title: 'PhoneNumber verified',
      message: ['You mobile phone number has been verified.'],
      image: LOGO,
    },
    emailVerified: {
      title: 'Email Address verified',
      message: ['Your email address has been verified.'],
      image: LOGO,
    },
    companyEmailVerified: {
      title: 'Company Email Address verified',
      message: ['Your company email address has been verified.'],
      image: LOGO,
    },
    deviceChanged: {
      title: 'Device Changed',
      message: [
        `We noticed you have changed your device to ${props?.deviceName}.`,
      ],
      image: LOGO,
    },
    loanRequest: {
      title: 'Loan Request',
      message: [
        'Your loan application request has been received!',
        'we will check your loan eligibility and get back to you.',
      ],
      image: LOGO,
    },
    loanApproved: {
      title: 'Congrats! Your Loan Has Been Approved',
      message: [
        `Hi ${props?.firstName},`,
        `Your loan of ${formatCurrency(
          props?.amount
        )} has been Approved and paid into your bank account.`,
        `The due date of your loan is ${new Date(
          props?.dueDate
        )?.toDateString()}`,
      ],
      image: LOGO,
    },
    loanReceived: {
      title: 'FastQuid Alert',
      message: [
        `Hi ${props?.firstName},`,
        `${formatCurrency(props?.amount)} was successfully sent to your ${
          props?.bankName
        } bank account.`,
        'Transfer Details:',
        `To - ${props?.accountName}`,
        `Amount - ${formatCurrency(props?.amount)}`,
        `Date - ${new Date().toDateString()}`,
      ],
      image: LOGO,
    },
    loanPartialPayment: {
      title: '',
      message: [''],
      image: LOGO,
    },
    loanFullPayment: {
      title: 'Loan Repayment',
      message: [
        `Your loan of ${formatCurrency(
          props?.amount
        )} has been successfully settled`,
        'you can re-apply for another loan',
      ],
      image: LOGO,
    },
    loanDeclined: {
      title: 'Loan Declined',
      message: [
        `Hi ${props?.firstName},`,
        'We are sorry to inform you that your loan request was denied! Because you did not meet our application requirement',
        'kindly retry in 10 days time',
      ],
      image: LOGO,
    },
  }
}
