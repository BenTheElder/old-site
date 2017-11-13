# BenTheElder's site

This repo contains the source to my personal website as well as the Go
 microservice, docker image, and kubernetes configuration that runs it.

----------

To Future Ben, to set this up from scratch:
- make sure kubectl, docker, go are installed
- login to docker
- get a kubernetes cluster up and running (in this case, kubeadm on ubuntu)
  - further in this case:
  - use the `nginx-ingress` configuration for bare metal
    - edit the deployment to have `hostNetwork: true` and `hostPort`s
  - deploy `default-http-backend`
- run `./push_image.sh` to build the site binary and push the site image
- `kubectl create -f ...` for each of `deployment.yaml`, `service.yaml`, `ingress.yaml`
- setup `kube-lego` for https
