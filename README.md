# Help with Prison Visits (HwPV) Asynchronous Worker

[![ministryofjustice](https://circleci.com/gh/ministryofjustice/help-with-prison-visits-asynchronous-worker.svg?style=svg)](https://circleci.com/gh/ministryofjustice/help-with-prison-visits-asynchronous-worker) [![JavaScript Style Guide](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](http://standardjs.com/)

The asynchronous worker is a separate node application which runs a set of jobs as k8s [CronJobs](https://kubernetes.io/docs/concepts/workloads/controllers/cron-jobs/), checking for tasks added to the database by the [External](https://github.com/ministryofjustice/help-with-prison-visits-external) and [Internal](https://github.com/ministryofjustice/help-with-prison-visits-external) node apps to process.

This allows the External/Internal web applications to offload long running or error prone operations to the worker and make it easier to re-run failed processes later.

## Requirements

* Node 12 (Including NPM) - If running locally
* Docker (optional)

## Run

The application does not run continuously and has several tasks which are run by different cron jobs.

As with the internal and external apps, `dotenv` is used to allow local running, see `config.js` for the list of configuration environmental variables needed.

### Locally
Install dependencies and run

```
npm install
npm run start-worker-tasks  # start worker to process regularly performed tasks
npm run start-daily-tasks   # start script to run daily tasks
npm run start-payment-run   # start script to run payment tasks
```

## Test

Currently only the unit tests are fully working. There is tech debt work to get the integration tests running again.

```
npm run test             # checks code against standard JS and runs mocha unit tests.
```

## Task execution

The main asynchronous worker task runs on a CronJob to poll the External and Internal database †ask tables for tasks to execute in batches. Tasks which fail can be re-executed by updating their status or re-inserting with same data. It uses the value set in [worker-tasks-cron.yaml](https://github.com/ministryofjustice/help-with-prison-visits-asynchronous-worker/blob/main/helm_deploy/help-with-prison-visits-asynchronous-worker/templates/worker-tasks-cron.yaml) to control when it is run.

### Running daily tasks

The script [start-daily-tasks.js](https://github.com/ministryofjustice/help-with-prison-visits-asynchronous-worker/blob/main/start-daily-tasks.js) is used to run tasks which need to be executed daily, using the value set in [daily-tasks-cron.yaml](https://github.com/ministryofjustice/help-with-prison-visits-asynchronous-worker/blob/main/helm_deploy/help-with-prison-visits-asynchronous-worker/templates/daily-tasks-cron.yaml) to control when it is run.

### Running payment run tasks

The script [start-payment-run.js](https://github.com/ministryofjustice/help-with-prison-visits-asynchronous-worker/blob/main/start-payment-run.js) is used to run payment run tasks which need to be executed on a custom schedule, using the value set in [payment-run-cron.yaml](https://github.com/ministryofjustice/help-with-prison-visits-asynchronous-worker/blob/main/helm_deploy/help-with-prison-visits-asynchronous-worker/templates/payment-run-cron.yaml) to control when it is run.

## Integration points

### Database

The application requires a MS SQL database instance, configured with an async worker user.

### Notify

The application sends email notifications using the Notify service. In order to utilize the Notify Worker you will need Notify credentials. See [here](https://www.gov.uk/government/publications/govuk-notify/govuk-notify) for details on setting up a Notify account, and `config.js` for the environment variables to set.

See [send-notification.js](https://github.com/ministryofjustice/help-with-prison-visits-asynchronous-worker/blob/main/app/services/notify/send-notification.js) for implementation.

### DWP benefit checker

The `DWP-CHECK` task requires making a call to the DWP Benefit Checker service. This is a SOAP service to validate that given details (surname, dob, nino) a person is recorded with DWP as receiving benefits (Yes/No/Undetermined). Calling the service requires a number of environment variables set, see `config.js`.

See [call-dwp-benefit-checker-soap-service.js](https://github.com/ministryofjustice/help-with-prison-visits-asynchronous-worker/blob/main/app/services/benefit-checker/call-dwp-benefit-checker-soap-service.js) for implementation, [here](https://github.com/ministryofjustice/help-with-prison-visits-asynchronous-worker/blob/main/app/services/benefit-checker/BenefitChecker.wsdl) for the SOAP service WSDL.

### Google Distance Matrix API

To calculate car expense distances the `COMPLETE-CLAIM` task calls the [Google Distance Matrix API](https://developers.google.com/maps/documentation/distance-matrix/) and attempt to retrieve the distance between the visitor address and the prison (using postcodes).

See [call-distance-api-for-postcodes.js](https://github.com/ministryofjustice/help-with-prison-visits-asynchronous-worker/blob/main/app/services/distance-checker/call-distance-api-for-postcodes.js) for implementation.
