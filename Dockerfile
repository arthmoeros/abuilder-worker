FROM node:boron

WORKDIR /usr/src/app
RUN mkdir /var/artifacter

COPY package.json .
RUN npm install

COPY . .
EXPOSE 8080

ENV ARTIFACTER_TMP=/var/artifacter/
ENV ARTIFACTER_CONFIG=/etc/artifacter/

CMD [ "npm", "start"]
