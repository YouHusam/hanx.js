FROM dockerfile/nodejs

MAINTAINER Matthias Luebken, matthias@catalyst-zero.com

WORKDIR /home/hanx

# Install Hanx.JS Prerequisites
RUN npm install -g grunt-cli
RUN npm install -g bower

# Install Hanx.JS packages
ADD package.json /home/hanx/package.json
RUN npm install

# Manually trigger bower. Why doesnt this work via npm install?
ADD .bowerrc /home/hanx/.bowerrc
ADD bower.json /home/hanx/bower.json
RUN bower install --config.interactive=false --allow-root

# Make everything available for start
ADD . /home/hanx

# currently only works for development
ENV NODE_ENV development

# Port 3000 for server
# Port 35729 for livereload
EXPOSE 3000 35729
CMD ["grunt"]
