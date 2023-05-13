const validator = require('validator')
const { Schema } = require('mongoose')

const schema = new Schema({
  photoUrl: {
    type: String,
  },
  firstName: {
    type: String,
    required: [true, 'FirstName is required'],
    trim: true,
    lowercase: true,
  },
  lastName: {
    type: String,
    required: [true, 'LastName is required'],
    trim: true,
    lowercase: true,
  },
  middleName: {
    type: String,
    trim: true,
    lowercase: true,
  },
  phoneNumber: {
    type: String,
    trim: true,
    unique: true,
    required: [true, 'Phone Number is required'],
  },
  emailAddress: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    validate(value) {
      if (!validator.isEmail(value)) {
        throw new Error('Please enter a valid E-mail!')
      }
    },
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    validate(value) {
      if (!validator.isLength(value, { min: 6, max: 1000 })) {
        throw Error(
          'Length of the password should be between at least 6 character'
        )
      }
      if (validator.contains(value, 'password')) {
        throw Error('The password should not contain the keyword "password"!')
      }
    },
  },
  gender: {
    type: String,
    enum: ['male', 'female'],
    default: 'male',
    trim: true,
    lowercase: true,
  },
  isEmailVerified: {
    type: Boolean,
    default: false,
  },
  isPhoneVerified: {
    type: Boolean,
    default: false,
  },
  device: {
    os: {
      type: String,
    },
    id: {
      type: String,
    },
    model: {
      type: String,
    },
  },
  deviceToken: {
    type: String,
    default: null,
  },
  active: {
    type: Boolean,
    default: true,
  },
})

module.exports = schema
