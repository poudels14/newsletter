# build uploader
FROM golang:1.14.4-alpine3.11 AS UPLOADER_BUILDER

RUN apk add git
WORKDIR /go/src/app
RUN ls
COPY ./tools/staticfilesuploader.go ./staticfilesuploader.go

RUN go get
RUN GOOS=linux CGO_ENABLED=0 go build -o /uploader -a

# compile frontend files
FROM alpine:3.11 AS FRONTEND_COMPILER

RUN apk add --no-cache nodejs yarn tree

WORKDIR /app
ADD ./app/package.json .
RUN yarn install


ENV NODE_ENV=production
ENV STATICSERVER=http://prod-staticserver:8003
ENV STATICFILES_DIRECTORY=/public/static/

ARG GMAIL_API_KEY
ARG GMAIL_CLIENT_ID

ADD ./app .
RUN yarn run frontend:build

# put uploader and compiled files in a same container
FROM busybox
COPY --from=UPLOADER_BUILDER /uploader /uploader
COPY --from=FRONTEND_COMPILER /app/build  /public
RUN cat /public/static/index.html

ENTRYPOINT [ "/uploader" ]



