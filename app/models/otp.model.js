module.exports = (mongoose) => {
  const schema = mongoose.Schema(
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User is required'],
      },
      otp: {
        type: Number,
        required: [true, 'OTP is required'],
      },
      expiration_time: {
        type: Date,
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

  const Otp = mongoose.model('Otp', schema)

  return Otp
}
