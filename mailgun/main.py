from fastapi import FastAPI, Request, Form, HTTPException
import hashlib, hmac
from boto3 import session
from botocore.client import Config
import uuid
import os
import requests

session = session.Session()
client = session.client('s3',
                        region_name=os.environ['DO_SPACES_REGION'],
                        endpoint_url=os.environ['DO_SPACES_ENDPOINT_URL'],
                        aws_access_key_id=os.environ['DO_SPACES_ACCESS_ID'],
                        aws_secret_access_key=os.environ['DO_SPACES_SECRET_KEY'])

def verify_signature(signing_key, token, timestamp, signature):
    hmac_digest = hmac.new(key=signing_key.encode(),
                           msg=('{}{}'.format(timestamp, token)).encode(),
                           digestmod=hashlib.sha256).hexdigest()
    return hmac.compare_digest(str(signature), str(hmac_digest))

app = FastAPI()

@app.get("/healthy")
async def root():
  return "OK"

@app.post("/webhook/mail/{user_id}")
async def incoming_mail(
  user_id: str,
  request: Request,
  timestamp: int = Form(...),
  token: str = Form(...),
  signature: str = Form(...),
  message_url: str = Form(None, alias="message-url"),
  body_html: str = Form(None, alias="body-html"),
):
  if not verify_signature(os.environ['MAILGUN_WEBHOOK_SIGNING_KEY'], token, timestamp, signature):
    raise HTTPException(status_code=400)

  req = requests.get(message_url, auth=("api", os.environ['MAILGUN_API_KEY']))
  client.put_object(Body=req.text, Bucket='mailgun-mails', Key='{}/{}.json'.format(user_id, uuid.uuid3(uuid.NAMESPACE_URL, message_url)))

  # TODO(sagar): trigger background job to parse digest content

  return "OK"