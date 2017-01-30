const config = require('../../../knexfile').asyncworker
const knex = require('knex')(config)

module.exports = function (schema, reference) {
  return knex(`${schema}.Visitor`).first().where({'Reference': reference})
    .select('FirstName')
}
