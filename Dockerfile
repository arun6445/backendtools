FROM node:12-alpine

RUN apk update

EXPOSE 8080

EXPOSE 8080
COPY ["./package.json", "./package-lock.json", "tsconfig.build.json", "tsconfig.json", "/app/"]
WORKDIR /app

RUN npm ci --quiet

COPY ./src /app/src

RUN npm run build

CMD npm run start:prod
