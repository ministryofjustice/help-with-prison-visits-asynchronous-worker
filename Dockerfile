# Build args available to all stages
ARG BUILD_NUMBER
ARG GIT_REF
ARG GIT_BRANCH

# Stage: build assets
FROM ghcr.io/ministryofjustice/hmpps-node:24-alpine AS build

ARG BUILD_NUMBER
ARG GIT_REF
ARG GIT_BRANCH

# Cache breaking and ensure required build / git args defined
RUN test -n "$BUILD_NUMBER" || (echo "BUILD_NUMBER not set" && false)
RUN test -n "$GIT_REF" || (echo "GIT_REF not set" && false)
RUN test -n "$GIT_BRANCH" || (echo "GIT_BRANCH not set" && false)

COPY package*.json .allowed-scripts.mjs .npmrc ./
RUN NPM_CONFIG_AUDIT=false NPM_CONFIG_FUND=false npm run setup
ENV NODE_ENV='production'

COPY . .

RUN npm prune --no-audit --no-fund --omit=dev

# Stage: copy production assets and dependencies
FROM ghcr.io/ministryofjustice/hmpps-node:24-alpine-runtime

ARG BUILD_NUMBER
ARG GIT_REF
ARG GIT_BRANCH

RUN mkdir /app/logs && chown appuser:appgroup /app/logs
RUN mkdir /app/data && chown appuser:appgroup /app/data
RUN mkdir /app/tmp && chown appuser:appgroup /app/tmp

COPY --from=build --chown=appuser:appgroup \
        /app/package.json \
        /app/package-lock.json \
        /app/knexfile.js \
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
ENV BUILD_NUMBER=${BUILD_NUMBER}
ENV GIT_REF=${GIT_REF}
ENV GIT_BRANCH=${GIT_BRANCH}
ENV NODE_ENV='production'
USER 2000
