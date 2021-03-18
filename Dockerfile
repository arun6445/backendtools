FROM node:12-alpine

RUN apk update

EXPOSE 8081

EXPOSE 8081
COPY ["./package.json", "./package-lock.json", ".eslintrc.js", "tsconfig.build.json", "tsconfig.json", "/app/"]
WORKDIR /app

RUN npm ci --quiet

COPY ./src /app/src

RUN npm run build

CMD npm run start:prod
