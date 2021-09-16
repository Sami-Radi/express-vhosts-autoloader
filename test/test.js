var assert = require("assert");
var request = require("supertest");

describe("Express test server", function() {
  var server;
  beforeEach(function(){
    // The beforeEach() callback gets run before each test in the suite.
    delete require.cache[require.resolve("server")];
    server = require("server");
  });
  it("responds to / .", function(done) {
    server.start((app) => {
      request(app)
        .get("/")
        .expect(404, done);
    });
  });
  afterEach(function(done) {
    // The afterEach() callback gets run after each test in the suite.
    server.stop(done);
  });
});

describe("Virtual hosts vhostsAutoloader \"vhostsAutoloader()\"", function() {
  var server;
  var vhostsAutoloader;
  before(function(){
    // The before() callback gets run before all tests in the suite. Do one-time setup here.
    vhostsAutoloader = require("..");
  });
  beforeEach(function(){
    // The beforeEach() callback gets run before each test in the suite.
    delete require.cache[require.resolve("server")];
    server = require("server");
  });
  it("gets rejected if first argument is not an Express server.", function (done) {
    vhostsAutoloader().then((data) => {
      done(new Error("Promise was unexpectedly fulfilled."));
    }, (error) => {
      done(assert(error));
    });
  });
  it("gets rejected if \"settings\" is not an object.", function (done) {
    vhostsAutoloader(server.app, true).then((data) => {
      done(new Error("Promise was unexpectedly fulfilled."));
    }, (error) => {
      done(assert(error));
    });
  });
  it("gets rejected if \"settings.folder\" is not a string (deprecated).", function (done) {
    vhostsAutoloader(server.app, {
      folder: true
    }).then((data) => {
      done(new Error("Promise was unexpectedly fulfilled."));
    }, (error) => {
      done(assert(error));
    });
  });
  it("gets rejected if \"settings.directory\" is not a string.", function (done) {
    vhostsAutoloader(server.app, {
      directory: true
    }).then((data) => {
      done(new Error("Promise was unexpectedly fulfilled."));
    }, (error) => {
      done(assert(error));
    });
  });
  it("gets rejected if working folder cannot be red (deprecated).", function (done) {
    vhostsAutoloader(server.app, {
      folder: "/nonexistent-or-notauthorized-working-folder"
    }).then((data) => {
      done(new Error("Promise was unexpectedly fulfilled."));
    }, (error) => {
      done(assert(error));
    });
  });
  it("gets rejected if working directory cannot be red.", function (done) {
    vhostsAutoloader(server.app, {
      directory: "/nonexistent-or-notauthorized-working-directory"
    }).then((data) => {
      done(new Error("Promise was unexpectedly fulfilled."));
    }, (error) => {
      done(assert(error));
    });
  });
  it("can scan automatically current working directory if no directory is given.", function (done) {
    vhostsAutoloader(server.app).then((data) => {
      done();
    }, (error) => {
      done(error);
    });
  });
  it("responds 404 to http://127.0.0.1:" + (process.env["PORT"] || 8080) + " .", function (done) {
    vhostsAutoloader(server.app, {
      directory: server.dirname,
      debug: true
    }).then((data) => {
      server.start(() => {
        request("http://127.0.0.1:" + (process.env["PORT"] || 8080))
          .get("/")
          .expect(404, done);
      });
    }, (error) => {
      done(error);
    });
  });
  it("responds 200 to http://localhost:" + (process.env["PORT"] || 8080) + " .", function (done) {
    vhostsAutoloader(server.app, {
      directory: server.dirname,
      debug: true
    }).then((data) => {
      server.start(() => {
        request("http://localhost:" + (process.env["PORT"] || 8080))
          .get("/")
          .set("Host", "localhost")
          .expect(200, "It works (with app.js) !", done);
      });
    }, (error) => {
      done(error);
    });
  });
  afterEach(function(done){
    // The afterEach() callback gets run after each test in the suite.
    server.stop(done);
  });
  after(function() {
    // after() is run after all your tests have completed. Do teardown here.
    delete require.cache[require.resolve("..")];
  });
});

