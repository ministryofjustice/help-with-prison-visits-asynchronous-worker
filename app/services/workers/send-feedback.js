const RatingEnum = require('../../constants/rating-enum')
const Config = require('../../../config')
const Zendesk = require('zendesk-node-api')

module.exports.execute = function (task) {
  var feedback = task.additionalData.split('~~')
  var personalisation = {
    rating: RatingEnum[feedback[0]].displayName,
    improvements: feedback[1],
    contactEmailAddress: feedback[2]
  }

  if (Config.ZENDESK_ENABLED === 'true') {
    var zendesk = new Zendesk({
      url: Config.ZENDESK_API_URL,
      email: Config.ZENDESK_EMAIL_ADDRESS,
      token: Config.ZENDESK_API_KEY
    })

    if (Config.ZENDESK_TEST_ENVIRONMENT === 'true') {
      return zendesk.tickets.create({
        subject: 'Test: Help With Prison Visits - Feedback',
        comment: {
          body: personalisation.improvements + '\n\n' +
          'Rating: ' + personalisation.rating + '\n' +
          'Email address (optional): ' + personalisation.contactEmailAddress
        }
      }).then(function (result) {
        console.log('Zendesk ticket, ' + result.ticket.id + ' has been raised')
      })
    } else {
      return zendesk.tickets.create({
        subject: 'Help With Prison Visits - Feedback',
        comment: {
          body: personalisation.improvements + '\n\n' +
          'Rating: ' + personalisation.rating + '\n' +
          'Email address (optional): ' + personalisation.contactEmailAddress
        }
      }).then(function (result) {
        console.log('Zendesk ticket, ' + result.ticket.id + ' has been raised')
      })
    }
  } else {
    return console.log('Zendesk not implemented in development environments.')
  }
}
