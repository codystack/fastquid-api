const validator = require('validator')
const extendSchema = require('mongoose-extend-schema')
const globalScheme = require('./global_scheme')
const intl_phonePlugin = require('../helpers/intl_phone.plugin')
const mongoosePaginate = require('mongoose-paginate-v2')

module.exports = (mongoose) => {
  const schema = extendSchema(
    globalScheme,
    {
      loanLevelAmount: {
        type: Number,
        default: process.env.MINIMUM_LOAN_AMOUNT,
      },
      accountStatus: {
        type: String,
        enum: ['pending', 'verified', 'frozen'],
        default: 'pending',
      },
      dob: {
        type: Date,
      },
      bvn: {
        type: String,
      },
      location: {
        state: {
          type: String,
        },
        city: {
          type: String,
        },
        address: {
          type: String,
        },
        ipAddress: {
          type: String,
        },
      },
      maritalStatus: {
        type: String,
      },
      education: {
        type: String,
      },
      children: {
        type: String,
        default: '0',
      },
      // contacts: [
      //   {
      //     relationship: {
      //       type: String,
      //     },
      //     name: {
      //       type: String,
      //     },
      //     phoneNumber: {
      //       type: String,
      //     },
      //   },
      // ],
      loan: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Loan',
      },
      bank: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Bank',
      },
      work: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Work',
      },
      debitCard: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'DebitCard',
      },
    },

    {
      timestamps: true,
      versionKey: false,
      toJSON: { virtuals: true },
      toObject: { virtuals: true },
    }
  )

  intl_phonePlugin(schema)

  schema.plugin(mongoosePaginate)

  schema.method('toJSON', function () {
    const { _id, ...object } = this.toObject()
    object.id = _id
    return object
  })

  schema.virtual('fullName').get(function () {
    return this.firstName + ' ' + this.lastName
  })

  const User = mongoose.model('User', schema)

  return User
}
