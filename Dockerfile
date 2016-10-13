FROM mhart/alpine-node:latest
RUN apk update && apk upgrade
RUN apk add --no-cache bash git openssh
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app
COPY package.json /usr/src/app
RUN npm install

COPY . /usr/src/app

EXPOSE 3000
CMD [ "npm", "start"]
