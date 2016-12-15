const config = require('../../../config')
const moment = require('moment')
const getAllOpenAdvanceClaimsForDateOfJourneyRangeWithEmail = require('../data/get-all-open-advance-claims-for-date-of-journey-range-with-email')
const insertTask = require('../data/insert-task')
const tasksEnum = require('../../constants/tasks-enum')
const Promise = require('bluebird')

module.exports.execute = function (task) {
  var dateCreated = task.dateCreated
  var numberOfDaysAfterDateOfJourneyForReminder = parseInt(config.NUMBER_OF_DAYS_AFTER_DATE_OF_JOURNEY_FOR_ADVANCE_REMINDER)

  // Get date range of Advance Claims with DateOfJourney which require reminders
  var startDate = moment(dateCreated).startOf('day').subtract(numberOfDaysAfterDateOfJourneyForReminder, 'days').toDate()
  var endDate = moment(dateCreated).endOf('day').subtract(numberOfDaysAfterDateOfJourneyForReminder, 'days').toDate()

  return getAllOpenAdvanceClaimsForDateOfJourneyRangeWithEmail(startDate, endDate)
    .then(function (openAdvanceClaims) {
      return insertTasksToSendAdvanceClaimEvidenceReminderNotification(openAdvanceClaims)
    })
}

function insertTasksToSendAdvanceClaimEvidenceReminderNotification (openAdvanceClaims) {
  var promises = []

  openAdvanceClaims.forEach(function (claim) {
    promises.push(insertTaskToSendAdvanceClaimEvidenceReminderNotification(claim))
  })

  return Promise.all(promises)
}

function insertTaskToSendAdvanceClaimEvidenceReminderNotification (claim) {
  return insertTask(claim.Reference, claim.EligibilityId, claim.ClaimId, tasksEnum.ADVANCE_CLAIM_EVIDENCE_REMINDER_NOTIFICATION, claim.EmailAddress)
}
