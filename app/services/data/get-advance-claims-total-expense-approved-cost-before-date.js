const config = require('../../../knexfile').asyncworker
const knex = require('knex')(config)

module.exports = function (date, status) {
  // Get all Claims before a certain date or above away with total amount of expenses
  return knex('IntSchema.Claim')
    .select('IntSchema.Claim.ClaimId', 'IntSchema.Claim.Reference')
    .where({ 'IntSchema.Claim.IsAdvanceClaim': true, 'IntSchema.Claim.Status': status, 'IntSchema.ClaimExpense.IsEnabled': true })
    .andWhere(function () {
      this.where('IntSchema.Claim.IsOverpaid', null).orWhere('IntSchema.Claim.IsOverpaid', false)
    })
    .andWhere('IntSchema.Claim.DateOfJourney', '<=', date)
    .innerJoin('IntSchema.ClaimExpense', 'IntSchema.Claim.ClaimId', '=', 'IntSchema.ClaimExpense.ClaimId')
    .groupBy('IntSchema.Claim.ClaimId', 'IntSchema.Claim.Reference')
    .sum('IntSchema.ClaimExpense.ApprovedCost as Amount')
}
