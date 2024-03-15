const stubZendesk = jest.fn().mockResolvedValue()

describe('services/send-technical-help', function () {
  it('should call zendesk with correct details', function () {
    expect(function () {
      expect(stubZendesk).toHaveBeenCalledTimes(1)
    })
  })
})
