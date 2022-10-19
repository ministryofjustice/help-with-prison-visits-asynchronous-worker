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
  const connection = knex(knexConfig)
  // cachedConnection = connection
  return connection
}

module.exports = {
  getDatabaseConnector
}
