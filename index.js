//IMPORTS
require('dotenv').config({ path: `.env.${process.env.NODE_ENV}` })
const express = require('express')
const cookieParser = require('cookie-parser')
const bodyParser = require('body-parser')
const morgan = require('morgan')
const helmet = require('helmet')
const cors = require('cors')
const db = require('./src/db')
const changeSchemeHandler = require('./src/controllers/changeScheme.handler')
const middleware = require('./src/helpers/middlewares')
const fs = require('fs')

// const  authRoute = require("./app/routes/auth.routes.js");

//DECLARE
const app = express()
const http = require('http').Server(app)
const io = require('socket.io')(http)

//PLUGINS
app.use(morgan('dev'))
app.use(helmet())
app.use(cors())
// app.use(
//   cors({
//     origin: ['https://fastquid-admin.vercel.app', 'https://fastquid-dashboard.vercel.app', 'https://app.fastquid.ng', 'https://backoffice.fastquid.ng', 'http://192.168.1.103'],
//   })
// )

app.use(express.json())
app.use(bodyParser.urlencoded({ extended: true }))
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
app.get('/', (req, res) => {
  res.json({
    message: 'FASTQUID REST API v' + process.env.npm_package_version,
  })
})

/* backslash for windows, in unix it would be forward slash */
// const routes_directory = require('path').resolve(__dirname) + '\\app\\';

// fs.readdirSync('./app/routes').map((file) => app.use("/api", require("./app/routes/"+file)));

// app.use("/api", authRoute);
// app.use('/api/auth', authRoute)

// Socket Connection
io.on('connection', (socket) => {
  console.log(`${socket.id} user connected`)

  socket.on('disconnect', () => {
    console.log(`${socket.id} user disconnected`)
  })
})

// CHANGE STREAMS
changeSchemeHandler(db, io)

// app.use('/api/auth', authRoute)

require('./src/routes/admin.routes')(app)
require('./src/routes/auth.routes')(app)
require('./src/routes/bank.routes')(app)
require('./src/routes/loan.routes')(app)
require('./src/routes/transaction.routes')(app)
require('./src/routes/media.routes')(app)
require('./src/routes/support.routes')(app)
require('./src/routes/notification.routes')(app)
// Not for production
// require('./app/routes/sms.routes')(app)

app.use(middleware.notFound)
app.use(middleware.errorHandler)

// set port, listen for requests
const PORT = process.env.PORT || 8080

http.listen(PORT, () => {
  console.log('env', process.env.NODE_ENV)
  console.log(`Server is running on port ${PORT}.`)
})
