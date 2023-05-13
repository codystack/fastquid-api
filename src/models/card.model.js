const mongoosePaginate = require('mongoose-paginate-v2')

module.exports = (mongoose) => {
  const schema = mongoose.Schema(
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      authorization_code: {
        type: String,
        required: [true, 'Authorization Code is required'],
      },
      card_type: {
        type: String,
        required: [true, 'Card type is required'],
      },
      last4: {
        type: String,
        required: [true, 'Last4 digit is required'],
      },
      exp_month: {
        type: String,
        required: [true, 'Expiry Month is required'],
      },
      exp_year: {
        type: String,
        required: [true, 'Expiry Year is required'],
      },
      bin: {
        type: String,
      },
      bank: {
        type: String,
      },
      channel: {
        type: String,
      },
      signature: {
        type: String,
      },
      reusable: {
        type: Boolean,
      },
      country_code: {
        type: String,
      },
      account_name: {
        type: String,
      },
    },
    {
      timestamps: true,
      versionKey: false,
    }
  )

  schema.plugin(mongoosePaginate)

  schema.method('toJSON', function () {
    const { _id, ...object } = this.toObject()
    object.id = _id
    return object
  })

  const DebitCard = mongoose.model('DebitCard', schema)
  return DebitCard
}
