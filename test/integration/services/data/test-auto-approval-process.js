const expect = require('chai').expect
const sinon = require('sinon')
const proxyquire = require('proxyquire')
require('sinon-bluebird')

const testHelper = require('../../../test-helper')

const reference1 = 'AUTOAPP'
const reference2 = 'AUTOAPP2'

var validAutoApprovalData = testHelper.getValidAutoApprovalData(reference1)
var invalidAutoApprovalData = testHelper.getInvalidAutoApprovalData(reference2)

var autoApprovalCheckForValidClaim = proxyquire('../../../../app/services/auto-approval/auto-approval-process', {
  '../data/get-data-for-auto-approval-check': sinon.stub().resolves(validAutoApprovalData)
})
var autoApprovalCheckForInvalidClaim = proxyquire('../../../../app/services/auto-approval/auto-approval-process', {
  '../data/get-data-for-auto-approval-check': sinon.stub().resolves(invalidAutoApprovalData)
})

describe('services/auto-approval/checks/auto-approval-process', function () {
  it('should return true if the claim is eligible for auto approval', function () {
    return testHelper.insertAutoApprovalData('IntSchema', validAutoApprovalData)
      .then(function () {
        return autoApprovalCheckForValidClaim(validAutoApprovalData)
          .then(function (result) {
            expect(result.claimApproved).to.equal(true)
          })
      })
  })

  it('should return false if the claim is ineligible for auto approval', function () {
    return testHelper.insertAutoApprovalData('IntSchema', invalidAutoApprovalData)
      .then(function () {
        return autoApprovalCheckForInvalidClaim(invalidAutoApprovalData)
          .then(function (result) {
            expect(result.claimApproved).to.equal(false)
          })
      })
  })

  after(function () {
    return testHelper.deleteAll(reference1, 'IntSchema').then(function () {
      return testHelper.deleteAll(reference2, 'IntSchema')
    })
  })
})
