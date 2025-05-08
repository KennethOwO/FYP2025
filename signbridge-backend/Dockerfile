FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json . /app/

RUN npm install        

COPY . /app      

EXPOSE 3000          

CMD ["npm", "start"]
