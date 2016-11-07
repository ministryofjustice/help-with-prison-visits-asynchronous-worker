const config = require('../../../../config')
const sendNotification = require('../../../../app/services/notify/send-notification')

describe('services/notify/send-notification', function () {
  it('should send an email', function () {
    return sendNotification(
      config.NOTIFY_FIRST_TIME_CLAIM_EMAIL_TEMPLATE_ID,
      process.env.APVS_TEST_EMAIL_ADDRESS,
      { reference: '1234567' }
    ) // manual check to see if email was sent
  })

  it('should not send an email to do not send email', function () {
    return sendNotification(
      config.NOTIFY_FIRST_TIME_CLAIM_EMAIL_TEMPLATE_ID,
      config.NOTIFY_DO_NOT_SEND_EMAIL,
      { reference: 'DONOTSEND' }
    ) // manual check to see if email was not sent
  })
})
