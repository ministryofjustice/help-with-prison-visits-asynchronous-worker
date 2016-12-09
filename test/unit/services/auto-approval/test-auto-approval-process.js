const expect = require('chai').expect
const sinon = require('sinon')
require('sinon-bluebird')
const proxyquire = require('proxyquire')
const claimTypeEnum = require('../../../../app/constants/claim-type-enum')
const statusEnum = require('../../../../app/constants/status-enum')
const autoApprovalRulesEnum = require('../../../../app/constants/auto-approval-rules-enum')

const testHelper = require('../../../test-helper')
const AutoApprovalCheckResult = require('../../../../app/services/domain/auto-approval-check-result')

const REFERENCE = 'AUTOAPP'
const ELIGIBILITY_ID = 1234
const CLAIM_ID = 4321

var validAutoApprovalData = testHelper.getAutoApprovalData(REFERENCE)
var validCheckResult = new AutoApprovalCheckResult('', true, '')
var invalidCheckResult = new AutoApprovalCheckResult('', false, '')
var validAutoApprovalConfig

var autoApprovalDataConstructorStub
var getDataForAutoApprovalCheckStub
var getAutoApprovalConfigStub
var insertClaimEventDataStub
var insertTaskStub
var autoApproveClaimStub
var autoApprovalDependencies

var autoApprovalProcess

