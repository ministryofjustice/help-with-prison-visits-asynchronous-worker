require('dotenv').config()
const knex = require('knex')
const { KNEX_CONFIG } = require('../config')
const log = require('./services/log')

// let cachedConnection

function getDatabaseConnector (connectionDetails = KNEX_CONFIG) {
  log.info('Getting database connection')
  const knexConfig = require('../knexfile')[connectionDetails]

  // if (cachedConnection) {
  //   log.info('Returning cached ')
  //   return cachedConnection
  // }
  let connection

  try {
    connection = knex(knexConfig)
  } catch (error) {
    if (error && error.message.match(/Failed to connect to /)) {
      log.error('Failed first connection attempt')
      setTimeout(function() {
        log.info('Retrying connection')
        connection = knex(knexConfig)
      }, 5000)
    }
  }
  // cachedConnection = connection
  return connection
}

module.exports = {
  getDatabaseConnector
}
