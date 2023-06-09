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
        required: [true, 'LoanType is required'],
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
      interest: {
        type: Number,
        default: process.env.DEFAULT_PERSONAL_LOAN_INTEREST,
        required: [true, 'Interest is required'],
      },
      interestAmount: {
        type: Number,
        default: 0,
      },
      amountBorrowed: {
        type: Number,
        default: 0,
        required: [true, 'Amount Borrowed is required'],
      },
      totalAmountDue: {
        type: Number,
        default: 0,
        required: [true, 'Total Amount Due is required'],
      },
      amountPaid: {
        type: Number,
        default: 0,
        required: [true, 'Total Amount Due is required'],
      },
      salary: {
        type: Number,
        required: [true, 'Salary is required'],
      },
      company: {
        type: String,
        required: [true, 'Company name is required'],
      },
      dueDate: {
        type: Date, 
      },
      disbursedOn: {
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

  const Loan = mongoose.model('Loan', schema)

  return Loan
}
