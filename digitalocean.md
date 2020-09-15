- List culster:
  `doctl kubernetes cluster list`
- Save Kube context:
  `doctl kubernetes cluster kubeconfig save <cluster name>`
- Store authentication token for registry as secret in cluster
  `doctl registry kubernetes-manifest | kubectl apply -f -`
  For different namespace, run:
  `doctl registry kubernetes-manifest --namespace prod-newsletters kubernetes-manifest`
- Instruct default service account to use the image pull secret
  `kubectl patch serviceaccount default -p '{"imagePullSecrets": [{"name": "registry-<my-registry>"}]}'`
- Publishing docker image
  1. Build the docker image
     `docker image build <dir>`; dir should contain Dockerfile
  2. Tag the image to the registry
     `docker tag <image id> <reigstry>/imageId`
  3. Push image to registry
     `docker push <registry>`

Monitoring stack:

- https://marketplace.digitalocean.com/apps/kubernetes-monitoring-stack
