/*!
 * express virtual hosts autoloader 
 * @author sami.radi@virtuoworks.com (Sami Radi)
 * @company VirtuoWorks
 * @license MIT
 */

'use strict';

/**
 * Module dependencies.
 * @private
 */
 
// core modules
var fs = require('fs');
var path = require('path');

// third party modules
var vhost = require('vhost');
var winston = require('winston');

/**
 * Module settings.
 */

winston.addColors({
  info: 'green',
  error: 'red',
  warn: 'yellow',
  debug: 'grey',
});

var logger = module.exports = new (winston.Logger)({
  transports: [
    new (winston.transports.Console)({
      colorize: 'all'
    })
  ]
});

/**
 * Registers a new express virtual host middleware.
 *
 * @param {object} options (required) An options object.
 * @param {string} options.domainName (required) Matches the virtual host
 * folder name. e.g : www.virtuoworks.com, module name defaults to app.js,
 * exports name defaults to app.
 * @param {string} options.mainFile (optional) If set matches the virtual
 * host module filename (e.g : app.js), exports name defaults to app (e.g :
 * app in module.exports.app = myAppMiddleware; at the end of app.js file).
 * @param {string} options.exportsProperty (optional) If set matches
 * exports name (e.g : bar in module.exports.bar = myAppMiddleware; at
 * the end of app.js file).
 * @param {string} options.expressServer Optional if used after the virtual
 * hosts autoload. Required otherwise.
 * @param {string} options.debug (optional) If set will be more verbose.
 */                                                                            
var loadVhost = function loadVhost(options) {

  var that = this;
  var options = options || {};
 
  if(options.debug) {
    logger.transports.console.level = 'debug';
  };
 
  if (options.expressServer) {
    that.expressServer = options.expressServer;
  };
 
  if (that.expressServer && typeof that.expressServer === 'function'
    && that.expressServer.use) {

    if (typeof options !== 'object') {
      throw new TypeError('"options" must be an object.');
    };

    if (!options.domainName) {
      throw new ReferenceError('"options.domainName" is required.');
    };

    if (typeof options.domainName !== 'string') {
      throw new TypeError('"options.domainName" is expected to be a string.');
    };

    options.mainFile = options.mainFile || 'app';

    if (typeof options.mainFile !== 'string') {
      throw new TypeError('"options.mainFile" is expected to be a string.');
    };

    // compatibility code for ES < 6
    if (typeof String.prototype.endsWith !== 'function') {
        String.prototype.endsWith = function(suffix) {
            return this.indexOf(suffix, this.length - suffix.length) !== -1;
        };
    };

    if(options.mainFile.endsWith('.js')){
      options.mainFile = options.mainFile.substring(0, options.mainFile.length - '.js'.length);
    };

    options.exportsProperty = options.exportsProperty || 'app';

    if (typeof options.exportsProperty !== 'string') {
      throw new TypeError('"options.exportsProperty" is expected to be a string.');
    };

    options.folder = options.folder || path.normalize(process.cwd() + path.sep);

    if (typeof options.folder !== 'string') {
      throw new TypeError('"options.folder" must be a string.');
    };

    var moduleName = path.normalize(options.folder + path.sep + options.domainName + path.sep + options.mainFile);

    var moduleFile = moduleName + '.js';

    logger.debug('Trying to access "' + moduleFile + '" file...');

    fs.access(moduleFile, fs.R_OK, function (error) {
      if (error) {
        logger.error('Module file for "' + options.domainName + '" not found.');
        that.expressServer.use(function (req, res, next) {
          res.status(500).send('<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Error 500 : Internal server error</title></head><body><h1>Error 500 : Internal server error</h1><p>The following module &laquo; <b>' + moduleFile + '</b> &raquo; could not be found.</p></body></html>');
          next();
        });
      } else {
        logger.debug('Requiring "' + moduleName + '" module...');
        module = require(moduleName);
        if (module[options.exportsProperty]
          && typeof module[options.exportsProperty] === 'function') {
          if (options.autoloader) {
            logger.info('"' + options.domainName + '" module (automatically) loaded as an Express middleware.');
          } else {
            logger.info('"' + options.domainName + '" module (manually) loaded as an Express middleware.');
          };
          that.expressServer.use(vhost(options.domainName, module[options.exportsProperty]));
        } else {
          if (options.autoloader) {
            logger.error('Failed to load (automatically) "' + options.domainName + '" module. "module.exports.' + options.exportsProperty + '" not found in "' + moduleFile + '".');
          } else {
            logger.error('Failed to load (manually) "' + options.domainName + '" module. "module.exports.' + options.exportsProperty + '" not found in "' + moduleFile + '".');
          };
          that.expressServer.use(function (req, res, next) {
            res.status(500).send('<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Error 500 : Internal server error</title></head><body><h1>Error 500 : Internal server error</h1><p>Your module for this virtual host should end with <b><code>module.exports.' + options.exportsProperty + ' = </code> <i>&lt;yourExpressMiddleware&gt;</i>.</p></body></html>');
            next();
          });
        }
      };
    });

  } else {
    throw new ReferenceError('"options.expressServer" is expected to be an object.');
  };
};

/**
 * Auto detects and loads virtual hosts according to folder name (e.g :
 * folder www.virtuoworks.com will be bound to www.virtuoworks.com virtual
 * host).
 * 
 * @param {object} expressServer An express server object
 * @param {object} options (optional) An options object.
 * @param {string} options.folder (optional) A string representing the folder
 * where the virtual hosts folders can be found. Defaults to server folder.
 * @return {object} An express server object
 */
var vhostsAutoloader = function vhostsAutoloader(expressServer, options) {

  var options = options || {};

  if(options.debug) {
    logger.transports.console.level = 'debug';
  };

  if (expressServer && typeof expressServer === 'function' 
    && expressServer.use) {

    vhostsAutoloader.expressServer = expressServer;

    if (typeof options !== 'object') {
      throw new TypeError('"options" must be an object.');
    };

    options.folder = options.folder || path.normalize(process.cwd() + path.sep);

    if (typeof options.folder !== 'string') {
      throw new TypeError('"options.folder" must be a string.');
    };

    fs.readdir(options.folder, function(error,files) {
      if (error) {
        logger.error('Cannot read current directory : "' + options.folder + '".');
      } else {
        files.forEach(function(fileOrFolder) {
          fs.stat(path.normalize(options.folder + path.sep + fileOrFolder), function(error, stats) {
            if (error) {
              logger.warn('Cannot read : "' + fileOrFolder + '".');
            } else {
              if (stats.isDirectory()) {
                var moduleFile = path.normalize(options.folder + path.sep + fileOrFolder + path.sep + 'app.js');
                fs.access(moduleFile, fs.R_OK, function (error) {
                  if (error) {
                    logger.warn('Cannot read/find : "' + moduleFile + '".');
                  } else {
                    logger.debug('Loading "' + moduleFile + '" module as an Express middleware.');
                    vhostsAutoloader.loadVhost({
                      autoloader: true,
                      folder: options.folder,
                      domainName:fileOrFolder,
                      debug: options.debug || false,
                    });
                  };
                });
              };
            };
          });
        });
      };
    });

    return expressServer;

  } else {
    throw new ReferenceError('Express server is required.');
  };
};

vhostsAutoloader.loadVhost = loadVhost;
/**
 * Expose `vhostsAutoloader()`.
 * @public
 */
exports = module.exports = vhostsAutoloader;