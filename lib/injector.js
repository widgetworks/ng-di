(function (exports) {
  'use strict';



  var hash = require('./hashmap');
  var di = require('./ng-di');
  var NgMap = hash.NgMap;
  
  var utils = require('./utils');
  var isString = utils.isString;
  var valueFn = utils.valueFn;
  var createMap = utils.createMap;
  var forEach = utils.forEach;
  var isObject = utils.isObject;
  var isFunction = utils.isFunction;
  var assertNotHasOwnProperty = utils.assertNotHasOwnProperty;
  var assertArg = utils.assertArg;
  var assertArgFn = utils.assertArgFn;
  var reverseParams = utils.reverseParams;
  var isBoolean = utils.isBoolean;
  var isUndefined = utils.isUndefined;
  var msie = utils.msie;

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
            throw new Error('strictdi:' +
              '\''+name+'\' is not using explicit annotation and cannot be invoked in strict mode');
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
        loadedModules = new NgMap(),
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
              if (utils.isString(caller)) {
                path.push(caller);
              }
              throw new Error('unpr: Unknown provider: ' + path.join(' <- '));
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
        throw new Error('pget: Provider \''+name+'\' must define $get factory method.');
      }
      return (providerCache[name + providerSuffix] = provider_);
    }
  
    function enforceReturnValue(name, factory) {
      return /** @this */ function enforcedReturnValue() {
        var result = instanceInjector.invoke(factory, this);
        if (isUndefined(result)) {
          throw new Error('undef: Provider \''+name+'\' must return a value from $get factory method.');
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
      forEach(modulesToLoad, function(module) {
        if (loadedModules.get(module)) return;
        loadedModules.set(module, true);
  
        function runInvokeQueue(queue) {
          var i, ii;
          for (i = 0, ii = queue.length; i < ii; i++) {
            var invokeArgs = queue[i],
                provider = providerInjector.get(invokeArgs[0]);
  
            provider[invokeArgs[1]].apply(provider, invokeArgs[2]);
          }
        }
  
        try {
          if (isString(module)) {
            moduleFn = di.module(module);
            instanceInjector.modules[module] = moduleFn;
            runBlocks = runBlocks.concat(loadModules(moduleFn.requires)).concat(moduleFn._runBlocks);
            runInvokeQueue(moduleFn._invokeQueue);
            runInvokeQueue(moduleFn._configBlocks);
          } else if (isFunction(module)) {
              runBlocks.push(providerInjector.invoke(module));
          } else if (Array.isArray(module)) {
              runBlocks.push(providerInjector.invoke(module));
          } else {
            assertArgFn(module, 'module');
          }
        } catch (e) {
          if (Array.isArray(module)) {
            module = module[module.length - 1];
          }
          if (e.message && e.stack && e.stack.indexOf(e.message) === -1) {
            // Safari & FF's stack traces don't contain error.message content
            // unlike those of Chrome and IE
            // So if stack doesn't contain message, we create a new string that contains both.
            // Since error.stack is read-only in Safari, I'm overriding e and not e.stack here.
            // eslint-disable-next-line no-ex-assign
            e = e.message + '\n' + e.stack;
          }
          throw new Error('modulerr: Failed to instantiate module '+module+' due to:\n' + (e.stack || e.message || e));
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
            throw new Error('cdep: Circular dependency found: '+
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
            throw new Error('itkn: '+
                    'Incorrect injection token! Expected service name as string, got '+ key);
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


  };
  
  
  createInjector.$$annotate = annotate;
  
  exports.createInjector = createInjector;
  exports.annotate = annotate;
})(typeof exports === 'undefined'? require('./injector'): exports);


