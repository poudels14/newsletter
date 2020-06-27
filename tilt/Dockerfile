FROM alpine:3.11

RUN apk add --no-cache git tree nodejs yarn openssh-client

WORKDIR /app

ADD ./app/package.json package.json
RUN yarn install

ADD ./app .

ENTRYPOINT [ "yarn", "run", "dev" ]