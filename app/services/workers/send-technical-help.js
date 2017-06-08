const Config = require('../../../config')
const Zendesk = require('zendesk-node-api')

module.exports.execute = function (task) {
  var technicalHelp = task.additionalData.split('~~')
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
      return zendesk.tickets.create({
        subject: 'Test: Help With Prison Visits - Help',
        comment: {
          body: personalisation.issue + '\n\n' +
          'Name: ' + personalisation.name + '\n' +
          'Email address: ' + personalisation.contactEmailAddress
        },
        collaborators: [
          562,
          personalisation.contactEmailAddress,
          {
            'name': personalisation.name,
            'email': personalisation.contactEmailAddress
          }
        ]
      }).then(function (result) {
        console.log('Zendesk ticket, ' + result.ticket.id + ' has been raised')
      })
    } else {
      return zendesk.tickets.create({
        subject: 'Help With Prison Visits - Help',
        comment: {
          body: personalisation.issue + '\n\n' +
          'Name: ' + personalisation.name + '\n' +
          'Email address: ' + personalisation.contactEmailAddress
        },
        collaborators: [
          562,
          personalisation.contactEmailAddress,
          {
            'name': personalisation.name,
            'email': personalisation.contactEmailAddress
          }
        ]
      }).then(function (result) {
        console.log('Zendesk ticket, ' + result.ticket.id + ' has been raised')
      })
    }
  } else {
    return console.dir('Zendesk not implemented in development environments.')
  }
}

