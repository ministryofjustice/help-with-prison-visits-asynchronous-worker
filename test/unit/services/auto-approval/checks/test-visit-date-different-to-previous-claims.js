const moment = require('moment')
const visitDateDifferentToPreviousClaims = require('../../../../../app/services/auto-approval/checks/visit-date-different-to-previous-claims')

const visitDate = new Date(2016, 1, 1)
const validAutoApprovalData = {
  Claim: {
    Reference: 'ABC123',
    DateOfJourney: moment(visitDate).subtract(5, 'months')
  },
  previousClaims: [
    {
      ClaimId: 1,
      DateOfJourney: moment(visitDate).subtract(6, 'months').toDate()
    },
    {
      ClaimId: 2,
      DateOfJourney: moment(visitDate).subtract(8, 'months').toDate()
    },
    {
      ClaimId: 3,
      DateOfJourney: moment(visitDate).subtract(12, 'months').toDate()
    }
  ]
}

const invalidAutoApprovalData = {
  Claim: {
    Reference: 'ABC123',
    DateOfJourney: moment(visitDate).subtract(6, 'months').toDate()
  },
  previousClaims: [
    {
      ClaimId: 1,
      DateOfJourney: moment(visitDate).subtract(6, 'months').toDate()
    },
    {
      ClaimId: 2,
      DateOfJourney: moment(visitDate).toDate()
    },
    {
      ClaimId: 3,
      DateOfJourney: moment(visitDate).subtract(12, 'months').toDate()
    }
  ]
}

const emptyAutoApprovalData = {
  Claim: {
    Reference: 'ABC123',
    DateOfJourney: moment(visitDate).subtract(5, 'days')
  },
  previousClaims: []
}

describe('services/auto-approval/checks/visit-date-different-to-previous-claims', function () {
  it('should return true if none of the previous claims have the same visit date as the current claim', function () {
    const checkResult = visitDateDifferentToPreviousClaims(validAutoApprovalData)
    expect(checkResult.result).toBe(true)
  })

  it('should return false if any of the previous claims have the same visit date as the current claim', function () {
    const checkResult = visitDateDifferentToPreviousClaims(invalidAutoApprovalData)
    expect(checkResult.result).toBe(false)
    expect(checkResult.failureMessage).toBe(
      'The date of visit for this claim is the same as the date of visit for a previous claim. Claim ref: ABC123, Current claim visit date: 01/08/2015, Previous claim visit date: 01/08/2015'
    )
  })

  it('should return true if there are no previous claims', function () {
    const checkResult = visitDateDifferentToPreviousClaims(emptyAutoApprovalData)
    expect(checkResult.result).toBe(true)
  })
})
