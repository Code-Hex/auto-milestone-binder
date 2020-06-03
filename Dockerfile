FROM node:slim

COPY . .

RUN yarn install --production

ENTRYPOINT ["node", "/lib/main.js"]