/*!
 * express virtual hosts autoloader
 * @author sami.radi@virtuoworks.com (Sami Radi)
 * @company VirtuoWorks
 * @license MIT
 */

`use strict`;

/**
 * Module dependencies.
 * @private
 */
// module tag
const tag = `Virtual Hosts Autoloader`;

// core modules
const fs = require("fs");
const path = require("path");

// third party modules
const vhost = require("vhost");
const winston = require("winston");

/**
 * Module settings.
 */

winston.addColors({
  info: `green`,
  error: `red`,
  warn: `yellow`,
  debug: `grey`,
});

const logger = module.exports = new (winston.Logger)({
  transports: [
    new (winston.transports.Console)({
      colorize: `all`
    })
  ]
});

var Autoloader = function () {
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
   * @return {object} A Promise object.
   */
  this.loadVhost = function loadVhost(settings) {
    settings = settings || {};
    return new Promise((resolve, reject) => {

      if (typeof settings !== `object`) {
        let message = `[${tag}] "settings" must be an object.`;
        return reject(new TypeError(message));
      }

      if(settings.debug) {
        logger.transports.console.level = `debug`;
      }

      if (settings.expressServer) {
        this.expressServer = settings.expressServer;
      }

      if (this.expressServer && typeof this.expressServer === `function`
        && this.expressServer.use) {

        if (!settings.domainName) {
          let message = `[${tag}] "settings.domainName" is required.`;
          return reject(new ReferenceError(message));
        }

        if (typeof settings.domainName !== `string`) {
          let message = `[${tag}] "settings.domainName" is expected to be a string.`;
          return reject(new TypeError(message));
        }

        settings.mainFile = settings.mainFile || `app`;

        if (typeof settings.mainFile !== `string`) {
          let message = `[${tag}] "settings.mainFile" is expected to be a string.`;
          return reject(new TypeError(message));
        }

        // compatibility code for ES < 6
        if (typeof String.prototype.endsWith !== `function`) {
            String.prototype.endsWith = function(suffix) {
                return this.indexOf(suffix, this.length - suffix.length) !== -1;
            };
        }

        if(settings.mainFile.endsWith(".js")){
          settings.mainFile = settings.mainFile.substring(0, settings.mainFile.length - ".js".length);
        }

        settings.exportsProperty = settings.exportsProperty || `app`;

        if (typeof settings.exportsProperty !== `string`) {
          let message = `[${tag}] "settings.exportsProperty" is expected to be a string.`;
          return reject(new TypeError(message));
        }

        settings.folder = settings.folder || path.normalize(process.cwd() + path.sep);

        if (typeof settings.folder !== `string`) {
          let message = `[${tag}] "settings.folder" must be a string.`;
          return reject(new TypeError(message));
        }

        let moduleName = path.normalize(settings.folder + path.sep + settings.domainName + path.sep + settings.mainFile);

        let moduleFile = moduleName + `.js`;

        let message = `[${tag}] Trying to access ${moduleFile} file...`;
        logger.debug(message);

        fs.access(moduleFile, fs.R_OK, (error) => {
          if (error) {
            if(settings.debug) {
              this.expressServer.use(vhost(settings.domainName, function (req, res, next) {
                res.status(500).send(`<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Error 500 : Internal server error</title></head><body><h1>Error 500 : Internal server error</h1><p>The following module &laquo; <b>${moduleFile}</b> &raquo; could not be found.</p></body></html>`);
                next();
              }));
            } else {
              this.expressServer.use(vhost(settings.domainName, function (req, res, next) {
                res.status(500).send(`<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Error 500 : Internal server error</title></head><body><h1>Error 500 : Internal server error</h1><p>Sorry, something went wrong.</p></body></html>`);
                next();
              }));
            }
            let message = `[${tag}] Module file for ${settings.domainName} not found.`;
            logger.error(message);
            return reject(new Error(message));
          } else {
            let message = `[${tag}] Requiring ${moduleName} module...`;
            logger.debug(message);
            module = require(moduleName);
            if (module[settings.exportsProperty]
              && typeof module[settings.exportsProperty] === "function") {
              this.expressServer.use(vhost(settings.domainName, module[settings.exportsProperty]));
              let message;
              if (settings.autoloader) {
                message = `[${tag}] "${settings.domainName}" module (automatically) loaded as an Express middleware.`;
              } else {
                message = `[${tag}] "${settings.domainName}" module (manually) loaded as an Express middleware.`;
              }
              logger.info(message);
              return resolve({
                message: message
              });
            } else {
              if(settings.debug) {
                this.expressServer.use(vhost(settings.domainName, function (req, res, next) {
                  res.status(500).send(`<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Error 500 : Internal server error</title></head><body><h1>Error 500 : Internal server error</h1><p>Your module for this virtual host should end with <b><code>module.exports.${settings.exportsProperty} = </code> <i>&lt;yourExpressMiddleware&gt;</i>.</p></body></html>`);
                  next();
                }));
              } else {
                this.expressServer.use(vhost(settings.domainName, function (req, res, next) {
                  res.status(500).send(`<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Error 500 : Internal server error</title></head><body><h1>Error 500 : Internal server error</h1><p>Sorry, something went wrong.</p></body></html>`);
                  next();
                }));
              }
              let message;
              if (settings.autoloader) {
                message = `[${tag}] Failed to load (automatically) "${settings.domainName}" module. "module.exports.${settings.exportsProperty}" not found in "${moduleFile}".`;
              } else {
                message = `[${tag}] Failed to load (manually) "${settings.domainName}" module. "module.exports.${settings.exportsProperty}" not found in "${moduleFile}".`;
              }
              logger.error(message);
              return reject(new Error(message));
            }
          }
        });
      } else {
        let message = `[${tag}] "settings.expressServer" is expected to be an object.`;
        return reject(new ReferenceError(message));
      }
    });
  };

  /**
   * Loads a virtual host middleware according to folder name (e.g :
   * folder www.virtuoworks.com will be bound to www.virtuoworks.com virtual
   * host).
   *
   * @param {string} fileOrFolder A file or directory name.
   * @param {object} settings (optional) A settings object.
   * @param {string} settings.folder (optional) A string representing the folder
   * where the virtual hosts folders can be found. Defaults to server folder.
   * @return {object} A Promise object.
   */
  this.loadAsMiddleWare = function loadAsMiddleWare (fileOrFolder, settings) {
    settings = settings || {};
    return new Promise((resolve, reject) => {

      if (typeof fileOrFolder !== `string`) {
        let message = `[${tag}] "fileOrFolder" is expected to be a string.`;
        return reject(new TypeError(message));
      }

      if (typeof settings !== `object`) {
        let message = `[${tag}] "settings" must be an object.`;
        logger.error(message);
        return reject(new TypeError(message));
      }

      settings.folder = settings.folder || path.normalize(process.cwd() + path.sep);

      if (typeof settings.folder !== `string`) {
        let message = `[${tag}] "settings.folder" must be a string.`;
        logger.error(message);
        return reject(new TypeError(message));
      }

      fs.stat(path.normalize(settings.folder + path.sep + fileOrFolder), (error, stats) => {
        if (error) {
          let message = `[${tag}] Cannot read : ${fileOrFolder}.`;
          logger.warn(message);
          return reject({
            message,
            error
          });
        } else {
          if (stats.isDirectory()) {
            let moduleFile = path.normalize(settings.folder + path.sep + fileOrFolder + path.sep + `app.js`);
            fs.access(moduleFile, fs.R_OK, (error) => {
              if (error) {
                let message = `[${tag}] Cannot read/find : ${moduleFile}.`;
                logger.warn(message);
                return reject({
                  message,
                  error
                });
              } else {
                let message = `[${tag}] Loading ${moduleFile} module as an Express middleware.`;
                logger.debug(message);
                this.loadVhost({
                  autoloader: true,
                  folder: settings.folder,
                  domainName: fileOrFolder,
                  debug: false || settings.debug,
                }).then((data) => {
                  return resolve(data);
                }, (error) => {
                  return reject(error);
                });
              }
            });
          } else {
            let message = `[${tag}] ${fileOrFolder} is not a directory.`;
            reject({
              message
            });
          }
        }
      });
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
   * @return {object} A Promise object
   */
  this.run = function run (expressServer, settings) {
    settings = settings || {};
    return new Promise((resolve, reject) => {

      if(settings.debug) {
        logger.transports.console.level = `debug`;
      }

      if (expressServer && typeof expressServer === `function` && expressServer.use) {

        this.expressServer = expressServer;

        if (typeof settings !== `object`) {
          let message = `[${tag}] "settings" must be an object.`;
          logger.error(message);
          return reject(new TypeError(message));
        }

        settings.folder = settings.folder || path.normalize(process.cwd() + path.sep);

        if (typeof settings.folder !== `string`) {
          let message = `[${tag}] "settings.folder" must be a string.`;
          logger.error(message);
          return reject(new TypeError(message));
        }

        fs.readdir(settings.folder, (error, files) => {
          if (error) {
            let message = `[${tag}] Cannot read the current working directory : ${settings.folder}.`;
            logger.error(message);
            return reject(new Error(message));
          } else {
            let scan = [];
            files.forEach((fileOrFolder) => {
              scan.push(new Promise((resolve, reject) => {
                this.loadAsMiddleWare(fileOrFolder, settings).then((success) => {
                  resolve(success);
                }, (error) => {
                  // Ignore all errors.
                  resolve(error);
                });
              }));
              Promise.all(scan).then((data) => {
                resolve(data);
              });
            });
          }
        });
      } else {
        let message = `[${tag}] Express server is required.`;
        logger.error(message);
        return reject(new ReferenceError(message));
      }
    });
  };
};

/**
 * Expose `vhostsAutoloader()`.
 * @public
 */
exports = module.exports = (function () {
  // Creates a new autoloader object.
  let autoloader = new Autoloader();

  // Create a new autoloader function
  let vhostsAutoloader = function (expressServer, settings) {
    return new Promise((resolve, reject) => {
      autoloader.run(expressServer, settings).then((success) => {
        resolve(success);
      }, (error) => {
        reject(error);
      });
    });
  };

  // Binds the object methods to the autoloader function.
  vhostsAutoloader.loadVhost = autoloader.loadVhost.bind(autoloader);
  vhostsAutoloader.loadAsMiddleWare = autoloader.loadAsMiddleWare.bind(autoloader);

  // Returns the autoloader function.
  return vhostsAutoloader;
}());
