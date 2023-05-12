module.exports = (mongoose) => {
  const schema = mongoose.Schema(
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      accountName: {
        type: String,
        lowercase: true,
        trim: true,
        required: [true, 'account name is required'],
      },
      accountNumber: {
        type: String,
        required: [true, 'account number is required'],
      },
      bankName: {
        type: String,
        required: [true, 'bank is required'],
      },
      bankCode: {
        type: String,
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

  const Bank = mongoose.model('Bank', schema)
  return Bank
}
