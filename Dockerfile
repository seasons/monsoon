FROM node:12-alpine
WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install --production --ignore-scripts
COPY . .
RUN yarn prisma generate
EXPOSE 3000
CMD ["yarn", "start:production"]