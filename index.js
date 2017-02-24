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
 * @param {object} settings (required) A settings object.
 * @param {string} settings.domainName (required) Matches the virtual host
 * folder name. e.g : www.virtuoworks.com, module name defaults to app.js,
 * exports name defaults to app.
 * @param {string} settings.mainFile (optional) If set matches the virtual
 * host module filename (e.g : app.js), exports name defaults to app (e.g :
 * app in module.exports.app = myAppMiddleware; at the end of app.js file).
 * @param {string} settings.exportsProperty (optional) If set matches
 * exports name (e.g : bar in module.exports.bar = myAppMiddleware; at
 * the end of app.js file).
 * @param {string} settings.expressServer Optional if used after the virtual
 * hosts autoload. Required otherwise.
 * @param {string} settings.debug (optional) If set will be more verbose.
 */                                                                            
let loadVhost = function loadVhost(settings) {
  var settings = settings || {};
  return new Promise((resolve, reject) => {

    if(settings.debug) {
      logger.transports.console.level = 'debug';
    };

    if (settings.expressServer) {
      this.expressServer = settings.expressServer;
    };

    if (this.expressServer && typeof this.expressServer === 'function'
      && this.expressServer.use) {

      if (typeof settings !== 'object') {
        let message = `"settings" must be an object.`;
        reject(new TypeError(message));
      };

      if (!settings.domainName) {
        let message = `"settings.domainName" is required.`;
        reject(new ReferenceError(message));
      };

      if (typeof settings.domainName !== 'string') {
        let message = `"settings.domainName" is expected to be a string.`;
        reject(new TypeError(message));
      };

      settings.mainFile = settings.mainFile || 'app';

      if (typeof settings.mainFile !== 'string') {
        let message = `"settings.mainFile" is expected to be a string.`
        reject(new TypeError(message));
      };

      // compatibility code for ES < 6
      if (typeof String.prototype.endsWith !== 'function') {
          String.prototype.endsWith = function(suffix) {
              return this.indexOf(suffix, this.length - suffix.length) !== -1;
          };
      };

      if(settings.mainFile.endsWith('.js')){
        settings.mainFile = settings.mainFile.substring(0, settings.mainFile.length - '.js'.length);
      };

      settings.exportsProperty = settings.exportsProperty || 'app';

      if (typeof settings.exportsProperty !== 'string') {
        let message = `"settings.exportsProperty" is expected to be a string.`;
        reject(new TypeError(message));
      };

      settings.folder = settings.folder || path.normalize(process.cwd() + path.sep);

      if (typeof settings.folder !== 'string') {
        let message = `"settings.folder" must be a string.`;
        reject(new TypeError(message));
      };

      var moduleName = path.normalize(settings.folder + path.sep + settings.domainName + path.sep + settings.mainFile);

      var moduleFile = moduleName + '.js';

      let message = `Trying to access ${moduleFile} file...`;
      logger.debug(message);

      fs.access(moduleFile, fs.R_OK, (error) => {
        if (error) {
          this.expressServer.use(function (req, res, next) {
            res.status(500).send(`<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Error 500 : Internal server error</title></head><body><h1>Error 500 : Internal server error</h1><p>The following module &laquo; <b>${moduleFile}</b> &raquo; could not be found.</p></body></html>`);
            next();
          });
          let message = `Module file for ${settings.domainName} not found.`;
          logger.error(message);
          reject(new Error(message));
        } else {
          let message = `Requiring ${moduleName} module...`;
          logger.debug(message);
          module = require(moduleName);
          if (module[settings.exportsProperty]
            && typeof module[settings.exportsProperty] === 'function') {
            this.expressServer.use(vhost(settings.domainName, module[settings.exportsProperty]));
            let message;
            if (settings.autoloader) {
              message = `"${settings.domainName}" module (automatically) loaded as an Express middleware.`;
            } else {
              message = `"${settings.domainName}" module (manually) loaded as an Express middleware.`;
            };
            logger.info(message);
            resolve({
              message: message
            });
          } else {
            this.expressServer.use(function (req, res, next) {
              res.status(500).send(`<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Error 500 : Internal server error</title></head><body><h1>Error 500 : Internal server error</h1><p>Your module for this virtual host should end with <b><code>module.exports.${settings.exportsProperty} = </code> <i>&lt;yourExpressMiddleware&gt;</i>.</p></body></html>`);
              next();
            });
            let message;
            if (settings.autoloader) {
              message = `Failed to load (automatically) "${settings.domainName}" module. "module.exports.${settings.exportsProperty}" not found in "${moduleFile}".`;
            } else {
              message = `Failed to load (manually) "${settings.domainName}" module. "module.exports.${settings.exportsProperty}" not found in "${moduleFile}".`;
            };
            logger.error(message);
            reject(new Error(message));
          }
        };
      });
    } else {
      let message = `"settings.expressServer" is expected to be an object.`;
      reject(new ReferenceError(message));
    };
  });
};

