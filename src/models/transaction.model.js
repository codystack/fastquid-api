const mongoosePaginate = require('mongoose-paginate-v2')
const mongoose =  require("mongoose");

module.exports = () => {
  const schema = mongoose.Schema(
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      }, 
      type: {
        type: String,
        enum: ['account', 'loan'],
        required: [true, 'Transaction Type is required'],
      },
      domain: {
        type: String,
      },
      status: {
        type: String,
        required: [true, 'Status is required'],
      },
      reference: {
        type: String,
        required: [true, 'Reference is required'],
      },
      amount: {
        type: Number,
        required: [true, 'Amount is required'],
      },
      message: {
        type: String,
      },
      gateway_response: {
        type: String,
      },
      channel: {
        type: String,
        required: [true, 'Channel is required'],
      },
      currency: {
        type: String,
      },
      ip_address: {
        type: String,
      },
      transfer_code: {
        type: String,
      },
    },
    {
      timestamps: true,
      versionKey: false,
    }
  )

  // schema.plugin(mongoosePaginate)

  // schema.method('toJSON', function () {
  //   const { _id, ...object } = this.toObject()
  //   object.id = _id
  //   return object
  // })

  // schema.virtual('fullName').get(function () {
  //   return this.firstName + ' ' + this.lastName
  // })

  // const User = mongoose.model('User', schema)


  schema.plugin(mongoosePaginate)

  schema.method('toJSON', function () {
    const { _id, ...object } = this.toObject()
    object.id = _id
    return object
  })

  // const Transaction = mongoose.model('Transaction', schema)
  // export default mongoose.model("Review", ReviewSchema);

  return mongoose.model('Transaction', schema); //Transaction
}
