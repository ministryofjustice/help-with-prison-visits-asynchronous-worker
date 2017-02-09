const config = require('../../../../config')
const sendNotification = require('../../../../app/services/notify/send-notification')

describe('services/notify/send-notification', function () {
  it('should send an email', function () {
    var requestInfoUrl = `${config.EXTERNAL_SERVICE_URL}${config.EXTERNAL_PATH_ALREADY_REGISTERED}`
    var personalisation = {
      first_name: 'Steven',
      reference: 'REF1234',
      requestInfoUrl: requestInfoUrl
    }

    var emailAddress = 's.alexander@kainos.com'
    var emailTemplateId = config.NOTIFY_REJECTED_CLAIM_EMAIL_TEMPLATE_ID

    return sendNotification(emailTemplateId, emailAddress, personalisation)
  })

  // it('should not send an email to do not send email', function () {
  //   return sendNotification(
  //     config.NOTIFY_SUBMIT_CLAIM_EMAIL_TEMPLATE_ID,
  //     config.NOTIFY_DO_NOT_SEND_EMAIL,
  //     { reference: 'DONOTSEND' }
  //   ) // manual check to see if email was not sent
  // })
})
