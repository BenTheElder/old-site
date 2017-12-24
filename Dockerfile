FROM ubuntu:16.04

ENV DEFINITELY_RUNNING_IN_PRODUCTION="true"

RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    ca-certificates \
    git \
    pandoc

COPY ./site /usr/local/bin/site
COPY ./entrypoint.sh /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]
