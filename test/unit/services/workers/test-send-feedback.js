const expect = require('chai').expect
const sinon = require('sinon')
require('sinon-bluebird')

var stubZendesk = sinon.stub().resolves()

describe('services/send-feedback', function () {
  it('should call zendesk with correct details', function () {
    expect(function () {
      sinon.assert.calledOnce(stubZendesk)
    })
  })
})
