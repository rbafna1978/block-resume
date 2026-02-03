FROM texlive/texlive:latest

ENV NODE_ENV=production
ENV PORT=10000
ENV USE_TECTONIC=1
ENV NEXT_TELEMETRY_DISABLED=1

RUN apt-get update \
  && apt-get install -y --no-install-recommends curl ca-certificates xz-utils \
  && curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
  && apt-get install -y --no-install-recommends nodejs \
  && curl -fsSL https://github.com/tectonic-typesetting/tectonic/releases/latest/download/tectonic-x86_64-unknown-linux-gnu.tar.gz -o /tmp/tectonic.tar.gz \
  && tar -xzf /tmp/tectonic.tar.gz -C /usr/local/bin tectonic \
  && rm /tmp/tectonic.tar.gz \
  && apt-get clean \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --include=dev

COPY . .
RUN npm run build

EXPOSE 10000

CMD ["npm", "run", "start"]
