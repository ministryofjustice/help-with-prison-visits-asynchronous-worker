var expect = require('chai').expect
var getAutoApprovalConfig = require('../../../../app/services/data/get-auto-approval-config')
<<<<<<< HEAD
var knexConfig = require('../../../../knexfile').asyncworker
var knex = require('knex')(knexConfig)
var config = require('../../../../config')
var moment = require('moment')
=======
var config = require('../../../../knexfile').asyncworker
var knex = require('knex')(config)
var dateFormatter = require('../../../../app/services/date-formatter')
>>>>>>> develop

var insertedIds

describe('services/data/get-auto-approval-config', function () {
  var existingAutoApprovalId

  before(function () {
<<<<<<< HEAD
    return getCurrentAutoApprovalConfigId()
      .then(function (currentAutoApprovalConfigId) {
        if (currentAutoApprovalConfigId) {
          existingAutoApprovalId = currentAutoApprovalConfigId.AutoApprovalConfigId
          return setIsEnabled(existingAutoApprovalId, false)
        } else {
          return Promise.resolve()
        }
=======
    return knex('IntSchema.AutoApprovalConfig')
      .insert([{
        Caseworker: 'caseworker1@test.com',
        DateCreated: dateFormatter.now().toDate(),
        AutoApprovalEnabled: 'true',
        CostVariancePercentage: '5.00',
        MaxClaimTotal: '100.00',
        MaxDaysAfterAPVUVisit: '28',
        MaxNumberOfClaimsPerYear: '10',
        RulesDisabled: 'auto-approval-rule-1,auto-approval-rule-2,auto-approval-rule-3',
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
        IsEnabled: 'false'
      }])
      .returning('AutoApprovalConfigId')
      .then(function (result) {
        insertedIds = result
>>>>>>> develop
      })
  })

  it('should return auto approval config defaults when no auto approval config data is found', function () {
    return getAutoApprovalConfig()
      .then(function (result) {
        expect(result.AutoApprovalEnabled).to.equal(config.AUTO_APPROVAL_ENABLED === 'true')
        expect(result.CostVariancePercentage).to.equal(parseFloat(config.AUTO_APPROVAL_COST_VARIANCE))
        expect(result.MaxClaimTotal).to.equal(parseFloat(config.AUTO_APPROVAL_MAX_CLAIM_TOTAL))
        expect(result.MaxDaysAfterAPVUVisit).to.equal(parseInt(config.AUTO_APPROVAL_MAX_DAYS_AFTER_APVU_VISIT))
        expect(result.MaxNumberOfClaimsPerYear).to.equal(parseInt(config.AUTO_APPROVAL_MAX_CLAIMS_PER_YEAR))
        expect(result.MaxNumberOfClaimsPerMonth).to.equal(parseInt(config.AUTO_APPROVAL_MAX_CLAIMS_PER_MONTH))
        expect(result.RulesDisabled).to.be.null
      })
  })

  it('should return the latest auto approval config record', function () {
    return insertTestData()
    .then(function () {
      return getAutoApprovalConfig()
        .then(function (result) {
          expect(result.Caseworker).to.equal('caseworker1@test.com')
          expect(result.RulesDisabled).to.deep.equal(['auto-approval-rule-1', 'auto-approval-rule-2', 'auto-approval-rule-3'])
          expect(result.IsEnabled).to.equal(true)
        })
    })
  })

  after(function () {
    return knex('IntSchema.AutoApprovalConfig')
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
  return knex('IntSchema.AutoApprovalConfig')
    .insert([{
      Caseworker: 'caseworker1@test.com',
      DateCreated: moment().toDate(),
      AutoApprovalEnabled: 'true',
      CostVariancePercentage: '5.00',
      MaxClaimTotal: '100.00',
      MaxDaysAfterAPVUVisit: '28',
      MaxNumberOfClaimsPerYear: '10',
      RulesDisabled: 'auto-approval-rule-1,auto-approval-rule-2,auto-approval-rule-3',
      IsEnabled: 'true'
    },
    {
      Caseworker: 'caseworker2@test.com',
      DateCreated: moment().subtract(1, 'day').toDate(),
      AutoApprovalEnabled: 'true',
      CostVariancePercentage: '5.00',
      MaxClaimTotal: '100.00',
      MaxDaysAfterAPVUVisit: '28',
      MaxNumberOfClaimsPerYear: '10',
      RulesDisabled: 'auto-approval-rule-1,auto-approval-rule-3',
      IsEnabled: 'false'
    }])
    .returning('AutoApprovalConfigId')
    .then(function (result) {
      insertedIds = result
    })
}

function setIsEnabled (autoApprovalConfigId, isEnabled) {
  return knex('IntSchema.AutoApprovalConfig')
    .where('AutoApprovalConfigId', autoApprovalConfigId)
    .update({
      IsEnabled: isEnabled
    })
}

function getCurrentAutoApprovalConfigId () {
  return knex('IntSchema.AutoApprovalConfig')
    .first()
    .where('IsEnabled', true)
    .select('AutoApprovalConfigId')
}
