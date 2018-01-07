---
header-includes:
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link rel="stylesheet" type="text/css" href="/style.css?stamp=1515333200"/>
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
pagetitle: "Prow | BenTheElder"
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


<!-- under construction tile -->
<!--<div class="card centered-text warning"><p class="title">This post is under construction <img src="/images/emoji/emoji_u1f6a7.png" class="emoji" alt="Construction"></img></p><p class="no-margin">If you found this post, please know that it is currently incomplete.</p></div>-->


<!--prow diagram-->
<div class="blueprint-title double-size centered-text" style="max-width: 20em"><a href="https://github.com/kubernetes/test-infra/tree/master/prow" class="white bold">Prow</a>: Testing the way to Kubernetes Next</div>
<div><img src="/images/prow_diagram.svg" style="max-width: 100%; margin: 0 auto; display: block">
</img></div>



<!--diagram attribution-->
<div class="card" style="margin-top: 0"><p class="no-margin"><span class="bold italic">Prow</span> - extended nautical metaphor diagram by Benjamin Elder. <a href="https://blog.golang.org/gopher">Go Gopher</a> originally by <a href="http://reneefrench.blogspot.com/">Renee French</a>, <a href="https://github.com/golang-samples/gopher-vector#gopher">SVG version</a> by <a href="https://twitter.com/tenntenn">Takuya Ueda</a>, modified under the <a 
href="https://creativecommons.org/licenses/by/3.0/">CC BY 3.0 license</a>. Ship's wheel from <a href="https://github.com/kubernetes/kubernetes/blob/master/logo/logo.svg">Kubernetes logo.svg</a> by <a href="http://www.hockin.org/~thockin/save/">Tim Hockin</a>.</p></div>



<div class="card blog-content">
<p class="title">Prow</p>
<p class="sub-title">December 26th, 2017</p>
<a href="https://kubernetes.io/">The Kubernetes project</a> does <a href="http://velodrome.k8s.io/dashboard/db/bigquery-metrics?orgId=1" class="italic">a lot</a> of testing,
 <span class="bold">on the order of 10000 jobs per day</span> covering everything from build and unit tests, to end-to-end testing on real clusters deployed from source all the way up to ~5000 node <a href="https://k8s-testgrid.appspot.com/sig-scalability-gce#Summary">scalability and performance tests</a>.

<img src="/images/test_metrics.png" alt="Velodrome job metrics" title="Velodrome job metrics"></img>
<p class="centered-text"><a href="http://velodrome.k8s.io/dashboard/db/bigquery-metrics?orgId=1">Velodrome metrics</a></p>
The system handling all of this leverages Kubernetes, naturally, and of-course has a number
 of nautically-named components. This system is <a href="https://github.com/kubernetes/test-infra/tree/master/prow" class="italic">Prow</a>, and is used to manage automatic validation and merging of
 human-approved pull requests and to verify branch-health leading up to each release.

With Prow each job is a single-container <a href="https://kubernetes.io/docs/concepts/workloads/pods/pod/">pod</a>, created in a dedicated build and test cluster by "plank", a micro-service running in the services cluster. 
Each Prow component (roughly outlined above, along with <a href="http://testgrid.k8s.io">Testgrid</a>) is a small Go service structured around managing these one-off single-pod "ProwJobs". 

Using Kubernetes frees us from worrying about most of the resource management and scheduling / bin-packing of these
 jobs once they have been created and has generally been a pleasant experience.

Prow / "hook" also provides <a href="http://prow.k8s.io/plugin-help.html">a number of GitHub automation plugins</a>
 used to provide things like issue and pull request <a href="https://github.com/kubernetes/test-infra/blob/master/commands.md">slash commands</a> for applying and removing labels, opening and closing issues, etc.
 This has been particularly helpful since <a href="https://help.github.com/articles/repository-permission-levels-for-an-organization/">GitHub's permissions model is not particularly granular</a> and we'd like contributors to be able to label issues without write permissions. <img src="/images/emoji/emoji_u1f643.png" class="emoji" alt="Upside-Down Face"></img>

If any of this sounds interesting to you come check out <a href="https://github.com/kubernetes/test-infra/tree/master/prow">Prow's source code</a> and join our <a href="https://github.com/kubernetes/community/blob/master/sig-testing/README.md">SIG Testing</a> meetings for more. 

<hr>

Notes:

 - There are many other tools that didn't make the diagram or dicussion above, you can find these and more about everything at <a href="https://github.com/kubernetes/test-infra">github.com/kubernetes/test-infra</a>.
 - These are all open source, except Testgrid, which is actually a <a href="testgrid.k8s.io">publicly hosted</a> and <a href="https://github.com/kubernetes/test-infra/tree/master/testgrid/config">configured</a> version of an internal tool developed at Google. We hope to open source a more performant rewrite of Testgrid sometime in Spring 2018.
 - A number of other projects / groups including <a href="https://www.openshift.com/">OpenShift</a>, <a href="https://istio.io/">Istio</a>, and <a href="https://www.jetstack.io/">Jetstack</a> are also using and contributing (greatly!) to Prow and the rest of Kubernetes "test-infra".
</div>


<!--comments card-->
<div class="card">
<p class="title">Comments</p>
<div id="disqus_thread"></div>
<script>
    var disqus_config = function () {
        this.page.url = "https://bentheelder.io/posts/prow";
        this.page.identifier = "posts/prow";
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

