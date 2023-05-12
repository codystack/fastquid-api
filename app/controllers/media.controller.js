exports.localUpload = async (req, res) => {
  // console.log('file', req.file)
  res.send({
    url: `${process.env.SERVER_BASEURL}/uploads${req.file.filename}`,
  })
}
