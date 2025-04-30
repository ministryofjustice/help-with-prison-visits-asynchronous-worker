const { getDatabaseConnector } = require('../../../../app/databaseConnector')
const config = require('../../../../config')
const dateFormatter = require('../../../../app/services/date-formatter')
const testHelper = require('../../../test-helper')

const getOldEligibilityData = require('../../../../app/services/data/get-old-eligibility-data')

describe('services/data/get-old-eligibility-data', () => {
  const maxAgeInDays = parseInt(config.EXTERNAL_MAX_DAYS_BEFORE_DELETE_OLD_DATA, 10)
  const reference1 = 'GETELIG1'
  const reference2 = 'GETELIG2'
  const reference3 = 'GETELIG3'
  const reference4 = 'GETELIG4'
  let eligibilityId1
  let eligibilityId2
  let eligibilityId3
  let eligibilityId4

  const dateThreshold = dateFormatter.now().subtract(maxAgeInDays, 'days').toDate()
  const olderThanMaxAge = dateFormatter
    .now()
    .subtract(maxAgeInDays + 1, 'days')
    .toDate()
  const lessThanMaxAge = dateFormatter
    .now()
    .subtract(maxAgeInDays - 1, 'days')
    .toDate()

  beforeAll(() => {
    return Promise.all([
      // Old eligibility with claim
      createTestData(reference1, olderThanMaxAge, false).then(ids => {
        eligibilityId1 = ids.eligibilityId
      }),
      // Old eligibility without claim
      createTestData(reference2, olderThanMaxAge, true).then(ids => {
        eligibilityId2 = ids.eligibilityId
      }),
      // Newer eligibility with claim
      createTestData(reference3, lessThanMaxAge, false).then(ids => {
        eligibilityId3 = ids.eligibilityId
      }),
      // Newer eligibility without claim
      createTestData(reference4, lessThanMaxAge, true).then(ids => {
        eligibilityId4 = ids.eligibilityId
      }),
    ])
  })

  it('should retrieve eligibility records past the date threshold', () => {
    return getOldEligibilityData(dateThreshold).then(results => {
      const eligibility1Found = eligibilityExists(eligibilityId1, results)
      const eligibility2Found = eligibilityExists(eligibilityId2, results)

      expect(eligibility1Found).toBe(true)
      expect(eligibility2Found).toBe(true)
    })
  })

  it('should not retrieve eligibility records within the date threshold', () => {
    return getOldEligibilityData(dateThreshold).then(results => {
      const eligibility3Found = eligibilityExists(eligibilityId3, results)
      const eligibility4Found = eligibilityExists(eligibilityId4, results)

      expect(eligibility3Found).toBe(false)
      expect(eligibility4Found).toBe(false)
    })
  })

  afterAll(() => {
    return Promise.all([
      testHelper.deleteAll(reference1, 'ExtSchema'),
      testHelper.deleteAll(reference2, 'ExtSchema'),
      testHelper.deleteAll(reference3, 'ExtSchema'),
      testHelper.deleteAll(reference4, 'ExtSchema'),
    ])
  })
})

function createTestData(ref, dateCreated, deleteClaim) {
  const returnObject = {}

  return testHelper
    .insertClaimEligibilityData('ExtSchema', ref)
    .then(ids => {
      const db = getDatabaseConnector()

      returnObject.eligibilityId = ids.eligibilityId
      returnObject.claimId = ids.claimId

      return db('ExtSchema.Eligibility')
        .where('EligibilityId', returnObject.eligibilityId)
        .update({
          DateCreated: dateCreated,
        })
        .then(() => {
          if (deleteClaim) {
            return Promise.all([
              deleteFromTable(returnObject.claimId, 'ClaimBankDetail'),
              deleteFromTable(returnObject.claimId, 'ClaimExpense'),
              deleteFromTable(returnObject.claimId, 'ClaimDocument'),
              deleteFromTable(returnObject.claimId, 'ClaimChild'),
            ]).then(() => {
              return deleteFromTable(returnObject.claimId, 'Claim')
            })
          }
          return Promise.resolve()
        })
    })
    .then(() => {
      return returnObject
    })
}

function deleteFromTable(claimId, tableName) {
  const db = getDatabaseConnector()

  return db(`ExtSchema.${tableName}`).where('ClaimId', claimId).del()
}

function eligibilityExists(value, collection) {
  const result = collection.filter(item => {
    return item.EligibilityId === value
  })

  return result.length > 0
}
