# awilix-router-core

[![npm](https://img.shields.io/npm/v/awilix-router-core.svg?maxAge=1000)](https://www.npmjs.com/package/awilix-router-core)
[![dependency Status](https://img.shields.io/david/jeffijoe/awilix-router-core.svg?maxAge=1000)](https://david-dm.org/jeffijoe/awilix-router-core)
[![devDependency Status](https://img.shields.io/david/dev/jeffijoe/awilix-router-core.svg?maxAge=1000)](https://david-dm.org/jeffijoe/awilix-router-core)
[![Build Status](https://img.shields.io/travis/jeffijoe/awilix-router-core.svg?maxAge=1000)](https://travis-ci.org/jeffijoe/awilix-router-core)
[![Coveralls](https://img.shields.io/coveralls/jeffijoe/awilix-router-core.svg?maxAge=1000)](https://coveralls.io/github/jeffijoe/awilix-router-core)
[![npm](https://img.shields.io/npm/dt/awilix-router-core.svg?maxAge=1000)](https://www.npmjs.com/package/awilix-router-core)
[![npm](https://img.shields.io/npm/l/awilix-router-core.svg?maxAge=1000)](https://github.com/jeffijoe/awilix-router-core/blob/master/LICENSE.md)

> This package is intended for use with HTTP libraries that want to configure routes using **ESNext decorators** or a **builder pattern**.

# Table of Contents

* [Install](#install)
* [Example](#example)
  * [With decorators](#with-decorators)
  * [With builder pattern](#with-builder-pattern)
* [For framework adapter authors](#for-framework-adapter-authors)
* [API](#api)
  * [Route Declaration](#route-declaration)
      * [Builder](#builder)
        * [createController(targetClassOrFunction)](#createcontrollertargetclassorfunction)
      * [Decorators](#decorators)
        * [route(path)](#routepath)
        * [before(middlewares) and <code>after(middlewares)</code>](#beforemiddlewares-and-aftermiddlewares)
        * [verbs(httpVerbs)](#verbshttpverbs)
        * [Verb shorthands](#verb-shorthands)
  * [Extracting route config](#extracting-route-config)
      * [getStateAndTarget(functionOrClassOrController)](#getstateandtargetfunctionorclassorcontroller)
      * [rollUpState(state)](#rollupstatestate)
      * [findControllers(pattern, globOptions)](#findcontrollerspattern-globoptions)
* [Author](#author)


# Install

With `npm`:

```
npm install awilix-router-core
```

Or with `yarn`

```
yarn add awilix-router-core
```

# Example

The end-user of the routing library will be able to use decorators or a builder pattern to declaratively set up their routes, middleware and methods.

**Note**: in the examples below, an ES6 `default` export is used, but named exports and multiple exports
per file are supported.

## With decorators

```js
// You may re-export these as well.
import { route, before, GET, verbs, HttpVerbs } from 'awilix-router-core'

import bodyParser from 'your-framework-body-parser'
import authenticate from 'your-framework-authentication'

@before(bodyParser())
@route('/news')
export default class NewsController {
  constructor ({ service }) {
    this.service = service
  }

  @GET()
  async find (ctx) {
    ctx.body = await this.service.doSomethingAsync()
  }

  @route('/:id')
  @GET()
  async get(ctx) {
    ctx.body = await this.service.getNewsOrWhateverAsync(ctx.params.id)
  }

  @route('(/:id)')
  @verbs([HttpVerbs.POST, HttpVerbs.PUT])
  @before(authenticate())
  async save (ctx) {
    ctx.body = await this.service.saveNews(ctx.params.id, ctx.request.body)
  }
}
```

## With builder pattern

```js
// You may re-export these as well.
import { createController } from 'awilix-router-core'

import bodyParser from 'your-framework-body-parser'
import authenticate from 'your-framework-authentication'

// Can use a factory function or a class.
const api = ({ service }) => ({
  find: async () => (ctx.body = await service.doSomethingAsync()),
  get: async (ctx) => (ctx.body = await service.getNewsOrWhateverAsync(ctx.params.id)),
  save: async (ctx) => (ctx.body = await service.saveNews(ctx.params.id, ctx.request.body))
}) 

export default createController(api)
  .before(bodyParser())
  .prefix('/news')
  .get('', 'find') // <- "find" is the method on the result from `api`
  .get('/:id', 'get') // <- "get" is the method on the result from `api`
  .verbs([HttpVerbs.POST, HttpVerbs.PUT], '/:id', 'save', {
    // "save" is the method on the result from `api`
    before: [authenticate()]
  })
```

# For framework adapter authors

The framework adapter will use the tools provided by this package to extract routing config from decorated classes and register it in the router of choice.

Check out the [`awilix-koa`](https://github.com/jeffijoe/awilix-koa/tree/master/src/controller.ts) reference implementation, as well as the [API docs](#extracting-route-config) here.

# API

As mentioned earlier, this package exposes the user-facing route declaration API, as well as utilities needed for framework adapter authors.

## Route Declaration

There are 2 flavors of route declaration: **builder** and **ESNext decorators**.

### Builder

The builder API's public top level exports are:

```js
import { createController, HttpVerbs } from 'awilix-router-core'
```

#### `createController(targetClassOrFunction)`

Creates a controller that will invoke methods on an instance of the specified `targetClassOrFunction`.

The controller exposes the following builder methods:

* `.get|post|put|patch|delete|head|options|connect|all(path, method, opts)`: shorthands for `.verbs([HttpVerbs.POST], ...)` - see [`HttpVerbs`][http-verbs] for possible values.
* `.verbs(verbs, path, method, opts)`: registers a path mapping for the specified controller method.
* `.prefix(path)`: registers a prefix for the controller. Calling this multiple times adds multiple prefix options.
* `.before(middlewares)`: registers one or more middlewares that runs before any of the routes are processed.
* `.after(middlewares)`: registers one or more middlewares that runs after the routes are processed.

The optional `opts` object passed to `.verbs` can have the following properties:

* `before`: one or more middleware that runs before the route handler.
* `after`: one or more middleware that runs after the route handler.

**Note**: all builder methods returns a _new builder_ - this means the builder is **immutable**! This allows you to have a common 
builder setup that you can reuse for multiple controllers.

### Decorators

If you have enabled decorator support in your transpiler, you can use the decorator API.

The decorator API exports are:

```js
import { 
  route, 
  before,
  after, 
  verbs,
  HttpVerbs,

  // The following are just shortcuts for `verbs([HttpVerbs..])`
  GET,
  HEAD,
  POST,
  PUT,
  DELETE,
  CONNECT,
  OPTIONS,
  PATCH,
  ALL
} from 'awilix-router-core'
```

#### `route(path)`

**Class-level**: adds a prefix to all routes in this controller.

**Method-level**: adds a route for the decorated method in the controller.

Has no effect if no `verbs` are configured.

**Example**:

```js
@route('/todos')
class Controller {
  // GET /todos
  // POST /todos
  @GET()
  @POST()
  method1() {}

  // PATCH /todos/:id
  @route('/:id')
  @PATCH()
  method2() {}
}
```

#### `before(middlewares)` and `after(middlewares)`

**Class-level**: adds middleware to run before/after the routes are processed.

**Method-level**: adds middleware to run before/after the decorated method is processed.

**Example**:

```js
@before([bodyParser()])
class Controller {
  @before([authenticate()])
  @after([compress()])
  method() {}
}
```

#### `verbs(httpVerbs)`

**Class-level**: not allowed.

**Method-level**: adds HTTP verbs that the route will match. 

Has no effect if no `route`s are configured.

**Example**:

```js
@verbs([HttpVerbs.GET, HttpVerbs.POST])
method() {}
```

#### Verb shorthands

`GET`, `POST`, etc.

**Example**:

```js
@route('/todos')
class Controller {
  // GET /todos
  // POST /todos
  @GET()
  @POST()
  method1() {}

  // PATCH /todos/:id
  @route('/:id')
  @PATCH()
  method2() {}
}
```

## Extracting route config

This section is for framework adapter authors. Please see [awilix-koa][awilix-koa] for a reference implementation. If you need any help, please feel free to reach out!

The primary functions needed for this are `getStateAndTarget`, `rollUpState`, and `findControllers`.

> **NOTE**: when referring to "state-target tuple", it means an object containing `state` 
> and `target` properties, where `target` is the class/function to build up (using `container.build`) 
> in order to get an object to call methods on.

```js
import { getStateAndTarget, rollUpState, findControllers } from 'awilix-router-core'
```

### `getStateAndTarget(functionOrClassOrController)`

Given a controller (either from `createController` or a decorated class), returns a state-target tuple.

### `rollUpState(state)`

This will return a map where the key is the controller method name and the value is the routing config to set up for that method, with root paths + middleware stacks pre-merged.

### `findControllers(pattern, globOptions)`

Using `glob`, loads controllers from matched files, with non-applicable files filtered out.

Returns an array of state-target tuples.

# Author

Jeff Hansen — [@Jeffijoe](https://twitter.com/Jeffijoe)

  [http-verbs]: /src/http-verbs.ts
  [awilix-koa]: https://github.com/jeffijoe/awilix-koa
