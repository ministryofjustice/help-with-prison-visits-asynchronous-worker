const expect = require('chai').expect
const { getDatabaseConnector } = require('../../../../app/databaseConnector')
const config = require('../../../../config')
const dateFormatter = require('../../../../app/services/date-formatter')
const testHelper = require('../../../test-helper')

const getOldEligibilityData = require('../../../../app/services/data/get-old-eligibility-data')

describe('services/data/get-old-eligibility-data', function () {
  const maxAgeInDays = parseInt(config.EXTERNAL_MAX_DAYS_BEFORE_DELETE_OLD_DATA)
  const reference1 = 'GETELIG1'
  const reference2 = 'GETELIG2'
  const reference3 = 'GETELIG3'
  const reference4 = 'GETELIG4'
  let eligibilityId1
  let eligibilityId2
  let eligibilityId3
  let eligibilityId4

  const dateThreshold = dateFormatter.now().subtract(maxAgeInDays, 'days').toDate()
  const olderThanMaxAge = dateFormatter.now().subtract(maxAgeInDays + 1, 'days').toDate()
  const lessThanMaxAge = dateFormatter.now().subtract(maxAgeInDays - 1, 'days').toDate()

  before(function () {
    return Promise.all([
      // Old eligibility with claim
      createTestData(reference1, olderThanMaxAge, false)
        .then(function (ids) {
          eligibilityId1 = ids.eligibilityId
        }),
      // Old eligibility without claim
      createTestData(reference2, olderThanMaxAge, true)
        .then(function (ids) {
          eligibilityId2 = ids.eligibilityId
        }),
      // Newer eligibility with claim
      createTestData(reference3, lessThanMaxAge, false)
        .then(function (ids) {
          eligibilityId3 = ids.eligibilityId
        }),
      // Newer eligibility without claim
      createTestData(reference4, lessThanMaxAge, true)
        .then(function (ids) {
          eligibilityId4 = ids.eligibilityId
        })
    ])
  })

  it('should retrieve eligibility records past the date threshold', function () {
    return getOldEligibilityData(dateThreshold)
      .then(function (results) {
        const eligibility1Found = eligibilityExists(eligibilityId1, results)
        const eligibility2Found = eligibilityExists(eligibilityId2, results)

        expect(eligibility1Found).to.be.true //eslint-disable-line
        expect(eligibility2Found).to.be.true //eslint-disable-line
      })
  })

  it('should not retrieve eligibility records within the date threshold', function () {
    return getOldEligibilityData(dateThreshold)
      .then(function (results) {
        const eligibility3Found = eligibilityExists(eligibilityId3, results)
        const eligibility4Found = eligibilityExists(eligibilityId4, results)

        expect(eligibility3Found).to.be.false //eslint-disable-line
        expect(eligibility4Found).to.be.false //eslint-disable-line
      })
  })

  after(function () {
    return Promise.all([
      testHelper.deleteAll(reference1, 'ExtSchema'),
      testHelper.deleteAll(reference2, 'ExtSchema'),
      testHelper.deleteAll(reference3, 'ExtSchema'),
      testHelper.deleteAll(reference4, 'ExtSchema')
    ])
  })
})

function createTestData (ref, dateCreated, deleteClaim) {
  const returnObject = {}

  return testHelper.insertClaimEligibilityData('ExtSchema', ref)
    .then(function (ids) {
      const db = getDatabaseConnector()

      returnObject.eligibilityId = ids.eligibilityId
      returnObject.claimId = ids.claimId

      return db('ExtSchema.Eligibility')
        .where('EligibilityId', returnObject.eligibilityId)
        .update({
          DateCreated: dateCreated
        })
        .then(function () {
          if (deleteClaim) {
            return Promise.all([
              deleteFromTable(returnObject.claimId, 'ClaimBankDetail'),
              deleteFromTable(returnObject.claimId, 'ClaimExpense'),
              deleteFromTable(returnObject.claimId, 'ClaimDocument'),
              deleteFromTable(returnObject.claimId, 'ClaimChild')
            ])
              .then(function () {
                return deleteFromTable(returnObject.claimId, 'Claim')
              })
          }
        })
    })
    .then(function () {
      return returnObject
    })
}

function deleteFromTable (claimId, tableName) {
  const db = getDatabaseConnector()

  return db(`ExtSchema.${tableName}`)
    .where('ClaimId', claimId)
    .del()
}

function eligibilityExists (value, collection) {
  const result = collection.filter(function (item) {
    return item.EligibilityId === value
  })

  return result.length > 0
}
