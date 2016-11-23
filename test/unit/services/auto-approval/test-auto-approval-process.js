const expect = require('chai').expect
const moment = require('moment')
const sinon = require('sinon')
const proxyquire = require('proxyquire')
require('sinon-bluebird')

const VISIT_CONFIRMATION_DOC_TYPE = 'VISIT-CONFIRMATION'

const validClaimData = {
  Claim: {
    ClaimId: 4,
    DateOfJourney: moment().subtract(29, 'days'),
    DateSubmitted: moment().subtract(2, 'days')
  },
  ClaimExpenses: [
    {
      ClaimExpenseId: 3,
      ExpenseType: 'car hire',
      Cost: 45
    },
    {
      ClaimExpenseId: 4,
      ExpenseType: 'plane',
      Cost: 100
    }
  ],
  ClaimDocuments: [
    {
      ClaimDocumentId: 1,
      DocumentType: VISIT_CONFIRMATION_DOC_TYPE,
      DocumentStatus: 'uploaded'
    }
  ],
  ClaimChildren: [
    {
      ClaimChildId: 1,
      DateOfBirth: moment().subtract(10, 'years')
    },
    {
      ClaimChildId: 2,
      DateOfBirth: moment().subtract(15, 'years')
    }
  ],
  Prisoner: {
    PrisonerId: 1,
    NameOfPrison: 'Hewell'
  }
}

const validAutoApprovalData = {
  previousClaims: [
    {
      ClaimId: 3,
      DateOfJourney: moment().subtract(3, 'months'),
      DateSubmitted: moment().subtract(3, 'months').add(10, 'days'),
      Status: 'APPROVED'
    },
    {
      ClaimId: 2,
      DateOfJourney: moment().subtract(6, 'months'),
      DateSubmitted: moment().subtract(6, 'months').add(10, 'days'),
      Status: 'APPROVED'
    },
    {
      ClaimId: 1,
      DateOfJourney: moment().subtract(9, 'months'),
      DateSubmitted: moment().subtract(9, 'months').add(10, 'days'),
      Status: 'APPROVED'
    }
  ],
  latestManuallyApprovedClaim: {
    ClaimId: 1,
    DateOfJourney: moment().subtract(9, 'months'),
    DateSubmitted: moment().subtract(9, 'months').add(10, 'days'),
    Status: 'APPROVED',
    claimExpenses: [
      {
        ClaimExpenseId: 1,
        ExpenseType: 'car hire',
        Cost: 45
      },
      {
        ClaimExpenseId: 2,
        ExpenseType: 'plane',
        Cost: 110
      }
    ]
  }
}

const invalidClaimData = {
  Claim: {
    ClaimId: 4,
    DateOfJourney: moment().subtract(31, 'days'),
    DateSubmitted: moment().subtract(2, 'days')
  },
  ClaimExpenses: [
    {
      ClaimExpenseId: 3,
      ExpenseType: 'car hire',
      Cost: 55
    },
    {
      ClaimExpenseId: 4,
      ExpenseType: 'plane',
      Cost: 100
    }
  ],
  ClaimDocuments: [
    {
      ClaimDocumentId: 1,
      DocumentType: VISIT_CONFIRMATION_DOC_TYPE,
      DocumentStatus: 'uploaded'
    }
  ],
  ClaimChildren: [
    {
      ClaimChildId: 1,
      DateOfBirth: moment().subtract(10, 'years')
    },
    {
      ClaimChildId: 2,
      DateOfBirth: moment().subtract(19, 'years')
    }
  ],
  Prisoner: {
    PrisonerId: 1,
    NameOfPrison: 'Hewell'
  }
}

const invalidAutoApprovalData = {
  previousClaims: [],
  latestManuallyApprovedClaim: null
}

var autoApprovalCheckForValidClaim = proxyquire('../../../../app/services/auto-approval/auto-approval-process', {
  '../data/get-data-for-auto-approval-check': sinon.stub().resolves(validAutoApprovalData)
})
var autoApprovalCheckForInvalidClaim = proxyquire('../../../../app/services/auto-approval/auto-approval-process', {
  '../data/get-data-for-auto-approval-check': sinon.stub().resolves(invalidAutoApprovalData)
})

describe('services/auto-approval/checks/auto-approval-process', function () {
  it('should return true if the claim is eligible for auto approval', function () {
    return autoApprovalCheckForValidClaim(validClaimData)
      .then(function (result) {
        expect(result.claimApproved).to.equal(true)
      })
  })

  it('should return false if the claim is not eligible for auto approval', function () {
    return autoApprovalCheckForInvalidClaim(invalidClaimData)
      .then(function (result) {
        expect(result.claimApproved).to.equal(false)
      })
  })
})
