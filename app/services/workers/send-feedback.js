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

  if (Config.ZENDESK_ENABLED) {
    var zendesk = new Zendesk({
      url: Config.ZENDESK_API_URL,
      email: Config.ZENDESK_EMAIL_ADDRESS,
      token: Config.ZENDESK_API_KEY
    })

    zendesk.tickets.create({
      subject: 'APVS Feedback: ' + personalisation.rating,
      comment: {
        body: personalisation.improvements
      }
    }).then(function (result) {
      console.dir(result)
    })
  } else {
    console.dir('Zendesk not implemented in development environments.')
  }
}
