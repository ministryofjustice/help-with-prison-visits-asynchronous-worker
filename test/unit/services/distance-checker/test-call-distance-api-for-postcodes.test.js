const mockLogError = jest.fn()

jest.mock('../../../../app/services/log', () => ({ error: mockLogError }))
jest.mock('../../../../config', () => ({
  DISTANCE_CALCULATION_DIRECTIONS_API_URL: 'https://example.test/directions',
  DISTANCE_CALCULATION_DIRECTIONS_API_KEY: 'test-key',
}))

const callDistanceApiForPostcodes = require('../../../../app/services/distance-checker/call-distance-api-for-postcodes')

const ORIGIN_POSTCODE = 'BT11 1BT'
const DESTINATION_POSTCODE = 'B97 6QS'

function mockResponse({ body, ok = true, status = 200, statusText = 'OK' }) {
  return {
    ok,
    status,
    statusText,
    json: jest.fn().mockResolvedValue(body),
  }
}

describe('services/distance-checker/call-distance-api-for-postcodes', () => {
  beforeEach(() => {
    global.fetch = jest.fn()
    mockLogError.mockReset()
  })

  afterEach(() => {
    delete global.fetch
  })

  it('returns the round-trip distance from a successful Google response', async () => {
    global.fetch.mockResolvedValue(
      mockResponse({
        body: {
          status: 'OK',
          routes: [{ legs: [{ distance: { value: 10000 } }] }],
        },
      }),
    )

    await expect(callDistanceApiForPostcodes(ORIGIN_POSTCODE, DESTINATION_POSTCODE)).resolves.toBe(20)
    expect(mockLogError).not.toHaveBeenCalled()
  })

  it('logs an unsuccessful Google API status', async () => {
    global.fetch.mockResolvedValue(
      mockResponse({
        body: {
          status: 'OVER_QUERY_LIMIT',
          error_message: 'Too many requests',
        },
      }),
    )

    await expect(callDistanceApiForPostcodes(ORIGIN_POSTCODE, DESTINATION_POSTCODE)).resolves.toBeNull()
    expect(mockLogError).toHaveBeenCalledWith(
      {
        originPostCode: ORIGIN_POSTCODE,
        destinationPostCode: DESTINATION_POSTCODE,
        httpStatus: 200,
        httpStatusText: 'OK',
        apiStatus: 'OVER_QUERY_LIMIT',
        apiErrorMessage: 'Too many requests',
      },
      'Distance calculation API returned an unsuccessful response',
    )
  })

  it('logs HTTP and Google API details for an unsuccessful HTTP response', async () => {
    global.fetch.mockResolvedValue(
      mockResponse({
        ok: false,
        status: 403,
        statusText: 'Forbidden',
        body: {
          status: 'REQUEST_DENIED',
          error_message: 'The provided API key is invalid',
        },
      }),
    )

    await expect(callDistanceApiForPostcodes(ORIGIN_POSTCODE, DESTINATION_POSTCODE)).resolves.toBeNull()
    expect(mockLogError).toHaveBeenCalledWith(
      {
        originPostCode: ORIGIN_POSTCODE,
        destinationPostCode: DESTINATION_POSTCODE,
        httpStatus: 403,
        httpStatusText: 'Forbidden',
        apiStatus: 'REQUEST_DENIED',
        apiErrorMessage: 'The provided API key is invalid',
      },
      'Distance calculation API returned an unsuccessful response',
    )
  })

  it('logs fetch-native network error details', async () => {
    const error = new TypeError('fetch failed', { cause: { code: 'ECONNRESET' } })
    global.fetch.mockRejectedValue(error)

    await expect(callDistanceApiForPostcodes(ORIGIN_POSTCODE, DESTINATION_POSTCODE)).resolves.toBeNull()
    expect(mockLogError).toHaveBeenCalledWith(
      {
        originPostCode: ORIGIN_POSTCODE,
        destinationPostCode: DESTINATION_POSTCODE,
        errorName: 'TypeError',
        errorMessage: 'fetch failed',
        errorCode: 'ECONNRESET',
      },
      'Error calling distance calculation',
    )
  })

  it('logs the HTTP response details when the response body is not JSON', async () => {
    const response = mockResponse({ body: null, status: 502, statusText: 'Bad Gateway' })
    response.json.mockRejectedValue(new SyntaxError('Unexpected token'))
    global.fetch.mockResolvedValue(response)

    await expect(callDistanceApiForPostcodes(ORIGIN_POSTCODE, DESTINATION_POSTCODE)).resolves.toBeNull()
    expect(mockLogError).toHaveBeenCalledWith(
      {
        originPostCode: ORIGIN_POSTCODE,
        destinationPostCode: DESTINATION_POSTCODE,
        httpStatus: 502,
        httpStatusText: 'Bad Gateway',
        errorName: 'SyntaxError',
        errorMessage: 'Unexpected token',
      },
      'Error parsing distance calculation API response',
    )
  })
})
