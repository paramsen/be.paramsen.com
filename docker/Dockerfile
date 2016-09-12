FROM node:latest

MAINTAINER Pär Amsen

WORKDIR /usr/src/app

RUN apt-get update -y -qq
RUN apt-get install -y -qq build-essential

COPY src/package.json . 

RUN npm install

COPY src/ .

CMD ["npm", "start"]
