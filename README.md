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
```

### With Docker Compose
This will run the Asynchronous worker in development mode.

```
docker-compose build
docker-compose up
```

## Test

```
npm test                        # checks code against standard JS and runs mocha unit tests.
npm run-script test-unit        # unit tests
npm run-script test-integration # integration tests
```

## Database

The application requires a MS SQL database instance, configured with an async worker user. See [here](https://github.com/ministryofjustice/apvs/tree/develop/database) for details.

## Notify

The application sends email notifications using the Notify service. In order to utilize the Notify Worker you will need Notify credentials. See [here](https://www.gov.uk/government/publications/govuk-notify/govuk-notify) for details on setting up a Notify account, and config.js for the environment variables to set.
