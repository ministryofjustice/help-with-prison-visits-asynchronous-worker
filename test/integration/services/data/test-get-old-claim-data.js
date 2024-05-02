const { getDatabaseConnector } = require('../../../../app/databaseConnector')
const config = require('../../../../config')
const dateFormatter = require('../../../../app/services/date-formatter')
const testHelper = require('../../../test-helper')

const getOldClaimData = require('../../../../app/services/data/get-old-claim-data')

describe('services/data/get-old-claim-data', function () {
  const maxAgeInDays = parseInt(config.EXTERNAL_MAX_DAYS_BEFORE_DELETE_OLD_DATA, 10)
  const reference1 = 'GETCLAIM1'
  const reference2 = 'GETCLAIM2'
  const reference3 = 'GETCLAIM3'
  const reference4 = 'GETCLAIM4'
  let claimId1
  let claimId2
  let claimId3
  let claimId4

  const dateThreshold = dateFormatter.now().subtract(maxAgeInDays, 'days').toDate()
  const olderThanMaxAge = dateFormatter
    .now()
    .subtract(maxAgeInDays + 1, 'days')
    .toDate()
  const lessThanMaxAge = dateFormatter
    .now()
    .subtract(maxAgeInDays - 1, 'days')
    .toDate()

  beforeAll(function () {
    return Promise.all([
      // Old claim with eligibility
      createTestData(reference1, olderThanMaxAge, false).then(function (ids) {
        claimId1 = ids.claimId
      }),
      // Old claim without eligibility
      createTestData(reference2, olderThanMaxAge, true).then(function (ids) {
        claimId2 = ids.claimId
      }),
      // Newer claim with eligibility
      createTestData(reference3, lessThanMaxAge, false).then(function (ids) {
        claimId3 = ids.claimId
      }),
      // Newer claim without eligibility
      createTestData(reference4, lessThanMaxAge, true).then(function (ids) {
        claimId4 = ids.claimId
      }),
    ])
  })

  it('should retrieve claim records past the date threshold', function () {
    return getOldClaimData(dateThreshold).then(function (results) {
      const claim1Found = claimExists(claimId1, results)
      const claim2Found = claimExists(claimId2, results)

      expect(claim1Found).toBe(true)
      expect(claim2Found).toBe(true)
    })
  })

  it('should not retrieve claim records within the date threshold', function () {
    return getOldClaimData(dateThreshold).then(function (results) {
      const claim3Found = claimExists(claimId3, results)
      const claim4Found = claimExists(claimId4, results)

      expect(claim3Found).toBe(false)
      expect(claim4Found).toBe(false)
    })
  })

  afterAll(function () {
    return Promise.all([
      testHelper.deleteAll(reference1, 'ExtSchema'),
      testHelper.deleteAll(reference2, 'ExtSchema'),
      testHelper.deleteAll(reference3, 'ExtSchema'),
      testHelper.deleteAll(reference4, 'ExtSchema'),
    ])
  })
})

function createTestData(ref, dateCreated, deleteEligibility) {
  const returnObject = {}

  return testHelper
    .insertClaimEligibilityData('ExtSchema', ref)
    .then(function (ids) {
      const db = getDatabaseConnector()

      returnObject.eligibilityId = ids.eligibilityId
      returnObject.claimId = ids.claimId

      return db('ExtSchema.Claim')
        .where('ClaimId', returnObject.claimId)
        .update({
          DateCreated: dateCreated,
        })
        .then(function () {
          if (deleteEligibility) {
            return Promise.all([
              deleteFromTable(returnObject.eligibilityId, 'Prisoner'),
              deleteFromTable(returnObject.eligibilityId, 'Visitor'),
            ]).then(function () {
              return deleteFromTable(returnObject.eligibilityId, 'Eligibility')
            })
          }
          return Promise.resolve()
        })
    })
    .then(function () {
      return returnObject
    })
}

function deleteFromTable(eligibilityId, tableName) {
  const db = getDatabaseConnector()

  return db(`ExtSchema.${tableName}`).where('EligibilityId', eligibilityId).del()
}

function claimExists(value, collection) {
  const result = collection.filter(function (item) {
    return item.ClaimId === value
  })

  return result.length > 0
}
