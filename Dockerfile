FROM node:slim

WORKDIR /run

COPY . .

RUN yarn install --production

ENTRYPOINT ["node", "/run/lib/main.js"]