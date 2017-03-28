const expect = require('chai').expect
const knexfile = require('../../../../knexfile').asyncworker
const knex = require('knex')(knexfile)
const config = require('../../../../config')
const dateFormatter = require('../../../../app/services/date-formatter')
const testHelper = require('../../../test-helper')

const getOldEligibilityData = require('../../../../app/services/data/get-old-eligibility-data')

describe('services/data/get-old-eligibility-data', function () {
  var maxAgeInDays = parseInt(config.EXTERNAL_MAX_DAYS_BEFORE_DELETE_OLD_DATA)
  var reference1 = 'GETELIG1'
  var reference2 = 'GETELIG2'
  var reference3 = 'GETELIG3'
  var reference4 = 'GETELIG4'
  var eligibilityId1
  var eligibilityId2
  var eligibilityId3
  var eligibilityId4

  var dateThreshold = dateFormatter.now().subtract(maxAgeInDays, 'days').toDate()
  var olderThanMaxAge = dateFormatter.now().subtract(maxAgeInDays + 1, 'days').toDate()
  var lessThanMaxAge = dateFormatter.now().subtract(maxAgeInDays - 1, 'days').toDate()

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
        var eligibility1Found = eligibilityExists(eligibilityId1, results)
        var eligibility2Found = eligibilityExists(eligibilityId2, results)

        expect(eligibility1Found).to.be.true
        expect(eligibility2Found).to.be.true
      })
  })

  it('should not retrieve eligibility records within the date threshold', function () {
    return getOldEligibilityData(dateThreshold)
      .then(function (results) {
        var eligibility3Found = eligibilityExists(eligibilityId3, results)
        var eligibility4Found = eligibilityExists(eligibilityId4, results)

        expect(eligibility3Found).to.be.false
        expect(eligibility4Found).to.be.false
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
  var returnObject = {}

  return testHelper.insertClaimEligibilityData('ExtSchema', ref)
    .then(function (ids) {
      returnObject.eligibilityId = ids.eligibilityId
      returnObject.claimId = ids.claimId

      return knex('ExtSchema.Eligibility')
        .where('EligibilityId', returnObject.eligibilityId)
        .update({
          'DateCreated': dateCreated
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
  return knex(`ExtSchema.${tableName}`)
    .where('ClaimId', claimId)
    .del()
}

function eligibilityExists (value, collection) {
  var result = collection.filter(function (item) {
    return item.EligibilityId === value
  })

  return result.length > 0
}
