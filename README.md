![HANX.JS Logo](https://bytebucket.org/youhusam/hanxjs/raw/1eb2adf1abe8db760e5ec48f52c335b49d92792a/public/modules/core/img/brand/logo.png)

[![Build Status](https://travis-ci.org/YouHusam/hanx.js.svg?branch=master)](https://travis-ci.org/YouHusam/hanx.js)
[![Dependency Status](https://david-dm.org/YouHusam/hanx.js.svg)](https://david-dm.org/YouHusam/hanx.js)

HANX.JS is a port of [MEAN.JS](http://meanjs.org) in [Hapi.JS](http://www.hapijs.com/)

Please note that this is still a work in progress.

HAPI.JS is a full-stack JavaScript open-source solution, which provides a solid starting point for [PostgreSQL](http://www.postgresql.org/), [Node.js](http://www.nodejs.org/), [Hapi](http://hapijs.com/), and [AngularJS](http://angularjs.org/) based applications. The idea is to solve the common issues with connecting those frameworks, build a robust framework to support daily development needs, help developers use better practices while working with popular JavaScript components, and to eliminate the limits of the MEAN stack.

## Prerequisites
Make sure you have installed all of the following prerequisites on your development machine:
* Node.js - [Download & Install Node.js](http://www.nodejs.org/download/) and the npm package manager. If you encounter any problems, you can also use this [GitHub Gist](https://gist.github.com/isaacs/579814) to install Node.js.
* PostgreSQL - [Download & Install PostgreSQL](http://www.postgresql.org/download/), and make sure it's running on the default port (27017).
* Bower - You're going to use the [Bower Package Manager](http://bower.io/) to manage your front-end packages. Make sure you've installed Node.js and npm first, then install bower globally using npm:

```bash
$ npm install -g bower
```

* Grunt - You're going to use the [Grunt Task Runner](http://gruntjs.com/) to automate your development process. Make sure you've installed Node.js and npm first, then install grunt globally using npm:

```bash
$ npm install -g grunt-cli
```

* Setup the database:

```bash
$ psql
=# CREATE ROLE hanx WITH PASSWORD 'password' LOGIN;
=# CREATE DATABASE development;
=# GRANT postgres TO hanx;
```

## Downloading MEAN.JS
There are several ways you can get the HANX.JS boilerplate:

### Cloning The GitHub Repository
You can also use Git to directly clone the HANX.JS repository:
```bash
$ git clonehttps://github.com/YouHusam/hanx.js.git
```
This will clone the latest version of the HANX.JS repository to a **hanxjs** folder.

### Downloading The Repository Zip File
Another way to use the HANX.JS boilerplate is to download a zip copy from the [master branch on Github](https://github.org/youhusam/hanxjs/get/master.zip). You can also do this using `wget` command:
```bash
$ wget https://github.com/YouHusam/hanx.js/archive/master.zip -O hanx.zip; unzip hanx.zip; rm hanx.zip
```
Don't forget to rename **hanx-master** after your project name.

## Quick Install
Once you've downloaded the boilerplate and installed all the prerequisites, you're just a few steps away from starting to develop your HANX application.

The first thing you should do is install the Node.js dependencies. The boilerplate comes pre-bundled with a package.json file that contains the list of modules you need to start your application. To learn more about the modules installed visit the NPM & Package.json section.

To install Node.js dependencies you're going to use npm again. In the application folder run this in the command-line:

```bash
$ npm install
```

This command does a few things:
* First it will install the dependencies needed for the application to run.
* If you're running in a development environment, it will then also install development dependencies needed for testing and running your application.
* Finally, when the install process is over, npm will initiate a bower install command to install all the front-end modules needed for the application.

## Running Your Application
After the install process is over, you'll be able to run your application using Grunt. Just run grunt default task:

```bash
$ grunt
```

Your application should run on port 3000, so in your browser just go to [http://localhost:3000](http://localhost:3000)

That's it! Your application should be running. To proceed with your development, check the other sections in this documentation.
If you encounter any problems, try the Troubleshooting section.

## Testing Your Application
You can run the full test suite included with HANX.JS with the test task:

```
$ grunt test
```

This will run both the server-side tests (located in the app/tests/ directory) and the client-side tests (located in the public/modules/*/tests/).

To execute only the server tests, run the test:server task:

```
$ grunt test:server
```

And to run only the client tests, run the test:client task:

```
$ grunt test:client
```

## Running in a secure environment
To run your application in a secure manner you'll need to use OpenSSL and generate a set of self-signed certificates. Unix-based users can use the following command:
```bash
$ sh ./scripts/generate-ssl-certs.sh
```
Windows users can follow instructions found [here](http://www.websense.com/support/article/kbarticle/How-to-use-OpenSSL-and-Microsoft-Certification-Authority).
After you've generated the key and certificate, place them in the *config/sslcerts* folder.

## Credits
Based on the great work of [Amos Haviv](https://github.com/amoshaviv)
who created the [MEAN.JS](http://meanjs.org) boilerplate.

## License
(The MIT License)

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
'Software'), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
