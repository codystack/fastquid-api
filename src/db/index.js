const mongoose = require('mongoose')
mongoose.Promise = global.Promise

/**
 * @typeof {mongoose} db
 */

const db = {}
db.mongoose = mongoose
db.url = process.env.DATABASE_URL

//MODELS
db.admins = require('../models/admin.model')(mongoose)
db.users = require('../models/user.model')(mongoose)
db.otps = require('../models/otp.model')(mongoose)
db.banks = require('../models/bank.model')(mongoose)
db.loans = require('../models/loan.model')(mongoose)
db.works = require('../models/work.model')(mongoose)
db.requests = require('../models/request.model')(mongoose)
db.debitCards = require('../models/card.model')(mongoose)
db.transactions = require('../models/transaction.model')(mongoose)
db.notifications = require('../models/notification.model')(mongoose)
db.contacts = require('../models/contact.model')(mongoose)
db.content = require('../models/content.model')(mongoose)
db.settings = require('../models/setting.model')(mongoose)
db.companys = require('../models/company.model')(mongoose)

module.exports = db
