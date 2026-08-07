FROM node:22-alpine AS client-build
WORKDIR /app/client
COPY client/package*.json ./
RUN npm install
COPY client/ ./
ARG VITE_API_URL=/api
ENV VITE_API_URL=$VITE_API_URL
RUN npm run build

FROM node:22-alpine AS production
WORKDIR /app
COPY server/package*.json ./server/
RUN cd server && npm install --omit=dev
COPY server/ ./server/
COPY database/ ./database/
COPY --from=client-build /app/client/dist ./client/dist
WORKDIR /app/server
ENV NODE_ENV=production
ENV PORT=5000
EXPOSE 5000
CMD ["node", "src/server.js"]
