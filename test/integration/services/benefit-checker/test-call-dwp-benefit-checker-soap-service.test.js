const config = require('../../../../config')

const callDwpBenefitCheckerSoapService = require('../../../../app/services/benefit-checker/call-dwp-benefit-checker-soap-service')

const visitorDwpBenefitCheckerData = { visitorId: 1234, surname: 'YELLOW', dateOfBirth: '19681210', nino: 'PW556356A' }

// NOTE: THIS TEST WILL FAIL IF CALLED FROM UNWHITELISTED IP AND DWP_BENEFIT_CHECKER_ENABLED true
describe('services/benefit-checker/call-dwp-benefit-checker-soap-service', () => {
  it('should return undetermined for test data', () => {
    const expectedResult = config.DWP_BENEFIT_CHECKER_ENABLED === 'true' ? 'UNDETERMINED' : 'NOT-RUN'

    return callDwpBenefitCheckerSoapService(visitorDwpBenefitCheckerData).then(benefitCheckerResult => {
      expect(benefitCheckerResult.visitorId).toBe(visitorDwpBenefitCheckerData.visitorId)
      expect(benefitCheckerResult.result).toBe(expectedResult)
    })
  })
})
