
const getVisitorDwpBenefitCheckerData = require('../data/get-visitor-dwp-benefit-checker-data')
const callDwpBenefitCheckerSoapService = require('../benefit-checker/call-dwp-benefit-checker-soap-service')
const updateVisitorWithDwpBenefitCheckerResult = require('../data/update-visitor-with-dwp-benefit-checker-result')
const insertTask = require('../data/insert-task')
const tasksEnum = require('../../constants/tasks-enum')
const claimEventEnum = require('../../constants/claim-event-enum')
const insertClaimEvent = require('../data/insert-claim-event')
const sendDWPFailedEmailEnum = require('../../constants/dwp-failed-email-enum')

module.exports.execute = function (task) {
  return getVisitorDwpBenefitCheckerData(task.reference, task.eligibilityId, task.claimId)
    .then(function (visitorDwpBenefitCheckerData) {
      return callDwpBenefitCheckerSoapService(visitorDwpBenefitCheckerData)
        .then(function (benefitCheckerResult) {
          if(benefitCheckerResult.result != "YES" && sendDWPFailedEmailEnum[visitorDwpBenefitCheckerData.benefit]) {
              return insertTask(task.reference, task.eligibilityId, task.claimId, tasksEnum.DWP_FAILED_NOTIFICATION, benefitCheckerResult.result)
                .then(function() { return insertClaimEvent(task.reference, task.eligibilityId, task.claimId, null, claimEventEnum.MESSAGE.value, null, "Additional information automatically requested after DWP check", false) })
                .then(function() { return updateVisitorWithDwpBenefitCheckerResult(benefitCheckerResult.visitorId, benefitCheckerResult.result) })
          } else {
            return updateVisitorWithDwpBenefitCheckerResult(benefitCheckerResult.visitorId, benefitCheckerResult.result)
          }
        })
    })
}