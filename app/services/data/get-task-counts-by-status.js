const config = require('../../../knexfile').asyncworker
const knex = require('knex')(config)
const Promise = require('bluebird')
const statusEnum = require('../../constants/status-enum')

module.exports = function () {
  var getCountForStatus = function (status) {
    return knex('ExtSchema.Task').count('Status as count').where('Status', status)
      .then(function (countResult) {
        var count = countResult[0].count
        return `${status}: ${count}`
      })
  }

  return Promise.each([
    getCountForStatus(statusEnum.PENDING),
    getCountForStatus(statusEnum.INPROGRESS),
    getCountForStatus(statusEnum.COMPLETE),
    getCountForStatus(statusEnum.FAILED)], function (result) { return result })
}
