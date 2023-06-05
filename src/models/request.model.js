const mongoosePaginate = require('mongoose-paginate-v2')

module.exports = (mongoose) => {
  const schema = mongoose.Schema(
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      type: {
        type: String,
        enum: ['personal loan', 'pay day loan', 'buy now pay later'],
        required: [true, 'RequestType is required'],
      },
      status: {
        type: String,
        enum: ['pending', 'approved', 'denied', 'settled', 'credited'],
        required: [true, 'Status is required'],
        default: 'pending',
      },
      duration: {
        type: String,
        required: [true, 'Duration is required'],
      },
      salary: {
        type: Number,
        required: [true, 'Salary is required'],
      },
      company: {
        type: String,
        required: [true, 'Company name is required'],
      },
      amount: {
        type: Number,
        required: [true, 'Amount is required'],
      },
      amountIssued: {
        type: Number,
        default: 0,
      },
      reason: {
        type: String,
      },
      paymentDate: {
        type: Date,
      },
    },
    {
      timestamps: true,
      versionKey: false,
      toJSON: { virtuals: true },
    }
  )

  schema.plugin(mongoosePaginate)

  schema.method('toJSON', function () {
    const { _id, ...object } = this.toObject()
    object.id = _id
    return object
  })

  const Request = mongoose.model('Request', schema)

  return Request
}
