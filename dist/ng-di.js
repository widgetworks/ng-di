(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.di = {}));
}(this, (function (exports) { 'use strict';

  var uid = 0;

  // Support: IE 9-11 only
  /**
   * documentMode is an IE-only property
   * http://msdn.microsoft.com/en-us/library/ie/cc196988(v=vs.85).aspx
   */
  var msie = typeof window !== 'undefined' && window.document.documentMode;
  var MinErr = require('./minErr');

  ////////////////////////////////////

  /**
   * @ngdoc function
   * @name angular.forEach
   * @function
   *
   * @description
   * Invokes the `iterator` function once for each item in `obj` collection, which can be either an
   * object or an array. The `iterator` function is invoked with `iterator(value, key)`, where `value`
   * is the value of an object property or an array element and `key` is the object property key or
   * array element index. Specifying a `context` for the function is optional.
   *
   * Note: this function was previously known as `angular.foreach`.
   *
   <pre>
   var values = {name: 'misko', gender: 'male'};
   var log = [];
   angular.forEach(values, function(value, key){
       this.push(key + ': ' + value);
     }, log);
   expect(log).toEqual(['name: misko', 'gender:male']);
   </pre>
   *
   * @param {Object|Array} obj Object to iterate over.
   * @param {Function} iterator Iterator function.
   * @param {Object=} context Object to become context (`this`) for the iterator function.
   * @returns {Object|Array} Reference to `obj`.
   */


  /**
   * @private
   * @param {*} obj
   * @return {boolean} Returns true if `obj` is an array or array-like object (NodeList, Arguments, ...)
   */
  function isArrayLike(obj) {
    if (!obj || (typeof obj.length !== 'number')) return false;

    // We have on object which has length property. Should we treat it as array?
    if (typeof obj.hasOwnProperty != 'function' &&
      typeof obj.constructor != 'function') {
      // This is here for IE8: it is a bogus object treat it as array;
      return true;
    } else {
      return Object.prototype.toString.call(obj) !== '[object Object]' ||   // some browser native object
        typeof obj.callee === 'function';              // arguments (on IE8 looks like regular obj)
    }
  }


  function forEach(obj, iterator, context) {
    var key;
    if (obj) {
      if (isFunction(obj)) {
        for (key in obj) {
          if (key != 'prototype' && key != 'length' && key != 'name' && obj.hasOwnProperty(key)) {
            iterator.call(context, obj[key], key);
          }
        }
      } else if (obj.forEach && obj.forEach !== forEach) {
        obj.forEach(iterator, context);
      } else if (isArrayLike(obj)) {
        for (key = 0; key < obj.length; key++){
          iterator.call(context, obj[key], key);
        }
      } else {
        for (key in obj) {
          if (obj.hasOwnProperty(key)) {
            iterator.call(context, obj[key], key);
          }
        }
      }
    }
    return obj;
  }
  /**
   * @ngdoc function
   * @name angular.extend
   * @function
   *
   * @description
   * Extends the destination object `dst` by copying all of the properties from the `src` object(s)
   * to `dst`. You can specify multiple `src` objects.
   *
   * @param {Object} dst Destination object.
   * @param {...Object} src Source object(s).
   */
  function extend(dst) {
    forEach(arguments, function(obj){
      if (obj !== dst) {
        forEach(obj, function(value, key){
          dst[key] = value;
        });
      }
    });
    return dst;
  }


  /**
   * when using forEach the params are value, key, but it is often useful to have key, value.
   * @param {function(string, *)} iteratorFn
   * @returns {function(*, string)}
   */
  function reverseParams(iteratorFn) {
    return function(value, key) {
      iteratorFn(key, value);
    };
  }


  /**
   * A consistent way of creating unique IDs in angular.
   *
   * Using simple numbers allows us to generate 28.6 million unique ids per second for 10 years before
   * we hit number precision issues in JavaScript.
   *
   * Math.pow(2,53) / 60 / 60 / 24 / 365 / 10 = 28.6M
   *
   * @returns {number} an unique alpha-numeric string
   */
  function nextUid() {
    return ++uid;
  }

  function valueFn(value) {
    return function () {
      return value;
    };
  }
  /**
   * @ngdoc function
   * @name angular.isObject
   * @function
   *
   * @description
   * Determines if a reference is an `Object`. Unlike `typeof` in JavaScript, `null`s are not
   * considered to be objects.
   *
   * @param {*} value Reference to check.
   * @returns {boolean} True if `value` is an `Object` but not `null`.
   */
  function isObject(value) {
    return value != null && typeof value == 'object';
  }

  /**
   * @ngdoc function
   * @name angular.isString
   * @function
   *
   * @description
   * Determines if a reference is a `String`.
   *
   * @param {*} value Reference to check.
   * @returns {boolean} True if `value` is a `String`.
   */
  function isString(value) {
    return typeof value == 'string';
  }

  /**
   * @ngdoc function
   * @name angular.isNumber
   * @module ng
   * @kind function
   *
   * @description
   * Determines if a reference is a `Number`.
   *
   * This includes the "special" numbers `NaN`, `+Infinity` and `-Infinity`.
   *
   * If you wish to exclude these then you can use the native
   * [`isFinite'](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/isFinite)
   * method.
   *
   * @param {*} value Reference to check.
   * @returns {boolean} True if `value` is a `Number`.
   */
  function isNumber(value) {return typeof value === 'number';}


  /**
   * @ngdoc function
   * @name angular.isFunction
   * @function
   *
   * @description
   * Determines if a reference is a `Function`.
   *
   * @param {*} value Reference to check.
   * @returns {boolean} True if `value` is a `Function`.
   */
  function isFunction(value) {
    return typeof value == 'function';
  }

  /**
   * throw error if the argument is falsy.
   */
  function assertArg(arg, name, reason) {
    if (!arg) {
      var ngMinErr = MinErr.minErr('di');
      throw ngMinErr('areq', 'Argument \'{0}\' is {1}', (name || '?'), (reason || 'required'));
    }
    return arg;
  }

  function assertArgFn(arg, name, acceptArrayAnnotation) {
    if (acceptArrayAnnotation && Array.isArray(arg)) {
        arg = arg[arg.length - 1];
    }

    assertArg(isFunction(arg), name, 'not a function, got ' +
        (arg && typeof arg === 'object' ? arg.constructor.name || 'Object' : typeof arg));
    return arg;
  }


  function noop() {}

  var isNumberNaN = Number.isNaN || function isNumberNaN(num) {
    // eslint-disable-next-line no-self-compare
    return num !== num;
  };


  function isBoolean(value) {
    return typeof value === 'boolean';
  }


  /**
   * @ngdoc function
   * @name angular.isUndefined
   * @module ng
   * @kind function
   *
   * @description
   * Determines if a reference is undefined.
   *
   * @param {*} value Reference to check.
   * @returns {boolean} True if `value` is undefined.
   */
  function isUndefined(value) {return typeof value === 'undefined';}


  /**
   * @ngdoc function
   * @name angular.isDefined
   * @module ng
   * @kind function
   *
   * @description
   * Determines if a reference is defined.
   *
   * @param {*} value Reference to check.
   * @returns {boolean} True if `value` is defined.
   */
  function isDefined(value) {return typeof value !== 'undefined';}


  /**
   * Creates a new object without a prototype. This object is useful for lookup without having to
   * guard against prototypically inherited properties via hasOwnProperty.
   *
   * Related micro-benchmarks:
   * - http://jsperf.com/object-create2
   * - http://jsperf.com/proto-map-lookup/2
   * - http://jsperf.com/for-in-vs-object-keys2
   *
   * @returns {Object}
   */
  function createMap() {
    return Object.create(null);
  }


  var assertNotHasOwnProperty = function(name, context) {
    if (name === 'hasOwnProperty') {
      var ngMinErr = MinErr.minErr('di');
      throw ngMinErr('badname', 'hasOwnProperty is not a valid {0} name', context);
    }
  };

  var slice             = [].slice;
  function sliceArgs(args, startIndex) {
    return slice.call(args, startIndex || 0);
  }


  const isArray = Array.isArray;

  var _utils = /*#__PURE__*/Object.freeze({
    __proto__: null,
    forEach: forEach,
    reverseParams: reverseParams,
    extend: extend,
    nextUid: nextUid,
    assertArg: assertArg,
    assertArgFn: assertArgFn,
    valueFn: valueFn,
    isString: isString,
    isNumber: isNumber,
    isFunction: isFunction,
    isObject: isObject,
    noop: noop,
    isNumberNaN: isNumberNaN,
    isBoolean: isBoolean,
    isArray: isArray,
    isUndefined: isUndefined,
    isDefined: isDefined,
    createMap: createMap,
    msie: msie,
    assertNotHasOwnProperty: assertNotHasOwnProperty,
    sliceArgs: sliceArgs
  });

  /**
   * Checks if `obj` is a window object.
   *
   * @private
   * @param {*} obj Object to check
   * @returns {boolean} True if `obj` is a window obj.
   */
  function isWindow(obj) {
    return obj && obj.window === obj;
  }


  function isScope(obj) {
    return obj && obj.$evalAsync && obj.$watch;
  }


  function toJsonReplacer(key, value) {
    var val = value;

    if (typeof key === 'string' && key.charAt(0) === '$' && key.charAt(1) === '$') {
      val = undefined;
    } else if (isWindow(value)) {
      val = '$WINDOW';
    } else if (value && typeof window !== 'undefined' && window.document === value) {
      val = '$DOCUMENT';
    } else if (isScope(value)) {
      val = '$SCOPE';
    }

    return val;
  }


  function serializeObject(obj, maxDepth) {
    var seen = [];

    // // There is no direct way to stringify object until reaching a specific depth
    // // and a very deep object can cause a performance issue, so we copy the object
    // // based on this specific depth and then stringify it.
    // if (isValidObjectMaxDepth(maxDepth)) {
    //   // This file is also included in `angular-loader`, so `copy()` might not always be available in
    //   // the closure. Therefore, it is lazily retrieved as `angular.copy()` when needed.
    //   obj = angular.copy(obj, null, maxDepth);
    // }
    return JSON.stringify(obj, function(key, val) {
      val = toJsonReplacer(key, val);
      if (isObject(val)) {

        if (seen.indexOf(val) >= 0) return '...';

        seen.push(val);
      }
      return val;
    });
  }

  function toDebugString(obj, maxDepth) {
    if (typeof obj === 'function') {
      return obj.toString().replace(/ \{[\s\S]*$/, '');
    } else if (isUndefined(obj)) {
      return 'undefined';
    } else if (typeof obj !== 'string') {
      return serializeObject(obj);
    }
    return obj;
  }


  /**
   * @description
   *
   * This object provides a utility for producing rich Error messages within
   * AngularJS. It can be called as follows:
   *
   * var exampleMinErr = minErr('example');
   * throw exampleMinErr('one', 'This {0} is {1}', foo, bar);
   *
   * The above creates an instance of minErr in the example namespace. The
   * resulting error will have a namespaced error code of example.one.  The
   * resulting error will replace {0} with the value of foo, and {1} with the
   * value of bar. The object is not restricted in the number of arguments it can
   * take.
   *
   * If fewer arguments are specified than necessary for interpolation, the extra
   * interpolation markers will be preserved in the final string.
   *
   * Since data will be parsed statically during a build step, some restrictions
   * are applied with respect to how minErr instances are created and called.
   * Instances should have names of the form namespaceMinErr for a minErr created
   * using minErr('namespace'). Error codes, namespaces and template strings
   * should all be static strings, not variables or general expressions.
   *
   * @param {string} module The namespace to use for the new minErr instance.
   * @param {function} ErrorConstructor Custom error constructor to be instantiated when returning
   *   error from returned function, for cases when a particular type of error is useful.
   * @returns {function(code:string, template:string, ...templateArgs): Error} minErr instance
   */

  function minErr(module, ErrorConstructor) {
    ErrorConstructor = ErrorConstructor || Error;

    return function() {
      var code = arguments[0],
        template = arguments[1],
        message = '[' + (module ? module + ':' : '') + code + '] ',
        templateArgs = sliceArgs(arguments, 2).map(function(arg) {
          return toDebugString(arg);
        });

      // A minErr message has two parts: the message itself and the url that contains the
      // encoded message.
      // The message's parameters can contain other error messages which also include error urls.
      // To prevent the messages from getting too long, we strip the error urls from the parameters.

      message += template.replace(/\{\d+\}/g, function(match) {
        var index = +match.slice(1, -1);

        if (index < templateArgs.length) {
          return templateArgs[index];
        }

        return match;
      });

      message += '\n' + (module ? module + '/' : '') + code;

      return new ErrorConstructor(message);
    };
  }

  /*
  angular.js 1.6.10 `src/loader.js`
  */
  function setupModuleLoader(where) {

    var $injectorMinErr = minErr('$injector');
    var ngMinErr = minErr('di');

    function ensure(obj, name, factory) {
      return obj[name] || (obj[name] = factory());
    }

    return ensure(where, 'module', function() {
      /** @type {Object.<string, angular.Module>} */
      var modules = {};

      /**
       * @ngdoc function
       * @name angular.module
       * @module ng
       * @description
       *
       * The `angular.module` is a global place for creating, registering and retrieving AngularJS
       * modules.
       * All modules (AngularJS core or 3rd party) that should be available to an application must be
       * registered using this mechanism.
       *
       * Passing one argument retrieves an existing {@link angular.Module},
       * whereas passing more than one argument creates a new {@link angular.Module}
       *
       *
       * # Module
       *
       * A module is a collection of services, directives, controllers, filters, and configuration information.
       * `angular.module` is used to configure the {@link auto.$injector $injector}.
       *
       * ```js
       * // Create a new module
       * var myModule = angular.module('myModule', []);
       *
       * // register a new service
       * myModule.value('appName', 'MyCoolApp');
       *
       * // configure existing services inside initialization blocks.
       * myModule.config(['$locationProvider', function($locationProvider) {
       *   // Configure existing providers
       *   $locationProvider.hashPrefix('!');
       * }]);
       * ```
       *
       * Then you can create an injector and load your modules like this:
       *
       * ```js
       * var injector = angular.injector(['ng', 'myModule'])
       * ```
       *
       * However it's more likely that you'll just use
       * {@link ng.directive:ngApp ngApp} or
       * {@link angular.bootstrap} to simplify this process for you.
       *
       * @param {!string} name The name of the module to create or retrieve.
       * @param {!Array.<string>=} requires If specified then new module is being created. If
       *        unspecified then the module is being retrieved for further configuration.
       * @param {Function=} configFn Optional configuration function for the module. Same as
       *        {@link angular.Module#config Module#config()}.
       * @returns {angular.Module} new module with the {@link angular.Module} api.
       */
      return function module(name, requires, configFn) {
        
        var info = {};

        var assertNotHasOwnProperty = function(name, context) {
          if (name === 'hasOwnProperty') {
            throw ngMinErr('badname', 'hasOwnProperty is not a valid {0} name', context);
          }
        };

        assertNotHasOwnProperty(name, 'module');
        if (requires && modules.hasOwnProperty(name)) {
          modules[name] = null;
        }
        return ensure(modules, name, function() {
          if (!requires) {
            throw $injectorMinErr('nomod', 'Module \'{0}\' is not available! You either misspelled ' +
             'the module name or forgot to load it. If registering a module ensure that you ' +
             'specify the dependencies as the second argument.', name);
          }

          /** @type {!Array.<Array.<*>>} */
          var invokeQueue = [];

          /** @type {!Array.<Function>} */
          var configBlocks = [];

          /** @type {!Array.<Function>} */
          var runBlocks = [];

        var config = invokeLater('$injector', 'invoke', 'push', configBlocks);

          /** @type {angular.Module} */
          var moduleInstance = {
            // Private state
            _invokeQueue: invokeQueue,
            _configBlocks: configBlocks,
            _runBlocks: runBlocks,

            /**
             * @ngdoc method
             * @name angular.Module#info
             * @module ng
             *
             * @param {Object=} info Information about the module
             * @returns {Object|Module} The current info object for this module if called as a getter,
             *                          or `this` if called as a setter.
             *
             * @description
             * Read and write custom information about this module.
             * For example you could put the version of the module in here.
             *
             * ```js
             * angular.module('myModule', []).info({ version: '1.0.0' });
             * ```
             *
             * The version could then be read back out by accessing the module elsewhere:
             *
             * ```
             * var version = angular.module('myModule').info().version;
             * ```
             *
             * You can also retrieve this information during runtime via the
             * {@link $injector#modules `$injector.modules`} property:
             *
             * ```js
             * var version = $injector.modules['myModule'].info().version;
             * ```
             */
            info: function(value) {
              if (isDefined(value)) {
                if (!isObject(value)) throw ngMinErr('aobj', 'Argument \'{0}\' must be an object', 'value');
                info = value;
                return this;
              }
              return info;
            },

            /**
             * @ngdoc property
             * @name angular.Module#requires
             * @propertyOf angular.Module
             * @returns {Array.<string>} List of module names which must be loaded before this module.
             * @description
             * Holds the list of modules which the injector will load before the current module is loaded.
             */
            requires: requires,

            /**
             * @ngdoc property
             * @name angular.Module#name
             * @propertyOf angular.Module
             * @returns {string} Name of the module.
             * @description
             */
            name: name,


            /**
             * @ngdoc method
             * @name angular.Module#provider
             * @module ng
             * @param {string} name service name
             * @param {Function} providerType Construction function for creating new instance of the
             *                                service.
             * @description
             * See {@link auto.$provide#provider $provide.provider()}.
             */
            provider: invokeLaterAndSetModuleName('$provide', 'provider'),

            /**
             * @ngdoc method
             * @name angular.Module#factory
             * @module ng
             * @param {string} name service name
             * @param {Function} providerFunction Function for creating new instance of the service.
             * @description
             * See {@link auto.$provide#factory $provide.factory()}.
             */
            factory: invokeLaterAndSetModuleName('$provide', 'factory'),

            /**
             * @ngdoc method
             * @name angular.Module#service
             * @module ng
             * @param {string} name service name
             * @param {Function} constructor A constructor function that will be instantiated.
             * @description
             * See {@link auto.$provide#service $provide.service()}.
             */
            service: invokeLaterAndSetModuleName('$provide', 'service'),

            /**
             * @ngdoc method
             * @name angular.Module#value
             * @methodOf angular.Module
             * @param {string} name service name
             * @param {*} object Service instance object.
             * @description
             * See {@link AUTO.$provide#value $provide.value()}.
             */
            value: invokeLater('$provide', 'value'),

            /**
             * @ngdoc method
             * @name angular.Module#constant
             * @methodOf angular.Module
             * @param {string} name constant name
             * @param {*} object Constant value.
             * @description
             * Because the constant are fixed, they get applied before other provide methods.
             * See {@link AUTO.$provide#constant $provide.constant()}.
             */
            constant: invokeLater('$provide', 'constant', 'unshift'),

             /**
             * @ngdoc method
             * @name angular.Module#decorator
             * @module ng
             * @param {string} name The name of the service to decorate.
             * @param {Function} decorFn This function will be invoked when the service needs to be
             *                           instantiated and should return the decorated service instance.
             * @description
             * See {@link auto.$provide#decorator $provide.decorator()}.
             */
            decorator: invokeLaterAndSetModuleName('$provide', 'decorator', configBlocks),

            /**
             * @ngdoc method
             * @name angular.Module#config
             * @methodOf angular.Module
             * @param {Function} configFn Execute this function on module load. Useful for service
             *    configuration.
             * @description
             * Use this method to register work which needs to be performed on module loading.
             */
            config: config,

            /**
             * @ngdoc method
             * @name angular.Module#run
             * @methodOf angular.Module
             * @param {Function} initializationFn Execute this function after injector creation.
             *    Useful for application initialization.
             * @description
             * Use this method to register work which should be performed when the injector is done
             * loading all modules.
             */
            run: function(block) {
              runBlocks.push(block);
              return this;
            }
          };

          if (configFn) {
            config(configFn);
          }

          return  moduleInstance;

          /**
           * @param {string} provider
           * @param {string} method
           * @param {String=} insertMethod
           * @returns {angular.Module}
           */
          function invokeLater(provider, method, insertMethod, queue) {
            if (!queue) queue = invokeQueue;
            return function() {
              queue[insertMethod || 'push']([provider, method, arguments]);
              return moduleInstance;
            };
          }

          /**
           * @param {string} provider
           * @param {string} method
           * @returns {angular.Module}
           */
          function invokeLaterAndSetModuleName(provider, method, queue) {
            if (!queue) queue = invokeQueue;
            return function(recipeName, factoryFunction) {
              if (factoryFunction && isFunction(factoryFunction)) factoryFunction.$$moduleName = name;
              queue.push([provider, method, arguments]);
              return moduleInstance;
            };
          }
        });
      };
    });

  }

  /*
  angular.js 1.6.10
  */

  // A minimal ES2015 Map implementation.
  // Should be bug/feature equivalent to the native implementations of supported browsers
  // (for the features required in Angular).
  // See https://kangax.github.io/compat-table/es6/#test-Map
  var nanKey = Object.create(null);
  function NgMapShim() {
    this._keys = [];
    this._values = [];
    this._lastKey = NaN;
    this._lastIndex = -1;
  }
  NgMapShim.prototype = {
    _idx: function(key) {
      if (key !== this._lastKey) {
        this._lastKey = key;
        this._lastIndex = this._keys.indexOf(key);
      }
      return this._lastIndex;
    },
    _transformKey: function(key) {
      return isNumberNaN(key) ? nanKey : key;
    },
    get: function(key) {
      key = this._transformKey(key);
      var idx = this._idx(key);
      if (idx !== -1) {
        return this._values[idx];
      }
    },
    has: function(key) {
      key = this._transformKey(key);
      var idx = this._idx(key);
      return idx !== -1;
    },
    set: function(key, value) {
      key = this._transformKey(key);
      var idx = this._idx(key);
      if (idx === -1) {
        idx = this._lastIndex = this._keys.length;
      }
      this._keys[idx] = key;
      this._values[idx] = value;

      // Support: IE11
      // Do not `return this` to simulate the partial IE11 implementation
    },
    delete: function(key) {
      key = this._transformKey(key);
      var idx = this._idx(key);
      if (idx === -1) {
        return false;
      }
      this._keys.splice(idx, 1);
      this._values.splice(idx, 1);
      this._lastKey = NaN;
      this._lastIndex = -1;
      return true;
    }
  };

  /**
   * @ngdoc function
   * @name angular.injector
   * @function
   *
   * @description
   * Creates an injector function that can be used for retrieving services as well as for
   * dependency injection (see {@link guide/di dependency injection}).
   *

   * @param {Array.<string|Function>} modules A list of module functions or their aliases. See
   *        {@link angular.module}. The `ng` module must be explicitly added.
   * @returns {function()} Injector function. See {@link AUTO.$injector $injector}.
   *
   * @example
   * Typical usage
   * <pre>
   *   // create an injector
   *   var $injector = angular.injector(['ng']);
   *
   *   // use the injector to kick off your application
   *   // use the type inference to auto inject arguments, or use implicit injection
   *   $injector.invoke(function($rootScope, $compile, $document){
   *     $compile($document)($rootScope);
   *     $rootScope.$digest();
   *   });
   * </pre>
   */


  /**
   * @ngdoc overview
   * @name AUTO
   * @description
   *
   * Implicit module which gets automatically added to each {@link AUTO.$injector $injector}.
   */

  var ARROW_ARG = /^([^(]+?)=>/;
  var FN_ARGS = /^[^(]*\(\s*([^)]*)\)/m;
  var FN_ARG_SPLIT = /,/;
  var FN_ARG = /^\s*(_?)(\S+?)\1\s*$/;
  var STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;
  var $injectorMinErr = minErr('$injector');

  function stringifyFn(fn) {
    return Function.prototype.toString.call(fn);
  }

  function extractArgs(fn) {
    var fnText = stringifyFn(fn).replace(STRIP_COMMENTS, ''),
        args = fnText.match(ARROW_ARG) || fnText.match(FN_ARGS);
    return args;
  }

  function anonFn(fn) {
    // For anonymous functions, showing at the very least the function signature can help in
    // debugging.
    var args = extractArgs(fn);
    if (args) {
      return 'function(' + (args[1] || '').replace(/[\s\r\n]+/, ' ') + ')';
    }
    return 'fn';
  }

  function annotate(fn, strictDi, name) {
    var $inject,
        argDecl,
        last;

    if (typeof fn === 'function') {
      if (!($inject = fn.$inject)) {
        $inject = [];
        if (fn.length) {
          if (strictDi) {
            if (!isString(name) || !name) {
              name = fn.name || anonFn(fn);
            }
            throw $injectorMinErr('strictdi',
              '{0} is not using explicit annotation and cannot be invoked in strict mode', name);
          }
          argDecl = extractArgs(fn);
          forEach(argDecl[1].split(FN_ARG_SPLIT), function(arg) {
            arg.replace(FN_ARG, function(all, underscore, name) {
              $inject.push(name);
            });
          });
        }
        fn.$inject = $inject;
      }
    } else if (Array.isArray(fn)) {
      last = fn.length - 1;
      assertArgFn(fn[last], 'fn');
      $inject = fn.slice(0, last);
    } else {
      assertArgFn(fn, 'fn', true);
    }
    return $inject;
  }

  ///////////////////////////////////////

  /**
   * @ngdoc object
   * @name AUTO.$injector
   * @function
   *
   * @description
   *
   * `$injector` is used to retrieve object instances as defined by
   * {@link AUTO.$provide provider}, instantiate types, invoke methods,
   * and load modules.
   *
   * The following always holds true:
   *
   * <pre>
   *   var $injector = angular.injector();
   *   expect($injector.get('$injector')).toBe($injector);
   *   expect($injector.invoke(function($injector){
   *     return $injector;
   *   }).toBe($injector);
   * </pre>
   *
   * # Injection Function Annotation
   *
   * JavaScript does not have annotations, and annotations are needed for dependency injection. The
   * following ways are all valid way of annotating function with injection arguments and are equivalent.
   *
   * <pre>
   *   // inferred (only works if code not minified/obfuscated)
   *   $injector.invoke(function(serviceA){});
   *
   *   // annotated
   *   function explicit(serviceA) {};
   *   explicit.$inject = ['serviceA'];
   *   $injector.invoke(explicit);
   *
   *   // inline
   *   $injector.invoke(['serviceA', function(serviceA){}]);
   * </pre>
   *
   * ## Inference
   *
   * In JavaScript calling `toString()` on a function returns the function definition. The definition can then be
   * parsed and the function arguments can be extracted. *NOTE:* This does not work with minification, and obfuscation
   * tools since these tools change the argument names.
   *
   * ## `$inject` Annotation
   * By adding a `$inject` property onto a function the injection parameters can be specified.
   *
   * ## Inline
   * As an array of injection names, where the last item in the array is the function to call.
   */

  /**
   * @ngdoc method
   * @name AUTO.$injector#get
   * @methodOf AUTO.$injector
   *
   * @description
   * Return an instance of the service.
   *
   * @param {string} name The name of the instance to retrieve.
   * @return {*} The instance.
   */

  /**
   * @ngdoc method
   * @name AUTO.$injector#invoke
   * @methodOf AUTO.$injector
   *
   * @description
   * Invoke the method and supply the method arguments from the `$injector`.
   *
   * @param {!function} fn The function to invoke. The function arguments come form the function annotation.
   * @param {Object=} self The `this` for the invoked method.
   * @param {Object=} locals Optional object. If preset then any argument names are read from this object first, before
   *   the `$injector` is consulted.
   * @returns {*} the value returned by the invoked `fn` function.
   */

  /**
   * @ngdoc method
   * @name AUTO.$injector#instantiate
   * @methodOf AUTO.$injector
   * @description
   * Create a new instance of JS type. The method takes a constructor function invokes the new operator and supplies
   * all of the arguments to the constructor function as specified by the constructor annotation.
   *
   * @param {function} Type Annotated constructor function.
   * @param {Object=} locals Optional object. If preset then any argument names are read from this object first, before
   *   the `$injector` is consulted.
   * @returns {Object} new instance of `Type`.
   */

  /**
   * @ngdoc method
   * @name AUTO.$injector#annotate
   * @methodOf AUTO.$injector
   *
   * @description
   * Returns an array of service names which the function is requesting for injection. This API is used by the injector
   * to determine which services need to be injected into the function when the function is invoked. There are three
   * ways in which the function can be annotated with the needed dependencies.
   *
   * # Argument names
   *
   * The simplest form is to extract the dependencies from the arguments of the function. This is done by converting
   * the function into a string using `toString()` method and extracting the argument names.
   * <pre>
   *   // Given
   *   function MyController($scope, $route) {
   *     // ...
   *   }
   *
   *   // Then
   *   expect(injector.annotate(MyController)).toEqual(['$scope', '$route']);
   * </pre>
   *
   * This method does not work with code minfication / obfuscation. For this reason the following annotation strategies
   * are supported.
   *
   * # The `$inject` property
   *
   * If a function has an `$inject` property and its value is an array of strings, then the strings represent names of
   * services to be injected into the function.
   * <pre>
   *   // Given
   *   var MyController = function(obfuscatedScope, obfuscatedRoute) {
   *     // ...
   *   }
   *   // Define function dependencies
   *   MyController.$inject = ['$scope', '$route'];
   *
   *   // Then
   *   expect(injector.annotate(MyController)).toEqual(['$scope', '$route']);
   * </pre>
   *
   * # The array notation
   *
   * It is often desirable to inline Injected functions and that's when setting the `$inject` property is very
   * inconvenient. In these situations using the array notation to specify the dependencies in a way that survives
   * minification is a better choice:
   *
   * <pre>
   *   // We wish to write this (not minification / obfuscation safe)
   *   injector.invoke(function($compile, $rootScope) {
   *     // ...
   *   });
   *
   *   // We are forced to write break inlining
   *   var tmpFn = function(obfuscatedCompile, obfuscatedRootScope) {
   *     // ...
   *   };
   *   tmpFn.$inject = ['$compile', '$rootScope'];
   *   injector.invoke(tempFn);
   *
   *   // To better support inline function the inline annotation is supported
   *   injector.invoke(['$compile', '$rootScope', function(obfCompile, obfRootScope) {
   *     // ...
   *   }]);
   *
   *   // Therefore
   *   expect(injector.annotate(
   *      ['$compile', '$rootScope', function(obfus_$compile, obfus_$rootScope) {}])
   *    ).toEqual(['$compile', '$rootScope']);
   * </pre>
   *
   * @param {function|Array.<string|Function>} fn Function for which dependent service names need to be retrieved as described
   *   above.
   *
   * @returns {Array.<string>} The names of the services which the function requires.
   */


  /**
   * @ngdoc object
   * @name AUTO.$provide
   *
   * @description
   *
   * Use `$provide` to register new providers with the `$injector`. The providers are the factories for the instance.
   * The providers share the same name as the instance they create with `Provider` suffixed to them.
   *
   * A provider is an object with a `$get()` method. The injector calls the `$get` method to create a new instance of
   * a service. The Provider can have additional methods which would allow for configuration of the provider.
   *
   * <pre>
   *   function GreetProvider() {
   *     var salutation = 'Hello';
   *
   *     this.salutation = function(text) {
   *       salutation = text;
   *     };
   *
   *     this.$get = function() {
   *       return function (name) {
   *         return salutation + ' ' + name + '!';
   *       };
   *     };
   *   }
   *
   *   describe('Greeter', function(){
   *
   *     beforeEach(module(function($provide) {
   *       $provide.provider('greet', GreetProvider);
   *     });
   *
   *     it('should greet', inject(function(greet) {
   *       expect(greet('angular')).toEqual('Hello angular!');
   *     }));
   *
   *     it('should allow configuration of salutation', function() {
   *       module(function(greetProvider) {
   *         greetProvider.salutation('Ahoj');
   *       });
   *       inject(function(greet) {
   *         expect(greet('angular')).toEqual('Ahoj angular!');
   *       });
   *     )};
   *
   *   });
   * </pre>
   */

  /**
   * @ngdoc method
   * @name AUTO.$provide#provider
   * @methodOf AUTO.$provide
   * @description
   *
   * Register a provider for a service. The providers can be retrieved and can have additional configuration methods.
   *
   * @param {string} name The name of the instance. NOTE: the provider will be available under `name + 'Provider'` key.
   * @param {(Object|function())} provider If the provider is:
   *
   *   - `Object`: then it should have a `$get` method. The `$get` method will be invoked using
   *               {@link AUTO.$injector#invoke $injector.invoke()} when an instance needs to be created.
   *   - `Constructor`: a new instance of the provider will be created using
   *               {@link AUTO.$injector#instantiate $injector.instantiate()}, then treated as `object`.
   *
   * @returns {Object} registered provider instance
   */

  /**
   * @ngdoc method
   * @name AUTO.$provide#factory
   * @methodOf AUTO.$provide
   * @description
   *
   * A short hand for configuring services if only `$get` method is required.
   *
   * @param {string} name The name of the instance.
   * @param {function()} $getFn The $getFn for the instance creation. Internally this is a short hand for
   * `$provide.provider(name, {$get: $getFn})`.
   * @returns {Object} registered provider instance
   */


  /**
   * @ngdoc method
   * @name AUTO.$provide#service
   * @methodOf AUTO.$provide
   * @description
   *
   * A short hand for registering service of given class.
   *
   * @param {string} name The name of the instance.
   * @param {Function} constructor A class (constructor function) that will be instantiated.
   * @returns {Object} registered provider instance
   */


  /**
   * @ngdoc method
   * @name AUTO.$provide#value
   * @methodOf AUTO.$provide
   * @description
   *
   * A short hand for configuring services if the `$get` method is a constant.
   *
   * @param {string} name The name of the instance.
   * @param {*} value The value.
   * @returns {Object} registered provider instance
   */


  /**
   * @ngdoc method
   * @name AUTO.$provide#constant
   * @methodOf AUTO.$provide
   * @description
   *
   * A constant value, but unlike {@link AUTO.$provide#value value} it can be injected
   * into configuration function (other modules) and it is not interceptable by
   * {@link AUTO.$provide#decorator decorator}.
   *
   * @param {string} name The name of the constant.
   * @param {*} value The constant value.
   * @returns {Object} registered instance
   */

  /**
   * @ngdoc method
   * @name AUTO.$provide#decorator
   * @methodOf AUTO.$provide
   * @description
   *
   * Decoration of service, allows the decorator to intercept the service instance creation. The
   * returned instance may be the original instance, or a new instance which delegates to the
   * original instance.
   *
   * @param {string} name The name of the service to decorate.
   * @param {function()} decorator This function will be invoked when the service needs to be
   *    instanciated. The function is called using the {@link AUTO.$injector#invoke
   *    injector.invoke} method and is therefore fully injectable. Local injection arguments:
   *
   *    * `$delegate` - The original service instance, which can be monkey patched, configured,
   *      decorated or delegated to.
   */


  function createInjector(modulesToLoad, strictDi) {
    // // @wiwo default strictDi to true
    // strictDi = (strictDi !== false);
    strictDi = (strictDi === true);
    var INSTANTIATING = {},
        providerSuffix = 'Provider',
        path = [],
        loadedModules = new NgMapShim(),
        providerCache = {
          $provide: {
              provider: supportObject(provider),
              factory: supportObject(factory),
              service: supportObject(service),
              value: supportObject(value),
              constant: supportObject(constant),
              decorator: decorator
            }
        },
        providerInjector = (providerCache.$injector =
            createInternalInjector(providerCache, function(serviceName, caller) {
              if (isString(caller)) {
                path.push(caller);
              }
              throw $injectorMinErr('unpr', 'Unknown provider: {0}', path.join(' <- '));
            })),
        instanceCache = {},
        protoInstanceInjector =
            createInternalInjector(instanceCache, function(serviceName, caller) {
              var provider = providerInjector.get(serviceName + providerSuffix, caller);
              return instanceInjector.invoke(
                  provider.$get, provider, undefined, serviceName);
            }),
        instanceInjector = protoInstanceInjector;

    providerCache['$injector' + providerSuffix] = { $get: valueFn(protoInstanceInjector) };
    instanceInjector.modules = providerInjector.modules = createMap();
    var runBlocks = loadModules(modulesToLoad);
    instanceInjector = protoInstanceInjector.get('$injector');
    instanceInjector.strictDi = strictDi;
    forEach(runBlocks, function(fn) { if (fn) instanceInjector.invoke(fn); });

    instanceInjector.loadNewModules = function(mods) {
      forEach(loadModules(mods), function(fn) { if (fn) instanceInjector.invoke(fn); });
    };


    return instanceInjector;

    ////////////////////////////////////
    // $provider
    ////////////////////////////////////

    function supportObject(delegate) {
      return function supportObjectInternal(key, value) {
        if (isObject(key)) {
          forEach(key, reverseParams(delegate));
        } else {
          return delegate(key, value);
        }
      };
    }

    function provider(name, provider_) {
      assertNotHasOwnProperty(name, 'service');
      if (isFunction(provider_) || Array.isArray(provider_)) {
        provider_ = providerInjector.instantiate(provider_);
      }
      if (!provider_.$get) {
        throw $injectorMinErr('pget', 'Provider \'{0}\' must define $get factory method.', name);
      }
      return (providerCache[name + providerSuffix] = provider_);
    }

    function enforceReturnValue(name, factory) {
      return /** @this */ function enforcedReturnValue() {
        var result = instanceInjector.invoke(factory, this);
        if (isUndefined(result)) {
          throw $injectorMinErr('undef', 'Provider \'{0}\' must return a value from $get factory method.', name);
        }
        return result;
      };
    }

    function factory(name, factoryFn, enforce) {
      return provider(name, {
        $get: enforce !== false ? enforceReturnValue(name, factoryFn) : factoryFn
      });
    }

    function service(name, constructor) {
      return factory(name, ['$injector', function($injector) {
        return $injector.instantiate(constructor);
      }]);
    }

    function value(name, val) { return factory(name, valueFn(val), false); }

    function constant(name, value) {
      assertNotHasOwnProperty(name, 'constant');
      providerCache[name] = value;
      instanceCache[name] = value;
    }

    function decorator(serviceName, decorFn) {
      var origProvider = providerInjector.get(serviceName + providerSuffix),
          orig$get = origProvider.$get;

      origProvider.$get = function() {
        var origInstance = instanceInjector.invoke(orig$get, origProvider);
        return instanceInjector.invoke(decorFn, null, {$delegate: origInstance});
      };
    }

    ////////////////////////////////////
    // Module Loading
    ////////////////////////////////////
    function loadModules(modulesToLoad) {
      assertArg(isUndefined(modulesToLoad) || Array.isArray(modulesToLoad), 'modulesToLoad', 'not an array');
      var runBlocks = [], moduleFn;
      forEach(modulesToLoad, function(module$1) {
        if (loadedModules.get(module$1)) return;
        loadedModules.set(module$1, true);

        function runInvokeQueue(queue) {
          var i, ii;
          for (i = 0, ii = queue.length; i < ii; i++) {
            var invokeArgs = queue[i],
                provider = providerInjector.get(invokeArgs[0]);

            provider[invokeArgs[1]].apply(provider, invokeArgs[2]);
          }
        }

        try {
          if (isString(module$1)) {
            moduleFn = module(module$1);
            instanceInjector.modules[module$1] = moduleFn;
            runBlocks = runBlocks.concat(loadModules(moduleFn.requires)).concat(moduleFn._runBlocks);
            runInvokeQueue(moduleFn._invokeQueue);
            runInvokeQueue(moduleFn._configBlocks);
          } else if (isFunction(module$1)) {
              runBlocks.push(providerInjector.invoke(module$1));
          } else if (Array.isArray(module$1)) {
              runBlocks.push(providerInjector.invoke(module$1));
          } else {
            assertArgFn(module$1, 'module');
          }
        } catch (e) {
          if (Array.isArray(module$1)) {
            module$1 = module$1[module$1.length - 1];
          }
          if (e.message && e.stack && e.stack.indexOf(e.message) === -1) {
            // Safari & FF's stack traces don't contain error.message content
            // unlike those of Chrome and IE
            // So if stack doesn't contain message, we create a new string that contains both.
            // Since error.stack is read-only in Safari, I'm overriding e and not e.stack here.
            // eslint-disable-next-line no-ex-assign
            e = e.message + '\n' + e.stack;
          }
          throw $injectorMinErr('modulerr', 'Failed to instantiate module {0} due to:\n{1}',
                  module$1, e.stack || e.message || e);
        }
      });
      return runBlocks;
    }

    ////////////////////////////////////
    // internal Injector
    ////////////////////////////////////

    function createInternalInjector(cache, factory) {

      function getService(serviceName, caller) {
        if (cache.hasOwnProperty(serviceName)) {
          if (cache[serviceName] === INSTANTIATING) {
            throw $injectorMinErr('cdep', 'Circular dependency found: {0}',
                    serviceName + ' <- ' + path.join(' <- '));
          }
          return cache[serviceName];
        } else {
          try {
            path.unshift(serviceName);
            cache[serviceName] = INSTANTIATING;
            cache[serviceName] = factory(serviceName, caller);
            return cache[serviceName];
          } catch (err) {
            if (cache[serviceName] === INSTANTIATING) {
              delete cache[serviceName];
            }
            throw err;
          } finally {
            path.shift();
          }
        }
      }


      function injectionArgs(fn, locals, serviceName) {
        var args = [],
            $inject = createInjector.$$annotate(fn, strictDi, serviceName);

        for (var i = 0, length = $inject.length; i < length; i++) {
          var key = $inject[i];
          if (typeof key !== 'string') {
            throw $injectorMinErr('itkn',
                  'Incorrect injection token! Expected service name as string, got {0}', key);
          }
          args.push(locals && locals.hasOwnProperty(key) ? locals[key] :
                                                           getService(key, serviceName));
        }
        return args;
      }

      function isClass(func) {
        // Support: IE 9-11 only
        // IE 9-11 do not support classes and IE9 leaks with the code below.
        if (msie || typeof func !== 'function') {
          return false;
        }
        var result = func.$$ngIsClass;
        if (!isBoolean(result)) {
          // Support: Edge 12-13 only
          // See: https://developer.microsoft.com/en-us/microsoft-edge/platform/issues/6156135/
          result = func.$$ngIsClass = /^(?:class\b|constructor\()/.test(stringifyFn(func));
        }
        return result;
      }

      function invoke(fn, self, locals, serviceName) {
        if (typeof locals === 'string') {
          serviceName = locals;
          locals = null;
        }

        var args = injectionArgs(fn, locals, serviceName);
        if (Array.isArray(fn)) {
          fn = fn[fn.length - 1];
        }

        if (!isClass(fn)) {
          // http://jsperf.com/angularjs-invoke-apply-vs-switch
          // #5388
          return fn.apply(self, args);
        } else {
          args.unshift(null);
          return new (Function.prototype.bind.apply(fn, args))();
        }
      }


      function instantiate(Type, locals, serviceName) {
        // Check if Type is annotated and use just the given function at n-1 as parameter
        // e.g. someModule.factory('greeter', ['$window', function(renamed$window) {}]);
        var ctor = (Array.isArray(Type) ? Type[Type.length - 1] : Type);
        var args = injectionArgs(Type, locals, serviceName);
        // Empty object at position 0 is ignored for invocation with `new`, but required.
        args.unshift(null);
        return new (Function.prototype.bind.apply(ctor, args))();
      }


      return {
        invoke: invoke,
        instantiate: instantiate,
        get: getService,
        annotate: createInjector.$$annotate,
        has: function(name) {
          return providerCache.hasOwnProperty(name + providerSuffix) || cache.hasOwnProperty(name);
        }
        // @wiwo extension:
        // keys: function(){ return Object.keys(providerCache) }
      };
    }


  }

  createInjector.$$annotate = annotate;

  /*
   * ng-di
   * https://github.com/jmenidara/ng-di
   *
   * Copyright (c) 2013 Javier Mendiara Cañardo
   * Licensed under the MIT license.
   */

  const module = setupModuleLoader(exports);
  const injector = createInjector;
  const annotate$1 = annotate;
  const utils = _utils;

  const di = {
      module,
      injector,
      annotate: annotate$1,
      utils,
  };

  exports.annotate = annotate$1;
  exports.default = di;
  exports.di = di;
  exports.injector = injector;
  exports.module = module;
  exports.utils = utils;

  Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=ng-di.js.map
