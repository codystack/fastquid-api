module.exports = (mongoose) => {
    const schema = mongoose.Schema(
      {
        id: {
          type: String,
          required: [true, 'Email is required'],
        },
      },
    )
  
    schema.method('toJSON', function () {
      const { _id, ...object } = this.toObject()
      object.id = _id
      return object
    })
  
    const PotentialAdmin = mongoose.model('PotentialAdmin', schema)
  
    return PotentialAdmin
  }
  