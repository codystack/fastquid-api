module.exports = function addMinuteToDate(date, minutes) {
  return new Date(date.getTime() + minutes * 60000)
}
