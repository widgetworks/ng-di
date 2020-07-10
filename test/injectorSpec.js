'use strict';

(function(){

const di = require('../lib/ng-di');
const mock = require('../mock');
const injectorMod = require('../lib/injector');
var angularModule = di.module;

const utils = require('../lib/utils');
const extend = utils.extend;
const valueFn = utils.valueFn;

var module = mock.module;
var inject = mock.inject;
var angular = utils;


describe('injector.modules', function() {
    xit('should expose the loaded module info on the instance injector', function() {
      var test1 = di.module('test1', ['test2']).info({ version: '1.1' });
      var test2 = di.module('test2', []).info({ version: '1.2' });
      module('test1');
      inject(['$injector', function($injector) {
        expect(Object.keys($injector.modules)).toEqual(['test1', 'test2']);
        expect($injector.modules['test1'].info()).toEqual({ version: '1.1' });
        expect($injector.modules['test2'].info()).toEqual({ version: '1.2' });
      }]);
    });

    xit('should expose the loaded module info on the provider injector', function() {
      var providerInjector;
      var test1 = di.module('test1', ['test2']).info({ version: '1.1' });
      var test2 = di.module('test2', [])
        .info({ version: '1.2' })
        .provider('test', ['$injector', function($injector) {
          providerInjector = $injector;
          return {$get: function() {}};
        }]);
      module('test1');
      // needed to ensure that the provider blocks are executed
      inject();

      expect(Object.keys(providerInjector.modules)).toEqual(['test1', 'test2']);
      expect(providerInjector.modules['test1'].info()).toEqual({ version: '1.1' });
      expect(providerInjector.modules['test2'].info()).toEqual({ version: '1.2' });
    });
});


describe('injector', function() {
  var providers;
  var injector;
  var providerInjector;

  var createInjector;
  var annotate;
  
  beforeEach(function(){
    createInjector = injectorMod.createInjector;
    annotate = di.annotate;
  });

  beforeEach(module(function($provide, $injector) {
    providers = function(name, factory, annotations) {
      $provide.factory(name, extend(factory, annotations || {}));
    };
    providerInjector = $injector;
  }));
  beforeEach(inject(function($injector) {
    injector = $injector;
  }));


  xit('should return same instance from calling provider', function() {
    var instance = {},
        original = instance;
    providers('instance', function() { return instance; });
    expect(injector.get('instance')).toEqual(instance);
    instance = 'deleted';
    expect(injector.get('instance')).toEqual(original);
  });


  xit('should inject providers', function() {
    providers('a', function() {return 'Mi';});
    providers('b', function(mi) {return mi + 'sko';}, {$inject:['a']});
    expect(injector.get('b')).toEqual('Misko');
  });


  xit('should check its modulesToLoad argument', function() {
    expect(function() { di.injector('test'); })
        .toThrowError(/areq/);
  });


  xit('should resolve dependency graph and instantiate all services just once', function() {
    var log = [];

    //          s1
    //        /  | \
    //       /  s2  \
    //      /  / | \ \
    //     /s3 < s4 > s5
    //    //
    //   s6

    providers('s1', function() { log.push('s1'); return {}; }, {$inject: ['s2', 's5', 's6']});
    providers('s2', function() { log.push('s2'); return {}; }, {$inject: ['s3', 's4', 's5']});
    providers('s3', function() { log.push('s3'); return {}; }, {$inject: ['s6']});
    providers('s4', function() { log.push('s4'); return {}; }, {$inject: ['s3', 's5']});
    providers('s5', function() { log.push('s5'); return {}; });
    providers('s6', function() { log.push('s6'); return {}; });

    injector.get('s1');

    expect(log).toEqual(['s6', 's3', 's5', 's4', 's2', 's1']);
  });


  xit('should allow query names', function() {
    providers('abc', function() { return ''; });

    expect(injector.has('abc')).toBe(true);
    expect(injector.has('xyz')).toBe(false);
    expect(injector.has('$injector')).toBe(true);
  });


  xit('should provide useful message if no provider', function() {
    expect(function() {
      injector.get('idontexist');
    }).toThrowError("unpr: Unknown provider: idontexistProvider <- idontexist");
  });


  xit('should provide the caller name if given', function() {
    expect(function() {
      injector.get('idontexist', 'callerName');
    }).toThrowError('unpr: Unknown provider: idontexistProvider <- idontexist <- callerName');
  });


  xit('should not corrupt the cache when an object fails to get instantiated', function() {
    expect(function() {
      injector.get('idontexist');
    }).toThrowError('unpr: Unknown provider: idontexistProvider <- idontexist');

    expect(function() {
      injector.get('idontexist');
    }).toThrowError('unpr: Unknown provider: idontexistProvider <- idontexist');
  });


  xit('should provide path to the missing provider', function() {
    providers('a', function(idontexist) {return 1;});
    providers('b', function(a) {return 2;});
    expect(function() {
      injector.get('b');
    }).toThrowError('unpr: Unknown provider: idontexistProvider <- idontexist <- a <- b');
  });


  xit('should create a new $injector for the run phase', inject(function($injector) {
    expect($injector).not.toBe(providerInjector);
  }));


  describe('loadNewModules', function() {
    xit('should be defined on $injector', function() {
      var injector = createInjector([]);
      expect(injector.loadNewModules).toEqual(jasmine.any(Function));
    });

    xit('should allow new modules to be added after injector creation', function() {
      di.module('initial', []);
      var injector = createInjector(['initial']);
      expect(injector.modules['initial']).toBeDefined();
      expect(injector.modules['lazy']).toBeUndefined();
      di.module('lazy', []);
      injector.loadNewModules(['lazy']);
      expect(injector.modules['lazy']).toBeDefined();
    });

    xit('should execute runBlocks of new modules', function() {
      var log = [];
      di.module('initial', []).run(function() { log.push('initial'); });
      var injector = createInjector(['initial']);
      log.push('created');

      di.module('a', []).run(function() { log.push('a'); });
      injector.loadNewModules(['a']);
      expect(log).toEqual(['initial', 'created', 'a']);
    });

    xit('should execute configBlocks of new modules', function() {
      var log = [];
      di.module('initial', []).config(function() { log.push('initial'); });
      var injector = createInjector(['initial']);
      log.push('created');

      di.module('a', [], function() { log.push('config1'); }).config(function() { log.push('config2'); });
      injector.loadNewModules(['a']);
      expect(log).toEqual(['initial', 'created', 'config1', 'config2']);
    });

    xit('should execute runBlocks and configBlocks in the correct order', function() {
      var log = [];
      di.module('initial', [], function() { log.push(1); })
        .config(function() { log.push(2); })
        .run(function() { log.push(3); });
      var injector = createInjector(['initial']);
      log.push('created');

      di.module('a', [], function() { log.push(4); })
        .config(function() { log.push(5); })
        .run(function() { log.push(6); });
      injector.loadNewModules(['a']);
      expect(log).toEqual([1, 2, 3, 'created', 4, 5, 6]);
    });

    xit('should load dependent modules', function() {
      di.module('initial', []);
      var injector = createInjector(['initial']);
      expect(injector.modules['initial']).toBeDefined();
      expect(injector.modules['lazy1']).toBeUndefined();
      expect(injector.modules['lazy2']).toBeUndefined();
      di.module('lazy1', ['lazy2']);
      di.module('lazy2', []);
      injector.loadNewModules(['lazy1']);
      expect(injector.modules['lazy1']).toBeDefined();
      expect(injector.modules['lazy2']).toBeDefined();
    });

    xit('should execute blocks of new modules in the correct order', function() {
      var log = [];
      di.module('initial', []);
      var injector = createInjector(['initial']);

      di.module('lazy1', ['lazy2'], function() { log.push('lazy1-1'); })
        .config(function() { log.push('lazy1-2'); })
        .run(function() { log.push('lazy1-3'); });
      di.module('lazy2', [], function() { log.push('lazy2-1'); })
        .config(function() { log.push('lazy2-2'); })
        .run(function() { log.push('lazy2-3'); });

      injector.loadNewModules(['lazy1']);
      expect(log).toEqual(['lazy2-1', 'lazy2-2', 'lazy1-1', 'lazy1-2', 'lazy2-3', 'lazy1-3']);
    });

    xit('should not reload a module that is already loaded', function() {
      var log = [];
      di.module('initial', []).run(function() { log.push('initial'); });
      var injector = createInjector(['initial']);
      expect(log).toEqual(['initial']);

      injector.loadNewModules(['initial']);
      expect(log).toEqual(['initial']);

      di.module('a', []).run(function() { log.push('a'); });
      injector.loadNewModules(['a']);
      expect(log).toEqual(['initial', 'a']);
      injector.loadNewModules(['a']);
      expect(log).toEqual(['initial', 'a']);

      di.module('b', ['a']).run(function() { log.push('b'); });
      di.module('c', []).run(function() { log.push('c'); });
      di.module('d', ['b', 'c']).run(function() { log.push('d'); });
      injector.loadNewModules(['d']);
      expect(log).toEqual(['initial', 'a', 'b', 'c', 'd']);
    });

    xit('should be able to register a service from a new module', function() {
      var injector = createInjector([]);
      di.module('a', []).factory('aService', function() {
        return {sayHello: function() { return 'Hello'; }};
      });
      injector.loadNewModules(['a']);
      injector.invoke(function(aService) {
        expect(aService.sayHello()).toEqual('Hello');
      });
    });

  });

  xit('should have a false strictDi property', inject(function($injector) {
    expect($injector.strictDi).toBe(false);
  }));


  describe('invoke', function() {
    var args;

    beforeEach(function() {
      args = null;
      providers('a', function() {return 1;});
      providers('b', function() {return 2;});
    });


    function Fn(a, b, c, d) {
      args = [this, a, b, c, d];
      return a + b + c + d;
    }


    xit('should call function', function() {
      Fn.$inject = ['a', 'b', 'c', 'd'];
      injector.invoke(Fn, {name:'this'},  {c:3, d:4});
      expect(args).toEqual([{name:'this'}, 1, 2, 3, 4]);
    });


    xit('should treat array as annotations', function() {
      injector.invoke(['a', 'b', 'c', 'd', Fn], {name:'this'}, {c:3, d:4});
      expect(args).toEqual([{name:'this'}, 1, 2, 3, 4]);
    });


    xit('should invoke the passed-in fn with all of the dependencies as arguments', function() {
      providers('c', function() {return 3;});
      providers('d', function() {return 4;});
      expect(injector.invoke(['a', 'b', 'c', 'd', Fn])).toEqual(10);
    });


    xit('should fail with errors if not function or array', function() {
      expect(function() {
        injector.invoke({});
      }).toThrowError('areq: Argument \'fn\' is not a function, got Object');
      expect(function() {
        injector.invoke(['a', 123], {});
      }).toThrowError('areq: Argument \'fn\' is not a function, got number');
    });
  });


  describe('annotation', function() {
    /* global annotate: false */
    it('should return $inject', function() {
      function fn() {}
      fn.$inject = ['a'];
      expect(annotate(fn)).toBe(fn.$inject);
      expect(annotate(function() {})).toEqual([]);
      expect(annotate(function() {})).toEqual([]);
      /* eslint-disable space-before-function-paren, no-multi-spaces */
      expect(annotate(function  () {})).toEqual([]);
      expect(annotate(function /* */ () {})).toEqual([]);
      /* eslint-enable */
    });


    it('should create $inject', function() {
      var extraParams = utils.noop;
      /* eslint-disable space-before-function-paren */
      // keep the multi-line to make sure we can handle it
      function $f_n0 /*
          */(
          $a, // x, <-- looks like an arg but it is a comment
          b_, /* z, <-- looks like an arg but it is a
                 multi-line comment
                 function(a, b) {}
                 */
          _c,
          /* {some type} */ d) { extraParams(); }
      /* eslint-enable */
      expect(annotate($f_n0)).toEqual(['$a', 'b_', '_c',  'd']);
      expect($f_n0.$inject).toEqual(['$a', 'b_', '_c',  'd']);
    });


    it('should strip leading and trailing underscores from arg name during inference', function() {
      function beforeEachFn(_foo_) { /* foo = _foo_ */ }
      expect(annotate(beforeEachFn)).toEqual(['foo']);
    });

    it('should not strip service names with a single underscore', function() {
      function beforeEachFn(_) { /* _ = _ */ }
      expect(annotate(beforeEachFn)).toEqual(['_']);
    });

    it('should handle no arg functions', function() {
      function $f_n0() {}
      expect(annotate($f_n0)).toEqual([]);
      expect($f_n0.$inject).toEqual([]);
    });


    it('should handle no arg functions with spaces in the arguments list', function() {
      function fn() {}
      expect(annotate(fn)).toEqual([]);
      expect(fn.$inject).toEqual([]);
    });


    it('should handle args with both $ and _', function() {
      function $f_n0($a_) {}
      expect(annotate($f_n0)).toEqual(['$a_']);
      expect($f_n0.$inject).toEqual(['$a_']);
    });

    it('should handle functions with overridden toString', function() {
      function fn(a) {}
      fn.toString = function() { return 'fn'; };
      expect(annotate(fn)).toEqual(['a']);
      expect(fn.$inject).toEqual(['a']);
    });

    it('should throw on non function arg', function() {
      expect(function() {
        annotate({});
      }).toThrow();
    });


    describe('es6', function() {

      var support = {
        shorthandMethods: true,
        fatArrows: true,
        classes: true,
      };


      function baseThey(msg, vals, spec, itFn) {
        var valsIsArray = utils.isArray(vals);

        utils.forEach(vals, function(val, key) {
          var m = msg.split('$prop').join(JSON.stringify(valsIsArray ? val : key));
          itFn(m, function() {
            spec.call(this, val);
          });
        });
      }

      function they(msg, vals, spec) {
        baseThey(msg, vals, spec, it);
      }


      if (support.shorthandMethods) {
        // The functions are generated using `eval` as just having the ES6 syntax can break some browsers.
        it('should be possible to annotate shorthand methods', function() {
          // eslint-disable-next-line no-eval
          expect(annotate(eval('({ fn(x) { return; } })').fn)).toEqual(['x']);
        });
      }


      if (support.fatArrows) {
        it('should create $inject for arrow functions', function() {
          // eslint-disable-next-line no-eval
          expect(annotate(eval('(a, b) => a'))).toEqual(['a', 'b']);
        });
      }


      if (support.fatArrows) {
        it('should create $inject for arrow functions with no parenthesis', function() {
          // eslint-disable-next-line no-eval
          expect(annotate(eval('a => a'))).toEqual(['a']);
        });
      }


      if (support.fatArrows) {
        it('should take args before first arrow', function() {
          // eslint-disable-next-line no-eval
          expect(annotate(eval('a => b => b'))).toEqual(['a']);
        });
      }

      if (support.classes) {
        it('should be possible to instantiate ES6 classes', function() {
          providers('a', function() { return 'a-value'; });
          // eslint-disable-next-line no-eval
          var Clazz = eval('(class { constructor(a) { this.a = a; } aVal() { return this.a; } })');
          var instance = injector.instantiate(Clazz);
          expect(instance).toEqual(new Clazz('a-value'));
          expect(instance.aVal()).toEqual('a-value');
        });

        they('should detect ES6 classes regardless of whitespace/comments ($prop)', [
          'class Test {}',
          'class Test{}',
          'class //<--ES6 stuff\nTest {}',
          'class//<--ES6 stuff\nTest {}',
          'class {}',
          'class{}',
          'class //<--ES6 stuff\n {}',
          'class//<--ES6 stuff\n {}',
          'class/* Test */{}',
          'class /* Test */ {}'
        ], function(classDefinition) {
          // eslint-disable-next-line no-eval
          var Clazz = eval('(' + classDefinition + ')');
          var instance = injector.invoke(Clazz);

          expect(instance).toEqual(jasmine.any(Clazz));
        });
      }
    });


    it('should publish annotate API', function() {
      expect(di.mock.$$annotate).toBe(annotate);
      spyOn(di.mock, '$$annotate').and.callThrough();
      function fn() {}
      injector.annotate(fn);
      expect(di.mock.$$annotate).toHaveBeenCalledWith(fn);
    });
    
  });


  it('should have $injector', function() {
    var $injector = createInjector();
    expect($injector.get('$injector')).toBe($injector);
  });


  it('should define module', function() {
    var log = '';
    var injector = createInjector([function($provide) {
      $provide.value('value', 'value;');
      $provide.factory('fn', valueFn('function;'));
      $provide.provider('service', function Provider() {
        this.$get = valueFn('service;');
      });
    }, function(valueProvider, fnProvider, serviceProvider) {
      log += valueProvider.$get() + fnProvider.$get() + serviceProvider.$get();
    }]).invoke(function(value, fn, service) {
      log += '->' + value + fn + service;
    });
    expect(log).toEqual('value;function;service;->value;function;service;');
  });

  
  describe('module', function() {
    it('should provide $injector even when no module is requested', function() {
      var $provide,
        $injector = createInjector([
          utils.extend(function(p) { $provide = p; }, {$inject: ['$provide']})
        ]);
      expect($injector.get('$injector')).toBe($injector);
    });


    it('should load multiple function modules and infer inject them', function() {
      var a = 'junk';
      var $injector = createInjector([
        function() {
          a = 'A'; // reset to prove we ran
        },
        function($provide) {
          $provide.value('a', a);
        },
        angular.extend(function(p, serviceA) {
          p.value('b', serviceA.$get() + 'B');
        }, {$inject:['$provide', 'aProvider']}),
        ['$provide', 'bProvider', function(p, serviceB) {
          p.value('c', serviceB.$get() + 'C');
        }]
      ]);
      expect($injector.get('a')).toEqual('A');
      expect($injector.get('b')).toEqual('AB');
      expect($injector.get('c')).toEqual('ABC');
    });


    it('should run symbolic modules', function() {
      angularModule('myModule', []).value('a', 'abc');
      var $injector = createInjector(['myModule']);
      expect($injector.get('a')).toEqual('abc');
    });


    it('should error on invalid module name', function() {
      expect(function() {
        createInjector(['IDontExist'], {});
      }).toThrowError('modulerr: '+
        /nomod: Module 'IDontExist' is not available! You either misspelled the module name or forgot to load it/);
    });


    it('should load dependant modules only once', function() {
      var log = '';
      di.module('a', [], function() { log += 'a'; });
      di.module('b', ['a'], function() { log += 'b'; });
      di.module('c', ['a', 'b'], function() { log += 'c'; });
      createInjector(['c', 'c']);
      expect(log).toEqual('abc');
    });

    it('should load different instances of dependent functions', function() {
      function  generateValueModule(name, value) {
        return function($provide) {
          $provide.value(name, value);
        };
      }
      var injector = createInjector([generateValueModule('name1', 'value1'),
                                     generateValueModule('name2', 'value2')]);
      expect(injector.get('name2')).toBe('value2');
    });

    it('should load same instance of dependent function only once', function() {
      var count = 0;
      function valueModule($provide) {
        count++;
        $provide.value('name', 'value');
      }

      var injector = createInjector([valueModule, valueModule]);
      expect(injector.get('name')).toBe('value');
      expect(count).toBe(1);
    });

    it('should execute runBlocks after injector creation', function() {
      var log = '';
      di.module('a', [], function() { log += 'a'; }).run(function() { log += 'A'; });
      di.module('b', ['a'], function() { log += 'b'; }).run(function() { log += 'B'; });
      createInjector([
        'b',
        valueFn(function() { log += 'C'; }),
        [valueFn(function() { log += 'D'; })]
      ]);
      expect(log).toEqual('abABCD');
    });

    it('should execute own config blocks after all own providers are invoked', function() {
      var log = '';
      di.module('a', ['b'])
      .config(function($aProvider) {
        log += 'aConfig;';
      })
      .provider('$a', function Provider$a() {
        log += '$aProvider;';
        this.$get = function() {};
      });
      di.module('b', [])
      .config(function($bProvider) {
        log += 'bConfig;';
      })
      .provider('$b', function Provider$b() {
        log += '$bProvider;';
        this.$get = function() {};
      });

      createInjector(['a']);
      expect(log).toBe('$bProvider;bConfig;$aProvider;aConfig;');
    });

    describe('$provide', function() {

      it('should throw an exception if we try to register a service called "hasOwnProperty"', function() {
        createInjector([function($provide) {
          expect(function() {
            $provide.provider('hasOwnProperty', function() {  });
          }).toThrowError(/badname/);
        }]);
      });

      it('should throw an exception if we try to register a constant called "hasOwnProperty"', function() {
        createInjector([function($provide) {
          expect(function() {
            $provide.constant('hasOwnProperty', {});
          }).toThrowError(/badname/);
        }]);
      });


      describe('constant', function() {
        it('should create configuration injectable constants', function() {
          var log = [];
          createInjector([
            function($provide) {
              $provide.constant('abc', 123);
              $provide.constant({a: 'A', b:'B'});
              return function(a) {
                log.push(a);
              };
            },
            function(abc) {
              log.push(abc);
              return function(b) {
                log.push(b);
              };
            }
          ]).get('abc');
          expect(log).toEqual([123, 'A', 'B']);
        });
      });


      describe('value', function() {
        it('should configure $provide values', function() {
          expect(createInjector([function($provide) {
            $provide.value('value', 'abc');
          }]).get('value')).toEqual('abc');
        });


        it('should configure a set of values', function() {
          expect(createInjector([function($provide) {
            $provide.value({value: Array});
          }]).get('value')).toEqual(Array);
        });
      });


      describe('factory', function() {
        it('should configure $provide factory function', function() {
          expect(createInjector([function($provide) {
            $provide.factory('value', valueFn('abc'));
          }]).get('value')).toEqual('abc');
        });


        it('should configure a set of factories', function() {
          expect(createInjector([function($provide) {
            $provide.factory({value: Array});
          }]).get('value')).toEqual([]);
        });
      });


      describe('service', function() {
        it('should register a class', function() {
          function Type(value) {
            this.value = value;
          }

          var instance = createInjector([function($provide) {
            $provide.value('value', 123);
            $provide.service('foo', Type);
          }]).get('foo');

          expect(instance instanceof Type).toBe(true);
          expect(instance.value).toBe(123);
        });


        it('should register a set of classes', function() {
          var Type = function() {};

          var injector = createInjector([function($provide) {
            $provide.service({
              foo: Type,
              bar: Type
            });
          }]);

          expect(injector.get('foo') instanceof Type).toBe(true);
          expect(injector.get('bar') instanceof Type).toBe(true);
        });
      });


      describe('provider', function() {
        it('should configure $provide provider object', function() {
          expect(createInjector([function($provide) {
            $provide.provider('value', {
              $get: valueFn('abc')
            });
          }]).get('value')).toEqual('abc');
        });


        it('should configure $provide provider type', function() {
          function Type() {}
          Type.prototype.$get = function() {
            expect(this instanceof Type).toBe(true);
            return 'abc';
          };
          expect(createInjector([function($provide) {
            $provide.provider('value', Type);
          }]).get('value')).toEqual('abc');
        });


        it('should configure $provide using an array', function() {
          function Type(PREFIX) {
            this.prefix = PREFIX;
          }
          Type.prototype.$get = function() {
            return this.prefix + 'def';
          };
          expect(createInjector([function($provide) {
            $provide.constant('PREFIX', 'abc');
            $provide.provider('value', ['PREFIX', Type]);
          }]).get('value')).toEqual('abcdef');
        });


        it('should configure a set of providers', function() {
          expect(createInjector([function($provide) {
            $provide.provider({value: valueFn({$get:Array})});
          }]).get('value')).toEqual([]);
        });
      });


      describe('decorator', function() {
        var log, injector;

        beforeEach(function() {
          log = [];
        });


        it('should be called with the original instance', function() {
          injector = createInjector([function($provide) {
            $provide.value('myService', function(val) {
              log.push('myService:' + val);
              return 'origReturn';
            });

            $provide.decorator('myService', function($delegate) {
              return function(val) {
                log.push('myDecoratedService:' + val);
                var origVal = $delegate('decInput');
                return 'dec+' + origVal;
              };
            });
          }]);

          var out = injector.get('myService')('input');
          log.push(out);
          expect(log.join('; ')).
            toBe('myDecoratedService:input; myService:decInput; dec+origReturn');
        });


        it('should allow multiple decorators to be applied to a service', function() {
          injector = createInjector([function($provide) {
            $provide.value('myService', function(val) {
              log.push('myService:' + val);
              return 'origReturn';
            });

            $provide.decorator('myService', function($delegate) {
              return function(val) {
                log.push('myDecoratedService1:' + val);
                var origVal = $delegate('decInput1');
                return 'dec1+' + origVal;
              };
            });

            $provide.decorator('myService', function($delegate) {
              return function(val) {
                log.push('myDecoratedService2:' + val);
                var origVal = $delegate('decInput2');
                return 'dec2+' + origVal;
              };
            });
          }]);

          var out = injector.get('myService')('input');
          log.push(out);
          expect(log).toEqual(['myDecoratedService2:input',
                               'myDecoratedService1:decInput2',
                               'myService:decInput1',
                               'dec2+dec1+origReturn']);
        });


        it('should decorate services with dependencies', function() {
          injector = createInjector([function($provide) {
            $provide.value('dep1', 'dependency1');

            $provide.factory('myService', ['dep1', function(dep1) {
              return function(val) {
                log.push('myService:' + val + ',' + dep1);
                return 'origReturn';
              };
            }]);

            $provide.decorator('myService', function($delegate) {
              return function(val) {
                log.push('myDecoratedService:' + val);
                var origVal = $delegate('decInput');
                return 'dec+' + origVal;
              };
            });
          }]);

          var out = injector.get('myService')('input');
          log.push(out);
          expect(log.join('; ')).
            toBe('myDecoratedService:input; myService:decInput,dependency1; dec+origReturn');
        });


        it('should allow for decorators to be injectable', function() {
          injector = createInjector([function($provide) {
            $provide.value('dep1', 'dependency1');

            $provide.factory('myService', function() {
              return function(val) {
                log.push('myService:' + val);
                return 'origReturn';
              };
            });

            $provide.decorator('myService', function($delegate, dep1) {
              return function(val) {
                log.push('myDecoratedService:' + val + ',' + dep1);
                var origVal = $delegate('decInput');
                return 'dec+' + origVal;
              };
            });
          }]);

          var out = injector.get('myService')('input');
          log.push(out);
          expect(log.join('; ')).
            toBe('myDecoratedService:input,dependency1; myService:decInput; dec+origReturn');
        });


        it('should allow for decorators to $injector', function() {
          
          di.module('ng', [])
              .service('$http', function(){
                return '$httpService'
              });
          
          injector = createInjector(['ng', function($provide) {
            $provide.decorator('$injector', function($delegate) {
              return extend({}, $delegate, {get: function(val) {
                if (val === 'key') {
                  return 'value';
                }
                return $delegate.get(val);
              }});
            });
          }]);

          expect(injector.get('key')).toBe('value');
          expect(injector.get('$http')).not.toBeUndefined();
        });
      });
    });


    describe('error handling', function() {
      it('should handle wrong argument type', function() {
        expect(function() {
          createInjector([
            {}
          ], {});
        }).toThrowError(/modulerr: Failed to instantiate module \w+ due to:\n.*\[ng:areq] Argument 'module' is not a function, got Object/);
      });


      it('should handle exceptions', function() {
        expect(function() {
          createInjector([function() {
            throw new Error('MyError');
          }], {});
        }).toThrowError(/modulerr: Failed to instantiate module .+ due to:\n.*MyError/);
      });


      it('should decorate the missing service error with module name', function() {
        di.module('TestModule', [], function(xyzzy) {});
        expect(function() {
          createInjector(['TestModule']);
        }).toThrowError(
          /modulerr: Failed to instantiate module TestModule due to:\n.*\[unpr] Unknown provider: xyzzy/
        );
      });


      it('should decorate the missing service error with module function', function() {
        function myModule(xyzzy) {}
        expect(function() {
          createInjector([myModule]);
        }).toThrowError(
          /modulerr: Failed to instantiate module function myModule\(xyzzy\) due to:\n.*\[unpr] Unknown provider: xyzzy/
        );
      });


      it('should decorate the missing service error with module array function', function() {
        function myModule(xyzzy) {}
        expect(function() {
          createInjector([['xyzzy', myModule]]);
        }).toThrowError(
          /modulerr: Failed to instantiate module function myModule\(xyzzy\) due to:\n.*\[unpr] Unknown provider: xyzzy/
        );
      });


      it('should throw error when trying to inject oneself', function() {
        expect(function() {
          createInjector([function($provide) {
            $provide.factory('service', function(service) {});
            return function(service) {};
          }]);
        }).toThrowError('cdep: Circular dependency found: service <- service');
      });


      it('should throw error when trying to inject circular dependency', function() {
        expect(function() {
          createInjector([function($provide) {
            $provide.factory('a', function(b) {});
            $provide.factory('b', function(a) {});
            return function(a) {};
          }]);
        }).toThrowError('cdep: Circular dependency found: a <- b <- a');
      });

    });
  });


  // describe('retrieval', function() {
  //   var instance,
  //     $injector,
  //     $provide;
  //
  //   beforeEach(function() {
  //     $injector = createInjector([ ['$provide', function(provide) {
  //       ($provide = provide).value('instance', instance = {name:'di'});
  //     }]]);
  //   });
  //
  //
  //   xit('should retrieve by name and cache instance', function() {
  //     expect(instance).toEqual({name: 'di'});
  //     expect($injector.get('instance')).toBe(instance);
  //     expect($injector.get('instance')).toBe(instance);
  //   });
  //
  //
  //   xit('should call functions and infer arguments', function() {
  //     expect($injector.invoke(function(instance) { return instance; })).toBe(instance);
  //     expect($injector.invoke(function(instance) { return instance; })).toBe(instance);
  //   });
  // });
  //
  //
  // describe('method invoking', function() {
  //   var $injector;
  //
  //   beforeEach(function() {
  //     $injector = createInjector([ function($provide) {
  //       $provide.value('book', 'moby');
  //       $provide.value('author', 'melville');
  //     }]);
  //   });
  //
  //
  //   xit('should invoke method', function() {
  //     expect($injector.invoke(function(book, author) {
  //       return author + ':' + book;
  //     })).toEqual('melville:moby');
  //     expect($injector.invoke(function(book, author) {
  //       expect(this).toEqual($injector);
  //       return author + ':' + book;}, $injector)).toEqual('melville:moby');
  //   });
  //
  //
  //   xit('should invoke method with locals', function() {
  //     expect($injector.invoke(function(book, author) {
  //       return author + ':' + book;
  //     })).toEqual('melville:moby');
  //     expect($injector.invoke(
  //       function(book, author, chapter) {
  //         expect(this).toEqual($injector);
  //         return author + ':' + book + '-' + chapter;
  //       }, $injector, {author:'m', chapter:'ch1'})).toEqual('m:moby-ch1');
  //   });
  //
  //
  //   xit('should invoke method which is annotated', function() {
  //     expect($injector.invoke(utils.extend(function(b, a) {
  //       return a + ':' + b
  //     }, {$inject:['book', 'author']}))).toEqual('melville:moby');
  //     expect($injector.invoke(utils.extend(function(b, a) {
  //       expect(this).toEqual($injector);
  //       return a + ':' + b;
  //     }, {$inject:['book', 'author']}), $injector)).toEqual('melville:moby');
  //   });
  //
  //
  //   xit('should invoke method which is an array of annotation', function() {
  //     expect($injector.invoke(function(book, author) {
  //       return author + ':' + book;
  //     })).toEqual('melville:moby');
  //     expect($injector.invoke(function(book, author) {
  //       expect(this).toEqual($injector);
  //       return author + ':' + book;
  //     }, $injector)).toEqual('melville:moby');
  //   });
  //
  //
  //   xit('should throw usefull error on wrong argument type]', function() {
  //     expect(function() {
  //       $injector.invoke({});
  //     }).toThrowError("Argument 'fn' is not a function, got Object");
  //   });
  // });
  //
  //
  // describe('service instantiation', function() {
  //   var $injector;
  //
  //   beforeEach(function() {
  //     $injector = createInjector([ function($provide) {
  //       $provide.value('book', 'moby');
  //       $provide.value('author', 'melville');
  //     }]);
  //   });
  //
  //
  //   function Type(book, author) {
  //     this.book = book;
  //     this.author = author;
  //   }
  //   Type.prototype.title = function() {
  //     return this.author + ': ' + this.book;
  //   };
  //
  //
  //   xit('should instantiate object and preserve constructor property and be instanceof', function() {
  //     var t = $injector.instantiate(Type);
  //     expect(t.book).toEqual('moby');
  //     expect(t.author).toEqual('melville');
  //     expect(t.title()).toEqual('melville: moby');
  //     expect(t instanceof Type).toBe(true);
  //   });
  //
  //
  //   xit('should instantiate object and preserve constructor property and be instanceof ' +
  //     'with the array annotated type', function() {
  //     var t = $injector.instantiate(['book', 'author', Type]);
  //     expect(t.book).toEqual('moby');
  //     expect(t.author).toEqual('melville');
  //     expect(t.title()).toEqual('melville: moby');
  //     expect(t instanceof Type).toBe(true);
  //   });
  //
  //
  //   xit('should allow constructor to return different object', function() {
  //     var obj = {};
  //     var Class = function() {
  //       return obj;
  //     };
  //
  //     expect($injector.instantiate(Class)).toBe(obj);
  //   });
  //
  //
  //   xit('should handle constructor exception', function() {
  //     expect(function() {
  //       $injector.instantiate(function() { throw 'MyError'; });
  //     }).toThrow('MyError');
  //   });
  //
  //
  //   xit('should return instance if constructor returns non-object value', function() {
  //     var A = function() {
  //       return 10;
  //     };
  //
  //     var B = function() {
  //       return 'some-string';
  //     };
  //
  //     var C = function() {
  //       return undefined;
  //     };
  //
  //     expect($injector.instantiate(A) instanceof A).toBe(true);
  //     expect($injector.instantiate(B) instanceof B).toBe(true);
  //     expect($injector.instantiate(C) instanceof C).toBe(true);
  //   });
  // });
  //
  // describe('protection modes', function() {
  //   xit('should prevent provider lookup in app', function() {
  //     var  $injector = createInjector([function($provide) {
  //       $provide.value('name', 'di');
  //     }]);
  //     expect(function() {
  //       $injector.get('nameProvider');
  //     }).toThrowError("Unknown provider: nameProviderProvider <- nameProvider");
  //   });
  //
  //
  //   xit('should prevent provider configuration in app', function() {
  //     var  $injector = createInjector([]);
  //     expect(function() {
  //       $injector.get('$provide').value('a', 'b');
  //     }).toThrowError("Unknown provider: $provideProvider <- $provide");
  //   });
  //
  //
  //   xit('should prevent instance lookup in module', function() {
  //     function instanceLookupInModule(name) { throw Error('FAIL'); }
  //
  //     const expectedError = 'Unknown provider: name from ' + String(instanceLookupInModule);
  //
  //     expect(function() {
  //       createInjector([function($provide) {
  //         $provide.value('name', 'di')
  //       }, instanceLookupInModule]);
  //     }).toThrowError(expectedError);
  //   });
  // });
  
});


})();