describe('services/auto-approval/checks/auto-approval-process', function () {
  beforeEach(function () {
    validAutoApprovalConfig = {
      AutoApprovalConfigId: 39,
      Caseworker: 'caseworker1@test.com',
      DateCreated: '2016-12-08T12:17:58.260Z',
      AutoApprovalEnabled: true,
      CostVariancePercentage: 5,
      MaxClaimTotal: 100,
      MaxDaysAfterAPVUVisit: 28,
      MaxNumberOfClaimsPerYear: 10,
      RulesDisabled: null,
      IsEnabled: true
    }

    autoApprovalDataConstructorStub = sinon.stub().returns(validAutoApprovalData)
    getDataForAutoApprovalCheckStub = sinon.stub().resolves(validAutoApprovalData)
    getAutoApprovalConfigStub = sinon.stub().resolves(validAutoApprovalConfig)
    insertClaimEventDataStub = sinon.stub().resolves()
    insertTaskStub = sinon.stub().resolves()
    autoApproveClaimStub = sinon.stub().resolves()

    autoApprovalDependencies = {
      '../../../config': { AUTO_APPROVAL_ENABLED: 'true' },
      './auto-approval-data-constructor': autoApprovalDataConstructorStub,
      '../data/get-data-for-auto-approval-check': getDataForAutoApprovalCheckStub,
      '../data/get-auto-approval-config': getAutoApprovalConfigStub,
      '../data/auto-approve-claim': autoApproveClaimStub,
      '../data/insert-claim-event-data': insertClaimEventDataStub,
      '../data/insert-task': insertTaskStub
    }

    autoApprovalRulesEnum.forEach(function (check) {
      autoApprovalDependencies[`./checks/${check}`] = sinon.stub().returns(validCheckResult)
    })

    autoApprovalProcess = proxyquire('../../../../app/services/auto-approval/auto-approval-process', autoApprovalDependencies)
  })

  it('should not execute auto approval process if AutoApprovalEnabled is set to false', function () {
    getAutoApprovalConfigStub.resolves({AutoApprovalEnabled: false})

    return autoApprovalProcess(REFERENCE, ELIGIBILITY_ID, CLAIM_ID)
      .then(function (result) {
        expect(result).to.be.null
        sinon.assert.calledOnce(getAutoApprovalConfigStub)
        sinon.assert.notCalled(getDataForAutoApprovalCheckStub)
        sinon.assert.notCalled(autoApproveClaimStub)
      })
  })

  it('should return claimApproved false for FIRST_TIME claim', function () {
    var firstTimeData = {Claim: {ClaimType: claimTypeEnum.FIRST_TIME}}
    getDataForAutoApprovalCheckStub.resolves(firstTimeData)

    return autoApprovalProcess(REFERENCE, ELIGIBILITY_ID, CLAIM_ID)
      .then(function (result) {
        expect(result.claimApproved, 'should reject FIRST_TIME claims for auto-approval').to.be.false
      })
  })

  it('should return claimApproved false for claim with status not equal to NEW', function () {
    var pendingClaimData = {Claim: {Status: statusEnum.PENDING}}
    getDataForAutoApprovalCheckStub.resolves(pendingClaimData)

    return autoApprovalProcess(REFERENCE, ELIGIBILITY_ID, CLAIM_ID)
      .then(function (result) {
        expect(result.claimApproved, 'should reject claims with status other than NEW').to.be.false
      })
  })

  it('should return claimApproved true for NEW claims', function () {
    var newClaimData = validAutoApprovalData
    newClaimData.Claim = { Status: statusEnum.NEW }
    getDataForAutoApprovalCheckStub.resolves(newClaimData)

    return autoApprovalProcess(REFERENCE, ELIGIBILITY_ID, CLAIM_ID)
      .then(function (result) {
        expect(result.claimApproved, 'should auto approve NEW claims').to.be.true
      })
  })

  it('should return claimApproved false for Advance claim', function () {
    var advanceClaimData = validAutoApprovalData
    advanceClaimData.Claim = {
      ClaimType: claimTypeEnum.REPEAT_CLAIM,
      Status: statusEnum.NEW,
      IsAdvanceClaim: true
    }
    autoApprovalDependencies['./checks/is-visit-in-past'].returns(invalidCheckResult)
    getDataForAutoApprovalCheckStub.resolves(advanceClaimData)

    return autoApprovalProcess(REFERENCE, ELIGIBILITY_ID, CLAIM_ID)
      .then(function (result) {
        expect(result.claimApproved, 'should reject Advance claims for auto-approval').to.be.false
      })
  })

  it('should call all relevant functions to retrieve auto approval data and perform checks', function () {
    return autoApprovalProcess(REFERENCE, ELIGIBILITY_ID, CLAIM_ID)
      .then(function (result) {
        expect(result.claimApproved).to.be.true
        sinon.assert.calledOnce(getDataForAutoApprovalCheckStub)
        sinon.assert.calledOnce(autoApproveClaimStub)
        var keys = Object.keys(autoApprovalDependencies)
        for (var i = 0; i < keys.length; i++) {
          var key = keys[i]
          // skip check for getDataForAutoApproval, this is done above
          if (key.indexOf('/checks/') < 0) continue
          sinon.assert.called(autoApprovalDependencies[key])
        }
      })
  })

  it('should call all relevant functions to retrieve auto approval data and perform checks for invalid claim', function () {
    var inautoApprovalDependencies = autoApprovalDependencies
    var keys = Object.keys(inautoApprovalDependencies)

    for (var i = 0; i < keys.length; i++) {
      var key = keys[i]
      // Ignore mocked data functions and only set some auto approval checks to true
      if (key.indexOf('data') > -1 || i % 2 === 0) {
        continue
      } else {
        inautoApprovalDependencies[key].returns(invalidCheckResult)
      }
    }

    return autoApprovalProcess(REFERENCE, ELIGIBILITY_ID, CLAIM_ID)
      .then(function (result) {
        expect(result.claimApproved).to.be.false
        sinon.assert.calledOnce(getDataForAutoApprovalCheckStub)
        sinon.assert.calledOnce(insertClaimEventDataStub)
        var keys = Object.keys(autoApprovalDependencies)
        for (var i = 0; i < keys.length; i++) {
          var key = keys[i]
          // skip check for getDataForAutoApproval, this is done above
          if (key.indexOf('/checks/') < 0) continue
          sinon.assert.calledOnce(autoApprovalDependencies[key])
        }
      })
  })

  autoApprovalRulesEnum.forEach(function (check) {
    it(`should not perform ${check} check when it is disabled`, function () {
      validAutoApprovalConfig.RulesDisabled = [`${check}`]
      getAutoApprovalConfigStub.resolves(validAutoApprovalConfig)
      return autoApprovalProcess(REFERENCE, ELIGIBILITY_ID, CLAIM_ID)
        .then(function (result) {
          expect(result.claimApproved).to.be.true
          sinon.assert.calledOnce(getDataForAutoApprovalCheckStub)
          sinon.assert.calledOnce(autoApproveClaimStub)
          sinon.assert.notCalled(autoApprovalDependencies[`./checks/${check}`])
        })
    })
  })
})
