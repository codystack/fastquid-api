const validator = require('validator')
const extendSchema = require('mongoose-extend-schema')
const globalScheme = require('./global_scheme')
const intl_phonePlugin = require('../helpers/intl_phone.plugin')

module.exports = (mongoose) => {
  var schema = extendSchema(
    globalScheme,
    {
      privilege: {
        type: {
          type: String,
          enum: ['superadmin', 'admin'],
          trim: true,
          lowercase: true,
          default: 'admin',
        },
        role: {
          type: String,
          enum: ['manager', 'sales', 'operations', 'developer', 'analyst'],
          trim: true,
          lowercase: true,
          default: 'analyst',
        },
        claim: {
          type: String,
          enum: ['readonly', 'read/write'],
          trim: true,
          lowercase: true,
          default: 'readonly',
        },
      },
    },
    {
      timestamps: true,
      versionKey: false,
      toJSON: { virtuals: true },
      toObject: { virtuals: true },
    }
  )

  intl_phonePlugin(schema)

  schema.method('toJSON', function () {
    const { _id, ...object } = this.toObject()
    object.id = _id
    return object
  })

  schema.virtual('fullName').get(function () {
    return this.firstName + ' ' + this.lastName
  })

  const Admin = mongoose.model('Admin', schema)

  return Admin
}
