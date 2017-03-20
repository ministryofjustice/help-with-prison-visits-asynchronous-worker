# Assisted Prison Visits Scheme (APVS) - Asynchronous worker

[![Build Status](https://travis-ci.org/ministryofjustice/apvs-asynchronous-worker.svg?branch=develop)](https://travis-ci.org/ministryofjustice/apvs-asynchronous-worker?branch=develop) [![JavaScript Style Guide](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](http://standardjs.com/) [![NSP Status](https://nodesecurity.io/orgs/ministry-of-justice-digital/projects/43b6ef86-4a66-4d58-b63d-e550b42fefc5/badge)](https://nodesecurity.io/orgs/ministry-of-justice-digital/projects/43b6ef86-4a66-4d58-b63d-e550b42fefc5)

The asynchronous worker is a separate node application which runs continously, checking for tasks added to the database by the [External Web](https://github.com/ministryofjustice/apvs-external-web) and [Internal Web](https://github.com/ministryofjustice/apvs-internal-web) to process.

This allows the External/Internal web applications to offload long running or error prone operations to the worker and make it easier to re-run failed processes later.

## Requirements

* Node 6 (Including NPM) - If running locally
* Docker (Including Docker Compose) (optional)
* Python (for generating ADI Journal as part of payment run)

## Run

Running the application will cause it to poll the database for new tasks continously and respond on port 3999 (default, overriden by env `PORT`) at `/status` for a healthcheck.

See `config.js` for the list of configuration environmental variables needed.

### Locally
Install dependencies and run

```
npm install
npm start                                 # start worker
npm run-script start-web                  # start Express healthcheck available on http://localhost:3999/status
npm run-script start-schedule-daily-tasks # start schedule script for daily tasks
npm run-script start-schedule-payment-run # start schedule script for payment run tasks
```

### With Docker Compose
This will run the Asynchronous worker in development mode.

```
docker-compose build
docker-compose up
```

### Heroku

The application can be deployed to [heroku](https://www.heroku.com/) for quick preview.

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
npm run-script test-coverage    # generate code coverage report
```

## Task execution

The asynchronous worker uses [npm cron](https://www.npmjs.com/package/cron) to poll the External and Internal database †ask tables for tasks to execute in batches. Tasks which fail can be re-executed by updating their status or re-inserting with same data.

### Scheduling daily tasks

The script [start-schedule-daily-tasks.js](https://github.com/ministryofjustice/apvs-asynchronous-worker/blob/develop/start-schedule-daily-tasks.js) is used to insert tasks which need to be executed daily, using `DAILY_TASKS_CRON` environmental variable to control cron.

### Scheduling payment run

The script [start-schedule-payment-run.js](https://github.com/ministryofjustice/apvs-asynchronous-worker/blob/develop/start-schedule-payment-run.js) is used to insert payment run tasks which need to be executed on a custom schedule, using `PAYMENT_GENERATION_CRON` environmental variable to control cron.

## Integration points

### Database

The application requires a MS SQL database instance, configured with an async worker user. See [here](https://github.com/ministryofjustice/apvs/tree/develop/database) for details.

### Notify

The application sends email notifications using the Notify service. In order to utilize the Notify Worker you will need Notify credentials. See [here](https://www.gov.uk/government/publications/govuk-notify/govuk-notify) for details on setting up a Notify account, and `config.js` for the environment variables to set.

See [send-notification.js](https://github.com/ministryofjustice/apvs-asynchronous-worker/blob/develop/app/services/notify/send-notification.js) for implementation.

### DWP benefit checker

The `DWP-CHECK` task requires making a call to the DWP Benefit Checker service. This is a IP whitelisted SOAP service only available to approved government services to validate that given details (surname, dob, nino) a person is recorded with DWP as receiving benefits (Yes/No/Undetermined). Calling the service requires a number of environment variables set, see `config.js`.

See [call-dwp-benefit-checker-soap-service.js](https://github.com/ministryofjustice/apvs-asynchronous-worker/blob/develop/app/services/benefit-checker/call-dwp-benefit-checker-soap-service.js) for implementation, [here](https://github.com/ministryofjustice/apvs-asynchronous-worker/blob/develop/app/services/benefit-checker/BenefitChecker.wsdl) for the SOAP service WSDL.

### Google Distance Matrix API

To calculate car expense distances the `COMPLETE-CLAIM` task calls the [Google Distance Matrix API](https://developers.google.com/maps/documentation/distance-matrix/) and attempt to retrieve the distance between the visitor address and the prison (using postcodes).

See [call-distance-api-for-postcodes.js](https://github.com/ministryofjustice/apvs-asynchronous-worker/blob/develop/app/services/distance-checker/call-distance-api-for-postcodes.js) for implementation.

## Notes

### Python

This node application uses [python-shell](https://www.npmjs.com/package/python-shell) to call a number of python scripts as part of the `GENERATE-DIRECT-PAYMENTS` task. This is required as node libraries for generating XSLM files do not support preserving macros, which are included in supplied template for the ADI Journal.

This project uses Python major [Version 2.7](https://www.python.org/download/releases/2.7/)

To install the required python dependencies run:

```
pip install -r python/requirements.txt
```

### Updating dependencies

This node application uses [npm shrinkwrap](https://docs.npmjs.com/cli/shrinkwrap) to fix dependencies and peer dependencies to specific versions. This prevents node modules from automatically updating on new releases without developers knowledge.

To manually update a dependency (e.g. GOV.UK styles) use `npm update my-dependency` and commit the updated `package.json` and `npm-shrinkwrap.json` files.

Please note, there is an outstanding [bug in npm](https://github.com/npm/npm/issues/14042) which attempts to install incompatible optional dependencies when referenced in shrinkwrap (`fsevents` is one). To prevent this, either update the dependency from inside a docker image or manually remove the dependency from `npm-shrinkwrap.json`.
