FROM node:16

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install --legacy-peer-deps

COPY . .

RUN npx prisma generate dev
RUN npm run build

EXPOSE 80

CMD ["node", "/usr/src/app/dist/src/main.js"]
