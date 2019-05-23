const getAutoApproveClaims = require('../data/get-auto-approve-claims')
const autoApproveClaim = require('../data/auto-approve-claim')
const copyClaimDataToInternal = require('../data/copy-claim-data-to-internal')
const deleteClaimFromExternal = require('../data/delete-claim-from-external')
const calculateCarExpenseCosts = require('../distance-checker/calculate-car-expense-costs')
const insertTask = require('../data/insert-task')
const getVisitorEmailAddress = require('../data/get-visitor-email-address')
const tasksEnum = require('../../constants/tasks-enum')

module.exports.execute = function (task) {

  return getAutoApproveClaims()
    .then(function (data) { claimData = data })
    .then(function () { return autoApproveClaim(claimData.Reference, claimData.EligibilityId, claimData.ClaimId, claimData.EmailAddress) })
    .then(function () { return deleteClaimFromExternal(claimData.AutoApprovalId) })

}
