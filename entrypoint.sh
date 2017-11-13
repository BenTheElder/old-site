#!/usr/bin/env bash
set -x
# kubernetes only resolves internal services by default
git clone https://github.com/BenTheElder/site &&
cd site &&
site
