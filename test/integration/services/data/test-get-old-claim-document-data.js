const expect = require('chai').expect
const knexfile = require('../../../../knexfile').asyncworker
const knex = require('knex')(knexfile)
const config = require('../../../../config')
const moment = require('moment')
const testHelper = require('../../../test-helper')

const getOldClaimDocumentData = require('../../../../app/services/data/get-old-claim-document-data')

describe('services/data/get-old-claim-document-data', function () {
  var maxAgeInDays = parseInt(config.EXTERNAL_MAX_DAYS_BEFORE_DELETE_OLD_DATA)
  var reference1 = 'GETDOC1'
  var reference2 = 'GETDOC2'
  var reference3 = 'GETDOC3'
  var reference4 = 'GETDOC4'
  var claimId1
  var claimId2
  var claimId3
  var claimId4

  var dateThreshold = moment().subtract(maxAgeInDays, 'days').toDate()
  var olderThanMaxAge = moment().subtract(maxAgeInDays + 1, 'days').toDate()
  var lessThanMaxAge = moment().subtract(maxAgeInDays - 1, 'days').toDate()

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

  it('should retrieve claim document records past the date threshold', function () {
    return getOldClaimDocumentData(dateThreshold)
      .then(function (results) {
        var claimDocument1Found = claimDocumentsExist(claimId1, results)
        var claimDocument2Found = claimDocumentsExist(claimId2, results)

        expect(claimDocument1Found).to.be.true
        expect(claimDocument2Found).to.be.true
      })
  })

  it('should not retrieve claim records within the date threshold', function () {
    return getOldClaimDocumentData(dateThreshold)
      .then(function (results) {
        var claimDocument3Found = claimDocumentsExist(claimId3, results)
        var claimDocument4Found = claimDocumentsExist(claimId4, results)

        expect(claimDocument3Found).to.be.false
        expect(claimDocument4Found).to.be.false
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

function createTestData (ref, dateSubmitted, deleteEligibility) {
  var returnObject = {}

  return testHelper.insertClaimEligibilityData('ExtSchema', ref)
    .then(function (ids) {
      returnObject.eligibilityId = ids.eligibilityId
      returnObject.claimId = ids.claimId

      return knex('ExtSchema.ClaimDocument')
        .where('ClaimId', returnObject.claimId)
        .update({
          'DateSubmitted': dateSubmitted
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

function claimDocumentsExist (value, collection) {
  var result = collection.filter(function (item) {
    return item.ClaimId === value
  })

  return result.length > 0
}
