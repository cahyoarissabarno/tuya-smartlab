FROM node:alpine AS ts-builder
RUN rm -f ./build
RUN mkdir /app
WORKDIR /app
COPY . .
RUN npm install
RUN npm run build

FROM node:alpine AS ts-production
WORKDIR /app
COPY --from=ts-builder ./app/build ./build
COPY package* ./
# COPY .env ./
RUN touch ./.env
COPY .sequelizerc ./
ENV NODE_ENV=production
# RUN npm install --omit=dev
RUN npm install
RUN npm install -g sequelize-cli
# RUN sequelize init
# RUN npx sequelize-cli db:migrate
CMD npm run start