/**
 * Auto detects and loads virtual hosts according to folder name (e.g :
 * folder www.virtuoworks.com will be bound to www.virtuoworks.com virtual
 * host).
 * 
 * @param {object} expressServer An express server object
 * @param {object} settings (optional) A settings object.
 * @param {string} settings.folder (optional) A string representing the folder
 * where the virtual hosts folders can be found. Defaults to server folder.
 * @return {object} An express server object
 */
let vhostsAutoloader = function vhostsAutoloader(expressServer, settings) {
  var settings = settings || {};
  return new Promise((resolve, reject) => {

    if(settings.debug) {
      logger.transports.console.level = 'debug';
    };

    if (expressServer && typeof expressServer === 'function' && expressServer.use) {

      vhostsAutoloader.expressServer = expressServer;

      if (typeof settings !== 'object') {
        let message = `"settings" must be an object.`;
        logger.error(message);
        reject(new TypeError(message));
      };

      settings.folder = settings.folder || path.normalize(process.cwd() + path.sep);

      if (typeof settings.folder !== 'string') {
        let message = `"settings.folder" must be a string.`;
        logger.error(message);
        reject(new TypeError(message));
      };

      fs.readdir(settings.folder, (error, files) => {
        if (error) {
          let message = `Cannot read the current working directory : ${settings.folder}.`;
          logger.error(message);
          reject(new Error(message));
        } else {
          let scan = []
          files.forEach((fileOrFolder) => {
            scan.push(new Promise((resolve, reject) => {
              fs.stat(path.normalize(settings.folder + path.sep + fileOrFolder), (error, stats) => {
                if (error) {
                  let message = `Cannot read : ${fileOrFolder}.`;
                  logger.warn(message);
                  resolve({
                    message: message,
                    error: error
                  });
                } else {
                  if (stats.isDirectory()) {
                    let moduleFile = path.normalize(settings.folder + path.sep + fileOrFolder + path.sep + 'app.js');
                    fs.access(moduleFile, fs.R_OK, (error) => {
                      if (error) {
                        let message = `Cannot read/find : ${moduleFile}.`;
                        logger.warn(message);
                        resolve({
                          message: message,
                          error: error
                        });
                      } else {
                        let message = `Loading ${moduleFile} module as an Express middleware.`;
                        logger.debug(message);
                        vhostsAutoloader.loadVhost({
                          autoloader: true,
                          folder: settings.folder,
                          domainName:fileOrFolder,
                          debug: settings.debug || false,
                        }).then((data) => {
                          resolve(data);
                        }, (error) => {
                          resolve(error);
                        });
                      };
                    });
                  } else {
                    let message = `${fileOrFolder} is not a directory.`;
                    resolve({
                      message: message
                    });
                  }
                };
              });
            }));
            Promise.all(scan).then((data) => {
              resolve(data);
            })
          });
        };
      });
    } else {
      let message = `Express server is required.`;
      logger.error(message);
      reject(new ReferenceError(message));
    };
  });
};

vhostsAutoloader.loadVhost = loadVhost;

/**
 * Expose `vhostsAutoloader()`.
 * @public
 */
exports = module.exports = vhostsAutoloader;
