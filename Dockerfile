FROM node:10

WORKDIR /app
COPY . .
RUN ["yarn"]
RUN ["yarn", "build"]

CMD [ "yarn", "start"]