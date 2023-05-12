//IMPORTS
require('dotenv').config({ path: `.env.${process.env.NODE_ENV}` })
const express = require('express')
const cookieParser = require('cookie-parser')
const bodyParser = require('body-parser');
const morgan = require('morgan')
const helmet = require('helmet')
const cors = require('cors')
const db = require('./app/db')
const changeSchemeHandler = require('./app/controllers/changeScheme.handler')
const middleware = require('./app/helpers/middlewares')


//DECLARE
const app = express()
const http = require('http').Server(app)
const io = require('socket.io')(http)

//PLUGINS
app.use(morgan('dev'))
app.use(helmet())
app.use(cors())
app.use(express.json())
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())
app.use(express.static('public'))
app.use('/uploads', express.static('uploads'))

//DATABASE
db.mongoose
  .connect(db.url, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('Connected to the database!')
  })
  .catch((err) => {
    console.log('Cannot connect to the database!', err)
    process.exit()
  })
// simple route
app.get('/api', (req, res) => {
  res.json({
    message: 'FASTQUID REST API v' + process.env.npm_package_version,
  })
})
// Socket Connection
io.on('connection', (socket) => {
  console.log(`${socket.id} user connected`)

  socket.on('disconnect', () => {
    console.log(`${socket.id} user disconnected`)
  })
})

// CHANGE STREAMS
changeSchemeHandler(db, io)

require('./app/routes/admin.routes')(app)
require('./app/routes/auth.routes')(app)
require('./app/routes/bank.routes')(app)
require('./app/routes/loan.routes')(app)
require('./app/routes/transaction.routes')(app)
require('./app/routes/media.routes')(app)
require('./app/routes/support.routes')(app)
require('./app/routes/notification.routes')(app)
// Not for production
require('./app/routes/sms.routes')(app)

app.use(middleware.notFound)
app.use(middleware.errorHandler)

// set port, listen for requests
const PORT = process.env.PORT || 8080

http.listen(PORT, () => {
  console.log('env', process.env.NODE_ENV)
  console.log(`Server is running on port ${PORT}.`)
})
