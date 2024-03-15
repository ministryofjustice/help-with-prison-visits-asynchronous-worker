const getAutoApprovalConfig = require('../../../../app/services/data/get-auto-approval-config')

const { getDatabaseConnector } = require('../../../../app/databaseConnector')
const config = require('../../../../config')
const dateFormatter = require('../../../../app/services/date-formatter')

let insertedIds

describe('services/data/get-auto-approval-config', function () {
  let existingAutoApprovalId

  beforeAll(function () {
    return getCurrentAutoApprovalConfigId()
      .then(function (currentAutoApprovalConfigId) {
        if (currentAutoApprovalConfigId) {
          existingAutoApprovalId = currentAutoApprovalConfigId.AutoApprovalConfigId
          return setIsEnabled(existingAutoApprovalId, false)
        } else {
          return Promise.resolve()
        }
      })
  })

  it('should return auto approval config defaults when no auto approval config data is found', function () {
    return getAutoApprovalConfig()
      .then(function (result) {
        expect(result.AutoApprovalEnabled).toBe(config.AUTO_APPROVAL_ENABLED === 'true')
        expect(result.CostVariancePercentage).toBe(parseFloat(config.AUTO_APPROVAL_COST_VARIANCE))
        expect(result.MaxClaimTotal).toBe(parseFloat(config.AUTO_APPROVAL_MAX_CLAIM_TOTAL))
        expect(result.MaxDaysAfterAPVUVisit).toBe(parseInt(config.AUTO_APPROVAL_MAX_DAYS_AFTER_APVU_VISIT))
        expect(result.MaxNumberOfClaimsPerYear).toBe(parseInt(config.AUTO_APPROVAL_MAX_CLAIMS_PER_YEAR))
        expect(result.MaxNumberOfClaimsPerMonth).toBe(parseInt(config.AUTO_APPROVAL_MAX_CLAIMS_PER_MONTH))
        expect(result.RulesDisabled).toBeNull() //eslint-disable-line
        expect(result.CostPerMile).toBe(parseFloat(config.AUTO_APPROVAL_COST_PER_MILE))
        expect(result.NumberOfConsecutiveAutoApprovals).toBe(parseFloat(config.AUTO_APPROVAL_NUMBER_OF_CONSECUTIVE_AUTO_APPROVALS))
      });
  })

  it('should return the latest auto approval config record', function () {
    return insertTestData()
      .then(function () {
        return getAutoApprovalConfig()
          .then(function (result) {
            expect(result.Caseworker).toBe('caseworker1@test.com')
            expect(result.RulesDisabled).toEqual(['auto-approval-rule-1', 'auto-approval-rule-2', 'auto-approval-rule-3'])
            expect(result.IsEnabled).toBe(true)
          });
      });
  })

  afterAll(function () {
    const db = getDatabaseConnector()

    return db('IntSchema.AutoApprovalConfig')
      .whereIn('AutoApprovalConfigId', insertedIds)
      .del()
      .then(function () {
        if (existingAutoApprovalId) {
          return setIsEnabled(existingAutoApprovalId, true)
        }
      })
  })
})

function insertTestData () {
  const db = getDatabaseConnector()

  return db('IntSchema.AutoApprovalConfig')
    .insert([{
      Caseworker: 'caseworker1@test.com',
      DateCreated: dateFormatter.now().toDate(),
      AutoApprovalEnabled: 'true',
      CostVariancePercentage: '5.00',
      MaxClaimTotal: '100.00',
      MaxDaysAfterAPVUVisit: '28',
      MaxNumberOfClaimsPerYear: '10',
      RulesDisabled: 'auto-approval-rule-1,auto-approval-rule-2,auto-approval-rule-3',
      CostPerMile: '0.13',
      IsEnabled: 'true'
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
      IsEnabled: 'false'
    }])
    .returning('AutoApprovalConfigId')
    .then(function (result) {
      insertedIds = result.map(autoApproval => autoApproval.AutoApprovalConfigId)
    })
}

function setIsEnabled (autoApprovalConfigId, isEnabled) {
  const db = getDatabaseConnector()

  return db('IntSchema.AutoApprovalConfig')
    .where('AutoApprovalConfigId', autoApprovalConfigId)
    .update({
      IsEnabled: isEnabled
    })
}

function getCurrentAutoApprovalConfigId () {
  const db = getDatabaseConnector()

  return db('IntSchema.AutoApprovalConfig')
    .first()
    .where('IsEnabled', true)
    .select('AutoApprovalConfigId')
}
