#!/usr/bin/env python
# a script to run pandoc over all blogposts
#pandoc -o post-location-name.html post-location-name.md --highlight-style=pygments -s
import os
import sys
import subprocess
import glob
# get the directory containing this file
dir = os.path.dirname(os.path.abspath(__file__))
# loop over all markdown files in the blog dir
for filename in glob.iglob(os.path.join(dir, "*.md")):
    # get filename without path
    basename = os.path.basename(filename)
    # skip template file
    if basename == "template.md":
        continue
    # desired output name
    html_name = filename.replace(".md", ".html")
    # run pandoc
    subprocess.check_call(["pandoc", "-o", html_name, filename, "--highlight-style=pygments", "-s"])