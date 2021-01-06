FROM node:12-alpine

RUN apk update

EXPOSE 3001

COPY ["./package.json", "./package-lock.json", ".eslintrc.js", "tsconfig.build.json", "tsconfig.json", ".env.development", ".env.production", "/app/"]

WORKDIR /app

RUN npm ci --quiet

COPY ./src /app/src

RUN npm run build

CMD npm run start:prod
