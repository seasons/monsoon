FROM node:12-alpine

WORKDIR /app
COPY package.json yarn.lock ./
EXPOSE 4000

RUN yarn install --production --ignore-scripts
COPY . .
RUN ls -la /app/node_modules/prisma
RUN yarn prisma generate

CMD ["yarn", "start:production"] 
