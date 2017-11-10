# awilix-router-core

[![npm](https://img.shields.io/npm/v/awilix-router-core.svg?maxAge=1000)](https://www.npmjs.com/package/awilix-router-core)
[![dependency Status](https://img.shields.io/david/jeffijoe/awilix-router-core.svg?maxAge=1000)](https://david-dm.org/jeffijoe/awilix-router-core)
[![devDependency Status](https://img.shields.io/david/dev/jeffijoe/awilix-router-core.svg?maxAge=1000)](https://david-dm.org/jeffijoe/awilix-router-core)
[![Build Status](https://img.shields.io/travis/jeffijoe/awilix-router-core.svg?maxAge=1000)](https://travis-ci.org/jeffijoe/awilix-router-core)
[![Coveralls](https://img.shields.io/coveralls/jeffijoe/awilix-router-core.svg?maxAge=1000)](https://coveralls.io/github/jeffijoe/awilix-router-core)
[![npm](https://img.shields.io/npm/dt/awilix-router-core.svg?maxAge=1000)](https://www.npmjs.com/package/awilix-router-core)
[![npm](https://img.shields.io/npm/l/awilix-router-core.svg?maxAge=1000)](https://github.com/jeffijoe/awilix-router-core/blob/master/LICENSE.md)

> This package is intended for use with HTTP routers that want to configure routes using decorators.

> This package exposes an API for use with **ESNext Decorators**.

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

**End-user:**

The end-user of the routing library will be able to use decorators to declaratively set up their routes, middleware and methods.

```js
// You may re-export these as well.
import { route, before, GET, methods, HttpMethods } from 'awilix-router-core'

import bodyParser from 'your-framework-body-parser'
import authenticate from 'your-framework-authentication'

@before(bodyParser())
@route('/todos')
export default class NewsController {
  @GET()
  async find (ctx) {
    ctx.body = await doSomethingAsync()
  }

  @route('/:id')
  @GET()
  async get(ctx) {
    ctx.body = await getNewsOrWhateverAsync(ctx.params.id)
  }

  @route('(/:id)')
  @methods([HttpMethods.POST, HttpMethods.PUT])
  @before(authenticate())
  async save (ctx) {
    ctx.body = await saveNews(ctx.params.id, ctx.request.body)
  }
}
```

**Framework adapter**

The framework adapter will use the tools provided by this package to extract routing config from decorated classes and register it in the router of choice.

This example uses Koa + Koa Router for demo purposes.

**Don't use this example verbatim, package it up and make it a bit nicer. 😁**

```js
import { getState, rollUpState, findClasses } from 'awilix-router-core'
import Koa from 'koa'
import Router from 'koa-router'

function register (router, Class) {
  const state = getState(Class)
  if (!state) {
    // No routing configured for this class.
    return
  }

  // This will return a `Map` where the key is the controller function name, and the value is a concatted routing config.
  const concatted = rollUpState(state)
  concatted.forEach((cfg, key) => {
    cfg.methods.forEach(method => {
      if (method === '*') {
        method = 'all'
      }
      method = method.toLowerCase()
      router[method](
        cfg.paths,
        ...cfg.beforeMiddleware,
        async (ctx, ...rest) => {
          const instance = new Class(ctx.state.container.cradle)
          await instance[key](ctx, ...rest)
        },
        ...cfg.afterMiddleware
      )
    })
  })
  return router
}

const router = new Router()
// uses glob to auto-load classes.
const classes = findClasses('routes/*.js', { cwd: __dirname })
classes.forEach(Class => register(router, Class))
const app = new Koa()
app.use(router.routes())
app.use(router.allowedMethods())
```

# Author

Jeff Hansen — [@Jeffijoe](https://twitter.com/Jeffijoe)
