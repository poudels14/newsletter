FROM python:3.9-rc-alpine

RUN apk add --no-cache gcc g++ make libffi-dev openssl-dev

WORKDIR /mailgun

ADD ./mailgun/requirements.txt ./requirements.txt
RUN pip install -r requirements.txt

ADD ./mailgun .

ENTRYPOINT [ "uvicorn", "--host", "0.0.0.0", "--port", "8004", "main:app" ]