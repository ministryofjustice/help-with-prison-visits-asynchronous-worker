const config = require('../../../knexfile').asyncworker
const knex = require('knex')(config)

module.exports = function (claimBankDetailId, reference, claimId, sortcode, accountNumber) {
  return knex('IntSchema.ClaimBankDetail')
    .where({ 'ClaimBankDetailId': claimBankDetailId, 'Reference': reference, 'ClaimId': claimId })
    .update({'SortCode': sortcode, 'accountNumber': accountNumber})
}
