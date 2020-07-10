'use strict';

/*
angular.js 1.6.10 `test/loaderSpec.js`
*/
(function(){

var setupModuleLoader = require('../lib/module').setupModuleLoader;
var di = require('../lib/ng-di');

fdescribe('module loader', function() {
  var window;
  var createInjector;

  beforeEach(function () {
    window = {};
    setupModuleLoader(window);
    createInjector = di.injector;
  });

  it('should not override existing namespace', function() {
    var module = window.module;

    setupModuleLoader(window);
    expect(window.module).toBe(module);
  });


  it('should record calls', function() {
    var otherModule = di.module('other', []);
    otherModule.config('otherInit');

    var myModule = di.module('my', ['other'], 'config');

    expect(myModule.
      decorator('dk', 'dv').
      provider('sk', 'sv').
      factory('fk', 'fv').
      service('a', 'aa').
      value('k', 'v').
      config('init2').
      constant('abc', 123).
      run('runBlock')).toBe(myModule);

    expect(myModule.requires).toEqual(['other']);
    expect(myModule._invokeQueue).toEqual([
      ['$provide', 'constant', jasmine.objectContaining(['abc', 123]) ],
      ['$provide', 'provider', jasmine.objectContaining(['sk', 'sv'])],
      ['$provide', 'factory', jasmine.objectContaining(['fk', 'fv']) ],
      ['$provide', 'service', jasmine.objectContaining(['a', 'aa']) ],
      ['$provide', 'value', jasmine.objectContaining(['k', 'v']) ],
    ]);
    expect(myModule._configBlocks).toEqual([
      ['$injector', 'invoke', jasmine.objectContaining(['config'])],
      ['$provide', 'decorator', jasmine.objectContaining(['dk', 'dv'])],
      ['$injector', 'invoke', jasmine.objectContaining(['init2'])]
    ]);
    expect(myModule._runBlocks).toEqual(['runBlock']);
  });


  it('should not throw error when `module.decorator` is declared before provider that it decorates', function() {
    di.module('theModule', []).
      decorator('theProvider', function($delegate) { return $delegate; }).
      factory('theProvider', function() { return {}; });

    expect(function() {
      createInjector(['theModule']);
    }).not.toThrow();
  });


  it('should run decorators in order of declaration, even when mixed with provider.decorator', function() {
    var log = '';

    di.module('theModule', [])
      .factory('theProvider', function() {
        return {api: 'provider'};
      })
      .decorator('theProvider', function($delegate) {
        $delegate.api = $delegate.api + '-first';
        return $delegate;
      })
      .config(function($provide) {
        $provide.decorator('theProvider', function($delegate) {
          $delegate.api = $delegate.api + '-second';
          return $delegate;
        });
      })
      .decorator('theProvider', function($delegate) {
        $delegate.api = $delegate.api + '-third';
        return $delegate;
      })
      .run(function(theProvider) {
        log = theProvider.api;
      });

      createInjector(['theModule']);
      expect(log).toBe('provider-first-second-third');
  });


  it('should decorate the last declared provider if multiple have been declared', function() {
    var log = '';

    di.module('theModule', []).
      factory('theProvider', function() {
        return {
          api: 'firstProvider'
        };
      }).
      decorator('theProvider', function($delegate) {
        $delegate.api = $delegate.api + '-decorator';
        return $delegate;
      }).
      factory('theProvider', function() {
        return {
          api: 'secondProvider'
        };
      }).
      run(function(theProvider) {
        log = theProvider.api;
      });

    createInjector(['theModule']);
    expect(log).toBe('secondProvider-decorator');
  });


  it('should allow module redefinition', function() {
    expect(di.module('a', [])).not.toBe(di.module('a', []));
  });


  fit('should complain of no module', function() {
    expect(function() {
      di.module('dontExist');
    }).toThrowMinErr('$injector', 'nomod', 'Module \'dontExist\' is not available! You either misspelled the module name ' +
            'or forgot to load it. If registering a module ensure that you specify the dependencies as the second ' +
            'argument.');
  });

  it('should complain if a module is called "hasOwnProperty', function() {
    expect(function() {
      di.module('hasOwnProperty', []);
    }).toThrowError('badname: \'hasOwnProperty\' is not a valid module name');
  });

  describe('Module', function() {
    describe('info()', function() {
      var theModule;

      beforeEach(function() {
        theModule = di.module('theModule', []);
      });

      it('should default to an empty object', function() {
        expect(theModule.info()).toEqual({});
      });

      it('should store the object passed as a param', function() {
        theModule.info({ version: '1.2' });
        expect(theModule.info()).toEqual({ version: '1.2' });
      });

      it('should throw if the parameter is not an object', function() {
        expect(function() {
          theModule.info('some text');
        }).toThrowError('aobj: Argument \'some text\' must be an object');
      });

      it('should completely replace the previous info object', function() {
        theModule.info({ value: 'X' });
        theModule.info({ newValue: 'Y' });
        expect(theModule.info()).toEqual({ newValue: 'Y' });
      });
    });
  });
  
  
});


})();