describe("Virtual hosts manual loader \"vhostsAutoloader.loadVhost()\"", function() {
  var server;
  var vhostsAutoloader;
  var endsWith = String.prototype.endsWith;

  before(function(){
    // The before() callback gets run before all tests in the suite. Do one-time setup here.
    vhostsAutoloader = require("..");
  });
  beforeEach(function(){
    // The beforeEach() callback gets run before each test in the suite.
    delete require.cache[require.resolve("server")];
    server = require("server");
  });
  it("gets rejected if \"settings\" is not set.", function (done) {
    vhostsAutoloader.loadVhost().then((data) => {
      done(new Error("Promise was unexpectedly fulfilled."));
    }, (error) => {
      done(assert(error));
    });
  });
  it("gets rejected if \"settings\" is not an object.", function (done) {
    vhostsAutoloader.loadVhost(true).then((data) => {
      done(new Error("Promise was unexpectedly fulfilled."));
    }, (error) => {
      done(assert(error));
    });
  });
  it("gets rejected if \"settings.expressServer\" is not set.", function (done) {
    vhostsAutoloader.loadVhost({
      directory: server.dirname,
      domainName: "localhost",
      debug: true
    }).then((data) => {
      done(new Error("Promise was unexpectedly fulfilled."));
    }, (error) => {
      done(assert(error));
    });
  });
  it("gets rejected if \"settings.domainName\" is not set.", function (done) {
    vhostsAutoloader.loadVhost({
      expressServer: server.app,
      directory: server.dirname,
      debug: true
    }).then((data) => {
      done(new Error("Promise was unexpectedly fulfilled."));
    }, (error) => {
      done(assert(error));
    });
  });
  it("gets rejected if \"settings.domainName\" is not a string.", function (done) {
    vhostsAutoloader.loadVhost({
      expressServer: server.app,
      directory: server.dirname,
      domainName: true,
      debug: true
    }).then((data) => {
      done(new Error("Promise was unexpectedly fulfilled."));
    }, (error) => {
      done(assert(error));
    });
  });
  it("gets rejected if \"settings.mainFile\" is not a string.", function (done) {
    vhostsAutoloader.loadVhost({
      expressServer: server.app,
      directory: server.dirname,
      domainName: "localhost",
      mainFile: true,
      debug: true
    }).then((data) => {
      done(new Error("Promise was unexpectedly fulfilled."));
    }, (error) => {
      done(assert(error));
    });
  });
  it("gets rejected if \"settings.exportsProperty\" is not a string.", function (done) {
    vhostsAutoloader.loadVhost({
      expressServer: server.app,
      directory: server.dirname,
      domainName: "localhost",
      exportsProperty: true,
      debug: true
    }).then((data) => {
      done(new Error("Promise was unexpectedly fulfilled."));
    }, (error) => {
      done(assert(error));
    });
  });
  it("gets rejected if \"settings.folder\" is not a string (deprecated).", function (done) {
    vhostsAutoloader.loadVhost({
      expressServer: server.app,
      folder: true,
      domainName: "localhost",
      debug: true
    }).then((data) => {
      done(new Error("Promise was unexpectedly fulfilled."));
    }, (error) => {
      done(assert(error));
    });
  });
  it("gets rejected if \"settings.directory\" is not a string.", function (done) {
    vhostsAutoloader.loadVhost({
      expressServer: server.app,
      directory: true,
      domainName: "localhost",
      debug: true
    }).then((data) => {
      done(new Error("Promise was unexpectedly fulfilled."));
    }, (error) => {
      done(assert(error));
    });
  });
  it("gets rejected if module file for localhost cannot be found.", function (done) {
    vhostsAutoloader.loadVhost({
      expressServer: server.app,
      domainName: "localhost",
      debug: true
    }).then((data) => {
      done(new Error("Promise was unexpectedly fulfilled."));
    }, (error) => {
      done(assert(error));
    });
  });
  it("responds 200 to http://localhost:" + (process.env["PORT"] || 8080) + " .", function (done) {
    vhostsAutoloader.loadVhost({
      expressServer: server.app,
      directory: server.dirname,
      domainName: "localhost",
      debug: true
    }).then((data) => {
      server.start(() => {
        request("http://localhost:" + (process.env["PORT"] || 8080))
          .get("/")
          .set("Host", "localhost")
          .expect(200, "It works (with app.js) !", done);
      });
    }, (error) => {
      done(error);
    });
  });
  it("responds 404 to http://127.0.0.1:" + (process.env["PORT"] || 8080) + " with default app.js .", function (done) {
    vhostsAutoloader.loadVhost({
      expressServer: server.app,
      directory: server.dirname,
      domainName: "localhost",
      debug: true
    }).then((data) => {
      server.start(() => {
        request("http://127.0.0.1:" + (process.env["PORT"] || 8080))
          .get("/")
          .expect(404, done);
      });
    }, (error) => {
      done(error);
    });
  });
  it("responds 200 to http://localhost:" + (process.env["PORT"] || 8080) + " with bar as main file .", function (done) {
    vhostsAutoloader.loadVhost({
      expressServer: server.app,
      directory: server.dirname,
      domainName: "localhost",
      mainFile: "bar",
      debug: true
    }).then((data) => {
      server.start(() => {
        request("http://localhost:" + (process.env["PORT"] || 8080))
          .get("/")
          .set("Host", "localhost")
          .expect(200, "It works (with bar.js) !", done);
      });
    }, (error) => {
      done(error);
    });
  });
  it("responds 200 to http://localhost:" + (process.env["PORT"] || 8080) + " with bar as main file (with compatibility code for ES < 6) .", function (done) {
    String.prototype.endsWith = null;
    vhostsAutoloader.loadVhost({
      expressServer: server.app,
      directory: server.dirname,
      domainName: "localhost",
      mainFile: "bar",
      debug: true
    }).then((data) => {
      server.start(() => {
        request("http://localhost:" + (process.env["PORT"] || 8080))
          .get("/")
          .set("Host", "localhost")
          .expect(200, "It works (with bar.js) !", done);
      });
    }, (error) => {
      done(error);
    });
  });
  it("responds 200 to http://localhost:" + (process.env["PORT"] || 8080) + " with bar.js as main file .", function (done) {
    vhostsAutoloader.loadVhost({
      expressServer: server.app,
      directory: server.dirname,
      domainName: "localhost",
      mainFile: "bar.js",
      debug: true
    }).then((data) => {
      server.start(() => {
        request("http://localhost:" + (process.env["PORT"] || 8080))
          .get("/")
          .set("Host", "localhost")
          .expect(200, "It works (with bar.js) !", done);
      });
    }, (error) => {
      done(error);
    });
  });
  it("responds 200 to http://localhost:" + (process.env["PORT"] || 8080) + " with bar as main file .", function (done) {
    vhostsAutoloader.loadVhost({
      expressServer: server.app,
      directory: server.dirname,
      domainName: "localhost",
      mainFile: "bar",
      debug: true
    }).then((data) => {
      server.start(() => {
        request("http://localhost:" + (process.env["PORT"] || 8080))
          .get("/")
          .set("Host", "localhost")
          .expect(200, "It works (with bar.js) !", done);
      });
    }, (error) => {
      done(error);
    });
  });
  it("responds 200 to http://localhost:" + (process.env["PORT"] || 8080) + " with bar.js as main file .", function (done) {
    vhostsAutoloader.loadVhost({
      expressServer: server.app,
      directory: server.dirname,
      domainName: "localhost",
      mainFile: "bar.js",
      debug: true
    }).then((data) => {
      server.start(() => {
        request("http://localhost:" + (process.env["PORT"] || 8080))
          .get("/")
          .set("Host", "localhost")
          .expect(200, "It works (with bar.js) !", done);
      });
    }, (error) => {
      done(error);
    });
  });
  it("responds 200 to http://localhost:" + (process.env["PORT"] || 8080) + " with foo.js as main file and module.exports.bar .", function (done) {
    vhostsAutoloader.loadVhost({
      expressServer: server.app,
      directory: server.dirname,
      domainName: "localhost",
      mainFile: "foo",
      exportsProperty: "bar",
      debug: true
    }).then((data) => {
      server.start(() => {
        request("http://localhost:" + (process.env["PORT"] || 8080))
          .get("/")
          .set("Host", "localhost")
          .expect(200, "It works (with foo.js and module.exports.bar property) !", done);
      });
    }, (error) => {
      done(error);
    });
  });
  it("responds 200 to http://localhost:" + (process.env["PORT"] || 8080) + " with foo as main file and module.exports.bar .", function (done) {
    vhostsAutoloader.loadVhost({
      expressServer: server.app,
      directory: server.dirname,
      domainName: "localhost",
      mainFile: "foo.js",
      exportsProperty: "bar",
      debug: true
    }).then((data) => {
      server.start(() => {
        request("http://localhost:" + (process.env["PORT"] || 8080))
          .get("/")
          .set("Host", "localhost")
          .expect(200, "It works (with foo.js and module.exports.bar property) !", done);
      });
    }, (error) => {
      done(error);
    });
  });
  it("responds 500 to http://localhost:" + (process.env["PORT"] || 8080) + " with unknown.js as main file and debug enabled.", function (done) {
    vhostsAutoloader.loadVhost({
      expressServer: server.app,
      directory: server.dirname,
      domainName: "localhost",
      mainFile: "unknown",
      debug: true
    }).then((data) => {
      done(data);
    }, (error) => {
      server.start(() => {
        request("http://localhost:" + (process.env["PORT"] || 8080))
          .get("/")
          .set("Host", "localhost")
          .expect(500, done);
      });
    });
  });
  it("responds 500 to http://localhost:" + (process.env["PORT"] || 8080) + " with unknown.js as main file and debug disabled.", function (done) {
    vhostsAutoloader.loadVhost({
      expressServer: server.app,
      directory: server.dirname,
      domainName: "localhost",
      mainFile: "unknown"
    }).then((data) => {
      done(data);
    }, (error) => {
      server.start(() => {
        request("http://localhost:" + (process.env["PORT"] || 8080))
          .get("/")
          .set("Host", "localhost")
          .expect(500, done);
      });
    });
  });
  it("responds 500 to http://localhost:" + (process.env["PORT"] || 8080) + " with bar.js as main file and module.exports.unknown and debug enabled.", function (done) {
    vhostsAutoloader.loadVhost({
      expressServer:server.app,
      directory: server.dirname,
      domainName: "localhost",
      mainFile: "bar",
      exportsProperty: "unknown",
      debug: true
    }).then((data) => {
      done(data);
    }, (error) => {
      server.start(() => {
        request("http://localhost:" + (process.env["PORT"] || 8080))
          .get("/")
          .set("Host", "localhost")
          .expect(500, done);
      });
    });
  });
  it("responds 500 to http://localhost:" + (process.env["PORT"] || 8080) + " with bar.js as main file and module.exports.unknown and debug disabled.", function (done) {
    vhostsAutoloader.loadVhost({
      expressServer:server.app,
      directory: server.dirname,
      domainName: "localhost",
      mainFile: "bar",
      exportsProperty: "unknown"
    }).then((data) => {
      done(data);
    }, (error) => {
      server.start(() => {
        request("http://localhost:" + (process.env["PORT"] || 8080))
          .get("/")
          .set("Host", "localhost")
          .expect(500, done);
      });
    });
  });
  it("responds 500 to http://localhost:" + (process.env["PORT"] || 8080) + " with bar.js as main file and module.exports.unknown, debug enabled, mocked as automatic.", function (done) {
    vhostsAutoloader.loadVhost({
      expressServer:server.app,
      directory: server.dirname,
      domainName: "localhost",
      mainFile: "bar",
      autoloader: true,
      exportsProperty: "unknown",
      debug: true
    }).then((data) => {
      done(data);
    }, (error) => {
      server.start(() => {
        request("http://localhost:" + (process.env["PORT"] || 8080))
          .get("/")
          .set("Host", "localhost")
          .expect(500, done);
      });
    });
  });
  it("responds 500 to http://localhost:" + (process.env["PORT"] || 8080) + " with bar.js as main file and module.exports.unknown, debug disabled, mocked as automatic.", function (done) {
    vhostsAutoloader.loadVhost({
      expressServer:server.app,
      directory: server.dirname,
      domainName: "localhost",
      mainFile: "bar",
      autoloader: true,
      exportsProperty: "unknown"
    }).then((data) => {
      done(data);
    }, (error) => {
      server.start(() => {
        request("http://localhost:" + (process.env["PORT"] || 8080))
          .get("/")
          .set("Host", "localhost")
          .expect(500, done);
      });
    });
  });
  afterEach(function(done){
    // The afterEach() callback gets run after each test in the suite.
    String.prototype.endsWith = endsWith;
    server.stop(done);
  });
  after(function() {
    // after() is run after all your tests have completed. Do teardown here.
    delete require.cache[require.resolve("..")];
  });
});

