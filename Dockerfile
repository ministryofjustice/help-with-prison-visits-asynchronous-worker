# NOTE THIS IS NOT A PRODUCTION READY CONTAINER FOR DEVELOPMENT ONLY
FROM node:6.5.0

RUN mkdir -p /usr/src/app/app
WORKDIR /usr/src/app

COPY package.json /usr/src/app/
COPY config.js /usr/src/app/
COPY start.js /usr/src/app/
COPY knexfile.js /usr/src/app/
COPY nodemon.json /usr/src/app/
COPY app /usr/src/app/app

EXPOSE 3999

HEALTHCHECK CMD curl --fail http://localhost:3999/status || exit 1

# Resolve dependencies at container startup to allow caching
CMD npm install && node_modules/.bin/nodemon start.js --config="nodemon.json"