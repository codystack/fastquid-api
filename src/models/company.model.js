const mongoosePaginate = require('mongoose-paginate-v2')
const validator = require('validator')

module.exports = (mongoose) => {
  var schema = mongoose.Schema(
    {
      name: {
        type: String,
        required: [true, 'Company name is required'],
      },
      emailAddress: {
        type: String,
        required: [true, 'Company Email is required'],
        unique: true,
        trim: true,
        lowercase: true,
        validate(value) {
          if (!validator.isEmail(value)) {
            throw new Error('Please enter a valid E-mail!')
          }
        },
      },
      phone: {
        type: String,
      },
      contactPerson: {
        name: String,
        phone: String,
      },
      accountManager: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin',
      },
      website: {
        type: String,
      },
      domain: {
        type: String,
      },
      type: {
        type: String,
        enum: ['personal', 'non-profit', 'corporation', 'government-owned'],
        trim: true,
        lowercase: true,
        default: 'sole proprietor',
      },
    },
    {
      timestamps: true,
      versionKey: false,
      toJSON: { virtuals: true },
      toObject: { virtuals: true },
    }
  )

  schema.plugin(mongoosePaginate)

  schema.method('toJSON', function () {
    const { _id, ...object } = this.toObject()
    object.id = _id
    return object
  })

  schema.virtual('label').get(function () {
    return this.name
  })

  const Company = mongoose.model('Company', schema)

  return Company
}
