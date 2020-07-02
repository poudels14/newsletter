FROM alpine:3.11 AS BUILD_IMAGE

RUN apk add --no-cache nodejs yarn tree

WORKDIR /app
ADD ./app/package.json .
RUN yarn install

ENV NODE_ENV=production

ADD ./app .
RUN yarn run backend:build

# second stage
FROM node:12-alpine AS SECOND_STAGE

WORKDIR /app
COPY --from=BUILD_IMAGE /app/package.json ./package.json
COPY --from=BUILD_IMAGE /app/yarn.lock ./yarn.lock
RUN yarn install --production=true


# third stage
FROM alpine:3.11
RUN apk add --no-cache nodejs

WORKDIR /app
COPY --from=BUILD_IMAGE /app/build ./build
COPY --from=SECOND_STAGE /app/package.json ./package.json
COPY --from=SECOND_STAGE /app/node_modules ./node_modules

ENTRYPOINT [ "node", "./build/server/main.js" ]