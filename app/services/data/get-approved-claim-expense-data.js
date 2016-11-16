const config = require('../../../knexfile').asyncworker
const knex = require('knex')(config)

module.exports.getClaimExpenseData = function(claimId) {
    // Get all Claim expenses from database for specified claim id
    return knex('IntSchema.ClaimExpense')
    .where('IntSchema.ClaimExpense.ClaimId', claimId)
    .select('IntSchema.ClaimExpense.ClaimExpenseId',
        'IntSchema.ClaimExpense.ExpenseType',
        'IntSchema.ClaimExpense.Cost',
        'IntSchema.ClaimExpense.From',
        'IntSchema.ClaimExpense.To',
        'IntSchema.ClaimExpense.IsReturn',
        'IntSchema.ClaimExpense.ApprovedCost',
        'IntSchema.ClaimExpense.Status',
        'IntSchema.ClaimExpense.EligibilityId'
    )
}

module.exports.getClaimantData = function(reference, claimId) {
    var visitor
    var visitorBankDetails

    return knex('IntSchema.Visitor')
        .where('Reference', reference)
        .select('FirstName')
        .first()
        .then(function(visitorData) {
            visitor = visitorData
        })
        .then(function() {
            return knex('IntSchema.ClaimBankDetail')
                .where('ClaimId', claimId)
                .first()
                .then(function(bankDetails) {
                    visitorBankDetails = bankDetails
                })
        })
        .then(function() {
            return {
                'VisitorFirstName': visitor.FirstName,
                'AccountNumberLastFourDigits': visitorBankDetails.AccountNumber.substr(visitorBankDetails.AccountNumber.length - 4)
            }
        })
}
