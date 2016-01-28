# Dockerfile for reddit-mobile

FROM nodesource/vivid:4.2.3

ENV DEBIAN_FRONTEND noninteractive

RUN echo "deb-src http://archive.ubuntu.com/ubuntu trusty main" >> /etc/apt/sources.list \
    && apt-get update \
    && apt-get install -y curl python2.7 git \
    && apt-get update \
    && apt-get upgrade -y \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

ADD package.json package.json
RUN NODE_ENV=development npm install

ADD . .
RUN npm run build

# start the server
ENTRYPOINT npm start
