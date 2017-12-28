---
header-includes:
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link rel="stylesheet" type="text/css" href="/style.css?stamp=1514442948"/>
    <meta name="theme-color" content="#01579b" />
    <!-- favicon, all platforms -->
    <link rel="apple-touch-icon-precomposed" sizes="57x57" href="/images/icons/apple-touch-icon-57x57.png" />
    <link rel="/apple-touch-icon-precomposed" sizes="114x114" href="/images/icons/apple-touch-icon-114x114.png" />
    <link rel="apple-touch-icon-precomposed" sizes="72x72" href="/images/icons/apple-touch-icon-72x72.png" />
    <link rel="apple-touch-icon-precomposed" sizes="144x144" href="/images/icons/apple-touch-icon-144x144.png" />
    <link rel="apple-touch-icon-precomposed" sizes="60x60" href="/images/icons/apple-touch-icon-60x60.png" />
    <link rel="apple-touch-icon-precomposed" sizes="120x120" href="/images/icons/apple-touch-icon-120x120.png" />
    <link rel="apple-touch-icon-precomposed" sizes="76x76" href="/images/icons/apple-touch-icon-76x76.png" />
    <link rel="apple-touch-icon-precomposed" sizes="152x152" href="/images/icons/apple-touch-icon-152x152.png" />
    <link rel="icon" type="image/png" href="/images/icons/favicon-196x196.png" sizes="196x196" />
    <link rel="icon" type="image/png" href="/images/icons/favicon-96x96.png" sizes="96x96" />
    <link rel="icon" type="image/png" href="/images/icons/favicon-32x32.png" sizes="32x32" />
    <link rel="icon" type="image/png" href="/images/icons/favicon-16x16.png" sizes="16x16" />
    <link rel="icon" type="image/png" href="/images/icons/favicon-128.png" sizes="128x128" />
    <meta name="application-name" content="&nbsp;"/>
    <meta name="msapplication-TileColor" content="#FFFFFF" />
    <meta name="msapplication-TileImage" content="/images/icons/mstile-144x144.png" />
    <meta name="msapplication-square70x70logo" content="/images/icons/mstile-70x70.png" />
    <meta name="msapplication-square150x150logo" content="/images/icons/mstile-150x150.png" />
    <meta name="msapplication-wide310x150logo" content="/images/icons/mstile-310x150.png" />
    <meta name="msapplication-square310x310logo" content="/images/icons/mstile-310x310.png" />
pagetitle: "Migrating My Site To Kubernetes | BenTheElder"
---

<!DOCTYPE html>
<html lang="en">
<body>

<div><link href="https://fonts.googleapis.com/css?family=Open+Sans:400,700|Roboto:400,500,700" rel="stylesheet" lazyload="1" /></div>


<div class="header">
<div class="header-content">
<span class="brand"><a href="/">BenTheElder</a></span><div class="nav"><span><a href="/projects">PROJECTS</a>
</span></span><span><a class="current" href="/posts">POSTS</a></span><span><a href="/about">ABOUT</a></div>
</div>
</div>


<div class="card blog-content">
<p class="title">Migrating My Site To Kubernetes</p>
<p class="sub-title">November 16th, 2017</p>

<div class="full-bleed warning centered-text">
<p class="big bold">Disclaimer:&nbsp;&nbsp;I work at Google in Cloud on Kubernetes things, but this is a personal post.</p>
</div>

