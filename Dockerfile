FROM node:12 AS dev
WORKDIR /usr/src/app

ENV NODE_ENV=development
CMD npm run dev

FROM dev AS prod
COPY package*.json ./
RUN npm install
ENV NODE_ENV=production
COPY . .
RUN npx prisma generate
RUN npm run build:server:prod
RUN npm run build:static:prod

# need to build in the CMD, because assets are bind mounted and served by nginx instead
CMD npx prisma migrate deploy && node src/server/app.js
