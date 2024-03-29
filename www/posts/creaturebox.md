---
header-includes:
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link rel="stylesheet" type="text/css" href="/style.css?stamp=1515931666"/>
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
pagetitle: "CreatureBox | BenTheElder"
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
<p class="title">CreatureBox: An obstacle avoidance evolutionary simulation</p>
<p class="sub-title">January 2nd, 2016</p>

<a href="https://github.com/BenTheElder/creaturebox">CreatureBox</a> is a simple evolutionary obstacle avoidance demo I wrote inspired by [studio otoro](http://otoro.net)'s awesome
 [creatures avoiding planks](http://blog.otoro.net/2015/05/07/creatures-avoiding-planks/).
I wanted to build something similar for fun and try out golang's [Go mobile](https://github.com/golang/mobile)
 project as well, so over the break between semsters I took a little time to write one.

####gomobile

The first thing I did was get gomobile up and running, and create a basic main loop to handle events and draw a
 quad to the screen during paint events.
One interesting effect of using gomobile is that CreatureBox should work on Windows,
 OS X, Linux, Android, iOS, etc, which is pretty cool.
 The library and tooling provide a common ground with a portable event model
 and opengl access provided for you. I have only tested on OS X El Capitan and Android Marshmallow,
 but it seems to work well, and it's really nice to have the mobile code running on desktop and mobile without an emulator.
 On the bad side, I couldn't find a good method to attain a vsync like refresh rate, all of the continuously updating
 pure go demos in the gomobile repository simply create a new paint event at the end of the previous paint event, which
 causes the app to use excessive processing time on my laptop. My "solution" was to call `time.Sleep()` on desktop at
 the end of each paint event in order to throttle the processor time used.
 The gomobile tooling was definitely very interesting, but pure go apps are definitely still a little rough around the
 edges. I think it made a pretty resaonable compromise in this case, and it made focusing on the simulation logic very
 straight-forward.
\
\


#### The Simulation
The next thing I did was layout the project structure, divided into the application layer, the simulation, and the
 simulation further divided into the simulation logic and the "Brain" logic.

The simulation uses <a href="https://github.com/llgcode">llgcode</a>'s awesome [draw2d](https://github.com/llgcode/draw2d)
 package to draw each frame to a fixed size canvas in order to simplify a number of things. In particular this allowed me
 to detect collisions and perform raycasts by traversing the canvas's pixels after drawing the background, walls,
 and obstacles. Any location with a non-background colored pixel is then obviously a wall or an obstacle, and in this
 case I intended to treat them the same, so this is allowed me to cheaply and easily implement "killing" creatures that
 touch a wall or a moving obstacle.


#### "Brains"
I then implemented the "brains" for the creatures, mimicing the design described in the studio otoro blog post.
Each creature has a fully connected two layer (input and output) neural network. Most of the outputs are recurrent like
 the studio otoro demo. Each creature receives a number of "distance to edge or obstacle" inputs in
 evenly distributed directions about them as well as the previous output for the recurrent nodes, and produces a turn
 and move output used for turning left/right and moving forward/backwards every frame. These are then scaled, and applied.
 You can see which way a creature is facing by the white dot drawn on them towards their current "forward" direction.

#### Evolution
Lastly I implemented the key component (evolution) by adding logic to track the number of frames each creature has been
 "alive" for, storing the weights of the best creatures. I also performed a finalpass over the logic to optimize things
 a little bit (mainly minimizing un-neccessary allocations).\
\
Every n-th frame a number of new creatures are spawned, some of which have brain patterns cloned from the all time best
 creatures so far, some with a combination of two of the best, and some purely random. Eventually creatures better at
 staying alive will become more common but there will always be purely random creatures. Creatures do not "breed" or
 "grow" like the studio otoro demo, but they do have a "frames alive" score used to determine which brain patterns
 perform best, and the best are spontaneously reproduced each cycle.\
\
The color of each creature is based on the average of their brain weights divided into 3 chunks for the RGB channels allowing some limited visualization of similarity between creatures ("clones" will be the same color for example).

#### Wrap-Up:
All told, this project was pretty fun to work on.\
Here's two a gifs of the result running on my laptop (the second gif has more evolved creatures):

<div class="flex-container vertical-center"><img class="flex-2-col no-grow" src="/images/creaturebox_demo.gif" width="310" height="518" alt="gif of CreatureBox running on my laptop"></img><img class="flex-2-col no-grow" src="/images/creaturebox_demo_2.gif" width="310" height="518" alt="gif of CreatureBox running on my laptop with more evolved creatures"></img></div>

I posted the project to [my twitter](https://twitter.com/BenTheElder) before I wrote this post and received a kind
 reply from <a href="https://twitter.com/hardmaru">@hardmaru</a> of [studio otoro](http://otoro.net):

<blockquote class="twitter-tweet tw-align-center" lang="en"><p lang="en" dir="ltr"><a href="https://twitter.com/BenTheElder">@BenTheElder</a> nice implementation of creatures-avoiding-planks in golang. Have you thought abt using q-learning n-nets rather than evolution?</p>&mdash; hardmaru (@hardmaru) <a href="https://twitter.com/hardmaru/status/683177164447981568">January 2, 2016</a></blockquote>

I may just have to explore that for my next project (I [replied back](https://twitter.com/BenTheElder/status/683178992606810112)).



<div style="clear: both;"></div>
</div>

<!--comments card-->
<div class="card">
<p class="title">Comments</p>
<div id="disqus_thread"></div>
<script>
    var disqus_config = function () {
        this.page.url = "https://bentheelder.io/posts/creaturebox";
        this.page.identifier = "posts/creaturebox";
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
