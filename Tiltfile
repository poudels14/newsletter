k8s_yaml(kustomize('./tilt'))

k8s_resource('tilt-envoyproxy', port_forwards=["8000:8000", "5000:5000"])
k8s_resource('tilt-mysql', port_forwards="3306:3306")

# allow access to app server for debugging
k8s_resource('tilt-apibackend', port_forwards=["8001:8001"])
k8s_resource('tilt-frontend', port_forwards=["8002:8002"])
# k8s_resource('tilt-staticserver', port_forwards=["8003:8003"])

docker_build('tilt-apibackend', '.',
    dockerfile='./tilt/app/Dockerfile',
    only=['./app', './highlighter'],
    ignore=['./app/node_modules', './app/frontend'],
    entrypoint='yarn run backend:dev',
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