const db = require('../db')
const Setting = db.settings
let customErr = new Error()

module.exports.create = async (req, res) => {
  try {
    const setting = await new Setting(req.body).save()
    res.send(setting)
  } catch (error) {}
}
