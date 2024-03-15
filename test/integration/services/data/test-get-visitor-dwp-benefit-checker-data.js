const testHelper = require('../../../test-helper')
const moment = require('moment')

const getVisitorDwpBenefitCheckerData = require('../../../../app/services/data/get-visitor-dwp-benefit-checker-data')

describe('services/data/get-visitor-dwp-benefit-checker-data', function () {
  const reference = 'GETDWPV'
  let eligibilityId
  let claimId
  const claimData = testHelper.getClaimData(reference)

  beforeAll(function () {
    return testHelper.insertClaimEligibilityData('IntSchema', reference)
      .then(function (ids) {
        claimId = ids.claimId
        eligibilityId = ids.eligibilityId
      })
  })

  it('should return visitor DWP benefit checker data', function () {
    return getVisitorDwpBenefitCheckerData(reference, eligibilityId, claimId)
      .then(function (visitorDwpBenefitCheckerData) {
        const dobFormatted = moment(claimData.Visitor.DateOfBirth).format('YYYYMMDD')

        expect(visitorDwpBenefitCheckerData.nino).toBe(claimData.Visitor.NationalInsuranceNumber)
        expect(visitorDwpBenefitCheckerData.surname).toBe(claimData.Visitor.LastName.toUpperCase())
        expect(visitorDwpBenefitCheckerData.dateOfBirth).toBe(dobFormatted)
      });
  })

  afterAll(function () {
    return testHelper.deleteAll(reference, 'IntSchema')
  })
})
