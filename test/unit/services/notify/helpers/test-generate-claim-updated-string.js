const generateClaimUpdatedString = require('../../../../../app/services/notify/helpers/generate-claim-updated-string')

describe('notify/helpers/generate-claim-updated-string', function () {
  it('should contain note and document details', function () {
    const UPDATED_DOCUMENTS = [{ DocumentType: 'VISIT-CONFIRMATION', DocumentStatus: 'post-later' }]

    const message = generateClaimUpdatedString(UPDATED_DOCUMENTS)

    expect(message).toEqual(expect.arrayContaining([UPDATED_DOCUMENTS[0].DocumentType]))
    expect(message).toEqual(expect.arrayContaining([UPDATED_DOCUMENTS[0].DocumentStatus]))
  })
})
