# Assisted Prison Visits Scheme (APVS) - Asynchronous worker

[![Build Status](https://travis-ci.org/ministryofjustice/apvs-asynchronous-worker.svg?branch=develop)](https://travis-ci.org/ministryofjustice/apvs-asynchronous-worker?branch=develop) [![JavaScript Style Guide](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](http://standardjs.com/)

The asynchronous worker is a separate node application which runs continously, checking for tasks added to the database by the [External Web](https://github.com/ministryofjustice/apvs-external-web) and [Internal Web](https://github.com/ministryofjustice/apvs-internal-web) to process.

This allows the External/Internal web applications to offload long running or error prone operations to the worker and make it easier to re-run failed processes later.

## Requirements

* Node 6 (Including NPM) - If running locally
* Docker (Including Docker Compose) (optional)

## Run

Running the application will cause it to poll the database for new tasks continously and respond on port 3999 (default, overriden by env `PORT`) at `/status` for a healthcheck.

See `config.js` for the list of configuration environmental variables needed.

### Locally
Install dependencies and run

```
npm install
npm start

# start Express healthcheck available on http://localhost:3999/status
npm run-script start-web
```

### With Docker Compose
This will run the Asynchronous worker in development mode.

```
docker-compose build
docker-compose up
```

### Heroku

The application can be deployed to [heroku](https://www.heroku.com/) for quick preview.

Deployment to heroku is automatically performed by [Travis using an encrypted deployment key](https://docs.travis-ci.com/user/deployment/heroku/) in `.travis.yml`.

```
heroku login
heroku create
heroku buildpacks:set heroku/nodejs

# Set config vars for application
# heroku config:set DB_USERNAME=mydbuser
# NOTE: APVS_ASYNC_START_WEB=true must be used as heroku will kill applications which do not bind a port

git push heroku master
```

## Test

```
npm test                        # checks code against standard JS and runs mocha unit tests.
npm run-script test-unit        # unit tests
npm run-script test-integration # integration tests
```

## Integration points

### Database

The application requires a MS SQL database instance, configured with an async worker user. See [here](https://github.com/ministryofjustice/apvs/tree/develop/database) for details.

### Notify

The application sends email notifications using the Notify service. In order to utilize the Notify Worker you will need Notify credentials. See [here](https://www.gov.uk/government/publications/govuk-notify/govuk-notify) for details on setting up a Notify account, and `config.js` for the environment variables to set.

See [send-notification.js](https://github.com/ministryofjustice/apvs-asynchronous-worker/blob/develop/app/services/notify/send-notification.js) for implementation.

### DWP benefit checker

The `DWP-CHECK` task requires making a call to the DWP Benefit Checker service. This is a IP whitelisted SOAP service only available to approved government services to validate that given details (surname, dob, nino) a person is recorded with DWP as receiving benefits (Yes/No/Undetermined). Calling the service requires a number of environment variables set, see `config.js`.

See [call-dwp-benefit-checker-soap-service.js](https://github.com/ministryofjustice/apvs-asynchronous-worker/blob/develop/app/services/benefit-checker/call-dwp-benefit-checker-soap-service.js) for implementation, [here](https://github.com/ministryofjustice/apvs-asynchronous-worker/blob/develop/app/services/benefit-checker/BenefitChecker.wsdl) for the SOAP service WSDL.

