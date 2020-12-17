const config = require('../../../../../../config')

// Format to be Payment Amount, blank, First Name, Last Name, Address1, Address2, Address3, Address4, Postcode,
// POI code, blank, blank, Reference, blank, blank, blank, blank, blank, template code, blank, blank, Date of Visit
module.exports = function formatCSVData (paymentData, claimIdIndex) {
  paymentData.forEach(function (data) {
    data.splice(claimIdIndex, 1)
    data.splice(1, 0, '')
    data.splice(9, 0, '2', '', '') // 2 is the code for checking ID in POI
    data.splice(13, 0, '', '', '', '', '', config.PAYOUT_TEMPLATE_CODE)
    data.splice(19, 0, '', '')

    // Ensures there is a space in the postcode
    const postCodeIndex = 8
    if (data[postCodeIndex].indexOf(' ') < 0) {
      data[postCodeIndex] = data[postCodeIndex].replace(/^(.*)(.{3})$/, '$1 $2')
    }

    // Formats the date of visit
    const dateOfVisitIndex = 21
    const dateOfVisitRaw = JSON.stringify(data[dateOfVisitIndex])
    const year = dateOfVisitRaw.substring(1, 5)
    const month = dateOfVisitRaw.substring(6, 8)
    const day = dateOfVisitRaw.substring(9, 11)
    const dateOfVisit = day + ' ' + month + ' ' + year
    data[dateOfVisitIndex] = dateOfVisit
  })

  return paymentData
}
