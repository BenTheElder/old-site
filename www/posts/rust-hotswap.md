---
header-includes:
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link rel="stylesheet" type="text/css" href="/style.css?stamp=1514431940"/>
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
pagetitle: "Rust Hotstap | BenTheElder"
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

<!-- under construction cart -->
<div class="card centered-text warning"><p class="title">This post is old (!)</p><p class="no-margin">Rust has changed since this post was written, it may not still be accurate.</p></div>

<div class="card blog-content">
<p class="title">Rust Hotswap</p>
<p class="sub-title">January 12th, 2015</p>

Mozilla's [rust](http://rust-lang.org) language has just [reached 1.0 alpha](http://blog.rust-lang.org/2015/01/09/Rust-1.0-alpha.html).

I've been learning it off and on for a while now, and I'm quite happy to see the breaking
changes slow down.
As part of learning rust I've played around implementing things that would be
normally done in c or c++;
one of those is the old trick of hot-swapping code by reloading a shared library at runtime.

The rest of this post assumes that you have a pretty fair knowledge of rust.
If not, you should probably start with the rust [book](http://doc.rust-lang.org/book/).

__________________________________________________________________________

####Project setup:


First we'll set up a folder to develop from:
`mkdir ./rust-hotswap && cd ./rust-hotswap`
and a source dir:
`mkdir ./src`.

We'll use [cargo](https://github.com/rust-lang/cargo) to build, so next we'll create a `Cargo.toml`

```
[package]
name = "rust-hotswap"
version = "0.0.1"

[lib]
crate-type = ["dylib"]
name = "rust-hotswap"
path = "src/lib.rs"

[[bin]]
name = "rust-hotswap"
path = "src/main.rs"

[dependencies]
glob = "*"
```

This is a pretty generic project file, with one dependency on [glob](https://crates.io/crates/glob).
We'll discuss glob in a moment.

The key thing is that we specify that the library be built as a `dylib` so that we get a c style
dynamic library.

__________________________________________________________________________

####Code:


Next we'll need our library source, this is the part we will swap out at runtime.
_src/lib.rs_:
```{.rust}
use std::io;
use std::fmt;

#[no_mangle]
pub extern "C" fn do_tick(num: i32) {
    let mut out = io::stdout();

    let s = format!("Tick: {}", num);
    out.write_str(s.as_slice());
    out.write_char('\n');

    out.flush();
}
```
\
We use `#[no_mangle]` to prevent rust from mangling the function name, and `extern "C"` to export it in the C linkage style. We use `io::stdout()` to get a handle to stdout instead of using the `println!` macro because the macro causes an illegal instruction error on exit. I'm not sure exactly why this occurs but i'm sure it has to do with unsafely sharing the stdout handle. It's probably a good idea to do it this way anyhow, but I might want to look into that later.

Now to actually load the library.

The first important thing to know is that rustc appends a versioning hash to libraries it produces.
We could possibly recreate this hash, or we could just look for a dynamic library next to the
executable. To do this we use `std::os::self_exe_path` to get the directory the executable is in,
then use it to create a search pattern for `glob` to find the dynamic library we built.

We have a small helper function `get_dylib_path_pattern` that appends a platform specific file extension using rust's `cfg` conditional compilation and `target_os`.  
After finding the library we can then use the (unstable!) `std::dynamic_lib::DynamicLibrary` api to load the library, and resolve the symbol for `do_tick`, which we can then call.

We'll wrap up the loading and calling bits in a helper function.

Lastly we can throw in a `println!` and a keypress read between `ticks` to puase the program, and alert the user that it is now safe to modify the code.
This allows you to finally do the following:

1) Run: `cargo run`.
2) Edit _src/lib.rs_ to write something else to stdout.
3) From another shell `cargo build`.
4) Hit enter in the first shell after `cargo build` completes.
5) The output this time should now match your modified code.

A real usecase for this would be EG game development, where the game is implemented as a small wrapper executable and the rest as methods in a dynamic library, you can pass in a struct full of globals to the library and between ticks reload the library with modified code. You might monitor the source for changes to the library, and rebuild and reload between ticks during development.
In anycase, it's a cool trick.
<br>
<br>
<br>

----------------------
<u>**Full Source**</u>

_src/main.rs_
```rust
extern crate glob;

use std::io;
use glob::glob;
use std::dynamic_lib::DynamicLibrary;
use std::os::self_exe_path;
use std::mem::transmute;

#[cfg(any(target_os = "linux",
          target_os = "freebsd",
          target_os = "dragonfly"))]
fn get_dylib_path_pattern(dir: &str) -> String {
    dir.to_string() + "/*.so"
}

#[cfg(target_os = "macos")]
fn get_dylib_path_pattern(dir: &str) -> String {
    dir.to_string() + "/*.dylib"
}

#[cfg(target_os = "windows")]
fn get_dylib_path_pattern(dir: &str) -> String {
    dir.to_string() + "/*.dll"
}

fn do_lib_tick(dylib_path_pattern: &str, num: i32) {
    let mut paths = glob(dylib_path_pattern);

    let path = paths.next().unwrap();
    println!("path: {}", path.display());

    let lib = match DynamicLibrary::open(Some(&path)) {
        Ok(lib) => lib,
        Err(e) => panic!("Failed to load library: {:?}", e)
    };

    let do_tick: extern "C" fn(i32) = unsafe {
        match lib.symbol::<u8>("do_tick") {
            Ok(do_tick) => transmute::<*mut u8, extern "C" fn(i32)>(do_tick),
            Err(e) => panic!("Failed to load symbol: {:?}", e)
        }
    };
    do_tick(num);
}

fn main() {
    let dir = self_exe_path().unwrap();
    println!("dir: {:?}", dir);

    let dylib_path_pattern = get_dylib_path_pattern(dir.as_str().unwrap());
    println!("pattern: {}", dylib_path_pattern);

    do_lib_tick(dylib_path_pattern.as_slice(), 1);

    println!("\nNow modify lib.rs, build, and then hit enter.");
    let mut stdin = io::stdin();
    stdin.read_char();

    do_lib_mn(dylib_path_pattern.as_slice(), 2);
}
```
\
_Cargo.toml_
```toml
[package]
name = "rust-hotswap"
version = "0.0.1"

[lib]
crate-type = ["dylib"]
name = "rust-hotswap"
path = "src/lib.rs"

[[bin]]
name = "rust-hotswap"
path = "src/main.rs"

[dependencies]
glob = "*"
```
<div style="clear: both;"></div>
</div>
</div>

<!--comments card-->
<div class="card">
<p class="title">Comments</p>
<div id="disqus_thread"></div>
<script>
    var disqus_config = function () {
        this.page.url = "https://bentheelder.io/posts/rust-hotswap";
        this.page.identifier = "posts/rust-hotswap";
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
