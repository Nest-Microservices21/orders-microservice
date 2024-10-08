ARG NODE_VERSION=22.3.0
ARG PNPM_VERSION=9.7.0

FROM node:${NODE_VERSION}-alpine AS base

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
RUN apk add --no-cache libc6-compat

# Dependencies stage
FROM base AS deps
WORKDIR /usr/src/app
COPY package*.json pnpm-lock.yaml ./

RUN --mount=type=cache,target=/root/.local/share/pnpm/store \
    pnpm install --prod --frozen-lockfile 

# Build stage
FROM base AS build
WORKDIR /usr/src/app
COPY package*.json pnpm-lock.yaml drizzle.config.ts ./

RUN --mount=type=cache,target=/root/.local/share/pnpm/store \
    pnpm install --frozen-lockfile

COPY --chown=node:node . .
RUN pnpm run build && pnpm drizzle-kit generate

# Development final stage
FROM base AS final-dev
WORKDIR /usr/src/app
COPY --from=build /usr/src/app ./
CMD ["pnpm", "start:dev"]

# Production final stage
FROM base AS final-prod
WORKDIR /usr/src/app
ENV NODE_ENV=production
USER node

COPY --from=deps --chown=node:node /usr/src/app/node_modules ./node_modules
COPY --from=deps --chown=node:node /usr/src/app/package.json ./
COPY --from=build --chown=node:node /usr/src/app/dist ./dist
COPY --from=build --chown=node:node /usr/src/app/drizzle ./drizzle
COPY --from=build --chown=node:node /usr/src/app/migrator ./migrator
# Switch to root user to perform cleanup
USER root
RUN apk del --purge libc6-compat \
    && rm -rf /var/cache/apk/* \
    && rm -rf /tmp/* \
    && rm -rf /usr/src/app/.pnpm-store \
    && if [ -d "/pnpm/store/v3/files" ]; then pnpm store prune; fi

# Switch back to node user
USER node

CMD ["pnpm", "start:prod"]
