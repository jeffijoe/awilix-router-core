# awilix-router-core

[![npm](https://img.shields.io/npm/v/awilix-router-core.svg?maxAge=1000)](https://www.npmjs.com/package/awilix-router-core)
[![dependency Status](https://img.shields.io/david/jeffijoe/awilix-router-core.svg?maxAge=1000)](https://david-dm.org/jeffijoe/awilix-router-core)
[![devDependency Status](https://img.shields.io/david/dev/jeffijoe/awilix-router-core.svg?maxAge=1000)](https://david-dm.org/jeffijoe/awilix-router-core)
[![Build Status](https://img.shields.io/travis/jeffijoe/awilix-router-core.svg?maxAge=1000)](https://travis-ci.org/jeffijoe/awilix-router-core)
[![Coveralls](https://img.shields.io/coveralls/jeffijoe/awilix-router-core.svg?maxAge=1000)](https://coveralls.io/github/jeffijoe/awilix-router-core)
[![npm](https://img.shields.io/npm/dt/awilix-router-core.svg?maxAge=1000)](https://www.npmjs.com/package/awilix-router-core)
[![npm](https://img.shields.io/npm/l/awilix-router-core.svg?maxAge=1000)](https://github.com/jeffijoe/awilix-router-core/blob/master/LICENSE.md)

> This package is intended for use with HTTP libraries that want to configure routes using **ESNext decorators** or a **builder pattern**.

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

## With decorators

```js
// You may re-export these as well.
import { route, before, GET, methods, HttpVerbs } from 'awilix-router-core'

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
  @methods([HttpVerbs.POST, HttpVerbs.PUT])
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

Check out the [`awilix-koa`](https://github.com/jeffijoe/awilix-koa/tree/master/src/controller.ts) reference implementation.

# Author

Jeff Hansen — [@Jeffijoe](https://twitter.com/Jeffijoe)
