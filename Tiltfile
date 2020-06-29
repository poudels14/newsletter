k8s_yaml(kustomize('./tilt'))

k8s_resource('tilt-envoy-proxy', port_forwards=["8000:8000", "5000:5000"])
k8s_resource('tilt-mysql', port_forwards="3306:3306")

# allow access to app server for debugging
k8s_resource('tilt-appserver', port_forwards=["8001:8001", "8002:8002"])
k8s_resource('tilt-staticserver', port_forwards=["8003:8003"])

docker_build('tilt-app-container', '.',
    dockerfile='./tilt/app/Dockerfile',
    only=['./app'],
    ignore=['./app/node_modules'],
    entrypoint='yarn run dev',
    live_update=[
        sync('./app', '/app'),
        run('cd /app && yarn install', trigger=['./app/package.json', './app/yarn.lock']),
])


docker_build('tilt-staticserver-container', '.',
    dockerfile='./tilt/staticserver/Dockerfile',
    only=['./newsletters'],
    live_update=[
        sync('./newsletters/public', '/app/public'),
])