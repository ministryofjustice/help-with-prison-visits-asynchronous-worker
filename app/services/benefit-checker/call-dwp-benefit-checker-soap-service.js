const axios = require('axios')
const util = require('util')
const parseStringAsync = util.promisify(require('xml2js').parseString)
const xpath = require('xml2js-xpath')
const log = require('../log')
const config = require('../../../config')

// Creating HTTP request rather than using SOAP client as node SOAP clients are unreliable
module.exports = visitorDwpBenefitCheckerData => {
  log.info(`call-dwp-benefit-checker-soap-service DWP_BENEFIT_CHECKER_ENABLED: ${config.DWP_BENEFIT_CHECKER_ENABLED}`)

  if (config.DWP_BENEFIT_CHECKER_ENABLED !== 'true') {
    return Promise.resolve({
      visitorId: visitorDwpBenefitCheckerData.visitorId,
      result: 'NOT-RUN',
    })
  }

  const options = {
    method: 'POST',
    url: config.DWP_BENEFIT_CHECKER_URL,
    rejectUnauthorized: false, // Would require injecting valid certificate subject to change
    data: getSoapBenefitCheckerRequestBody(visitorDwpBenefitCheckerData),
    headers: {
      'content-type': 'text/xml',
      SOAPAction: config.DWP_BENEFIT_CHECKER_URL,
    },
  }

  return axios(options)
    .then(responseBody => {
      return parseStringAsync(responseBody.data)
        .then(xml => {
          const result = xpath.find(xml, '//ns2:benefitCheckerStatus')

          if (result && result[0] && result[0]._) {
            const status = result[0]._.toString().toUpperCase()
            return {
              visitorId: visitorDwpBenefitCheckerData.visitorId,
              result: status,
            }
          }
          throw new Error(`Could not parse response: ${responseBody}`)
        })
        .catch(error => {
          log.error('Error parsing XML', error)
        })
    })
    .catch(error => {
      log.error('Error calling Benefit checker', error)
    })
}

function getSoapBenefitCheckerRequestBody(data) {
  return `<?xml version="1.0" encoding="utf-8"?>
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <soapenv:Body>
    <benefitCheckerRequest xmlns="https://lsc.gov.uk/benefitchecker/service/1.0/API_1.0_Check">
      <lscServiceName>${config.DWP_BENEFIT_CHECKER_LSCSERVICENAME}</lscServiceName>
      <clientOrgId>${config.DWP_BENEFIT_CHECKER_CLIENTORGID}</clientOrgId>
      <clientUserId>${config.DWP_BENEFIT_CHECKER_CLIENTUSERID}</clientUserId>
      <clientReference>${config.DWP_BENEFIT_CHECKER_CLIENTREFERENCE}</clientReference>
      <nino>${data.nino}</nino>
      <surname>${data.surname}</surname>
      <dateOfBirth>${data.dateOfBirth}</dateOfBirth>
      <dateOfAward></dateOfAward>
    </benefitCheckerRequest>
  </soapenv:Body>
</soapenv:Envelope>`
}
