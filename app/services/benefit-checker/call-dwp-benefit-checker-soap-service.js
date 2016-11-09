const config = require('../../../config')
const Promise = require('bluebird')
const requestPromise = require('request-promise')
const parseStringAsync = Promise.promisify(require('xml2js').parseString)
const xpath = require('xml2js-xpath')

// Creating HTTP request rather than using SOAP client as node SOAP clients are unreliable
module.exports = function (visitorDwpBenefitCheckerData) {
  var options = {
    method: 'POST',
    uri: config.DWP_BENEFIT_CHECKER_URL,
    rejectUnauthorized: false, // Would require injecting valid certificate subject to change
    body: getSoapBenefitCheckerRequestBody(visitorDwpBenefitCheckerData),
    headers: {
      'content-type': 'text/xml',
      'SOAPAction': config.DWP_BENEFIT_CHECKER_URL
    }
  }

  return requestPromise(options)
    .then(function (responseBody) {
      return parseStringAsync(responseBody)
        .then(function (xml) {
          var result = xpath.find(xml, '//ns2:benefitCheckerStatus')

          if (result && result[0] && result[0]._) {
            var status = result[0]._.toString().toUpperCase()
            return {
              'visitorId': visitorDwpBenefitCheckerData.VisitorId,
              'result': status
            }
          } else {
            throw new Error(`Could not parse response: ${responseBody}`)
          }
        })
    })
}

function getSoapBenefitCheckerRequestBody (data) {
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

