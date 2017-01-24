## Install
```
$ npm install --save http-mockserver
```

## Usage

**Start mockServer**
```
$ http-mockserver --port 3000
```

**Connect to mockServer**
```js
const { MockClient } = require('http-mockserver');
const mockServerHost = 'localhost:3000'; // Connect to MockServer on localhost:3000
const myMockClient = new MockClient(8888, mockServerHost); // start a mockServer instance on port 8888

// Setup mock on localhost:8888/rest/users
myMockClient.addMock({
	uri: '/rest/users',
	method: 'GET',
	response: {
		users: [],
		count: 0
	}
});
```

## CLI options
```
$ http-mockserver --help

  Usage
    $ http-mockserver

  Options
    --port     MockServer port, default: 3000
    --mocks    Path to mock config files
```

## Client API
The following methods can be called on any MockClient instance

#### mockClient.addMock([options])
Add mock. Returns a promise.

##### Options:
* **uri**: uri of request, eg. `/users/5345`
* **method**: method of request, eg. `GET`
* **response**: Response object
	* **body**, eg. `{data: "hello"}`
	* **statusCode**, eg. `200`
	* **headers**, eg. `{"Content-Type": "application/json"}`

#### mockClient.getRequests()

Returns a promise with a list of requests made to the mockServer

#### mockClient.clear()

Removed all mocks and requests made to the mockServer
