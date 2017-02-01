
## Install
```
$ npm install --save http-mockserver
```

## Usage

**Start mockServer from CLI**
```
$ http-mockserver
```

or

**Start mockServer from Node**
```js
const { mockServer } = require('http-mockserver');
mockServer.start();
```

**Add mock**
```js
const { mockClient } = require('http-mockserver');

// Setup mock on localhost:4000/rest/users
mockClient.addMock({
	port: 4000,
	uri: '/rest/users',
	method: 'GET',
	response: {
		users: [],
		count: 0
	}
});
```

## Mock object
To mock an endpoint, the mock should have the following structure:

* **port**: port of request, eg. `4000`
* **uri**: uri of request, eg. `/users/peter`
* **method**: method of request, eg. `GET`
* **response**: Response object
	* **body**, eg. `{data: "hello"}`
	* **statusCode**, eg. `404` (default: 200)
	* **headers**, eg. `{"Content-Type": "application/json"}`

**Example:**

```json
{
	"port": 9090,
	"method": "GET",
	"uri": "/my-endpoint",
	"response": {
		"body": "hello world"
	}
}
```

## MockServer CLI Options
```
$ http-mockserver --help

  Usage
    $ http-mockserver

  Options
    --port     MockServer port, default: 3000
    --mocks    Path to mock config files
```

## MockServer API

#### mockServer.start(port)
Start mockserver on the specified port.

Arguments:
* **port**: Port of MockServer (default: 3000)

#### mockServer.stop()
Stop mockserver

#### mockServer.addMock(mock)
Add mock to mockserver without sending them over http. Apart from being faster, this allows for some more advanced mocks. See [dynamic mock example](https://github.com/Tradeshift/http-mockserver/blob/master/examples/dynamic-mock.js)

Arguments:
* **mock**: Mock options object. See [mock object](https://github.com/Tradeshift/http-mockserver/blob/master/README.md#mock-object) for details

#### mockServer.addMocks(path)
Add mocks to mockserver without sending them over http. Apart from being faster, this allows for some more advanced mocks. See [dynamic mock example](https://github.com/Tradeshift/http-mockserver/blob/master/examples/dynamic-mock.js)

Arguments:
* **path**: Path to mock file or folder, eg. `./mocks/`

## MockClient API

#### mockClient.addMock(mock)
Add mock. Returns a promise.

Arguments:
* **mock**: Mock options object. See [mock object](https://github.com/Tradeshift/http-mockserver/blob/master/README.md#mock-object) for details

#### mockClient.getRequests(port)
Returns a promise with a list of requests made to the mockServer

#### mockClient.clear()
Removed all mocks and requests made to the mockServer

#### mockClient.setServerHost(serverHost)
Set hostname and port of mockserver

serverHost: (Default: `localhost:3000`)


