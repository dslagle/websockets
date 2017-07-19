FROM node:8.1.4-alpine

COPY dist /app
WORKDIR app

RUN npm install

CMD [ "npm", "start" ]