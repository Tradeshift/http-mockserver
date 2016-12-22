FROM node:6.9.1

# Install npm dependencies
COPY package.json package.json
RUN npm install

COPY ./src ./src
COPY ./bin ./bin

# Start node
CMD ["npm", "run", "start"]
