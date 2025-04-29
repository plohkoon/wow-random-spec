FROM node:23-alpine AS build

WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile
COPY . .
RUN yarn build

FROM node:23-alpine AS production

WORKDIR /app

COPY --from=build /app/yarn.lock  /app/package.json ./
RUN yarn install --frozen-lockfile --production
COPY --from=build /app/generated ./generated
COPY --from=build /app/prisma ./prisma
COPY --from=build /app/build ./build
COPY --from=build /app/public ./public

CMD ["yarn", "start"]
