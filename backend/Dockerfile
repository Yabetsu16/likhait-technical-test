# syntax = docker/dockerfile:1

# Use Ruby 3.3.7
ARG RUBY_VERSION=3.3.7
FROM ruby:$RUBY_VERSION-slim

# Rails app lives here
WORKDIR /rails

# Ensure Bundler and gem paths are consistent between build and runtime
ENV BUNDLE_APP_CONFIG=/usr/local/bundle
ENV BUNDLE_PATH=/usr/local/bundle
ENV GEM_HOME=/usr/local/bundle
ENV PATH=/usr/local/bundle/ruby/3.3.0/bin:/usr/local/bundle/bin:/usr/local/bin:$PATH

# Install base packages including yaml headers for psych gem
RUN apt-get update -qq && \
    apt-get install --no-install-recommends -y \
    build-essential ca-certificates default-mysql-client default-libmysqlclient-dev git \
    libyaml-dev && \
    rm -rf /var/lib/apt/lists /var/cache/apt/archives

# Install application gems
COPY Gemfile Gemfile.lock ./

# Update Gemfile.lock for Linux platform and install gems
RUN bundle lock --add-platform x86_64-linux && \
    bundle config set --local deployment 'false' && \
    # Remove any stale bundle config that may point to vendor/bundle
    if [ -f /usr/local/bundle/config ]; then rm -f /usr/local/bundle/config; fi && \
    # Install gems into the image-wide directory so a docker volume can be mounted there
    bundle config set --local path '/usr/local/bundle' && \
    bundle install --jobs 4 --retry 3

# Copy application code
COPY . .

# Ensure entrypoint has Unix line endings, remove UTF-8 BOM if present, and make executable inside the image
RUN if [ "$(od -An -t x1 -N 3 /rails/bin/docker-entrypoint | tr -d ' \n')" = "efbbbf" ]; then \
    tail -c +4 /rails/bin/docker-entrypoint > /rails/bin/docker-entrypoint.nobom && \
    mv /rails/bin/docker-entrypoint.nobom /rails/bin/docker-entrypoint; \
    fi && \
    sed -i 's/\r$//' /rails/bin/docker-entrypoint && \
    chmod +x /rails/bin/docker-entrypoint

# Entrypoint prepares the database
ENTRYPOINT ["/rails/bin/docker-entrypoint"]

# Start the server by default
EXPOSE 3000
CMD ["rails", "server", "-b", "0.0.0.0"]
