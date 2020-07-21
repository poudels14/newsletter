FROM alpine:3.11

RUN apk add --no-cache git tree nodejs yarn openssh-client

# TODO(sagar): dont have to do this once highlighter is added to npm
COPY ./highlighter /highlighter

WORKDIR /app

ADD ./app/package.json package.json
RUN yarn install

ADD ./app .