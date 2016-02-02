<<<<<<< HEAD
# express vhosts autoloader

This module helps you create an Express JS server with virtual hosts auto and manual management.

## Install

```sh
$ npm install express-vhosts-autoloader
```

## Usage

This module autoloads your express app's as express middlewares when their folders matches the domain name.

Your folder names **must** be the same as your domain names in order for this module to work. 

Let's assume you have this folder structure :

My Server Folder :
* server.js
* node_modules
  * vhosts-server
* www.<i></i>nodeapp1.com
  * app.js  
* www.<i></i>nodeapp2.com
  * app.js
* www.<i></i>nodeapp3.com
  * app.js 

And your domain names (pointing to your server) are :
* www.<i></i>nodeapp1.com
* www.<i></i>nodeapp2.com
* www.<i></i>nodeapp3.com

```javascript
// Load express.
var express = require('express');
// Load express vhosts autoloader.
var expressVhostsAutoloader = require('express-vhosts-autoloader');
// Create express server.
var expressServer = express();
// Trigger expressVhostsAutoloader with expressServer as parameter.
var expressServer = expressVhostsAutoloader(expressServer);
```

It works !

The express vhosts autoloader will load each app.js module in each folder as an express middleware triggered only when the required host (i.e domain name) is provided.

## API

### expressVhostsAutoloader(expressServer, options)

This function tries to load any app.js file in any folder in the server root folder as an express middleware trigger only when the required domain name is provider in the request.

* `expressServer` (object, **required**) express server instance.

* `options` : object.
  *  `options.debug` (boolean, optional) : defaults to `false`. If `true` makes the module more verbose in the console.
  *  `options.folder` (string, optional) : defaults to server root directory. If set `expressVhostsAutoloader` tries to load any app.js from the folder provided.

##### Example :

```javascript
// Tries to load any file in folders located inside /home/user
var expressServer = expressVhostsAutoloader(expressServer, {
	folder: '/home/user'
});
```
### expressVhostsAutoloader.load(options)

This utility method loads an express middleware triggered only when the required host (i.e domain name) is provided. 

* `options` : object.
  *  `options.debug` (boolean) : defaults to `false`. If `true` makes the module more verbose in the console.
  *  `options.domainName` (string, **required**) : the domain name / folder name
  *  `options.mainFile` (string, optional) : defaults to app. If set the method will try to load the file named after the provided value. 
  *  `options.exportsProperty` (string, optional) : defaults to app. If set the method will try to use the exports property named after the provided value
  *  `options.expressServer` (object, optional | required). Optional if used after calling `expressVhostsAutoloader`. **Required** if `expressVhostsAutoloader.load` is used alone.
 
##### Examples

Used **after calling** `expressVhostsAutoloader`

```javascript
expressVhostsAutoloader.load({
  domainName:'www.foo.com'
});
```
For www.foo.com folder ./www.<i></i>foo.com will be served and app.js module required, needs module.exports.app to be set in app.js

```javascript
expressVhostsAutoloader.load({
  domainName:'www.foobar.com',
  mainFile:'index'
});
```
For www.foobar.com folder ./www.<i></i>foobar.com will be served and index.js module required, needs module.exports.index to be set in index.js

```javascript
expressVhostsAutoloader.load({
  domainName:'www.foobarfoo.com',
  mainFile:'index',
  exportsProperty:'bar'
});
```
For www.foobarfoo.com folder ./www.<i></i>foobarfoo.com will be served, index.js module required, needs module.exports.bar to be set in index.js

Used **without calling** `expressVhostsAutoloader`

```javascript
// Load express.
var express = require('express');
// Load express vhosts autoloader.
var expressVhostsAutoloader = require('express-vhosts-autoloader');
// Create express server.
var expressServer = express();

expressVhostsAutoloader.load({
  domainName:'www.foobarfoo.com',
  mainFile:'foo',
  exportsProperty:'bar',
  expressServer:expressServer
});
```
For www.foobarfoo.com folder ./www.<i></i>foobarfoo.com will be served, foo.js module required, needs module.exports.bar to be set in foo.js

## License

[MIT](LICENSE)
=======
# express-vhosts-autoloader
Autoloads express middlewares using the hostname as the module foldername.
>>>>>>> cdb57885cc8ff08a50eff9dad78669c37da278cd
