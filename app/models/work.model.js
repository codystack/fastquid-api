module.exports = (mongoose) => {
  const schema = mongoose.Schema(
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User is required'],
      },
      employmentStatus: {
        type: String,
        required: [true, 'Employment Status is required'],
      },
      companyName: {
        type: String,
      },
      companyLocation: {
        type: String,
      },
      companyPhoneNumber: {
        type: String,
      },
      companyEmailAddress: {
        type: String,
      },
      jobTitle: {
        type: String,
      },
      monthlyIncome: {
        type: Number,
      },
      payDay: {
        type: Number,
      },
      isCompanyEmailVerified: {
        type: Boolean,
        default: false,
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

  const Work = mongoose.model('Work', schema)

  return Work
}
