require('dotenv').config()
const knex = require('knex')
const { KNEX_CONFIG } = require('../config')
const log = require('./services/log')

function getDatabaseConnector (connectionDetails = KNEX_CONFIG) {
  log.info('Getting database connection')
  const knexConfig = require('../knexfile')[connectionDetails]
  const connection = knex(knexConfig)

  log.info('Successfully got database connection')

  return connection
}

module.exports = {
  getDatabaseConnector
}
