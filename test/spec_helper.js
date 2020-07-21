(function(){
  
  function isUndefined(value) {return typeof value === 'undefined';}
  
  
  function MinErrMatcher(isNot, namespace, code, content, wording) {
    var codeRegex = new RegExp('^' + escapeRegexp('[' + namespace + ':' + code + ']'));
    var contentRegex = isUndefined(content) || jasmine.isA_('RegExp', content) ?
        content : new RegExp(escapeRegexp(content));

    this.test = test;

    function escapeRegexp(str) {
      // This function escapes all special regex characters.
      // We use it to create matching regex from arbitrary strings.
      // http://stackoverflow.com/questions/3446170/escape-string-for-use-in-javascript-regex
      return str.replace(/[-[\]/{}()*+?.\\^$|]/g, '\\$&');
    }

    function test(exception) {
      var exceptionMessage = (exception && exception.message) || exception || '';

      var codeMatches = codeRegex.test(exceptionMessage);
      var contentMatches = isUndefined(contentRegex) || contentRegex.test(exceptionMessage);
      var matches = codeMatches && contentMatches;

      return {
        pass: isNot ? !matches : matches,
        message: message
      };

      function message() {
        return 'Expected ' + wording.inputType + (isNot ? ' not' : '') + ' to ' +
            wording.expectedAction + ' "' + namespace + 'MinErr(\'' + code + '\')"' +
            (contentRegex ? ' matching \n\n' + contentRegex.toString() + '\n' : '') +
            (!exception ? '.' : '\nbut it ' + wording.actualAction + ': \n\n' + exceptionMessage) +
            '\n';
      }
    }
  }
  
  
  beforeEach(function (){
    jasmine.addMatchers({
      
      toBeFunction: function toBeFunctionFactory(util, customEqualityTesters){
        const matcher = {
          compare: function(actual){
            const result = {
              pass: Object.prototype.toString.call(actual)==='[object Function]',
            };
            return result;
          }
        };
        return matcher;
      },
  
      toThrowMinErr: function() {
        return {
          compare: generateCompare(false),
          negativeCompare: generateCompare(true)
        };
  
        function generateCompare(isNot) {
          return function(actual, namespace, code, content) {
            var exception;
  
            if (typeof actual !== 'function') {
              throw new Error('Actual is not a function');
            }
  
            try {
              actual();
            } catch (e) {
              exception = e;
            }
  
            var matcher = new MinErrMatcher(isNot, namespace, code, content, {
              inputType: 'function',
              expectedAction: 'throw',
              actualAction: 'threw'
            });
  
            return matcher.test(exception);
          };
        }
      },
      
    });
  });


})();
