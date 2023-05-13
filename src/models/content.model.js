module.exports = (mongoose) => {
  const schema = mongoose.Schema(
    {
      platform: {
        type: String,
        enum: ['web', 'mobile', 'desktop'],
        required: ['Platform is required', true],
        default: 'web',
      },
      about: mongoose.Schema.Types.Mixed,
      home: mongoose.Schema.Types.Mixed,
      ads: mongoose.Schema.Types.Mixed,
      faqs: mongoose.Schema.Types.Mixed,
      testimonies: mongoose.Schema.Types.Mixed,
      contacts: mongoose.Schema.Types.Mixed,
      supports: mongoose.Schema.Types.Mixed,
    },
    {
      timestamps: true,
      versionKey: false,
    }
  )

  schema.method('toJSON', function () {
    const { _id, ...object } = this.toObject()
    object.id = _id
    return object
  })

  const Content = mongoose.model('Content', schema)
  return Content
}
