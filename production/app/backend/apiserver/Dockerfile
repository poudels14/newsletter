FROM alpine:3.11 AS BUILD_IMAGE

RUN apk add --no-cache nodejs yarn tree

# TODO(sagar): dont have to do this once highlighter is added to npm
COPY ./highlighter /highlighter
WORKDIR /app
ADD ./app/package.json .
RUN yarn install

ENV NODE_ENV=production

ADD ./app .
RUN yarn run api:build



############## second stage ##############
FROM node:12-alpine AS SECOND_STAGE

# TODO(sagar): dont have to do this once highlighter is added to npm
COPY ./highlighter /highlighter
WORKDIR /app
COPY --from=BUILD_IMAGE /app/package.json ./package.json
COPY --from=BUILD_IMAGE /app/yarn.lock ./yarn.lock
RUN yarn install --production=true



############## third stage ##############
FROM alpine:3.11
RUN apk add --no-cache nodejs

WORKDIR /app
COPY --from=BUILD_IMAGE /app/build ./build
COPY --from=SECOND_STAGE /app/package.json ./package.json
COPY --from=SECOND_STAGE /app/node_modules ./node_modules

ENTRYPOINT [ "node", "./build/backend/api/main.js" ]