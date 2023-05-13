const mongooseIntlPhoneNumber = require('mongoose-intl-phone-number')

module.exports = (schema) =>
  schema.plugin(mongooseIntlPhoneNumber, {
    hook: 'validate',
    phoneNumberField: 'phoneNumber',
    nationalFormatField: 'nationalFormat',
    internationalFormat: 'internationalFormat',
    countryCodeField: 'countryCode',
  })
