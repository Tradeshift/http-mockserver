## Install
```
$ npm install --save http-mockserver
```

## Usage

```js
const { mockServer } = require('http-mockserver');

// Static mock
mockServer.addMock({
	port: 8080,
	method: 'GET',
	uri: '/my/url',
	response: {
		body: 'Hello world'
	}
});

// Dynamic mock
let counter = 0;
mockServer.addMock({
	port: 8080,
	method: 'GET',
	uri: '/my/other/url',
	handler: function (req, res) {
		counter++;
		res.send(`Counter: ${counter}`);
	}
});
```

## Mock object
To mock an endpoint, the mock object should follow one of these structures:

#### Static mock
* **port**: port of request, eg. `4000`
* **uri**: uri of request, eg. `/users/peter`
* **method**: method of request, eg. `GET`
* **response**: Response object
	* **body**, eg. `{data: "hello"}`
	* **statusCode**, eg. `404` (default: 200)
	* **headers**, eg. `{"Content-Type": "application/json"}`

#### Dynamic mock
* **port**: port of request, eg. `4000`
* **uri**: uri of request, eg. `/users/peter`
* **method**: method of request, eg. `GET`
* **handler**: `function(req, res) {...}`

# API
The following methods are available on both `mockServer` and `mockClient`

#### addMock(mock)
Mock and endpoint of a port and route, with a specific response (static mock) or a handler function (dynamic mock).

Arguments:
* **mock**: Mock object. See [mock object](https://github.com/Tradeshift/http-mockserver/blob/master/README.md#mock-object) for details

#### clearAll()
Remove all mocks and clear the request log

#### create(port)
Returns a mockserver instance with the same API interface, but the methods do not require a port to be specified.

Arguments:
* **port**: Port number.

Example:
```js
const { mockServer } = require('http-mockserver');
const backendService = mockServer.create(8888);

backendService.addMock({
	uri: '/some/url/to/mock',
	method: 'GET',
	response: {
		body: 'Hello world!'
	}
});

$ curl localhost:8888/some/url/to/mock 
"Hello world!"
```

#### getRequests([port])
Returns request log. If port is specified, request will be filtered by this

Arguments:
* **port**: Port number.

#### waitForRequest(port, predicate, [count = 1, delay = 500])
Returns a list of request logs that the predicate returns truthy for. The predicate is invoked with three arguments: (requestLog, index, requestLogs).

Arguments:
* **port**: Port number.
* **predicate**: The function invoked per iteration.
* **count**: Exact number of request logs to match before returning
* **delay**: Time between requests

## MockServer API
The following methods are available only available on `mockServer`

#### mockServer.start(port)
Start mockserver on the specified port.

Arguments:
* **port**: Port of MockServer (default: 3000)

#### mockServer.stop()
Stop mockserver

## MockClient API
The following methods are available only available on `mockClient`.
You only need to use the client if you are communicating with a mockServer that was started [from commandline](https://github.com/Tradeshift/http-mockserver#mockserver-cli-options) or by a separate Node process with [mockServer.start()](https://github.com/Tradeshift/http-mockserver#mockserverstartport). 

#### mockClient.setServerHost(serverHost)
Set hostname and port of mockserver. This is necessary if you start MockServer on another port than the default (port 3000).

Arguments:
* **serverHost**: Host of mockserver (Default: `localhost:3000`)

## MockServer CLI Options
If you need to interact with the mockserver from other languages that Node.js, you can start it as a stand-alone process, and add mocks by interacting with the REST api.
To start mockServer from the command-line run `http-mockserver`.
You can also use the CLI tool to start a mockserver with some preconfigured mocks, and load them on startup with `http-mockserver --mocks ./mock-folder`

```
$ http-mockserver --help

  Usage: http-mockserver [options]

  Options
    --port     MockServer port, default: 3000
    --mocks    Path to mock config files
```
