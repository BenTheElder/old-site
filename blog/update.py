#!/usr/bin/env python
# a script to run pandoc over all blogposts
# if --fswatch is supplied as the last argument, fswatch will be used to
# continually monitor and upadate posts
# pandoc -o post-location-name.html post-location-name.md --highlight-style=pygments -s
from __future__ import print_function

import os
import sys
import subprocess
import glob
# get the directory containing this file
DIR = os.path.dirname(os.path.abspath(__file__))
TEMPLATE_POST = os.path.join(DIR, "pandoc_template.html")

def call_and_print(arglist):
    print(" ".join(arglist))
    subprocess.check_call(arglist)

def process_post(filename):
    # get filename without path
    basename = os.path.basename(filename)
    # ignore template file
    if basename == "post_outline.md":
        return
    # desired output name
    html_name = filename.replace(".md", ".html")
    # run pandoc
    call_and_print(["pandoc", "-o", html_name,
                    filename, "--highlight-style=pygments",
                    "-s", "--template="+TEMPLATE_POST])

def main():
    # check args
    fswatch = sys.argv and sys.argv[-1] == "--fswatch"
    print("Updating all posts...")
    # loop over all markdown files in the blog dir
    for filename in glob.iglob(os.path.join(DIR, "*.md")):
        process_post(filename)
    if fswatch:
        print("Watching for files to change...")
        proc = subprocess.Popen(["fswatch", "-l", "1", DIR], stdout=subprocess.PIPE)
        for line in iter(proc.stdout.readline, ''):
            line = line.rstrip()
            if line.endswith(".md"):
                process_post(line)

if __name__ == "__main__":
    main()
