const { getDatabaseConnector } = require('../../../../app/databaseConnector')
const config = require('../../../../config')
const dateFormatter = require('../../../../app/services/date-formatter')
const testHelper = require('../../../test-helper')

const getOldClaimDocumentData = require('../../../../app/services/data/get-old-claim-document-data')

describe('services/data/get-old-claim-document-data', function () {
  const maxAgeInDays = parseInt(config.EXTERNAL_MAX_DAYS_BEFORE_DELETE_OLD_DATA)
  const reference1 = 'GETDOC1'
  const reference2 = 'GETDOC2'
  const reference3 = 'GETDOC3'
  const reference4 = 'GETDOC4'
  let claimId1
  let claimId2
  let claimId3
  let claimId4

  const dateThreshold = dateFormatter.now().subtract(maxAgeInDays, 'days').toDate()
  const olderThanMaxAge = dateFormatter.now().subtract(maxAgeInDays + 1, 'days').toDate()
  const lessThanMaxAge = dateFormatter.now().subtract(maxAgeInDays - 1, 'days').toDate()

  beforeAll(function () {
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
        const claimDocument1Found = claimDocumentsExist(claimId1, results)
        const claimDocument2Found = claimDocumentsExist(claimId2, results)

        expect(claimDocument1Found).toBe(true) //eslint-disable-line
        expect(claimDocument2Found).toBe(true) //eslint-disable-line
      })
  })

  it('should not retrieve claim records within the date threshold', function () {
    return getOldClaimDocumentData(dateThreshold)
      .then(function (results) {
        const claimDocument3Found = claimDocumentsExist(claimId3, results)
        const claimDocument4Found = claimDocumentsExist(claimId4, results)

        expect(claimDocument3Found).toBe(false) //eslint-disable-line
        expect(claimDocument4Found).toBe(false) //eslint-disable-line
      })
  })

  afterAll(function () {
    return Promise.all([
      testHelper.deleteAll(reference1, 'ExtSchema'),
      testHelper.deleteAll(reference2, 'ExtSchema'),
      testHelper.deleteAll(reference3, 'ExtSchema'),
      testHelper.deleteAll(reference4, 'ExtSchema')
    ])
  })
})

function createTestData (ref, dateSubmitted, deleteEligibility) {
  const returnObject = {}

  return testHelper.insertClaimEligibilityData('ExtSchema', ref)
    .then(function (ids) {
      const db = getDatabaseConnector()

      returnObject.eligibilityId = ids.eligibilityId
      returnObject.claimId = ids.claimId

      return db('ExtSchema.ClaimDocument')
        .where('ClaimId', returnObject.claimId)
        .update({
          DateSubmitted: dateSubmitted
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
  const db = getDatabaseConnector()

  return db(`ExtSchema.${tableName}`)
    .where('EligibilityId', eligibilityId)
    .del()
}

function claimDocumentsExist (value, collection) {
  const result = collection.filter(function (item) {
    return item.ClaimId === value
  })

  return result.length > 0
}
