const sinon = require('sinon')

const stubZendesk = sinon.stub().resolves()

describe('services/send-technical-help', function () {
  it('should call zendesk with correct details', function () {
    expect(function () {
      sinon.assert.calledOnce(stubZendesk)
    })
  })
})
