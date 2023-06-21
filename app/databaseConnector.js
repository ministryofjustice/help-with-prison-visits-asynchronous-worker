require('dotenv').config()
const knex = require('knex')
const { KNEX_CONFIG } = require('../config')
const log = require('./services/log')

function getDatabaseConnector (connectionDetails = KNEX_CONFIG) {
  const knexConfig = require('../knexfile')[connectionDetails]
  const connection = knex(knexConfig)

  return connection
}

module.exports = {
  getDatabaseConnector
}
