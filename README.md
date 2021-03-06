# Changes added in this fork...

**Breaking changes in 1.0.0**: 
 
- **processContent** is now async. Beware of it.

This is a fork of [karma-commonjs] this adds the following features. It is published in the npm registry as `karma-commonjs-plus`. See the details of how to use it after this section ends.

0. **Add global "global" variable**. Some commonjs modules, mostly the ones that run in the browser some times need to access the global scope. Accesing the global scope is discouraged and only needed in extremely rare cases... In any case, code that is meant to run in browsers and interact with legacy code sometimes need to do this.

1. **Look for global dependencies**: If a required dependency is not found will be looked in the global namespace (if you're already including the dependency the old school way)
  ```javascript
  var $ = require('jQuery'); // if $ module does not exists... will look for window.jQuery
  ```
  If you're using browserify you probably are using the `browserify-shim` in that case the best option is to make sure you add the browsers section to your package.json to resolve the same global dependency, like
  ```json
  "browserify-shim" : {
    "jQuery" : "global:jQuery"
  }
  ```
  That way you will have your variables properly resolved in the bundle too

2. **require can mock internal dependencies**: require allow to pass a second parameter to the mock the internal dependencies. This is usually useful for testing:
	```javascript
	var mockObject = jasmine.createSpyObj( 'mockObject', [ 'start' ] );
	var moduleA = require('../../moduleA', {
	  './moduleB' : mockObject
	});
	
	moduleA.callStart(); // internally call moduleB.start();
	
	expect(mockObject.start).toHaveBeenCalled();
	```
3. **shouldExecFile** config callback. a function to be called for each file processed, the file descriptor is passed to it 
   as the first parameter. It can be used to only autoExecute the modules that match a given pattern.

4. **processContent** config callback. a function to be called for each file processed, the content and the file descriptor are passed to the function.
   It can be used to modify the content of the module being processed. Like making sure all the modules run in `strict mode`, or other tasks...
	```javascript
	// this section should go inside your karma config object
	commonjsPreprocessor: {
	 shouldExecFile: function (file) {
	   return file.path.indexOf('/specs/') > -1;
	 },
	 processContent: function (content, file, cb) {
	   // make sure content is executed in stricter mode during testing
	   cb("'use strict';\n" + content);
	 }  
	}
	```
5. **global.__cjs__clearCachedModules method**. to clear all the cached modules (including mock ones) and make the tests easy to repeat. usually you will want to put this in an afterEach block:

	```javascript
	afterEach(function () {
	    // commonjs-plus the tool execute and caches 
	    // modules during startup we want to be able to
        // execute the module code again for testing
        // purposes, so we're manually clearing the 
        // modules cache here.
	    global.__cjs__clearCachedModules();
	  });
	```
6. **global.__clearMocks method**. to clear all the cached mocks. 

	```javascript
	afterEach(function () {
	    global.__clearMocks(); // clear only the mocks
	  });
	```


# karma-commonjs-plus

> A Karma plugin that allows testing [CommonJS] modules in the browser. So if you are using [Browserify] for instance, you might find this plugin useful...

### Why not just using Browserify for testing ?

Creating a single bundle means "recompiling" the bundle anytime any file changes. On big project, this can significantly slow down the development. This plugin processes only files that changed.

## Installation

The easiest way is to keep `karma-commonjs-plus` as a devDependency:

`npm install karma-commonjs-plus --save-dev`

which should result in the following entry in your `package.json`:

```json
{
  "devDependencies": {
    "karma": "~0.10",
    "karma-commonjs-plus": "~0.1.20"
  }
}
```

## Configuration
```js
// karma.conf.js
module.exports = function(config) {
  config.set({
    frameworks: ['jasmine', 'commonjs'],
    files: [
      // your tests, sources, ...
    ],

    preprocessors: {
      '**/*.js': ['commonjs']
    }
  });
};
```
Additionally you can specify a root folder (relative to project's directory) which is used to look for required modules:
```
commonjsPreprocessor: {
  modulesRoot: 'some_folder'  
}
```

When not specified the root folder default to the `karma.basePath/node_modules` configuration option.

For an example project, check out Karma's [client tests](https://github.com/karma-runner/karma/tree/master/test/client).

----

For more information on Karma see the [homepage].


[homepage]: http://karma-runner.github.com
[CommonJS]: http://www.commonjs.org/
[Browserify]: https://github.com/substack/node-browserify
[karma-commonjs]: https://github.com/karma-runner/karma-commonjs
