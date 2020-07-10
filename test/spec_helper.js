
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
  });
});
