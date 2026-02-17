FROM node:22-bookworm-slim

ENV NODE_ENV=production
ENV PORT=10000
ENV USE_TEXLIVE=1
ENV USE_TECTONIC=0
ENV NEXT_TELEMETRY_DISABLED=1

RUN apt-get update \
  && apt-get install -y --no-install-recommends ca-certificates curl perl latexmk texlive-latex-base texlive-latex-recommended texlive-latex-extra texlive-fonts-recommended texlive-extra-utils \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

EXPOSE 10000

CMD ["npm", "run", "start"]
