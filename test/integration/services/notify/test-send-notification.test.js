const config = require('../../../../config')
const sendNotification = require('../../../../app/services/notify/send-notification')

describe('services/notify/send-notification', () => {
  it('should send an email', () => {
    return sendNotification(config.NOTIFY_SUBMIT_CLAIM_EMAIL_TEMPLATE_ID, config.APVS_TEST_EMAIL_ADDRESS, {
      reference: 'DONOTSEND',
    }) // manual check to see if email was sent
  })

  it('should not send an email to do not send email', () => {
    return sendNotification(config.NOTIFY_SUBMIT_CLAIM_EMAIL_TEMPLATE_ID, config.NOTIFY_DO_NOT_SEND_EMAIL, {
      reference: 'DONOTSEND',
    }) // manual check to see if email was not sent
  })
})
