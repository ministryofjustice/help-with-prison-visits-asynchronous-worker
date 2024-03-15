const proxyquire = require('proxyquire')
const claimTypeEnum = require('../../../../app/constants/claim-type-enum')
const statusEnum = require('../../../../app/constants/status-enum')
const autoApprovalRulesEnum = require('../../../../app/constants/auto-approval-rules-enum')
const dateFormatter = require('../../../../app/services/date-formatter')

const testHelper = require('../../../test-helper')
const AutoApprovalCheckResult = require('../../../../app/services/domain/auto-approval-check-result')

const REFERENCE = 'AUTOAPP'
const ELIGIBILITY_ID = 1234
const CLAIM_ID = 4321

const validAutoApprovalData = testHelper.getAutoApprovalData(REFERENCE)
const validCheckResult = new AutoApprovalCheckResult('', true, '')
const invalidCheckResult = new AutoApprovalCheckResult('', false, '')
let validAutoApprovalConfig

let autoApprovalDataConstructorStub
let getDataForAutoApprovalCheckStub
let insertClaimEventStub
let getAutoApprovalConfigStub
let insertTaskStub
let autoApproveClaimStub
let autoApprovalDependencies
let getLastSetNumberOfClaimsStatusStub
let insertAutoApproveClaimStub

