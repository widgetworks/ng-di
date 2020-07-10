(function (exports) {
  'use strict';

  var uid = 0;
  
  // Support: IE 9-11 only
  /**
   * documentMode is an IE-only property
   * http://msdn.microsoft.com/en-us/library/ie/cc196988(v=vs.85).aspx
   */
  var msie = window.document.documentMode;


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
  };

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
      iteratorFn(key, value)
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
  };

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
  };
  
  
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
  };


  /**
   * @ngdoc function
   * @name angular.isArray
   * @function
   *
   * @description
   * Determines if a reference is an `Array`.
   *
   * @param {*} value Reference to check.
   * @returns {boolean} True if `value` is an `Array`.
   */
  function isArray(value) {
    return Object.prototype.toString.apply(value) == '[object Array]';
  };


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
  };



  /**
   * throw error of the argument is falsy.
   */
  function assertArg(arg, name, reason) {
    if (!arg) {
      throw new Error("Argument '" + (name || '?') + "' is " + (reason || "required"));
    }
    return arg;
  };

  function assertArgFn(arg, name, acceptArrayAnnotation) {
    if (acceptArrayAnnotation && isArray(arg)) {
      arg = arg[arg.length - 1];
    }

    assertArg(isFunction(arg), name, 'not a function, got ' +
      (arg && typeof arg == 'object' ? arg.constructor.name || 'Object' : typeof arg));
    return arg;
  };
  
  
  function noop() {};
  
  
  var isNumberNaN = Number.isNaN || function isNumberNaN(num) {
    // eslint-disable-next-line no-self-compare
    return num !== num;
  };


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
  

  exports.forEach = forEach;
  exports.reverseParams = reverseParams;
  exports.extend = extend;
  exports.nextUid = nextUid;
  exports.assertArgFn = assertArgFn;
  exports.valueFn = valueFn;
  exports.isString = isString;
  exports.isArray = isArray;
  exports.isFunction = isFunction;
  exports.isObject = isObject;
  exports.noop = noop;
  exports.isNumberNaN = isNumberNaN;
  exports.isUndefined = isUndefined;
  exports.isDefined = isDefined;
  exports.msie = msie;

})(typeof exports === 'undefined' ? require('./utils') : exports);
