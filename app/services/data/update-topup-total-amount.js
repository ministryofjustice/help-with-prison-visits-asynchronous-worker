const config = require('../../../knexfile').asyncworker
const knex = require('knex')(config)

module.exports = function (claimId, totalAmount, deductionApplied) {
  return knex('IntSchema.TopUp')
    .where('claimId', claimId)
    .andWhere('PaymentStatus', 'PENDING')
    .update({'PaymentAmount': Number(totalAmount).toFixed(2), 'DeductionApplied': Number(deductionApplied).toFixed(2)})
}
