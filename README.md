# BenTheElder's site

This repo contains the source to my personal website as well as the Go
 microservice, docker image, and kubernetes configuration that runs it.

----------

To Future Ben, to set this up from scratch:
- make sure kubectl, docker, go are installed
- login to docker
- get a kubernetes cluster up and running (in this case, kubeadm on ubuntu)
  - further in this case:
  - use the [`nginx-ingress`](https://github.com/kubernetes/ingress-nginx) configuration [for bare metal](https://github.com/kubernetes/ingress-nginx/blob/master/deploy/README.md#baremetal)
    - edit the deployment to have `hostNetwork: true` and `hostPort`s
  - deploy `default-http-backend`
- run `./push_image.sh` to build the site binary and push the site image
- `kubectl apply -f ...` for each of `k8s/*.yaml`
- setup `kube-lego` for https
# for docker registry
- `htpasswd -Bbc ./htpasswd <user> <password>`
- `kubectl create secret docker-registry regsecret --docker-server=<your-registry-server> --docker-username=<user> --docker-password=<password> --docker-email=<your-email>`
- `kubectl create secret generic docker-registry-auth-secret --from-file=htpasswd=htpasswd`
