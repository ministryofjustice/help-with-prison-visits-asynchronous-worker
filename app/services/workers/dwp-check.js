
const getVisitorDwpBenefitCheckerData = require('../data/get-visitor-dwp-benefit-checker-data')
const callDwpBenefitCheckerSoapService = require('../benefit-checker/call-dwp-benefit-checker-soap-service')
const updateVisitorWithDwpBenefitCheckerResult = require('../data/update-visitor-with-dwp-benefit-checker-result')
const insertTask = require('../data/insert-task')
const tasksEnum = require('../../constants/tasks-enum')
const sendDWPFailedEmailEnum = require('../../constants/dwp-failed-email-enum')

module.exports.execute = function (task) {
  return getVisitorDwpBenefitCheckerData(task.reference, task.eligibilityId, task.claimId)
    .then(function (visitorDwpBenefitCheckerData) {
      return callDwpBenefitCheckerSoapService(visitorDwpBenefitCheckerData)
        .then(function (benefitCheckerResult) {
          if(benefitCheckerResult.result != "YES") {
            if(sendDWPFailedEmailEnum[visitorDwpBenefitCheckerData.benefit]) {
              insertTask(task.reference, task.eligibilityId, task.claimId, tasksEnum.DWP_FAILED_NOTIFICATION, benefitCheckerResult.result)
              insertClaimEventForNote(reference, eligibilityId, claimId, note)
            }
          }

          return updateVisitorWithDwpBenefitCheckerResult(benefitCheckerResult.visitorId, benefitCheckerResult.result)
        })
    })
}

function insertClaimEventForNote (reference, eligibilityId, claimId, note) {
  if (note) {
    return insertClaimEvent(reference, eligibilityId, claimId, null, claimEventEnum.MESSAGE.value, null, note, false)
  } else {
    return Promise.resolve()
  }
}