const moment = require('moment')
const dateFormatter = require('../../../../../app/services/date-formatter')

const areChildrenUnder18 = require('../../../../../app/services/auto-approval/checks/are-children-under-18')

const autoApprovalDataClaimChildrenOver18 = {
  Claim: {
    Reference: 'ABC123',
  },
  ClaimChildren: [
    {
      DateOfBirth: dateFormatter.now().subtract(17, 'years').toDate(),
    },
    {
      DateOfBirth: dateFormatter.now().subtract(19, 'years').toDate(),
    },
  ],
}

const autoApprovalDataClaimChildrenUnder18 = {
  Claim: {
    Reference: 'ABC123',
  },
  ClaimChildren: [
    {
      ClaimChildId: 798118115,
      EligibilityId: 798118115,
      Reference: 'AUTOAPP',
      ClaimId: 798118115,
      FirstName: 'Sam',
      LastName: 'Bloggs',
      DateOfBirth: dateFormatter.now().subtract(14, 'years').toDate(),
      Relationship: 'prisoners-child',
      IsEnabled: true,
    },
    {
      ClaimChildId: 798118116,
      EligibilityId: 798118115,
      Reference: 'AUTOAPP',
      ClaimId: 798118115,
      FirstName: 'Mike',
      LastName: 'Bloggs',
      DateOfBirth: dateFormatter.now().subtract(15, 'years').toDate(),
      Relationship: 'my-child',
      IsEnabled: true,
    },
  ],
}

const childlessAutoApprovalClaimData = {
  ClaimChildren: [],
}

describe('services/auto-approval/checks/are-children-under-18', () => {
  it('should return false if any children associated to the claim are over 18 years old', () => {
    const checkResult = areChildrenUnder18(autoApprovalDataClaimChildrenOver18)
    expect(checkResult.result).toBe(false)
    expect(checkResult.failureMessage).toBe(
      `One or more children to be claimed are over 18 years old. Claim ref: ABC123, Date of birth: ${moment(autoApprovalDataClaimChildrenOver18.ClaimChildren[1].DateOfBirth).format('DD/MM/YYYY')}`,
    )
  })

  it('should return true if all children associated to the claim are under 18 years old', () => {
    const checkResult = areChildrenUnder18(autoApprovalDataClaimChildrenUnder18)
    expect(checkResult.result).toBe(true)
  })

  it('should return true if no children associated to the claim', () => {
    const checkResult = areChildrenUnder18(childlessAutoApprovalClaimData)
    expect(checkResult.result).toBe(true)
  })
})
