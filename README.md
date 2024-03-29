[![NPM Version][npm-image]][npm-url]
[![NPM Downloads][downloads-image]][downloads-url]
[![Codacy Badge][codacy-image]][codacy-url]
[![Build Status][circleci-image]][circleci-url]
[![Test Coverage][coveralls-image]][coveralls-url]
[![License][license-image]][license-url]

# Express VHosts Autoloader

This module helps you create an Express JS server with virtual hosts auto and manual management.

## Install

```sh
npm install express-vhosts-autoloader
```

## Usage

This module autoloads your express app's as express middlewares when their directories matches the domain name.

Your directory names **must** be the same as your domain names in order for this module to work.

Let's assume you have this directory structure :

My Server Directory :

-   `server.js`

-   `node_modules`

    -   `express`
    -   `express-vhosts-autoloader`

-   `www.nodeapp1.com`

    -   `app.js `

-   `www.nodeapp2.com`

    -   `app.js`

-   `www.nodeapp3.com`
    -   `app.js`

And your domain names (pointing to your server) are :

-   `www.nodeapp1.com`
-   `www.nodeapp2.com`
-   `www.nodeapp3.com`

```javascript
// Load express.
var express = require("express");

// Load express vhosts autoloader.
var vhostsAutoloader = require("express-vhosts-autoloader");

// Create express server.
var expressServer = express();

// Trigger vhostsAutoloader with expressServer as parameter.
vhostsAutoloader(expressServer);

// Start your express web server
var port = process.env["PORT"] || 80;
var server = expressServer.listen(port, function () {
  console.log("Server listening on port %d ", port);
});
```

It works !

The express vhosts autoloader will load each app.js module in each directory as an express middleware triggered only when the required host (i.e domain name) is provided.

Each `app.js` middleware should end with something like `module.exports.app = app` or `exports.app = app`

## API

### `Promise` <= vhostsAutoloader(expressServer, options)

This function tries to load any `app.js` file in any directory in the server root directory as an express middleware trigger only when the required domain name is provider in the request.

-   `expressServer` (object, **required**) express server instance.

-   `options` : (object, optional).
    -   `options.debug` (boolean, optional) : defaults to `false`. If `true` makes the module more verbose in the console.
    -   `options.directory` (string, optional) : defaults to server root directory. If set `vhostsAutoloader` tries to load any `app.js` from the directory provided.
    -   `options.ignoreList` (array, optional) : defaults to `[".git",".vscode",".circleci",".nyc_output","log","logs","test","tests","coverage","node_modules"]`

#### Example

```javascript
// Tries to load any file in directories located inside /home/user
vhostsAutoloader(expressServer, {
  directory: "/home/user",
});
```

### `Promise` <= vhostsAutoloader.loadVhost(options)

This utility method loads an express middleware triggered only when the required host (i.e domain name) is provided.

-   `options` : (object, **required**).
    -   `options.debug` (boolean) : defaults to `false`. If `true` makes the module more verbose in the console.
    -   `options.domainName` (string, **required**) : the domain name / directory name
    -   `options.mainFile` (string, optional) : defaults to `'app'`. If set the method will try to load the file named after the provided value.
    -   `options.exportsProperty` (string, optional) : defaults to `'app'`. If set the method will try to use the exports property named after the provided value
    -   `options.expressServer` (object, optional | required) : Optional if used after calling `vhostsAutoloader`. **Required** if `vhostsAutoloader.loadVhost` is used alone.
    -   `options.directory` (object, optional) : defaults to server root directory. If set `vhostsAutoloader.loadVhost` tries to load the module from the `directory\domainName` directory.

#### Examples

Used **after calling** `vhostsAutoloader`

```javascript
vhostsAutoloader.loadVhost({
  domainName: "www.foo.com",
});
```

For `www.foo.com` directory `.\www.foo.com` will be served and `app.js` module required, needs `module.exports.app` to be set in `app.js`.

```javascript
vhostsAutoloader.loadVhost({
  domainName: "www.foobar.com",
  mainFile: "index",
});
```

For `www.foobar.com` directory `.\www.foobar.com` will be served and `index.js` module required, needs `module.exports.index` to be set in `index.js`.

```javascript
vhostsAutoloader.loadVhost({
  domainName: "www.foobarfoo.com",
  mainFile: "index",
  exportsProperty: "bar",
});
```

For `www.foobarfoo.com` directory `.\www.foobarfoo.com` will be served, `index.js` module required, needs `module.exports.bar` to be set in `index.js`.

Used **without calling** `vhostsAutoloader`

```javascript
// Load express.
var express = require("express");
// Load express vhosts autoloader.
var vhostsAutoloader = require("express-vhosts-autoloader");
// Create express server.
var expressServer = express();

vhostsAutoloader.loadVhost({
  domainName: "www.foobarfoo.com",
  mainFile: "foo",
  exportsProperty: "bar",
  expressServer: expressServer,
});
```

For `www.foobarfoo.com` directory `.\www.foobarfoo.com` will be served, `foo.js` module required, needs `module.exports.bar` to be set in `foo.js`.

## License

[MIT](LICENSE)

[npm-image]: https://img.shields.io/npm/v/express-vhosts-autoloader
[npm-url]: https://npmjs.org/package/express-vhosts-autoloader
[downloads-image]: https://img.shields.io/npm/dw/express-vhosts-autoloader
[downloads-url]: https://npmjs.org/package/express-vhosts-autoloader
[circleci-image]: https://img.shields.io/circleci/build/github/Sami-Radi/express-vhosts-autoloader/master
[circleci-url]: https://circleci.com/gh/Sami-Radi/express-vhosts-autoloader/tree/master
[coveralls-image]: https://coveralls.io/repos/github/Sami-Radi/express-vhosts-autoloader/badge.svg?branch=master
[coveralls-url]: https://coveralls.io/github/Sami-Radi/express-vhosts-autoloader?branch=master
[codacy-image]: https://app.codacy.com/project/badge/Grade/8123da10bc2b4a888c2886db6104cf35
[codacy-url]: https://www.codacy.com/gh/Sami-Radi/express-vhosts-autoloader/dashboard
[license-image]: https://img.shields.io/npm/l/express-vhosts-autoloader
[license-url]: https://github.com/Sami-Radi/express-vhosts-autoloader/blob/master/LICENSE
