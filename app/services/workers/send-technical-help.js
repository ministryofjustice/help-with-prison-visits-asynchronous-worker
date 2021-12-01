const Config = require('../../../config')
const log = require('../log')
const axios = require('axios')

module.exports.execute = function (task) {
  if (Config.ZENDESK_ENABLED === 'true') {
    const technicalHelp = task.additionalData.split('~~')
    let subjectText = 'Help With Prison Visits - Help'
    let tagText = ['HelpWithPrisonVisits']
    const personalisation = {
      name: technicalHelp[0],
      contactEmailAddress: technicalHelp[1],
      issue: technicalHelp[2]
    }

    if (Config.ZENDESK_TEST_ENVIRONMENT === 'true') {
      subjectText = 'Test: Help With Prison Visits - Help'
      tagText = ['HelpWithPrisonVisits', 'Test']
    }

    const zendeskApiUrl = Config.ZENDESK_API_URL + '/api/v2/tickets.json'

    const credentials = Config.ZENDESK_EMAIL_ADDRESS + '/token:' + Config.ZENDESK_API_KEY
    const headers = {
      Authorization: 'Basic ' + Buffer.from(credentials).toString('base64')
    }

    const ticket = {
      ticket: {
        submitter_id: '114198238551',
        requester: {
          name: personalisation.name,
          email: personalisation.contactEmailAddress,
          verified: true
        },
        subject: subjectText,
        comment: {
          body: personalisation.issue
        },
        tags: tagText
      }
    }

    return axios.post(zendeskApiUrl, ticket, { headers })
      .then(function (response) {
        if (response.status === 201) {
          log.info('Zendesk ticket ' + response.data.ticket.id + ' has been raised')
        }
      })
  } else {
    log.info(`Zendesk not enabled. No ticket created for task ID ${task.taskId}.`)
    return Promise.resolve()
  }
}
