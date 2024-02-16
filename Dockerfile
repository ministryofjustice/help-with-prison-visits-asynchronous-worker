FROM node:20-bookworm-slim as base

ARG BUILD_NUMBER=1_0_0
ARG GIT_REF=not-available

LABEL maintainer="HMPPS Digital Studio <info@digital.justice.gov.uk>"

ENV TZ=Europe/London
RUN ln -snf "/usr/share/zoneinfo/$TZ" /etc/localtime && echo "$TZ" > /etc/timezone

RUN addgroup --gid 2000 --system appgroup && \
    adduser --uid 2000 --system appuser --gid 2000

WORKDIR /app

ENV BUILD_NUMBER ${BUILD_NUMBER:-1_0_0}

RUN apt-get update && \
    apt-get upgrade -y && \
    apt-get autoremove -y && \
    rm -rf /var/lib/apt/lists/*

# Stage: build assets
FROM base as build

ARG BUILD_NUMBER=1_0_0
ARG GIT_REF=not-available

RUN apt-get update

COPY . .

RUN npm ci --no-audit \
    export BUILD_NUMBER=${BUILD_NUMBER} && \
    export GIT_REF=${GIT_REF} && \
    npm run record-build-info

RUN npm prune --no-audit --omit=dev

FROM base

# RUN mkdir /app && chown appuser:appgroup /app
RUN mkdir /app/logs && chown appuser:appgroup /app/logs
RUN mkdir /app/data && chown appuser:appgroup /app/data
RUN mkdir /app/tmp && chown appuser:appgroup /app/tmp

COPY --from=build --chown=appuser:appgroup \
        /app/package.json \
        /app/package-lock.json \
        /app/knexfile.js \
        /app/build-info.json \
        /app/config.js \
        /app/start-worker-tasks.js \
        /app/start-payment-run.js \
        /app/start-daily-tasks.js \
        /app/start-daily-auto-approval-check.js \
        ./

COPY --from=build --chown=appuser:appgroup \
        /app/node_modules ./node_modules

COPY --from=build --chown=appuser:appgroup \
        /app/app ./app

ENV PORT=3999

EXPOSE 3999
USER 2000
