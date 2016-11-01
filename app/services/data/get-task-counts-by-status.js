const config = require('../../../knexfile').asyncworker
const knex = require('knex')(config)
const Promise = require('bluebird')
const statusEnum = require('../../constants/status-enum')

const INTSCHEMA = 'IntSchema'
const EXTSCHEMA = 'ExtSchema'

module.exports = function () {
  var getCountForStatus = function (schema, status) {
    return knex(`${schema}.Task`).count('Status as count').where('Status', status)
      .then(function (countResult) {
        var count = countResult[0].count
        return `${schema}-${status}: ${count}`
      })
  }

  return Promise.each([
    getCountForStatus(INTSCHEMA, statusEnum.PENDING),
    getCountForStatus(INTSCHEMA, statusEnum.INPROGRESS),
    getCountForStatus(INTSCHEMA, statusEnum.COMPLETE),
    getCountForStatus(INTSCHEMA, statusEnum.FAILED),
    getCountForStatus(EXTSCHEMA, statusEnum.PENDING),
    getCountForStatus(EXTSCHEMA, statusEnum.INPROGRESS),
    getCountForStatus(EXTSCHEMA, statusEnum.COMPLETE),
    getCountForStatus(EXTSCHEMA, statusEnum.FAILED)], function (result) { return result })
}
