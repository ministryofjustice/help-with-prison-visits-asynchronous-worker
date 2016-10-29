const sendFirstTimeClaimNotification = require('../../../../app/services/workers/send-first-time-claim-notification')

describe('services/workers/send-first-time-claim-notification', function () {
  it('should send an email', function (done) {
    sendFirstTimeClaimNotification.execute({
      reference: '1234567',
      additionalData: process.env.APVS_TEST_EMAIL_ADDRESS
    }).then(function () {
      // manual check to see if email was sent
      done()
    })
  })
})
