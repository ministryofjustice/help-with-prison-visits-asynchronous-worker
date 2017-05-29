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

    return zendesk.tickets.create({
      subject: 'APVS Feedback',
      comment: {
        body: personalisation.improvements + '\n\n' +
        'Rating: ' + personalisation.rating + '\n' +
        'Email address (optional): ' + personalisation.contactEmailAddress
      }
    }).then(function (result) {
      console.dir(result)
      console.log('Zendesk ticket, ' + result.ticket.id + ' has been raised')
    })
  } else {
    return console.log('Zendesk not implemented in development environments.')
  }
}