let autoApprovalProcess

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
      MaxNumberOfClaimsPerMonth: 3,
      RulesDisabled: null,
      IsEnabled: true,
      NumberOfConsecutiveAutoApprovals: 4
    }

    autoApprovalDataConstructorStub = jest.fn().mockReturnValue(validAutoApprovalData)
    getDataForAutoApprovalCheckStub = jest.fn().mockResolvedValue(validAutoApprovalData)
    getAutoApprovalConfigStub = jest.fn().mockResolvedValue(validAutoApprovalConfig)
    insertClaimEventStub = jest.fn().mockResolvedValue()
    insertTaskStub = jest.fn().mockResolvedValue()
    autoApproveClaimStub = jest.fn().mockResolvedValue()
    getLastSetNumberOfClaimsStatusStub = jest.fn().mockResolvedValue([])
    insertAutoApproveClaimStub = jest.fn().mockResolvedValue()

    autoApprovalDependencies = {
      '../../../config': { AUTO_APPROVAL_ENABLED: 'true' },
      './auto-approval-data-constructor': autoApprovalDataConstructorStub,
      '../data/get-data-for-auto-approval-check': getDataForAutoApprovalCheckStub,
      '../data/get-auto-approval-config': getAutoApprovalConfigStub,
      '../data/auto-approve-claim': autoApproveClaimStub,
      '../data/insert-claim-event': insertClaimEventStub,
      '../data/insert-task': insertTaskStub,
      '../data/get-last-set-number-of-claims-status': getLastSetNumberOfClaimsStatusStub,
      '../data/insert-auto-approve-claim': insertAutoApproveClaimStub
    }

    autoApprovalRulesEnum.forEach(function (check) {
      autoApprovalDependencies[`./checks/${check}`] = jest.fn().mockReturnValue(validCheckResult)
    })

    autoApprovalProcess = proxyquire('../../../../app/services/auto-approval/auto-approval-process', autoApprovalDependencies)
  })

  it('should not execute auto approval process if AutoApprovalEnabled is set to false', function () {
    getAutoApprovalConfigStub.resolves({ AutoApprovalEnabled: false })

    return autoApprovalProcess(REFERENCE, ELIGIBILITY_ID, CLAIM_ID)
      .then(function (result) {
        expect(result).to.be.null //eslint-disable-line
        expect(getAutoApprovalConfigStub).toHaveBeenCalledTimes(1)
        expect(getDataForAutoApprovalCheckStub).not.toHaveBeenCalled()
        expect(autoApproveClaimStub).not.toHaveBeenCalled()
      })
  })

  it('should return claimApproved false for FIRST_TIME claim', function () {
    const firstTimeData = { Claim: { ClaimType: claimTypeEnum.FIRST_TIME } }
    getDataForAutoApprovalCheckStub.resolves(firstTimeData)

    return autoApprovalProcess(REFERENCE, ELIGIBILITY_ID, CLAIM_ID)
      .then(function (result) {
        expect(result.claimApproved, 'should reject FIRST_TIME claims for auto-approval').to.be.false //eslint-disable-line
      })
  })

  it('should return claimApproved false for REPEAT_NEW_ELIGIBILITY claim', function () {
    const firstTimeData = { Claim: { ClaimType: claimTypeEnum.REPEAT_NEW_ELIGIBILITY } }
    getDataForAutoApprovalCheckStub.resolves(firstTimeData)

    return autoApprovalProcess(REFERENCE, ELIGIBILITY_ID, CLAIM_ID)
      .then(function (result) {
        expect(result.claimApproved, 'should reject REPEAT_NEW_ELIGIBILITY claims for auto-approval').to.be.false //eslint-disable-line
      })
  })

  it('should return claimApproved false for claims with status not equal to NEW', function () {
    const pendingClaimData = { Claim: { Status: statusEnum.PENDING } }
    getDataForAutoApprovalCheckStub.resolves(pendingClaimData)

    return autoApprovalProcess(REFERENCE, ELIGIBILITY_ID, CLAIM_ID)
      .then(function (result) {
        expect(result.claimApproved, 'should reject claims with status other than NEW').to.be.false //eslint-disable-line
      })
  })

  it('should return claimApproved true for NEW claims and those that are less than number of consecutive auto approvals', function () {
    const newClaimData = validAutoApprovalData
    newClaimData.Claim = { Status: statusEnum.NEW }
    getDataForAutoApprovalCheckStub.resolves(newClaimData)
    const expectedResult = true
    return autoApprovalProcess(REFERENCE, ELIGIBILITY_ID, CLAIM_ID)
      .then(function (result) {
        expect(result.claimApproved, 'should auto approve NEW claims').to.be.eql(expectedResult)
      })
  })

  it('should return claimApproved false for NEW claims and those that exceed consecutive auto approvals limit', function () {
    const newClaimData = validAutoApprovalData
    newClaimData.Claim = { Status: statusEnum.NEW }
    getDataForAutoApprovalCheckStub.resolves(newClaimData)
    getLastSetNumberOfClaimsStatusStub.resolves([{ Status: statusEnum.AUTOAPPROVED }, { Status: statusEnum.AUTOAPPROVED }, { Status: statusEnum.AUTOAPPROVED }, { Status: statusEnum.AUTOAPPROVED }])

    return autoApprovalProcess(REFERENCE, ELIGIBILITY_ID, CLAIM_ID)
      .then(function (result) {
        expect(result.claimApproved, 'should reject claims with more than number of auto approvals').to.be.false //eslint-disable-line
      })
  })

  it('should return claimApproved false for Advance claim', function () {
    const advanceClaimData = validAutoApprovalData
    advanceClaimData.Claim = {
      ClaimType: claimTypeEnum.REPEAT_CLAIM,
      Status: statusEnum.NEW,
      IsAdvanceClaim: true
    }
    autoApprovalDependencies['./checks/is-visit-in-past'].returns(invalidCheckResult)
    getDataForAutoApprovalCheckStub.resolves(advanceClaimData)

    return autoApprovalProcess(REFERENCE, ELIGIBILITY_ID, CLAIM_ID)
      .then(function (result) {
        expect(result.claimApproved, 'should reject Advance claims for auto-approval').to.be.false //eslint-disable-line
      })
  })

  it('should call all relevant functions to retrieve auto approval data and perform checks', function () {
    return autoApprovalProcess(REFERENCE, ELIGIBILITY_ID, CLAIM_ID)
      .then(function (result) {
        expect(result.claimApproved).to.be.true //eslint-disable-line
        expect(getDataForAutoApprovalCheckStub).toHaveBeenCalledTimes(1)
        const now = dateFormatter.now().toDate()
        const isInOfficeHours = now.getDay() < 5 && now.getHours() >= 10 && now.getHours() < 17
        if (isInOfficeHours) {
          expect(autoApproveClaimStub).toHaveBeenCalledTimes(1)
        } else {
          expect(insertAutoApproveClaimStub).toHaveBeenCalledTimes(1)
        }
        const keys = Object.keys(autoApprovalDependencies)
        for (let i = 0; i < keys.length; i++) {
          const key = keys[i]
          // skip check for getDataForAutoApproval, this is done above
          if (key.indexOf('/checks/') < 0) continue
          expect(autoApprovalDependencies[key]).toHaveBeenCalled()
        }
      })
  })

  it('should call all relevant functions to retrieve auto approval data and perform checks for invalid claim', function () {
    const inautoApprovalDependencies = autoApprovalDependencies
    const keys = Object.keys(inautoApprovalDependencies)

    for (let i = 0; i < keys.length; i++) {
      const key = keys[i]
      // Ignore mocked data functions and only set some auto approval checks to true
      if (key.indexOf('data') > -1 || i % 2 === 0) {
        continue
      } else {
        inautoApprovalDependencies[key].returns(invalidCheckResult)
      }
    }

    return autoApprovalProcess(REFERENCE, ELIGIBILITY_ID, CLAIM_ID)
      .then(function (result) {
        expect(result.claimApproved).to.be.false //eslint-disable-line
        expect(getDataForAutoApprovalCheckStub).toHaveBeenCalledTimes(1)
        expect(insertClaimEventStub).toHaveBeenCalledTimes(1)
        const keys = Object.keys(autoApprovalDependencies)
        for (let i = 0; i < keys.length; i++) {
          const key = keys[i]
          // skip check for getDataForAutoApproval, this is done above
          if (key.indexOf('/checks/') < 0) continue
          expect(autoApprovalDependencies[key]).toHaveBeenCalledTimes(1)
        }
      })
  })

  autoApprovalRulesEnum.forEach(function (check) {
    it(`should not perform ${check} check when it is disabled`, function () {
      validAutoApprovalConfig.RulesDisabled = [`${check}`]
      getAutoApprovalConfigStub.resolves(validAutoApprovalConfig)
      return autoApprovalProcess(REFERENCE, ELIGIBILITY_ID, CLAIM_ID)
        .then(function (result) {
          expect(result.claimApproved).to.be.true //eslint-disable-line
          expect(getDataForAutoApprovalCheckStub).toHaveBeenCalledTimes(1)
          const now = dateFormatter.now().toDate()
          const isInOfficeHours = now.getDay() < 5 && now.getHours() >= 10 && now.getHours() < 17
          if (isInOfficeHours) {
            expect(autoApproveClaimStub).toHaveBeenCalledTimes(1)
          } else {
            expect(insertAutoApproveClaimStub).toHaveBeenCalledTimes(1)
          }
          expect(autoApprovalDependencies[`./checks/${check}`]).not.toHaveBeenCalled()
        })
    })
  })
})
