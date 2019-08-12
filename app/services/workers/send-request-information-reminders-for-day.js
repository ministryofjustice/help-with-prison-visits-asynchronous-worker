const config = require('../../../config')
const moment = require('moment')
const getAllOpenClaimsForDateOfStatusRangeWithEmailFirst = require('../data/get-all-open-claims-for-date-of-status-range-with-email-first')
const getAllOpenClaimsForDateOfStatusRangeWithEmailSecond = require('../data/get-all-open-claims-for-date-of-status-range-with-email-second')
const updateClaimReminderSentStatus = require('../data/update-claim-reminder-sent-status')
const updateClaimStatus = require('../data/update-claim-status')
const insertTask = require('../data/insert-task')
const tasksEnum = require('../../constants/tasks-enum')
const statusEnum = require('../../constants/claim-status-enum')
const reminderEnum = require('../../constants/advance-claim-reminder-enum')
const log = require('../log')
const Promise = require('bluebird')

module.exports.execute = function (task) {
  var dateCreated = task.dateCreated
  var numberOfDaysAfterDateOfStatusForReminder = parseInt(config.NUMBER_OF_DAYS_AFTER_DATE_OF_STATUS_FOR_REMINDER)
  var numberOfDaysAfterDateOfStatusForSecondReminder = parseInt(config.NUMBER_OF_DAYS_AFTER_DATE_OF_STATUS_FOR_SECOND_REMINDER)

  // Get date range of Advance Claims with DateOfJourney which require reminders
  var startDateFirst = moment(dateCreated).startOf('day').subtract(numberOfDaysAfterDateOfStatusForReminder, 'days').toDate()
  var endDateFirst = moment(dateCreated).endOf('day').subtract(numberOfDaysAfterDateOfStatusForReminder, 'days').toDate()

  var startDateSecond = moment(dateCreated).startOf('day').subtract(numberOfDaysAfterDateOfStatusForSecondReminder, 'days').toDate()
  var endDateSecond = moment(dateCreated).endOf('day').subtract(numberOfDaysAfterDateOfStatusForSecondReminder, 'days').toDate()

  log.info(`Start Date First: ${startDateFirst}`)
  log.info(`End Date First: ${endDateFirst}`)

  log.info(`Start Date Second: ${startDateSecond}`)
  log.info(`End Date Second: ${endDateSecond}`)

  return Promise.all([
    getAllOpenClaimsForDateOfStatusRangeWithEmailFirst(startDateFirst, endDateFirst)
      .then(function (openClaims) {
        log.info(openClaims)
        return sendReminderOrRejectClaim(openClaims, reminderEnum.FIRST)
      }),
    getAllOpenClaimsForDateOfStatusRangeWithEmailSecond(startDateSecond, endDateSecond)
      .then(function (openClaims) {
        log.info(openClaims)
        return sendReminderOrRejectClaim(openClaims, reminderEnum.SECOND)
      })
  ])
}

function sendReminderOrRejectClaim (openClaims, reminder) {
  var promises = []

  if(reminder === reminderEnum.SECOND){
    openClaims.forEach(function (claim) {
      promises.push(rejectClaim(claim, reminder))
    })

  }else{
    openClaims.forEach(function (claim) {
      promises.push(insertTaskToSendClaimReminderNotification(claim, reminder))
    })
  }

  return Promise.all(promises)
}

function insertTaskToSendClaimReminderNotification (claim, reminder) {
  updateClaimReminderSentStatus(claim.ClaimId)
    .then(function(){
      return insertTask(claim.Reference, claim.EligibilityId, claim.ClaimId, tasksEnum.SEND_REQUEST_INFORMATION_REMINDER_NOTIFICATION, `${claim.EmailAddress}~~${reminder}`)
    })
}

function rejectClaim(claim, reminder) {
  return updateClaimStatus(claim.ClaimId, statusEnum.REJECTED)
}
