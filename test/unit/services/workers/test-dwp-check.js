const expect = require('chai').expect
const proxyquire = require('proxyquire')
const sinon = require('sinon')
require('sinon-bluebird')

var visitorDwpBenefitCheckerData = {'data': '1234'}
var benefitCheckerResult = {'VisitorId': 1234, 'Result': 'YES'}

var getVisitorDwpBenefitCheckerData = sinon.stub().resolves(visitorDwpBenefitCheckerData)
var callDwpBenefitCheckerSoapService = sinon.stub().resolves(benefitCheckerResult)
var updateVisitorWithDwpBenefitCheckerResult = sinon.stub().resolves()

const dwpCheck = proxyquire('../../../../app/services/workers/dwp-check', {
  '../data/get-visitor-dwp-benefit-checker-data': getVisitorDwpBenefitCheckerData,
  '../benefit-checker/call-dwp-benefit-checker-soap-service': callDwpBenefitCheckerSoapService,
  '../data/update-visitor-with-dwp-benefit-checker-result': updateVisitorWithDwpBenefitCheckerResult
})

const reference = '1234567'
const claimId = 123

describe('services/workers/dwp-check', function () {
  it('should call to retrieve data then make benefit check call', function () {
    return dwpCheck.execute({
      reference: reference,
      claimId: claimId
    }).then(function () {
      expect(getVisitorDwpBenefitCheckerData.calledWith(reference, claimId)).to.be.true
      expect(callDwpBenefitCheckerSoapService.calledWith(visitorDwpBenefitCheckerData)).to.be.true
      expect(updateVisitorWithDwpBenefitCheckerResult.calledWith(benefitCheckerResult)).to.be.true
    })
  })
})
