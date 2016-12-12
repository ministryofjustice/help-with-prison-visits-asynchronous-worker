const config = require('../../../knexfile').asyncworker
const knex = require('knex')(config)

module.exports = function () {
  return knex('IntSchema.AutoApprovalConfig')
    .where('IsEnabled', true)
    .orderBy('DateCreated', 'desc')
    .first()
    .then(function (config) {
      var rulesDisabled = config.RulesDisabled
      if (rulesDisabled) {
        config.RulesDisabled = rulesDisabled.split(',')
      }
      return config
    })
}
