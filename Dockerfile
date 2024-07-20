FROM node:16

WORKDIR /pinginfo

COPY package.json .

COPY package-lock.json .

RUN npm install

RUN mkdir logs src

COPY src ./src

WORKDIR /pinginfo/src

ENTRYPOINT [ "node", "index.js" ]