module.exports = (mongoose) => {
  const schema = mongoose.Schema(
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      subject: {
        type: String,
        lowercase: true,
        trim: true,
        enum: [
          'disbursement',
          'loan repayment',
          'debit',
          'fraud',
          'general inquires',
          'funds transfer',
          'others',
        ],
        required: [true, 'Subject is required'],
      },
      message: {
        type: String,
        lowercase: true,
        trim: true,
        required: [true, 'Message is required'],
      },
      ticketId: {
        type: String,
        uppercase: true,
        required: [true, 'TicketId is required'],
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

  const Contact = mongoose.model('Contact', schema)
  return Contact
}
