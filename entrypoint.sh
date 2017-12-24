#!/usr/bin/env bash
set -x
echo "nameserver 8.8.8.8" >> /etc/resolv.conf && cat /etc/resolv.conf
# kubernetes only resolves internal services by default
git clone https://github.com/BenTheElder/site &&
cd site &&
site
