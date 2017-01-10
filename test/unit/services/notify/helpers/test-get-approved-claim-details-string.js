const expect = require('chai').expect
const getApprovedClaimDetailsString = require('../../../../../app/services/notify/helpers/get-approved-claim-details-string')
const deductionTypeEnum = require('../../../../../app/constants/deduction-type-enum')

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
    TicketOwner: null,
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
    TicketOwner: 'you',
    IsEnabled: true,
    ApprovedCost: 20,
    Note: null,
    Status: 'APPROVED'
  }]
  var claimDeduction1 = [{
    DeductionType: deductionTypeEnum.HC3_DEDUCTION.value,
    Amount: 5
  }]
  var claimDeduction2 = [{
    DeductionType: deductionTypeEnum.OVERPAYMENT.value,
    Amount: 10
  }]

  it('should contain journey info if claim expense type is a journey type', function () {
    var claimDetails = getApprovedClaimDetailsString(claimExpense2, [])
    expect(claimDetails).to.contain('Bus journey - Euston to Birmingham')
  })

  it('should contain just the expense type if claim expense type is not a journey type', function () {
    var claimDetails = getApprovedClaimDetailsString(claimExpense1, [])
    expect(claimDetails).to.contain('Accommodation')
  })

  it('should contain the correct claim amount without deductions', function () {
    var claimDetails = getApprovedClaimDetailsString(claimExpense2, [])
    expect(claimDetails).to.contain('Claimed: £30.00')
  })

  it('should contain the correct approved amount without deductions', function () {
    var claimDetails = getApprovedClaimDetailsString(claimExpense2, [])
    expect(claimDetails).to.contain('Approved: £20.00')
  })

  it('should contain the deduction header if there are any claim deductions', function () {
    var claimDetails = getApprovedClaimDetailsString(claimExpense1, claimDeduction1)
    expect(claimDetails).to.contain('Deductions')
  })

  it('should contain the correct deduction type', function () {
    var claimDetails = getApprovedClaimDetailsString(claimExpense2, claimDeduction2)
    expect(claimDetails).to.contain('Type: Overpayment')
  })

  it('should contain the correct deduction amount', function () {
    var claimDetails = getApprovedClaimDetailsString(claimExpense2, claimDeduction2)
    expect(claimDetails).to.contain('Amount: £10.00')
  })

  it('should return nothing if no claims expenses exist', function () {
    var claimDetails = getApprovedClaimDetailsString([], [])
    expect(claimDetails).to.equal('')
  })
})
