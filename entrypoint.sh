#!/usr/bin/env bash
set -x
echo "nameserver 8.8.8.8" >> /etc/resolv.conf && cat /etc/resolv.conf
# switch to workdir and delete anything left behind
cd "${WORKSPACE}" && find -mindepth 1 -delete
# kubernetes only resolves internal services by default
git clone https://github.com/BenTheElder/site &&
cd site &&
site
