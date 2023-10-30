FROM node:16

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install --legacy-peer-deps

COPY . .

RUN npx prisma generate
RUN npm run build

EXPOSE 80

EXPOSE 81

CMD ["/bin/bash", "-c", "npx prisma migrate deploy;npm run start:dev"]
