# Assisted Prison Visits Scheme (APVS) - Asynchronous worker

[![Build Status](https://travis-ci.org/ministryofjustice/apvs-asynchronous-worker.svg?branch=develop)](https://travis-ci.org/ministryofjustice/apvs-asynchronous-worker?branch=develop) [![JavaScript Style Guide](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](http://standardjs.com/)

## Requirements

* Node 6 (Including NPM) - If running locally
* Docker (Including Docker Compose) (optional)

## Run

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
