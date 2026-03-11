FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 5000
# Ensure node_modules is not overwritten if the volume mount fails
ENV NODE_PATH=/app/node_modules
CMD ["npm", "run", "dev"]
