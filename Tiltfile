k8s_yaml(kustomize('./tilt'))

k8s_resource('tilt-envoy-proxy', port_forwards=["8000:8000", "5000:5000"])
k8s_resource('tilt-postgres', port_forwards="5432:5432")
k8s_resource('tilt-pgadmin', port_forwards="5050:80")

# allow access to app server for debugging
k8s_resource('tilt-appserver', port_forwards=["8001:8001", "8002:8002"])

docker_build('tilt-app-container', '.',
    dockerfile='./tilt/Dockerfile',
    ignore=['app/node_modules'],
    entrypoint='yarn run dev',
    live_update=[
        sync('./app', '/app'),
        run('cd /app && yarn install', trigger=['./app/package.json', './app/yarn.lock']),
])