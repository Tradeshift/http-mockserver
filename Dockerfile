FROM node:6.9.1

# Install npm dependencies
COPY package.json package.json
RUN npm install

COPY ./bin ./bin
COPY ./__tests__ ./__tests__
COPY ./test.sh ./test.sh
COPY ./examples ./examples
COPY ./src ./src

# Start node
CMD ["npm", "run", "start"]
