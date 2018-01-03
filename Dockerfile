FROM ubuntu:16.04

# override WORKSPACE in production to an emptyDir or similar
ENV WORKSPACE="/workspace" \
    DEFINITELY_RUNNING_IN_PRODUCTION="true"

# make sure $WORKSPACE exists even if no volume is mounted
RUN mkdir "${WORKSPACE}"

RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    ca-certificates \
    git \
    wget && \
    export PANDOC_DEB_URL="https://github.com/jgm/pandoc/releases/download/2.0.6/pandoc-2.0.6-1-amd64.deb" && \
    TEMP_DEB="$(mktemp)" && \
    wget -O "$TEMP_DEB" "$PANDOC_DEB_URL" && \
    dpkg -i "$TEMP_DEB" && \
    rm -f "$TEMP_DEB"

COPY ./site /usr/local/bin/site
COPY ./entrypoint.sh /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]
