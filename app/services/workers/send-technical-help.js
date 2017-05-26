const Config = require('../../../config')
const Zendesk = require('zendesk-node-api')

module.exports.execute = function (task) {
  var technicalHelp = task.additionalData.split('~~')
  var personalisation = {
    name: technicalHelp[0],
    phone: technicalHelp[1],
    issue: technicalHelp[2]
  }

  if (Config.ZENDESK_ENABLED) {
    var zendesk = new Zendesk({
      url: Config.ZENDESK_API_URL,
      email: Config.ZENDESK_EMAIL_ADDRESS,
      token: Config.ZENDESK_API_KEY
    })

    zendesk.tickets.create({
      subject: 'APVS Technical Help',
      comment: {
        body: personalisation.issue
      },
      collaborators: {
        name: personalisation.email,
        email: personalisation.phone
      }
    }).then(function (result) {
      console.dir(result)
    })
  } else {
    console.dir('Zendesk not implemented in development environments.')
  }
}