describe("Virtual host file as middleware \"vhostsAutoloader.loadAsMiddleWare()\"", function() {
  var server;
  var vhostsAutoloader;
  before(function(){
    // The before() callback gets run before all tests in the suite. Do one-time setup here.
    vhostsAutoloader = require("..");
  });
  beforeEach(function(){
    // The beforeEach() callback gets run before each test in the suite.
    delete require.cache[require.resolve("server")];
    server = require("server");
  });
  it("gets rejected if \"fileOrDirectory\" and \"settings\" is not set.", function (done) {
    vhostsAutoloader.loadAsMiddleWare().then((data) => {
      done(new Error("Promise was unexpectedly fulfilled."));
    }, (error) => {
      done(assert(error));
    });
  });
  it("gets rejected if \"fileOrDirectory\" is an illegal character.", function (done) {
    vhostsAutoloader.loadAsMiddleWare(":").then((data) => {
      done(new Error("Promise was unexpectedly fulfilled."));
    }, (error) => {
      done(assert(error));
    });
  });
  it("gets rejected if \"settings\" is not an object.", function (done) {
    vhostsAutoloader.loadAsMiddleWare("app.js", "not an object").then((data) => {
      done(new Error("Promise was unexpectedly fulfilled."));
    }, (error) => {
      done(assert(error));
    });
  });
  it("gets rejected if \"settings.folder\" is not a string (deprecated).", function (done) {
    vhostsAutoloader.loadAsMiddleWare("app.js", {
      folder: {}
    }).then((data) => {
      done(new Error("Promise was unexpectedly fulfilled."));
    }, (error) => {
      done(assert(error));
    });
  });
  it("gets rejected if \"settings.directory\" is not a string.", function (done) {
    vhostsAutoloader.loadAsMiddleWare("app.js", {
      directory: {}
    }).then((data) => {
      done(new Error("Promise was unexpectedly fulfilled."));
    }, (error) => {
      done(assert(error));
    });
  });
  it("gets rejected if \"settings.ignoreList\" is not an Array.", function (done) {
    vhostsAutoloader.loadAsMiddleWare("app.js", {
      ignoreList: {}
    }).then((data) => {
      done(new Error("Promise was unexpectedly fulfilled."));
    }, (error) => {
      done(assert(error));
    });
  });
  afterEach(function(done){
    // The afterEach() callback gets run after each test in the suite.
    server.stop(done);
  });
  after(function() {
    // after() is run after all your tests have completed. Do teardown here.
    delete require.cache[require.resolve("..")];
  });
});