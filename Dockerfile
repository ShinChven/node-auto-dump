FROM node:alpine
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app
COPY . /usr/src/app

ARG NODE=production
ENV NODE_ENV ${NODE}
CMD ["npm","start"]
