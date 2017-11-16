#!/usr/bin/env python
# TODO(bentheelder): actually use some better templating here and automate this
# a bit more...
# a script to make a copy of the blog-post template file with a new name
import os
import shutil
# get the directory containing this file
dir = os.path.dirname(os.path.abspath(__file__))
template_path = os.path.join(dir, "post_outline.md")
post_name = raw_input("post name: ") + ".md"
post_path = os.path.join(dir, post_name)
shutil.copyfile(template_path, post_path)
