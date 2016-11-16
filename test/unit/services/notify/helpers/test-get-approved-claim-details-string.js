const expect = require('chai').expect
const getApprovedClaimDetailsString = require('../../../../../app/services/notify/helpers/get-approved-claim-details-string')

describe('notify/helpers/get-approved-claim-details-string', function () {
  var claimExpense1 = [{
    ClaimExpenseId: 793150379,
    EligibilityId: 793150379,
    Reference: 'DWPVISI',
    ClaimId: 793150379,
    ExpenseType: 'accommodation',
    Cost: 0,
    TravelTime: null,
    From: 'London',
    To: 'Hewell',
    IsReturn: false,
    DurationOfTravel: null,
    TicketType: null,
    IsChild: null,
    IsEnabled: true,
    ApprovedCost: 0,
    Note: null,
    Status: 'REJECTED'
  }]
  var claimExpense2 = [{
    ClaimExpenseId: 793149603,
    EligibilityId: 793149602,
    Reference: 'DWPVISI',
    ClaimId: 793149602,
    ExpenseType: 'bus',
    Cost: 30,
    TravelTime: null,
    From: 'Euston',
    To: 'Birmingham New Street',
    IsReturn: false,
    DurationOfTravel: null,
    TicketType: null,
    IsChild: null,
    IsEnabled: true,
    ApprovedCost: 20,
    Note: null,
    Status: 'APPROVED'
  }]

  it('should contain journey info if claim expense type is a journey type', function () {
    var claimDetails = getApprovedClaimDetailsString(claimExpense2)
    expect(claimDetails).to.contain('Bus journey - Euston to Birmingham')
  })

  it('should contain just the expense type if claim expense type is not a journey type', function () {
    var claimDetails = getApprovedClaimDetailsString(claimExpense1)
    expect(claimDetails).to.contain('Accommodation')
  })

  it('should contain the correct claim amount', function () {
    var claimDetails = getApprovedClaimDetailsString(claimExpense2)
    expect(claimDetails).to.contain('Claimed: £30.00')
  })

  it('should contain the correct approved amount', function () {
    var claimDetails = getApprovedClaimDetailsString(claimExpense2)
    expect(claimDetails).to.contain('Approved: £20.00')
  })

  it('should return nothing if no claims expenses exist', function () {
    var claimDetails = getApprovedClaimDetailsString([])
    expect(claimDetails).to.equal('')
  })
})
