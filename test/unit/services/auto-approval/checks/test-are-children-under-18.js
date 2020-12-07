const expect = require('chai').expect
const dateFormatter = require('../../../../../app/services/date-formatter')

const areChildrenUnder18 = require('../../../../../app/services/auto-approval/checks/are-children-under-18')

const autoApprovalDataClaimChildrenOver18 = {
  ClaimChildren: [
    {
      DateOfBirth: dateFormatter.now().subtract(17, 'years').toDate()
    },
    {
      DateOfBirth: dateFormatter.now().subtract(19, 'years').toDate()
    }
  ]
}

const autoApprovalDataClaimChildrenUnder18 = {
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
      IsEnabled: true
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
      IsEnabled: true
    }
  ]
}

const childlessAutoApprovalClaimData = {
  ClaimChildren: []
}

describe('services/auto-approval/checks/are-children-under-18', function () {
  it('should return false if any children associated to the claim are over 18 years old', function () {
    const checkResult = areChildrenUnder18(autoApprovalDataClaimChildrenOver18)
    expect(checkResult.result).to.equal(false)
  })

  it('should return true if all children associated to the claim are under 18 years old', function () {
    const checkResult = areChildrenUnder18(autoApprovalDataClaimChildrenUnder18)
    expect(checkResult.result).to.equal(true)
  })

  it('should return true if no children associated to the claim', function () {
    const checkResult = areChildrenUnder18(childlessAutoApprovalClaimData)
    expect(checkResult.result).to.equal(true)
  })
})
