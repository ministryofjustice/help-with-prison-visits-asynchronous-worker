require('dotenv').config()
const knex = require('knex')
const { KNEX_CONFIG } = require('../config')
const log = require('./services/log')

function getDatabaseConnector (connectionDetails = KNEX_CONFIG) {
  log.info('Getting database connection')
  const knexConfig = require('../knexfile')[connectionDetails]
  let connection

  try {
    connection = knex(knexConfig)
    log.info('Successfully got database connection')
  } catch (error) {
    log.error('Failed first connection attempt')
    setTimeout(function () {
      log.info('Retrying connection')
      connection = knex(knexConfig)
      log.info('Successfully got retried database connection')
    }, 5000)
  }

  return connection
}

module.exports = {
  getDatabaseConnector
}
