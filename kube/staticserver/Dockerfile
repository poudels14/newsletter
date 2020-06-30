FROM golang:1.14.4-alpine3.11 AS builder

RUN apk add git
WORKDIR /go/src/app
COPY ./staticserver/* ./

RUN go get
RUN GOOS=linux CGO_ENABLED=0 go build -o /server -a


FROM scratch
COPY --from=builder /server .

CMD ["/server"]