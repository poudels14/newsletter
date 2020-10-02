k8s_yaml(kustomize('./tilt'))

k8s_resource('tilt-envoyproxy', port_forwards=["8000:8000", "5000:5000"])
k8s_resource('tilt-mysql', port_forwards="3306:3306")
k8s_resource('tilt-rabbitmq', port_forwards=["5672:5672", "15672:15672"])

# allow access to app server for debugging
k8s_resource('tilt-apiserver', port_forwards=["8001:8001"])
k8s_resource('tilt-frontend', port_forwards=["8002:8002"])
k8s_resource('tilt-mailgunserver', port_forwards=["8004:8004"])

docker_build('tilt-apiserver', '.',
    dockerfile='./tilt/app/Dockerfile',
    only=['./app', './highlighter'],
    ignore=['./app/node_modules', './app/frontend', './app/backend/emailprocessing'],
    entrypoint='yarn run api:dev',
    live_update=[
        sync('./app/backend', '/app/backend'),
        run('cd /app && yarn install', trigger=['./app/package.json', './app/yarn.lock']),
])

docker_build('tilt-emailprocessor', '.',
    dockerfile='./tilt/app/Dockerfile',
    only=['./app', './highlighter'],
    ignore=['./app/node_modules', './app/frontend', './app/backend/api'],
    entrypoint='yarn run emailprocessing:dev',
    live_update=[
        sync('./app/backend', '/app/backend'),
        run('cd /app && yarn install', trigger=['./app/package.json', './app/yarn.lock']),
])

docker_build('tilt-frontend', '.',
    dockerfile='./tilt/app/Dockerfile',
    only=['./app', './highlighter'],
    ignore=['./app/node_modules', './app/backend'],
    entrypoint='yarn run frontend:dev',
    live_update=[
        sync('./app/frontend', '/app/frontend'),
        run('cd /app && yarn install', trigger=['./app/package.json', './app/yarn.lock']),
])

docker_build('tilt-mailgunserver', '.',
    dockerfile='./kube/mailgun/Dockerfile',
    only=['./mailgun'],
    entrypoint='uvicorn --host 0.0.0.0 --port 8004 main:app --reload',
    live_update=[
        sync('./mailgun', '/mailgun'),
        run('pip install -r requirements.txt', trigger=['./mailgun/requirements.txt']),
])