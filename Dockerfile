FROM node:12

RUN apt-get update
RUN apt-get -y install imagemagick ghostscript poppler-utils

EXPOSE 3001 8082
COPY ["./package.json", "./package-lock.json", ".eslintrc.js", ".eslintignore", "tsconfig.build.json", "tsconfig.json", ".env", "/app/"]
WORKDIR /app
RUN npm i -g nest
RUN npm ci --quiet
COPY ./src /app/src

CMD npm run start
