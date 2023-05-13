/**
 *
 * @param {Object} db
 * @param {Object} io
 */
const population = [
  {
    path: 'loan',
    model: 'Loan',
  },
  {
    path: 'bank',
    model: 'Bank',
  },
  {
    path: 'work',
    model: 'Work',
  },
  {
    path: 'debitCard',
    model: 'DebitCard',
  },
]

module.exports = async function changeScheme(db, io) {
  try {
    const usersCollection = db.users.watch([], {
      fullDocument: 'updateLookup',
    })
    const loanCollection = db.loans.watch([], {
      fullDocument: 'updateLookup',
    })
    const notificationCollection = db.notifications.watch([], {
      fullDocument: 'updateLookup',
    })

    usersCollection.on('change', async (change) => {
      console.log('User_OperationType', change.operationType)
      const userId = change?.documentKey?._id
      const document = change?.fullDocument

      const userUpdated = await db.users.findById(userId).populate(population)

      switch (change.operationType) {
        case 'insert':
          io.emit('user-created', userUpdated)
          break

        case 'update':
          io.emit(`${userId}-user-updated`, userUpdated)
          break

        case 'delete':
          io.emit('user-deleted', document)
          break
      }
    })

    loanCollection.on('change', async (change) => {
      console.log('Loan_OperationType', change.operationType)
      const loanId = change?.documentKey?._id
      const document = change?.fullDocument

      switch (change.operationType) {
        case 'insert':
          io.emit(`${document?.user}-loan-created`, document)
          break

        case 'update':
          io.emit(`${document?.user}-loan-updated`, document)
          break

        case 'delete':
          io.emit('loan-deleted', document)
          break
      }
    })

    notificationCollection.on('change', async (change) => {
      const document = change?.fullDocument
      console.log('Notification_OperationType', change.operationType)

      switch (change.operationType) {
        case 'insert':
          console.log('user', document?.user)
          io.emit(`${document?.user}-notification-created`, document)
          break
        case 'delete':
          io.emit(`${document?.user}-notification-deleted`, document)
          break
      }
    })
  } catch (error) {
    console.log('error->', error)
  }
}
