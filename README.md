Development environment requirements:

- Node.js
- Tilt: https://tilt.dev/

Development environment setup:

- Secrets:
  There are several environment variables that are requireed by the app during runtime. These are stored in secret files which will be used by Tilt in development environment and kubernetes clusters in production environment. Most of these variables should be kept secret, so, git is configured to NOT track those files. To get the app up and running, you need to create following secret files:

  - filename: tilt/secrets/apibackend.env
    content:

    - NODE_ENV=development
    - GMAIL_API_KEY={value (obtained from Google Api Console)}
    - GMAIL_CLIENT_ID={value (obtained from Google Api Console)}
    - GMAIL_CLIENT_SECRET={value (obtained from Google Api Console)}
    - GMAIL_REDIRECT_URL=http://localhost:8000
    - LOGIN_COOKIE_SIGNING_KEY={any random value}
    - NEWSLETTERS_STATIC_SERVER=http://tilt-staticserver:8003
    - MYSQL_HOST=tilt-mysql
    - MYSQL_DATABASE={database name (can be random)}
    - MYSQL_USER={database user (can be anything)}
    - MYSQL_PASSWORD={database password (can be random)}
    - GMAIL_REFRESH_TOKEN_ENCRYPTION_KEY={any random encryption key}

  - filename: tilt/secrets/frontend.env
    content:

    - NODE_ENV=development
    - GMAIL_API_KEY={value}
    - GMAIL_CLIENT_ID={value}
    - GMAIL_CLIENT_SECRET={value}
    - GMAIL_REDIRECT_URL=http://localhost:8000

  - filename:mysql.env
    content:
    - MYSQL_ROOT_PASSWORD={root mysql password (can be random)}
    - MYSQL_DATABASE={database name}
    - MYSQL_USER={database user (can be anything)}
    - MYSQL_PASSWORD={database password (can be random)}

Running services:

- In the application's root folder, run `tilt up` and visit `http://localhost:10350/` to see the status of the services running. The services will restart automatically if any change is made.
