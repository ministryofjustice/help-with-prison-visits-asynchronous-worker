const { getDatabaseConnector } = require('../../databaseConnector')
const statusEnum = require('../../constants/status-enum')
require('../promise-each')

const INTSCHEMA = 'IntSchema'
const EXTSCHEMA = 'ExtSchema'

module.exports = function () {
  const getCountForStatus = function (schema, status) {
    const db = getDatabaseConnector()

    return db(`${schema}.Task`).count('Status as count').where('Status', status)
      .then(function (countResult) {
        const count = countResult[0].count
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
