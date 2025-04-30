const { getDatabaseConnector } = require('../../databaseConnector')
const statusEnum = require('../../constants/status-enum')
const dateFormatter = require('../date-formatter')

module.exports = (reference, eligibilityId, claimId, taskType, additionalData) => {
  const task = {
    Task: taskType,
    Reference: reference,
    EligibilityId: eligibilityId,
    ClaimId: claimId,
    AdditionalData: additionalData,
    DateCreated: dateFormatter.now().toDate(),
    Status: statusEnum.PENDING,
  }
  const db = getDatabaseConnector()

  return db('IntSchema.Task').insert(task)
}
