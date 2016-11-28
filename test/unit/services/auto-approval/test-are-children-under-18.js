const expect = require('chai').expect
const moment = require('moment')

const areChildrenUnder18 = require('../../../../app/services/auto-approval/checks/are-children-under-18')

var autoApprovalDataClaimChildrenOver18 = {
  ClaimChildren: [
    {
      DateOfBirth: moment().subtract(17, 'years').toDate()
    },
    {
      DateOfBirth: moment().subtract(19, 'years').toDate()
    }
  ]
}

var autoApprovalDataClaimChildrenUnder18 = {
  ClaimChildren: [
    {
      ClaimChildId: 798118115,
      EligibilityId: 798118115,
      Reference: 'AUTOAPP',
      ClaimId: 798118115,
      Name: 'Sam Bloggs',
      DateOfBirth: moment().subtract(14, 'years').toDate(),
      Relationship: 'prisoners-child',
      IsEnabled: true
    },
    {
      ClaimChildId: 798118116,
      EligibilityId: 798118115,
      Reference: 'AUTOAPP',
      ClaimId: 798118115,
      Name: 'Mike Bloggs',
      DateOfBirth: moment().subtract(15, 'years').toDate(),
      Relationship: 'my-child',
      IsEnabled: true
    }
  ]
}

var childlessAutoApprovalClaimData = {
  ClaimChildren: null
}

describe('services/auto-approval/checks/are-children-under-18', function () {
  it('should return false if any children associated to the claim are over 18 years old', function () {
    var checkResult = areChildrenUnder18(autoApprovalDataClaimChildrenOver18)
    expect(checkResult.result).to.equal(false)
  })

  it('should return true if all children associated to the claim are under 18 years old', function () {
    var checkResult = areChildrenUnder18(autoApprovalDataClaimChildrenUnder18)
    expect(checkResult.result).to.equal(true)
  })

  it('should return true if no children associated to the claim', function () {
    var checkResult = areChildrenUnder18(childlessAutoApprovalClaimData)
    expect(checkResult.result).to.equal(true)
  })
})
