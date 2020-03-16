FROM node:10

WORKDIR /app
COPY package.json .
COPY yarn.lock .
RUN yarn

COPY src/ src/
COPY config/ config/ 
COPY tsconfig.json .
COPY .env .

CMD [ "yarn", "start"]