FROM ubuntu:16.04

# override WORKSPACE in production to an emptyDir or similar
ENV WORKSPACE="/workspace"\
    DEFINITELY_RUNNING_IN_PRODUCTION="true"
# make sure $WORKSPACE exists even if no volume is mounted
RUN mkdir "${WORKSPACE}"

RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    ca-certificates \
    git \
    pandoc \
    python \
    python-pip && \
    pip install -I pygments

COPY ./site /usr/local/bin/site
COPY ./entrypoint.sh /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]
