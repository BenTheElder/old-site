#!/usr/bin/env bash
set -x
# kubernetes only resolves internal services by default
# TODO: we should probably configure this in the cluster instead
echo "nameserver 8.8.8.8" >> /etc/resolv.conf &&
git clone https://github.com/BenTheElder/site &&
cd site &&
site
