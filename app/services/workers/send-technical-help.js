const Config = require('../../../config')
const Zendesk = require('zendesk-node-api')

module.exports.execute = function (task) {
  var technicalHelp = task.additionalData.split('~~')
  var subjectText = 'Help With Prison Visits - Help'
  var tagText = ['HelpWithPrisonVisits']
  var personalisation = {
    name: technicalHelp[0],
    contactEmailAddress: technicalHelp[1],
    issue: technicalHelp[2]
  }

  if (Config.ZENDESK_ENABLED === 'true') {
    var zendesk = new Zendesk({
      url: Config.ZENDESK_API_URL,
      email: Config.ZENDESK_EMAIL_ADDRESS,
      token: Config.ZENDESK_API_KEY
    })

    if (Config.ZENDESK_TEST_ENVIRONMENT === 'true') {
      subjectText = 'Test: Help With Prison Visits - Help'
      tagText = ['HelpWithPrisonVisits', 'Test']
    }

    return zendesk.tickets.create({
      submitter_id: '114198238551',
      requester: {
        'name': personalisation.name,
        'email': personalisation.contactEmailAddress,
        'verified': true
      },
      subject: subjectText,
      comment: {
        body: personalisation.issue
      },
      tags: tagText
    }).then(function (result) {
      console.log('Zendesk ticket, ' + result.ticket.id + ' has been raised')
    })
  } else {
    return console.dir('Zendesk not implemented in development environments.')
  }
}
