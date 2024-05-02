const getAllClaimData = require('../data/get-all-claim-data')
const migrateClaimToInternalAsTransaction = require('../data/migrate-claim-to-internal-as-transaction')
const calculateCarExpenseCosts = require('../distance-checker/calculate-car-expense-costs')
const insertTask = require('../data/insert-task')
const getVisitorEmailAddress = require('../data/get-visitor-email-address')
const tasksEnum = require('../../constants/tasks-enum')

module.exports.execute = function (task) {
  const { reference } = task
  const { eligibilityId } = task
  const { claimId } = task
  let claimData

  return (
    getAllClaimData('ExtSchema', reference, eligibilityId, claimId)
      .then(function (data) {
        claimData = data
      })
      .then(function () {
        return migrateClaimToInternalAsTransaction(claimData, task.additionalData, eligibilityId, claimId)
      })
      .then(function () {
        return calculateCarExpenseCosts(reference, eligibilityId, claimId)
      })
      // autoApprovalProcess Removed in APVS0115
      .then(function () {
        return insertTaskSendClaimNotification(reference, eligibilityId, claimId)
      })
      .then(function () {
        return insertTask(reference, eligibilityId, claimId, tasksEnum.DWP_CHECK)
      })
  )
}

function insertTaskSendClaimNotification(reference, eligibilityId, claimId) {
  return getVisitorEmailAddress('IntSchema', reference, eligibilityId).then(function (emailAddress) {
    return insertTask(reference, eligibilityId, claimId, tasksEnum.SEND_CLAIM_NOTIFICATION, emailAddress)
  })
}
