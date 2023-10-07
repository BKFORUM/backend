FROM node:16

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

RUN npx prisma generate
RUN npm run build

EXPOSE 80

CMD ["node", "/usr/src/app/dist/main.js"]
