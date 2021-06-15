const config = require('../../../config')
const moment = require('moment')
const getAllClaimsPendingForFiveWeeks = require('../data/get-all-claims-pending-for-five-weeks')
const insertTask = require('../data/insert-task')
const tasksEnum = require('../../constants/tasks-enum')

module.exports.execute = function (task) {
  const dateCreated = task.dateCreated
  const numberOfDaysPendingForFinalReminder = parseInt(config.NUMBER_OF_DAYS_PENDING_FOR_FINAL_REMINDER)

  // Get date range of Advance Claims with DateOfJourney which require reminders
  const reminderCutoffDate = moment(dateCreated).clone().startOf('day').subtract(numberOfDaysPendingForFinalReminder, 'days').format('YYYY-MM-DD')

  return getAllClaimsPendingForFiveWeeks(reminderCutoffDate)
    .then(function (openClaims) {
      return sendReminder(openClaims)
    })
}

function sendReminder (openClaims) {
  const promises = []

  openClaims.forEach(function (claim) {
    promises.push(insertTaskToSendClaimReminderNotification(claim))
  })

  return Promise.all(promises)
}

function insertTaskToSendClaimReminderNotification (claim) {
  return insertTask(claim.Reference, claim.EligibilityId, claim.ClaimId, tasksEnum.SEND_REQUEST_INFORMATION_REMINDER_NOTIFICATION, claim.EmailAddress)
}
