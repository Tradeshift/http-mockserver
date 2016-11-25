FROM node:6.5

# Install npm dependencies
COPY package.json package.json
RUN npm install

COPY ./src ./src

# Start node
CMD ["npm", "run", "start"]