[Previously](https://bentheelder.io/blog/hello-again) when I brought my my site back online I breifly mentioned the simple setup I threw together with Caddy running on a tiny [GCE](https://cloud.google.com/compute/) VM with a few scripts&nbsp;&nbsp;—&nbsp;&nbsp;Since then I've had plenty of time to experience the awesomeness that is managing services with [Kubernetes](https://kubernetes.io/) at work while developing Kubernetes's [testing infrastructure](https://github.com/kubernetes/test-infra/) (which we run on [GKE](https://cloud.google.com/kubernetes-engine/)).

So I decided, of course, that it was only natural to migrate my own service(s) to Kubernetes for maximum dog-fooding. <img src="/images/kubernetes_logo.svg" class="emoji" title="kubernetes logo"></img>↔<img src="/images/emoji/emoji_u1f436.png" class="emoji" alt="dog" title="dog"></img>

This turned out to be even easier than expected and I was quickly up and running on a toy single-node cluster running on a spare linux box at home with the help of the excellent [official docs for setting up a cluster with kubeadm](https://kubernetes.io/docs/setup/independent/create-cluster-kubeadm/).
After that I set up [ingress-nginx](https://github.com/kubernetes/ingress-nginx) to handle ingress to my service(s) and [kube-lego](https://github.com/jetstack/kube-lego) to manage [letsencrypt](https://letsencrypt.org/) certificates. I then replaced Caddy with my own minimal containerized Go service to continue having [GitHub webhooks](https://developer.github.com/webhooks/) trigger site updates. <img src="/images/gopher_favicon.svg" class="emoji" title="go gopher"></img>

I did run into the following hiccups:

1) To get DNS resolution within the cluster of external services I needed to [configure kube-dns](https://kubernetes.io/docs/tasks/administer-cluster/dns-custom-nameservers/) with `kubectl apply -f ./k8s/kube-dns-configmap.yaml` where my `./k8s/kube-dns-configmap.yaml` contained:
```yaml
# resolve external services using Google's public DNS
apiVersion: v1
kind: ConfigMap
metadata:
  name: kube-dns
  namespace: kube-system
data:
  upstreamNameservers: |
    [“8.8.8.8”]
```

2) I also needed to configure [RBAC](https://kubernetes.io/docs/admin/authorization/rbac/) for `kube-lego` which doesn't currently ship with RBAC configured out of the box. Again, this was just involved applying a config update based on the comments at [jetstack/kube-lego#99](https://github.com/jetstack/kube-lego/issues/99) with `kubectl apply -f k8s/kube-lego.yaml`. The config below is probably giving `kube-lego` a lot more access than it needs, but I wasn't particularly concerned about this since this is on a toy "cluster" for my personal site and the service is already managing my TLS certificates. <img src="/images/emoji/emoji_u1f937_1f3fb_200d_2642.png" alt="shrug" title="shrug" class="emoji"></img>  

My `k8s/kube-lego.yaml` contained:

<details>
```yaml
# Complete setup for kube-lego.
# The only thing specific to my cluster here is the lego.email setting,
# the rest is just kube-lego with RBAC.
# Thanks to comments at: https://github.com/jetstack/kube-lego/issues/99
apiVersion: v1
kind: Namespace
metadata:
  name: kube-lego
---
apiVersion: v1
metadata:
  name: kube-lego
  namespace: kube-lego
data:
  # modify this to specify your address
  lego.email: "bentheelder@gmail.com"
  # configure for letsencrypt's production api
  lego.url: "https://acme-v01.api.letsencrypt.org/directory"
kind: ConfigMap
---
apiVersion: rbac.authorization.k8s.io/v1beta1
kind: ClusterRole
metadata:
    name: lego
rules:
- apiGroups:
  - ""
  - "extensions"
  resources:
  - configmaps
  - secrets
  - services
  - endpoints
  - ingresses
  - nodes
  - pods
  verbs:
  - list
  - get
  - watch
- apiGroups:
  - ""
  resources:
  - services
  verbs:
  - create
- apiGroups:
  - "extensions"
  - ""
  resources:
  - ingresses
  - ingresses/status
  verbs:
  - get
  - update
  - create
  - list
  - patch
  - delete
  - watch
- apiGroups:
  - "*"
  - ""
  resources:
  - events
  - certificates
  - secrets
  verbs:
  - create
  - list
  - update
  - get
  - patch
  - watch
---
apiVersion: rbac.authorization.k8s.io/v1beta1
kind: ClusterRoleBinding
metadata:
  name: lego
roleRef:
  apiGroup: rbac.authorization.k8s.io
  kind: ClusterRole
  name: lego
subjects:
  - kind: ServiceAccount
    name: lego
    namespace: kube-lego
---
apiVersion: v1
kind: ServiceAccount
metadata:
  name: lego
  namespace: kube-lego
---
apiVersion: extensions/v1beta1
kind: Deployment
metadata:
  name: kube-lego
  namespace: kube-lego
spec:
  replicas: 1
  template:
    metadata:
      labels:
        app: kube-lego
    spec:
      serviceAccountName: lego
      containers:
      - name: kube-lego
        image: jetstack/kube-lego:0.1.5
        imagePullPolicy: Always
        ports:
        - containerPort: 8080
        env:
        - name: LEGO_EMAIL
          valueFrom:
            configMapKeyRef:
              name: kube-lego
              key: lego.email
        - name: LEGO_URL
          valueFrom:
            configMapKeyRef:
              name: kube-lego
              key: lego.url
        - name: LEGO_NAMESPACE
          valueFrom:
            fieldRef:
              fieldPath: metadata.namespace
        - name: LEGO_POD_IP
          valueFrom:
            fieldRef:
              fieldPath: status.podIP
        readinessProbe:
          httpGet:
            path: /healthz
            port: 8080
          initialDelaySeconds: 5
          timeoutSeconds: 1
---
```
</details>

After applying these two changes the rest of [my very simple config](https://github.com/BenTheElder/site/tree/master/k8s) to deploy the Go service
 behind automatic TLS termination worked flawlessly. Since then managing the
site has been an excellent experience with the power of `kubectl`, [the kubernetes
swiss army knife](https://kubernetes.io/docs/user-guide/kubectl-overview/).

In conclusion:

- If you haven't given Kubernetes a try but you are already comfortable with Docker
 you should give it a try. Kubernetes makes managing services *easy and portable*.
The same `kubectl` commands I use to debug our services for the Kubernetes project's
 infrstructure on GKE work just as well on my toy cluster at home. <img src="/images/emoji/emoji_u1f604.png" alt="grin" title="grin" class="emoji"></img>

- If you want to give Kubernetes a try with much less effort [Google Cloud](https://cloud.google.com/) offers [a free 12 month, $300 credit](https://cloud.google.com/free/) and an [always-free tier](https://cloud.google.com/free/) which both include [Google Kubernetes Engine](https://cloud.google.com/kubernetes-engine/).  
We use GKE heavily for the project infrastructure and I can speak highly to it's ease of use
 and freedom to focus on your services without worrying about setting up and maintaining all of the pluggable Kubernetes bits such as [logging](https://kubernetes.io/docs/tasks/debug-application-cluster/logging-stackdriver/), [master upgrades](https://cloud.google.com/kubernetes-engine/docs/clusters/upgrade), [node auto repair](https://cloud.google.com/kubernetes-engine/docs/node-auto-repair), [IAM](https://cloud.google.com/iam/), [cluster networking](https://kubernetes.io/docs/concepts/cluster-administration/networking/#google-compute-engine-gce), etc. 

If my site were a serious production service instead of a toy learning experience I would seriously look towards GKE instead of a one node "cluster" running on a DIY "server" sitting by my desk at home, but setting up a toy cluster with `kubeadm` was a great experience for experimenting with Kubernetes. I can reccomend using kubeadm for similar experiments, it's quite simple to use once you have all the prerequesites installed and configured and the docs are quite good, however it won't solve many of the things you'll want for a production cluster.

You may also want to look around the list of the many [CNCF certified Kubernetes conformant products](https://www.cncf.io/certification/software-conformance/) for other options if for some reason neither of these sound appealing to you. 

----

Addendum:

1) I also used [Calico](https://www.projectcalico.org/) for my overlay network, but I haven't really exercised it yet so I can't really comment on it.
2) Kubernetes [secrets](https://kubernetes.io/docs/concepts/configuration/secret/) are awesome. My simple Go service can just read in the GitHub webhook secret as an environment variable injected into the container without worrying about how the secret is loaded and stored.<!-- <img src="/images/emoji/emoji_u1f510.png" title="Locked with Key" class="emoji"></img> -->
3) To get a one node cluster working you need to [remove the master taint](https://kubernetes.io/docs/setup/independent/create-cluster-kubeadm/#master-isolation). This is terrible idea for a production cluster but great for tinkering and effectively using kubelet as your PID1.

<div style="clear: both;"></div>
</div>
</div>

<!--comments card-->
<div class="card">
<p class="title">Comments</p>
<div id="disqus_thread"></div>
<script>
    var disqus_config = function () {
        this.page.url = "https://bentheelder.io/posts/migrating-my-site-to-kubernetes";
        this.page.identifier = "posts/migrating-my-site-to-kubernetes";
    };
    (function() {
        var d = document, s = d.createElement('script');
        s.src = 'https://bentheelder.disqus.com/embed.js';
        s.setAttribute('data-timestamp', +new Date());
        (d.head || d.body).appendChild(s);
    })();
</script>
<noscript><p>Comments powered by <a href="https://disqus.com/?ref_noscript">Disqus</a> require <a href="http://www.enable-javascript.com/">JavaScript enabled</a> to view.</a></p></noscript>
</div>

</body>
</html>

