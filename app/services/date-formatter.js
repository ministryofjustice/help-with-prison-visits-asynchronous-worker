const moment = require('moment')

const DATE_FORMAT = 'YYYY-MM-DD'
const INVALID_DATE_ERROR = 'Invalid date'

exports.format = function (date) {
  if (!isDate(date) || isUndefined(date) || isNull(date)) {
    return INVALID_DATE_ERROR
  }
  return date.format(DATE_FORMAT)
}

exports.now = function () {
  const now = moment()
  return applyDST(now)
}

exports.build = function (day, month, year) {
  month -= 1
  const date = moment([year, month, day])
  return applyDST(date)
}

exports.buildFormatted = function (day, month, year) {
  const date = this.build(day, month, year)
  if (!isValidDate(date)) {
    return INVALID_DATE_ERROR
  }
  return this.format(date)
}

exports.buildFromDateString = function (date) {
  if (typeof date !== 'string') {
    return false
  }
  const dateSplit = date.split('-')
  const year = dateSplit[0]
  const month = dateSplit[1]
  const day = dateSplit[2]

  return this.build(day, month, year)
}

function applyDST(date) {
  if (date.isDST()) {
    date = date.add(1, 'hour')
  }
  return date
}

function isUndefined(date) {
  return typeof date === 'undefined'
}

function isNull(date) {
  return date === null
}

function isDate(date) {
  return date instanceof moment
}

function isValidDate(date) {
  return date.isValid()
}
