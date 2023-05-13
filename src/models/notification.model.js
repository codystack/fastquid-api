const mongoosePaginate = require('mongoose-paginate-v2')

module.exports = (mongoose) => {
  var schema = mongoose.Schema(
    {
      title: {
        type: String,
        required: [true, 'Title is required'],
      },
      message: {
        type: [String],
        trim: false,
        required: [true, 'Message is required'],
      },
      image: {
        type: String,
        default: process.env.LOGO,
      },
      read: {
        type: Boolean,
        default: false,
      },
      user: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: 'userRefType',
      },
      userRefType: {
        type: String,
        required: [true, 'userRefType is required'],
        enum: ['User', 'Admin'],
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

  const Notification = mongoose.model('Notification', schema)

  return Notification
}
