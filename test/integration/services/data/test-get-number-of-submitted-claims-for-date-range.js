const expect = require('chai').expect
const { getDatabaseConnector } = require('../../../../app/databaseConnector')
const testHelper = require('../../../test-helper')

const getNumberOfSubmittedClaimsForDateRange = require('../../../../app/services/data/get-number-of-submitted-claims-for-date-range')

const REFERENCE = 'GETNUMC'
const START_DATE = new Date('1930-12-08')
const END_DATE = new Date('1930-12-08 23:59')

describe('services/data/get-number-of-submitted-claims-for-date-range', function () {
  before(function () {
    const claim1 = testHelper.getClaimData(REFERENCE).Claim
    claim1.DateSubmitted = new Date('1930-12-08 10:00')

    const claim2 = testHelper.getClaimData(REFERENCE).Claim
    claim2.ClaimId = claim1.ClaimId + 1
    claim2.DateSubmitted = new Date('1930-12-08 23:00')

    const claim3 = testHelper.getClaimData(REFERENCE).Claim
    claim3.ClaimId = claim1.ClaimId + 2
    claim3.DateSubmitted = new Date('1930-12-07 20:00')

    const db = getDatabaseConnector()

    return Promise.all([db('IntSchema.Claim').insert(claim1),
      db('IntSchema.Claim').insert(claim2),
      db('IntSchema.Claim').insert(claim3)])
  })

  it('should return number of claims submitted', function () {
    return getNumberOfSubmittedClaimsForDateRange(START_DATE, END_DATE)
      .then(function (submittedClaimCount) {
        expect(submittedClaimCount).to.equal(2)
      })
  })

  it('should return zero when no claims', function () {
    const noClaimsStartDate = new Date('1900-01-01')
    const noClaimsEndDate = new Date('1900-01-01 23:59')

    return getNumberOfSubmittedClaimsForDateRange(noClaimsStartDate, noClaimsEndDate)
      .then(function (submittedClaimCount) {
        expect(submittedClaimCount).to.equal(0)
      })
  })

  after(function () {
    return testHelper.deleteAll(REFERENCE, 'IntSchema')
  })
})
