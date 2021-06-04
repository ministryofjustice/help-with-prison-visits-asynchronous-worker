FROM node:12-buster as builder

ARG BUILD_NUMBER
ARG GIT_REF

RUN apt-get update && \
    apt-get upgrade -y

WORKDIR /app

COPY . .

RUN npm ci --no-audit

RUN npm prune --production

FROM node:12-buster-slim
LABEL maintainer="HMPPS Digital Studio <info@digital.justice.gov.uk>"

RUN apt-get update && \
    apt-get upgrade -y && \
    apt-get autoremove -y && \
    rm -rf /var/lib/apt/lists/*

RUN addgroup --gid 2000 --system appgroup && \
    adduser --uid 2000 --system appuser --gid 2000

ENV TZ=Europe/London
RUN ln -snf "/usr/share/zoneinfo/$TZ" /etc/localtime && echo "$TZ" > /etc/timezone

# Create app directory
RUN mkdir /app && chown appuser:appgroup /app
RUN mkdir /app/logs && chown appuser:appgroup /app/logs
RUN mkdir /app/data && chown appuser:appgroup /app/data
USER 2000
WORKDIR /app

COPY --from=builder --chown=appuser:appgroup \
        /app/package.json \
        /app/package-lock.json \
        /app/knexfile.js \
        /app/config.js \
        /app/start-worker-tasks.js \
        /app/start-schedule-payment-run.js \
        /app/start-schedule-daily-tasks.js \
        /app/start-daily-auto-approval-check.js \
        ./

COPY --from=builder --chown=appuser:appgroup \
        /app/node_modules ./node_modules

COPY --from=builder --chown=appuser:appgroup \
        /app/app ./app

ENV PORT=3999

EXPOSE 3999
USER 2000

HEALTHCHECK CMD curl --fail http://localhost:3999/status || exit 1

CMD [ "node", "./app/web/bin/www" ]
