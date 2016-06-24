FROM node:latest

MAINTAINER Pär Amsen @ Nixon Nixon

WORKDIR /usr/src/app

COPY src/package.json . 

RUN npm install

COPY src/ .

CMD ["npm", "start"]
