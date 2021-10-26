FROM node:14 AS dev
WORKDIR /usr/src/app

ENV NODE_ENV=development
COPY package*.json ./
# need to install depenencies so different distros other than ubuntu can be used on the host machine 
RUN npm install
COPY prisma prisma
RUN npx prisma generate
CMD npm run dev


FROM dev AS prod
COPY package*.json ./
RUN npm install
ENV NODE_ENV=production
COPY . .
RUN npx prisma generate

# need to build in the CMD, because assets are bind mounted and served by nginx instead
CMD npm run build:prod && npx prisma migrate deploy && node src/server/app.js
