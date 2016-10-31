const config = require('../../../../config')
const sendNotification = require('../../../../app/services/notify/send-notification')

describe('services/notify/send-notification', function () {
  it('should send an email', function (done) {
    sendNotification(
      config.NOTIFY_FIRST_TIME_CLAIM_EMAIL_TEMPLATE_ID,
      process.env.APVS_TEST_EMAIL_ADDRESS,
      { reference: '1234567' }
    ).then(function () {
      // manual check to see if email was sent
      done()
    })
  })
})
