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

const mockAutoApprovalDataConstructor = jest.fn()
const mockGetDataForAutoApprovalCheck = jest.fn()
const mockGetAutoApprovalConfig = jest.fn()
const mockInsertClaimEvent = jest.fn()
const mockInsertTask = jest.fn()
const mockAutoApproveClaim = jest.fn()
const mockGetLastSetNumberOfClaimsStatus = jest.fn()
const mockInsertAutoApproveClaim = jest.fn()
const mockGetClaimsPendingPayment = jest.fn()
const mockAutoApprovalDependencies = []
const mockValidCheckResult = jest.fn()

autoApprovalRulesEnum.forEach(check => {
  mockAutoApprovalDependencies[check] = jest.fn()
})

let autoApprovalProcess

describe('services/auto-approval/checks/auto-approval-process', () => {
  beforeEach(() => {
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
      NumberOfConsecutiveAutoApprovals: 4,
    }

    mockAutoApprovalDataConstructor.mockReturnValue(validAutoApprovalData)
    mockGetDataForAutoApprovalCheck.mockResolvedValue(validAutoApprovalData)
    mockGetAutoApprovalConfig.mockResolvedValue(validAutoApprovalConfig)
    mockInsertClaimEvent.mockResolvedValue()
    mockInsertTask.mockResolvedValue()
    mockAutoApproveClaim.mockResolvedValue()
    mockGetLastSetNumberOfClaimsStatus.mockResolvedValue([])
    mockInsertAutoApproveClaim.mockResolvedValue()
    mockValidCheckResult.mockReturnValue(validCheckResult)

    autoApprovalRulesEnum.forEach(check => {
      mockAutoApprovalDependencies[check].mockReturnValue(validCheckResult)
    })

    jest.mock('../../../../config', () => ({ AUTO_APPROVAL_ENABLED: 'true' }))
    jest.mock(
      '../../../../app/services/auto-approval/auto-approval-data-constructor',
      () => mockAutoApprovalDataConstructor,
    )
    jest.mock('../../../../app/services/data/get-claims-pending-payment', () => mockGetClaimsPendingPayment)
    jest.mock('../../../../app/services/data/get-data-for-auto-approval-check', () => mockGetDataForAutoApprovalCheck)
    jest.mock('../../../../app/services/data/get-auto-approval-config', () => mockGetAutoApprovalConfig)
    jest.mock('../../../../app/services/data/auto-approve-claim', () => mockAutoApproveClaim)
    jest.mock('../../../../app/services/data/insert-claim-event', () => mockInsertClaimEvent)
    jest.mock('../../../../app/services/data/insert-task', () => mockInsertTask)
    jest.mock(
      '../../../../app/services/data/get-last-set-number-of-claims-status',
      () => mockGetLastSetNumberOfClaimsStatus,
    )
    jest.mock('../../../../app/services/data/insert-auto-approve-claim', () => mockInsertAutoApproveClaim)

    autoApprovalRulesEnum.forEach(check => {
      const mockAutoApprovalDependency = mockAutoApprovalDependencies[check]
      jest.mock(`../../../../app/services/auto-approval/checks/${check}`, () => mockAutoApprovalDependency)
    })

    autoApprovalProcess = require('../../../../app/services/auto-approval/auto-approval-process')
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  it('should not execute auto approval process if AutoApprovalEnabled is set to false', () => {
    mockGetAutoApprovalConfig.mockResolvedValue({ AutoApprovalEnabled: false })

    return autoApprovalProcess(REFERENCE, ELIGIBILITY_ID, CLAIM_ID).then(result => {
      expect(result).toBe(null)
      expect(mockGetAutoApprovalConfig).toHaveBeenCalledTimes(1)
      expect(mockGetDataForAutoApprovalCheck).not.toHaveBeenCalled()
      expect(mockAutoApproveClaim).not.toHaveBeenCalled()
    })
  })

  it('should return claimApproved false for FIRST_TIME claim', () => {
    const firstTimeData = { Claim: { ClaimType: claimTypeEnum.FIRST_TIME } }
    mockGetDataForAutoApprovalCheck.mockResolvedValue(firstTimeData)

    return autoApprovalProcess(REFERENCE, ELIGIBILITY_ID, CLAIM_ID).then(result => {
      expect(result.claimApproved).toBe(false)
    })
  })

  it('should return claimApproved false for REPEAT_NEW_ELIGIBILITY claim', () => {
    const firstTimeData = { Claim: { ClaimType: claimTypeEnum.REPEAT_NEW_ELIGIBILITY } }
    mockGetDataForAutoApprovalCheck.mockResolvedValue(firstTimeData)

    return autoApprovalProcess(REFERENCE, ELIGIBILITY_ID, CLAIM_ID).then(result => {
      expect(result.claimApproved).toBe(false)
    })
  })

  it('should return claimApproved false for claims with status not equal to NEW', () => {
    const pendingClaimData = { Claim: { Status: statusEnum.PENDING } }
    mockGetDataForAutoApprovalCheck.mockResolvedValue(pendingClaimData)

    return autoApprovalProcess(REFERENCE, ELIGIBILITY_ID, CLAIM_ID).then(result => {
      expect(result.claimApproved).toBe(false)
    })
  })

  it('should return claimApproved true for NEW claims and those that are less than number of consecutive auto approvals', () => {
    mockGetDataForAutoApprovalCheck.mockResolvedValue(validAutoApprovalData)

    const expectedResult = true
    return autoApprovalProcess(REFERENCE, ELIGIBILITY_ID, CLAIM_ID).then(result => {
      expect(result.claimApproved).toEqual(expectedResult)
    })
  })

  it('should return claimApproved false for NEW claims and those that exceed consecutive auto approvals limit', () => {
    const newClaimData = validAutoApprovalData
    newClaimData.Claim = { Status: statusEnum.NEW }
    mockGetDataForAutoApprovalCheck.mockResolvedValue(newClaimData)
    mockGetLastSetNumberOfClaimsStatus.mockResolvedValue([
      { Status: statusEnum.AUTOAPPROVED },
      { Status: statusEnum.AUTOAPPROVED },
      { Status: statusEnum.AUTOAPPROVED },
      { Status: statusEnum.AUTOAPPROVED },
    ])

    return autoApprovalProcess(REFERENCE, ELIGIBILITY_ID, CLAIM_ID).then(result => {
      expect(result.claimApproved).toBe(false)
    })
  })

  it('should return claimApproved false for Advance claim', () => {
    const advanceClaimData = validAutoApprovalData
    advanceClaimData.Claim = {
      ClaimType: claimTypeEnum.REPEAT_CLAIM,
      Status: statusEnum.NEW,
      IsAdvanceClaim: true,
    }
    mockAutoApprovalDependencies['is-visit-in-past'].mockReturnValue(invalidCheckResult)
    mockGetDataForAutoApprovalCheck.mockResolvedValue(advanceClaimData)

    return autoApprovalProcess(REFERENCE, ELIGIBILITY_ID, CLAIM_ID).then(result => {
      expect(result.claimApproved).toBe(false)
    })
  })

  it('should call all relevant functions to retrieve auto approval data and perform checks', () => {
    return autoApprovalProcess(REFERENCE, ELIGIBILITY_ID, CLAIM_ID).then(result => {
      expect(result.claimApproved).toBe(true)
      expect(mockGetDataForAutoApprovalCheck).toHaveBeenCalledTimes(1)
      const now = dateFormatter.now().toDate()
      const isInOfficeHours = now.getDay() < 5 && now.getHours() >= 10 && now.getHours() < 17
      if (isInOfficeHours) {
        expect(mockAutoApproveClaim).toHaveBeenCalledTimes(1)
      } else {
        expect(mockInsertAutoApproveClaim).toHaveBeenCalledTimes(1)
      }
      const keys = Object.keys(mockAutoApprovalDependencies)
      for (let i = 0; i < keys.length; i += 1) {
        const key = keys[i]
        // skip check for getDataForAutoApproval, this is done above
        if (key.indexOf('/checks/') >= 0) {
          expect(mockAutoApprovalDependencies[key]).toHaveBeenCalled()
        }
      }
    })
  })

  it('should call all relevant functions to retrieve auto approval data and perform checks for invalid claim', () => {
    const inmockAutoApprovalDependencies = mockAutoApprovalDependencies
    const keys = Object.keys(inmockAutoApprovalDependencies)

    for (let i = 0; i < keys.length; i += 1) {
      const key = keys[i]
      // Ignore mocked data functions and only set some auto approval checks to true
      if (!(key.indexOf('data') > -1 || i % 2 === 0)) {
        inmockAutoApprovalDependencies[key].mockReturnValue(invalidCheckResult)
      }
    }

    return autoApprovalProcess(REFERENCE, ELIGIBILITY_ID, CLAIM_ID).then(result => {
      expect(result.claimApproved).toBe(false)
      expect(mockGetDataForAutoApprovalCheck).toHaveBeenCalledTimes(1)
      expect(mockInsertClaimEvent).toHaveBeenCalledTimes(1)
      const mockAADepKeys = Object.keys(mockAutoApprovalDependencies)
      for (let i = 0; i < mockAADepKeys.length; i += 1) {
        const key = mockAADepKeys[i]
        // skip check for getDataForAutoApproval, this is done above
        if (key.indexOf('/checks/') >= 0) {
          expect(mockAutoApprovalDependencies[key]).toHaveBeenCalledTimes(1)
        }
      }
    })
  })

  autoApprovalRulesEnum.forEach(check => {
    it(`should not perform ${check} check when it is disabled`, () => {
      validAutoApprovalConfig.RulesDisabled = [`${check}`]
      mockGetAutoApprovalConfig.mockResolvedValue(validAutoApprovalConfig)
      return autoApprovalProcess(REFERENCE, ELIGIBILITY_ID, CLAIM_ID).then(result => {
        expect(result.claimApproved).toBe(true)
        expect(mockGetDataForAutoApprovalCheck).toHaveBeenCalledTimes(1)
        const now = dateFormatter.now().toDate()
        const isInOfficeHours = now.getDay() < 5 && now.getHours() >= 10 && now.getHours() < 17
        if (isInOfficeHours) {
          expect(mockAutoApproveClaim).toHaveBeenCalledTimes(1)
        } else {
          expect(mockInsertAutoApproveClaim).toHaveBeenCalledTimes(1)
        }
        expect(mockAutoApprovalDependencies[check]).not.toHaveBeenCalled()
      })
    })
  })
})
