FROM node:12-alpine

WORKDIR /app
COPY package.json yarn.lock ./
EXPOSE 4000

RUN yarn install --production --ignore-scripts
COPY . .

CMD ["yarn", "start:production"] 
