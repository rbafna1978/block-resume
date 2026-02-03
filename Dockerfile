FROM texlive/texlive:latest

ENV NODE_ENV=production
ENV PORT=10000
ENV USE_TECTONIC=1
ENV NEXT_TELEMETRY_DISABLED=1

RUN apt-get update \
  && apt-get install -y --no-install-recommends ca-certificates curl nodejs npm tectonic \
  && apt-get clean \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --include=dev

COPY . .
RUN npm run build

EXPOSE 10000

CMD ["npm", "run", "start"]
