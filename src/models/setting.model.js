module.exports = (mongoose) => {
  const schema = mongoose.Schema(
    {
      minimumLoanAmount: {
        type: Number,
        default: 20000,
      },
      maximumLoanAmount: {
        type: Number,
        default: 250000,
      },
      personalLoanAmountPercentage: {
        type: Number,
        default: 20,
      },
      paydayLoanAmountPercentage: {
        type: Number,
        default: 50,
      },
      paydayLoanInterest: {
        type: mongoose.Schema.Types.Decimal128,
        default: 5,
      },
      personalLoanInterest: {
        type: mongoose.Schema.Types.Decimal128,
        default: 7.5,
      },
    },
    {
      timestamps: true,
      versionKey: false,
    }
  )

  schema.method('toJSON', function () {
    const { _id, ...object } = this.toObject()
    object.id = _id
    return object
  })

  const Setting = mongoose.model('Setting', schema)

  return Setting
}
