var expect = require('chai').expect
var getAutoApprovalConfig = require('../../../../app/services/data/get-auto-approval-config')
var config = require('../../../../knexfile').asyncworker
var knex = require('knex')(config)
var dateFormatter = require('../../../../app/services/date-formatter')

describe('services/data/get-auto-approval-config', function () {
  var insertedIds

  before(function () {
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
      })
  })

  it('should return the latest auto approval config record', function () {
    return getAutoApprovalConfig()
      .then(function (result) {
        expect(result.Caseworker).to.equal('caseworker1@test.com')
        expect(result.RulesDisabled).to.deep.equal(['auto-approval-rule-1', 'auto-approval-rule-2', 'auto-approval-rule-3'])
        expect(result.IsEnabled).to.equal(true)
      })
  })

  after(function () {
    return knex('IntSchema.AutoApprovalConfig')
      .whereIn('AutoApprovalConfigId', insertedIds)
      .del()
  })
})
