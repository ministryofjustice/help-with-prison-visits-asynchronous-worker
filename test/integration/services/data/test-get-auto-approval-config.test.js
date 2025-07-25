const getAutoApprovalConfig = require('../../../../app/services/data/get-auto-approval-config')

const { getDatabaseConnector } = require('../../../../app/databaseConnector')
const config = require('../../../../config')
const dateFormatter = require('../../../../app/services/date-formatter')

let insertedIds

describe('services/data/get-auto-approval-config', () => {
  let existingAutoApprovalId

  beforeAll(() => {
    return getCurrentAutoApprovalConfigId().then(currentAutoApprovalConfigId => {
      if (currentAutoApprovalConfigId) {
        existingAutoApprovalId = currentAutoApprovalConfigId.AutoApprovalConfigId
        return setIsEnabled(existingAutoApprovalId, false)
      }
      return Promise.resolve()
    })
  })

  it('should return auto approval config defaults when no auto approval config data is found', () => {
    return getAutoApprovalConfig().then(result => {
      expect(result.AutoApprovalEnabled).toBe(config.AUTO_APPROVAL_ENABLED === 'true')
      expect(result.CostVariancePercentage).toBe(parseFloat(config.AUTO_APPROVAL_COST_VARIANCE))
      expect(result.MaxClaimTotal).toBe(parseFloat(config.AUTO_APPROVAL_MAX_CLAIM_TOTAL))
      expect(result.MaxDaysAfterAPVUVisit).toBe(parseInt(config.AUTO_APPROVAL_MAX_DAYS_AFTER_APVU_VISIT, 10))
      expect(result.MaxNumberOfClaimsPerYear).toBe(parseInt(config.AUTO_APPROVAL_MAX_CLAIMS_PER_YEAR, 10))
      expect(result.MaxNumberOfClaimsPerMonth).toBe(parseInt(config.AUTO_APPROVAL_MAX_CLAIMS_PER_MONTH, 10))
      expect(result.RulesDisabled).toBeNull()
      expect(result.CostPerMile).toBe(parseFloat(config.AUTO_APPROVAL_COST_PER_MILE))
      expect(result.CostPerMileEngWal).toBe(parseFloat(config.AUTO_APPROVAL_COST_PER_MILE_ENGWAL))
      expect(result.NumberOfConsecutiveAutoApprovals).toBe(
        parseFloat(config.AUTO_APPROVAL_NUMBER_OF_CONSECUTIVE_AUTO_APPROVALS),
      )
    })
  })

  it('should return the latest auto approval config record', () => {
    return insertTestData().then(() => {
      return getAutoApprovalConfig().then(result => {
        expect(result.Caseworker).toBe('caseworker1@test.com')
        expect(result.RulesDisabled).toEqual(['auto-approval-rule-1', 'auto-approval-rule-2', 'auto-approval-rule-3'])
        expect(result.IsEnabled).toBe(true)
      })
    })
  })

  afterAll(() => {
    const db = getDatabaseConnector()

    return db('IntSchema.AutoApprovalConfig')
      .whereIn('AutoApprovalConfigId', insertedIds)
      .del()
      .then(() => {
        if (existingAutoApprovalId) {
          return setIsEnabled(existingAutoApprovalId, true)
        }

        return Promise.resolve()
      })
  })
})

function insertTestData() {
  const db = getDatabaseConnector()

  return db('IntSchema.AutoApprovalConfig')
    .insert([
      {
        Caseworker: 'caseworker1@test.com',
        DateCreated: dateFormatter.now().toDate(),
        AutoApprovalEnabled: 'true',
        CostVariancePercentage: '5.00',
        MaxClaimTotal: '100.00',
        MaxDaysAfterAPVUVisit: '28',
        MaxNumberOfClaimsPerYear: '10',
        RulesDisabled: 'auto-approval-rule-1,auto-approval-rule-2,auto-approval-rule-3',
        CostPerMile: '0.13',
        IsEnabled: 'true',
      },
      {
        Caseworker: 'caseworker2@test.com',
        DateCreated: dateFormatter.now().subtract(1, 'day').toDate(),
        AutoApprovalEnabled: 'true',
        CostVariancePercentage: '5.00',
        MaxClaimTotal: '100.00',
        MaxDaysAfterAPVUVisit: '28',
        MaxNumberOfClaimsPerYear: '10',
        RulesDisabled: 'auto-approval-rule-1,auto-approval-rule-3',
        CostPerMile: '0.13',
        IsEnabled: 'false',
      },
    ])
    .returning('AutoApprovalConfigId')
    .then(result => {
      insertedIds = result.map(autoApproval => autoApproval.AutoApprovalConfigId)
    })
}

function setIsEnabled(autoApprovalConfigId, isEnabled) {
  const db = getDatabaseConnector()

  return db('IntSchema.AutoApprovalConfig').where('AutoApprovalConfigId', autoApprovalConfigId).update({
    IsEnabled: isEnabled,
  })
}

function getCurrentAutoApprovalConfigId() {
  const db = getDatabaseConnector()

  return db('IntSchema.AutoApprovalConfig').first().where('IsEnabled', true).select('AutoApprovalConfigId')
}
