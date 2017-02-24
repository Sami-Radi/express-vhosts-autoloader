var assert = require('assert');
var request = require('supertest');
var vhostsAutoloader = require('..');

//require = require('really-need');

describe('Express test server', function() {
  var server;
  before(function(){
    // The before() callback gets run before all tests in the suite. Do one-time setup here.
  });
  beforeEach(function(){
    // The beforeEach() callback gets run before each test in the suite.
    delete require.cache[require.resolve('server')];
    server = require('server');
  });
  it('responds to /', function(done) {
    server.start((app) => {
      request(app)
        .get('/')
        .expect(404, done);
    });
  });
  afterEach(function(done) {
    // The afterEach() callback gets run after each test in the suite.
    server.stop(done);
  });
  after(function() {
    // after() is run after all your tests have completed. Do teardown here.
  });
});

describe('Virtual hosts vhostsAutoloader `vhostsAutoloader()`', function() {
  var server;
  before(function(){
    // The before() callback gets run before all tests in the suite. Do one-time setup here.
  });
  beforeEach(function(){
    // The beforeEach() callback gets run before each test in the suite.
    delete require.cache[require.resolve('server')];
    server = require('server');
  });
  it('responds 200 to http://localhost:' + (process.env['PORT'] || 8080), function (done) {
    vhostsAutoloader(server.app, {
      folder: server.dirname
    }).then((data) => {
      server.start(() => {
        request('http://localhost:' + (process.env['PORT'] || 8080))
          .get('/')
          .set('Host', 'localhost')
          .expect(200, 'It works (with app.js) !', done);
      });
    }, (error) => {
      done(error);
    });
  });
  it('responds 404 to http://127.0.0.1:' + (process.env['PORT'] || 8080), function (done) {
    app = vhostsAutoloader(server.app, {
      folder: server.dirname
    }).then((data) => {
      server.start(() => {
        request('http://127.0.0.1:' + (process.env['PORT'] || 8080))
          .get('/')
          .expect(404, done);
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
  });
});

describe('Virtual hosts manual loader `vhostsAutoloader.loadVhost()`', function() {
  var server;
  before(function(){
    // The before() callback gets run before all tests in the suite. Do one-time setup here.
  });
  beforeEach(function(){
    // The beforeEach() callback gets run before each test in the suite.
    delete require.cache[require.resolve('server')];
    server = require('server');
  });
  it('responds 200 to http://localhost:' + (process.env['PORT'] || 8080), function (done) {
    vhostsAutoloader.loadVhost({
      expressServer: server.app,
      folder: server.dirname,
      domainName: 'localhost'
    }).then((data) => {
      server.start(() => {
        request('http://localhost:' + (process.env['PORT'] || 8080))
          .get('/')
          .set('Host', 'localhost')
          .expect(200, 'It works (with app.js) !', done);
      });
    }, (error) => {
      done(error);
    });
  });
  it('responds 404 to http://127.0.0.1:' + (process.env['PORT'] || 8080) + ' with default app.js', function (done) {
    vhostsAutoloader.loadVhost({
      expressServer: server.app,
      folder: server.dirname,
      domainName: 'localhost'
    }).then((data) => {
      server.start(() => {
        request('http://127.0.0.1:' + (process.env['PORT'] || 8080))
          .get('/')
          .expect(404, done);
      });
    }, (error) => {
      done(error);
    });
  });
  it('responds 200 to http://localhost:' + (process.env['PORT'] || 8080) + ' with bar as main file', function (done) {
    vhostsAutoloader.loadVhost({
      expressServer: server.app,
      folder: server.dirname,
      domainName: 'localhost',
      mainFile: 'bar'
    }).then((data) => {
      server.start(() => {
        request('http://localhost:' + (process.env['PORT'] || 8080))
          .get('/')
          .set('Host', 'localhost')
          .expect(200, 'It works (with bar.js) !', done);
      });
    }, (error) => {
      done(error);
    });
  });
  it('responds 200 to http://localhost:' + (process.env['PORT'] || 8080) + ' with bar.js as main file', function (done) {
    vhostsAutoloader.loadVhost({
      expressServer: server.app,
      folder: server.dirname,
      domainName: 'localhost',
      mainFile: 'bar'
    }).then((data) => {
      server.start(() => {
        request('http://localhost:' + (process.env['PORT'] || 8080))
          .get('/')
          .set('Host', 'localhost')
          .expect(200, 'It works (with bar.js) !', done);
      });
    }, (error) => {
      done(error);
    });
  });
  it('responds 200 to http://localhost:' + (process.env['PORT'] || 8080) + ' with foo.js as main file and module.exports.bar', function (done) {
    vhostsAutoloader.loadVhost({
      expressServer: server.app,
      folder: server.dirname,
      domainName: 'localhost',
      mainFile: 'foo',
      exportsProperty: 'bar'
    }).then((data) => {
      server.start(() => {
        request('http://localhost:' + (process.env['PORT'] || 8080))
          .get('/')
          .set('Host', 'localhost')
          .expect(200, 'It works (with foo.js and module.exports.bar property) !', done);
      });
    }, (error) => {
      done(error);
    });
  });
  it('responds 500 to http://localhost:' + (process.env['PORT'] || 8080) + ' with unknown.js as main file', function (done) {
    vhostsAutoloader.loadVhost({
      expressServer: server.app,
      folder: server.dirname,
      domainName: 'localhost',
      mainFile: 'unknown'
    }).then((data) => {
      done(data);
    }, (error) => {
      server.start(() => {
        request('http://localhost:' + (process.env['PORT'] || 8080))
          .get('/')
          .set('Host', 'localhost')
          .expect(500, done);
      });
    });
  });
  it('responds 500 to http://localhost:' + (process.env['PORT'] || 8080) + ' with bar.js as main file and module.exports.unknown', function (done) {
    vhostsAutoloader.loadVhost({
      expressServer:server.app,
      folder: server.dirname,
      domainName: 'localhost',
      mainFile: 'bar',
      exportsProperty: 'unknown'
    }).then((data) => {
      done(data);
    }, (error) => {
      server.start(() => {
        request('http://localhost:' + (process.env['PORT'] || 8080))
          .get('/')
          .set('Host', 'localhost')
          .expect(500, done);
      });
    });
  });
  afterEach(function(done){
    // The afterEach() callback gets run after each test in the suite.
    server.stop(done);
  });
  after(function() {
    // after() is run after all your tests have completed. Do teardown here.
  });
});