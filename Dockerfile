FROM node:12 AS clientbuilder
WORKDIR /app
COPY ./client/package*.json ./
RUN npm ci
COPY ./client .
RUN npm run build

FROM node:12 as server
WORKDIR /app
COPY ./server/package*.json ./
RUN npm ci
COPY --from=clientbuilder /app/build ../build
COPY ./server .

EXPOSE 8080
CMD ["npm","start"]
