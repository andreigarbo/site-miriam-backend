FROM node

ENV NODE_ENV=prod
ENV PORT=5000

WORKDIR /express-docker

COPY . .

RUN npm cache clean --force
RUN npm install
RUN npm run build
RUN npm rebuild

CMD [ "node", "dist/server.js" ]

EXPOSE 5000