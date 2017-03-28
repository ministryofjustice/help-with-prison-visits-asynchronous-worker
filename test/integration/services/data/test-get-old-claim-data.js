const expect = require('chai').expect
const knexfile = require('../../../../knexfile').asyncworker
const knex = require('knex')(knexfile)
const config = require('../../../../config')
const dateFormatter = require('../../../../app/services/date-formatter')
const testHelper = require('../../../test-helper')

const getOldClaimData = require('../../../../app/services/data/get-old-claim-data')

describe('services/data/get-old-claim-data', function () {
  var maxAgeInDays = parseInt(config.EXTERNAL_MAX_DAYS_BEFORE_DELETE_OLD_DATA)
  var reference1 = 'GETCLAIM1'
  var reference2 = 'GETCLAIM2'
  var reference3 = 'GETCLAIM3'
  var reference4 = 'GETCLAIM4'
  var claimId1
  var claimId2
  var claimId3
  var claimId4

  var dateThreshold = dateFormatter.now().subtract(maxAgeInDays, 'days').toDate()
  var olderThanMaxAge = dateFormatter.now().subtract(maxAgeInDays + 1, 'days').toDate()
  var lessThanMaxAge = dateFormatter.now().subtract(maxAgeInDays - 1, 'days').toDate()

  before(function () {
    return Promise.all([
      // Old claim with eligibility
      createTestData(reference1, olderThanMaxAge, false)
        .then(function (ids) {
          claimId1 = ids.claimId
        }),
      // Old claim without eligibility
      createTestData(reference2, olderThanMaxAge, true)
        .then(function (ids) {
          claimId2 = ids.claimId
        }),
      // Newer claim with eligibility
      createTestData(reference3, lessThanMaxAge, false)
        .then(function (ids) {
          claimId3 = ids.claimId
        }),
      // Newer claim without eligibility
      createTestData(reference4, lessThanMaxAge, true)
        .then(function (ids) {
          claimId4 = ids.claimId
        })
    ])
  })

  it('should retrieve claim records past the date threshold', function () {
    return getOldClaimData(dateThreshold)
      .then(function (results) {
        var claim1Found = claimExists(claimId1, results)
        var claim2Found = claimExists(claimId2, results)

        expect(claim1Found).to.be.true
        expect(claim2Found).to.be.true
      })
  })

  it('should not retrieve claim records within the date threshold', function () {
    return getOldClaimData(dateThreshold)
      .then(function (results) {
        var claim3Found = claimExists(claimId3, results)
        var claim4Found = claimExists(claimId4, results)

        expect(claim3Found).to.be.false
        expect(claim4Found).to.be.false
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

function createTestData (ref, dateCreated, deleteEligibility) {
  var returnObject = {}

  return testHelper.insertClaimEligibilityData('ExtSchema', ref)
    .then(function (ids) {
      returnObject.eligibilityId = ids.eligibilityId
      returnObject.claimId = ids.claimId

      return knex('ExtSchema.Claim')
        .where('ClaimId', returnObject.claimId)
        .update({
          'DateCreated': dateCreated
        })
        .then(function () {
          if (deleteEligibility) {
            return Promise.all([
              deleteFromTable(returnObject.eligibilityId, 'Prisoner'),
              deleteFromTable(returnObject.eligibilityId, 'Visitor')
            ])
            .then(function () {
              return deleteFromTable(returnObject.eligibilityId, 'Eligibility')
            })
          }
        })
    })
    .then(function () {
      return returnObject
    })
}

function deleteFromTable (eligibilityId, tableName) {
  return knex(`ExtSchema.${tableName}`)
    .where('EligibilityId', eligibilityId)
    .del()
}

function claimExists (value, collection) {
  var result = collection.filter(function (item) {
    return item.ClaimId === value
  })

  return result.length > 0
}
