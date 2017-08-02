FROM node:boron

ENV APPDIR /usr/src/app


WORKDIR $APPDIR
RUN mkdir /var/artifacter

COPY package.json .
RUN npm install

ADD . $APPDIR
EXPOSE 8080

ENV ARTIFACTER_TMP=/var/artifacter/
ENV ARTIFACTER_CONFIG=/etc/artifacter/

CMD [ "npm", "start"]
