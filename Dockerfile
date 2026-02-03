FROM texlive/texlive:latest

ENV NODE_ENV=production
ENV PORT=10000
ENV USE_TECTONIC=1
ENV NEXT_TELEMETRY_DISABLED=1

RUN apt-get update \
  && apt-get install -y --no-install-recommends ca-certificates curl xz-utils nodejs npm texlive-extra-utils \
  && apt-get clean \
  && rm -rf /var/lib/apt/lists/*

# Install Tectonic from official GitHub releases (Debian repo does not include it)
ARG TECTONIC_VERSION=0.15.0
RUN set -eux; \
  arch="$(dpkg --print-architecture)"; \
  case "$arch" in \
    amd64) target="x86_64-unknown-linux-gnu" ;; \
    arm64) target="aarch64-unknown-linux-gnu" ;; \
    *) echo "Unsupported architecture: $arch"; exit 1 ;; \
  esac; \
  url="https://github.com/tectonic-typesetting/tectonic/releases/download/tectonic%40${TECTONIC_VERSION}/tectonic-${TECTONIC_VERSION}-${target}.tar.gz"; \
  curl -L -o /tmp/tectonic.tar.gz "$url"; \
  mkdir -p /tmp/tectonic; \
  tar -xzf /tmp/tectonic.tar.gz -C /tmp/tectonic; \
  if [ -f /tmp/tectonic/tectonic ]; then \
    mv /tmp/tectonic/tectonic /usr/local/bin/tectonic; \
  else \
    mv "$(find /tmp/tectonic -type f -name tectonic | head -n 1)" /usr/local/bin/tectonic; \
  fi; \
  chmod +x /usr/local/bin/tectonic; \
  rm -rf /tmp/tectonic*

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --include=dev

COPY . .
RUN npm run build

EXPOSE 10000

CMD ["npm", "run", "start"]
