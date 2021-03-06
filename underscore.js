//     Underscore.js 1.4.4
//     http://underscorejs.org
//     (c) 2009-2013 Jeremy Ashkenas, DocumentCloud Inc.
//     Underscore may be freely distributed under the MIT license.

(function(undefined) {

  // Baseline setup
  // --------------

  // Establish the root object, `window` in the browser, or `global` on the server.
  var root = this;

  // Save the previous value of the `_` variable.
  var previousUnderscore = root._;

  // Establish the object that gets returned to break out of a loop iteration.
  var breaker = {};

  // Save bytes in the minified (but not gzipped) version:
  var ArrayProto = Array.prototype, ObjProto = Object.prototype, FuncProto = Function.prototype;

  // Create quick reference variables for speed access to core prototypes.
  var push             = ArrayProto.push,
      slice            = ArrayProto.slice,
      concat           = ArrayProto.concat,
      toString         = ObjProto.toString,
      hasOwnProperty   = ObjProto.hasOwnProperty;

/**************************************
 *  All **ECMAScript 5** native function implementations that we hope to use
 *  are added here if not supported (by older browsers):
 *  Most of these are code from Mozilla.org
 **************************************/
// extendIfNull:
// Just like _.extend, but only if not already defined (!=null)
var extendIfNull = function(obj) {
	var source,
		args = slice.call(arguments,1),
		len=args.length;
	for(var i=0 ; i<len ; i++){
		for ( var prop in (source = args[i])) {
			if (obj[prop] == null) //THIS IS OUR ADDED CHECK
				obj[prop] = source[prop];
		}
	}
	return obj;
};
//For Array
extendIfNull(ArrayProto, {
	every : function(fn, context) {
		"use strict";
		var len = this.length >>> 0;
		if (typeof fn != "function") {
			throw new TypeError( fn + " is not a function" );
		}
		for (var i = 0; i < len; i++) {
			if (i in this && !fn.call(context, this[i], i, this)) {
				return false;
			}
		}
		return true;
	},
	filter : function(fn, context) {
		"use strict";
		var len = this.length >>> 0;
		if (typeof fn != "function") {
			throw new TypeError( fn + " is not a function" );
		}
		var res = [], val;
		for (var i = 0; i < len; i++) {
			if (i in this) {
				val = this[i]; // in case fn mutates this
				if (fn.call(context,val, i, this)) {
					res.push(val);
				}
			}
		}
		return res;
	},
	//TODO: note how different than .each(fn)
	//TODO: perfTest binding context vs not.
	forEach : function(fn, context) {
		"use strict";
        var len = this.length >>> 0; // Hack to convert O.length to a UInt32
        if (typeof fn != "function") {
			throw new TypeError( fn + " is not a function" );
        }
        for (var i = 0; i < len; i++) {
            if (i in this) { //skip undefined values
                fn.call(context, this[i], i, this);
            }
        }
    },
	indexOf : function (item, i ) {
        "use strict";
        var len = this.length >>> 0;
		i = ~~i;  //fastest integer conversion
		if(i < 0) i = Math.max( 0, len + i );
        for (; i < len; i++) {
            if (i in this && this[i] === item) {
                return i;
            }
        }
        return -1;
    },
	lastIndexOf : function(item, i) {
		"use strict";
		var len = Object(this).length >>> 0;

		if(arguments.length > 1){
			i = ~~i;
			i = i < 0 ? len + i : Math.min(i, len - 1);
		} else {
			i = len-1;
		}
		for (; i >= 0; i--)
		{
			if (i in this && this[i] === item)
				return i;
		}
		return -1;
	},
	map : function(fn, context) {
		"use strict";
        var len = this.length >>> 0;
        if (typeof fn != "function") {
			throw new TypeError( fn + " is not a function" );
        }
        var res = new Array(len);
        for (var i = 0; i < len; i++) {
            if (i in this) {
                res[i] = fn.call(context, this[i], i, this);
            }
        }
        return res;
    },
	reduce : function reduce(accumulator, curr){
		"use strict";
	    if (this == null) throw new TypeError("Object is null or undefined");
	    if(typeof accumulator !== "function") // ES5 : "If IsCallable(callbackfn) is false, throw a TypeError exception."
			throw new TypeError("First argument is not callable");
	    var len = this.length >>> 0, i = 0;

	    if(arguments.length < 2) {
			if (len === 0) throw new TypeError("Array length is 0 and no second argument");
			// start accumulating at first real element:
			for(;;) {
				if (i in this) {
					var curr = this[i++]; //start accumulating here.
					break;
				}
				if (++i >= len) {
					throw new TypeError("Array contains no values and no initial (second) argument");
				}
			}
	    }

	    for (; i < len; i++) {
	      if(i in this) curr = accumulator.call(undefined, curr, this[i], i, this);
	    }

	    return curr;
	},
	reduceRight : function(accumulator, curr) {
		"use strict";
	    if (this == null) throw new TypeError("Object is null or undefined");
		if (typeof accumulator != "function") {
			throw new TypeError("First argument is not callable");
		}
	    var len = this.length >>> 0, i = len - 1;

	    if(arguments.length < 2) {
			if (len == 0) throw new TypeError("Array length is 0 and no second argument");
			// start accumulating at first real element:
			for(;;) {
				if (i in this) {
					var curr = this[i--]; //start accumulating here.
					break;
				}
				if (--i < 0) {
					throw new TypeError("Array contains no values and no initial (second) argument");
				}
			}
		}

		for (; i >= 0; i--) {
			if (i in this) curr = accumulator.call(undefined, curr, this[i], i, this);
	    }

	    return curr;
	},
	some : function(fn, context) {
		"use strict";
		var len = this.length >>> 0;
		if (typeof fn != "function") {
			throw new TypeError( fn + " is not a function" );
		}
		for (var i=0; i < len; i++) {
			if (i in this && fn.call(context, this[i], i, this)) {
				return true;
			}
		}
		return false;
	},

	/*----------------------
	 * Completely NEW array functions:
	 -----------------------*/

	//Soft version of indexOf (uses == instead of === | identity)
	indexOfSoft : function (item, i) {
		"use strict";
		var len = this.length >>> 0;
		i = ~~i;  //fastest integer conversion
		if(i < 0) i = Math.max( 0, len + i );
		for (; i < len; i++) {
			if (i in this && this[i] == item) {
				return i;
			}
		}
		return -1;
	},
	//TODO: if value is a function, do we change this pointer???
	fill: function(value,size){
		if(size!=null) this.length = size;
		else size = this.length;

		if(typeof value == 'function')
			for (var i = 0; i < size; i++) {
				this[i] = value(this[i],i,this);
			}
		else
			for (var i = 0; i < size; i++) {
				this[i] = value;
			}
	},

	/*
	* Moves element at index up/down delta spaces
	*
	* delta of Infinity, or 'top','end' moves to end of array
	* delta of -Infinity or 'bottom','front' moves to start of array...
	* similar to moveTo(fromIndex,toIndex) method accept uses a delta
	*/
	move: function(index,delta){
		//we will have Infinitiy = top, -Infinity = bottom
		if(typeof delta == "string"){
			if(['top','end','last'].is(delta))
				delta = Infinity;
			else if(['bottom','front','first'].is(delta)){
				delta = -Infinity;
			}
			else
				delta = parseInt(delta);
		}

		return this.moveTo(index,index + delta);
	},
	/*
	* Moves element from one index in array to another:
	*
	* so if we have x = [a,b,c,d,e,f,g]
	* x.moveTo(3,5) results in [a,b,c,e,f,d,g]
	*
	* NOTE: careful when moving to a higher index ...
	* 	don't expect [a,b,c,e,d,f,g] in the above example
	* 	the toIndex will be the final index.
	*
	* 	returns 'true' if anything moved, otherwise 'false'
	*/
	moveTo: function(fromIndex,toIndex){
		if (fromIndex < 0 || fromIndex >= this.length || isNaN(toIndex)) {
			return false;
		}

		var item = this[fromIndex];
		this.splice(fromIndex,1);

		if(toIndex<0) toIndex = 0;
		else if(toIndex > this.length) toIndex = this.length;

		this.splice(toIndex,0,item);
		return (fromIndex != toIndex);
	}
});
//TODO: better test cases for this one:
//TODO: test to see if we can add static method to Array (instead of just it's prototype)
if(!Array.isArray) Array.isArray = function (obj) {
	return obj instanceof Array //super fast
		|| toString.call(obj) == '[object Array]'; //works in another frame;
};

// For Function:
if(!FuncProto.bind)	FuncProto.bind = function (context) {
	if (typeof this != "function") {
		// closest thing possible to the ECMAScript 5 internal IsCallable function
		throw new TypeError( this + " is not a function" );
	}
	var bound, func = this, args = slice.call(arguments, 1);
	return bound = function() {
		if (!(this instanceof bound)) return func.apply(context, args.concat(slice.call(arguments)));
		ctor.prototype = func.prototype;
		var self = new ctor;
		var result = func.apply(self, args.concat(slice.call(arguments)));
		if (Object(result) === result) return result;
		return self;
	};
};

// For Object:
if (!Object.keys) Object.keys = (function(){
	var hasDontEnumBug = !({toString: null}).propertyIsEnumerable('toString'),
	dontEnums = [
	  'toString',
	  'toLocaleString',
	  'valueOf',
	  'hasOwnProperty',
	  'isPrototypeOf',
	  'propertyIsEnumerable',
	  'constructor'
	],
	dontEnumsLength = dontEnums.length;

	return function (obj) {
		//TODO: speed test object compare:
		//if (typeof obj !== 'object' && typeof obj !== 'function' || obj === null)

		if (obj !== Object(obj))
			throw new TypeError('Object.keys called on a non-object');
		var result = [];

		for (var prop in obj) if (hasOwnProperty.call(obj,prop)) result.push(prop);

		if (hasDontEnumBug) {
			for (var i=0; i < dontEnumsLength; i++) {
				if (hasOwnProperty.call(obj, dontEnums[i])) result.push(dontEnums[i]);
			}
		}

		return result;
	}
})();

  // All **ECMAScript 5** native function implementations that we hope to use
  // are declared here.
  var
    nativeForEach      = ArrayProto.forEach,
    nativeMap          = ArrayProto.map,
    nativeReduce       = ArrayProto.reduce,
    nativeReduceRight  = ArrayProto.reduceRight,
    nativeFilter       = ArrayProto.filter,
    nativeEvery        = ArrayProto.every,
    nativeSome         = ArrayProto.some,
    nativeIndexOf      = ArrayProto.indexOf,
    nativeLastIndexOf  = ArrayProto.lastIndexOf,
    nativeIsArray      = Array.isArray,
    nativeKeys         = Object.keys,
    nativeBind         = FuncProto.bind;

  // Create a safe reference to the Underscore object for use below.
  var _ = function(obj) {
    if (obj instanceof _) return obj;
    if (!(this instanceof _)) return new _(obj);
    this._wrapped = obj;
  };

  // Export the Underscore object for **Node.js**, with
  // backwards-compatibility for the old `require()` API. If we're in
  // the browser, add `_` as a global object via a string identifier,
  // for Closure Compiler "advanced" mode.
  if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {
      exports = module.exports = _;
    }
    exports._ = _;
  } else {
    root._ = _;
  }

  // Current version.
  _.VERSION = '1.4.4-a';

/************************
 * A few important functions we need defined first:
 ************************/
var
// What isArrayLike:
//   - .length = number (property);
//       should give length of collection, also 'length' shouldn't be own property (though are skipping this test)
//   - .indexOf = function;
//   - srings will return 'false' (though they are arraylike, assume we don't want char array)
//       if so just use .split('');
// why? jQuery is arraylike but returns false to isArray()... also other collections:
//we can use jQuery like an array in most cases:
//Although strings really are arraylike, we will return false for a string, assuming we don't want array of it's characters.
//TODO: make tests for these:
//TODO: can we optimize this any more?
isArrayLike = function(obj){
	//TODO: test obj.length == +obj.length??
	return nativeIsArray(obj) ||
	(obj.length === +obj.length &&
		typeof obj.indexOf == 'function' &&
		typeof obj != 'string' && toString.call(obj)!='[object String]');
},

/* makeInArgsFn():
*
* returns: a function fn(val) which checks if val is in the passed arguments:
* arguments can be any of the following:
* ([val1,val2,val3,val4])
* (val1,val2,val3,val4)
* (value)
*
* This should make it good to use and extend Array.filter() and other functions
* 	that normally take only a function.
* NOTE: Array must have an indexOf function
* TODO: we should move functions to _.fn
*/
makeInArgsFn = function(arg){
	if(arguments.length!=1){
		arg = _.toArray(arguments);
	}else if(!isArrayLike(arg)){
		return function(v){
			return v==arg;
		};
	}
	return function(val){
		return nativeIndexOf.call(arg,val)!=-1;
	};
},
negate = function(fn) {
	return function() {
		return !fn.apply(this, arguments)
	};
};

/**************************
 * more Completely NEW array functions:
 * (more complicated, requires '_' to exist):
 **************************/
extendIfNull(ArrayProto,{
	remove: function(fn, context){
		if(!_.isFunction(fn)){ fn = makeInArgsFn.apply(null,arguments); context = null; }
		return ArrayProto.filter.call(this,negate(fn),context);
	}
});

  // Collection Functions
  // --------------------

  // The cornerstone, an `each` implementation, aka `forEach`.
  // Handles objects with the built-in `forEach`, arrays, and raw objects.
  // Delegates to **ECMAScript 5**'s native `forEach` if available.
  // FIXME: can we assume if obj.length is a number it's safe to run nativeForEach?
  // This would allow much faster optimizaion and work even for strings! (run through each character)
  // TODO: we need some test cases that would test the above.
  // TODO: test with jQuery as alternative object
  // TODO: see about adding forEach to Object.prototype
  // TODO: performance test pulling out obj.length to variable...
  // NOTE: now returns 'obj' to be more chainable
  var each = _.each = _.forEach = function(obj, iterator, context) {
    if (obj == null) return obj;
    if (obj.forEach === nativeForEach) {
      obj.forEach(iterator, context);
      return obj;
    }
    var len = obj.length;
    if (len === +len) {
      //nativeForEach.call(obj, iterator, context);
      for (var i = 0; i < len; i++) {
        if (i in obj && iterator.call(context, obj[i], i, obj) === breaker) return obj;
      }
    } else {
      for (var key in obj) {
        if (hasOwnProperty.call(obj, key)) {
          if (iterator.call(context, obj[key], key, obj) === breaker) return obj;
        }
      }
    }
    return obj;
  };

/* Like each function garunteed to break out on iterator returning false,
 *	nativeForEach if called doesn't have this rule
 *	(doing this when expected should be faster)
 * NOTE: pass used internally, if(pass==true) returns true/false
	false if broke out of iterations
	otherwise it returns the 'obj' for better chainability:
	TODO: do we do the opposite function (while false?)
		//user could do: while(obj,negate(iterator))
*/
var till = _.till = _.until = function(obj, iterator, context, pass) {
	if (obj == null) return pass || obj;
	var len = obj.length;
	if (len === +len) {
		for (var i = 0; i < len; i++) {
			if(i in obj && iterator.call(context, obj[i], i, obj) === false) return !pass && obj;
		}
	} else {
		for (var key in obj) {
			if (hasOwnProperty.call(obj, key) && iterator.call(context, obj[key], key, obj) === false) return !pass && obj;
		}
	}
	return pass || obj;
};

  // Return the results of applying the iterator to each element.
  // Delegates to **ECMAScript 5**'s native `map` if available.
  var map = _.map = _.collect = function(obj, iterator, context) {
    if (obj == null) return [];
    if (obj.map === nativeMap) return obj.map(iterator, context);

    var results = [];
    var len = obj.length;
    if (len === +len) {
      for (var i = 0; i < len; i++) {
        if (i in obj) results.push(iterator.call(context,obj[i], i, obj));
      }
    } else {
      for (var key in obj) {
        //TODO: check if we need to skip key = "prototype"
        if (hasOwnProperty.call(obj, key)) results.push(iterator.call(context,obj[key], key, obj));
      }
    }
/*
    each(obj, function(value, index, list) {
      results[results.length] = iterator.call(context, value, index, list);
    });
*/
    return results;
  };

  var reduceError = 'Reduce of empty array with no initial value';

  // **Reduce** builds up a single result from a list of values, aka `inject`,
  // or `foldl`. Delegates to **ECMAScript 5**'s native `reduce` if available.
  _.reduce = _.foldl = _.inject = function(obj, iterator, memo, context) {
    var initial = arguments.length > 2;
    if (obj == null) obj = [];
    if (obj.reduce === nativeReduce) {
      if (context) iterator = iterator.bind(context);
      return initial ? obj.reduce(iterator, memo) : obj.reduce(iterator);
    }
    each(obj, function(value, index, list) {
      if (!initial) {
        memo = value;
        initial = true;
      } else {
        memo = iterator.call(context, memo, value, index, list);
      }
    });
    if (!initial) throw new TypeError(reduceError);
    return memo;
  };

  // The right-associative version of reduce, also known as `foldr`.
  // Delegates to **ECMAScript 5**'s native `reduceRight` if available.
  _.reduceRight = _.foldr = function(obj, iterator, memo, context) {
    var initial = arguments.length > 2;
    if (obj == null) obj = [];
    if (obj.reduceRight === nativeReduceRight) {
      if (context) iterator = iterator.bind(context);
      return initial ? obj.reduceRight(iterator, memo) : obj.reduceRight(iterator);
    }
    var length = obj.length;
    if (length !== +length) {
      var keys = nativeKeys(obj);
      length = keys.length;
    }
    each(obj, function(value, index, list) {
      index = keys ? keys[--length] : --length;
      if (!initial) {
        memo = obj[index];
        initial = true;
      } else {
        memo = iterator.call(context, memo, obj[index], index, list);
      }
    });
    if (!initial) throw new TypeError(reduceError);
    return memo;
  };

  // Return the first key found where value passes a truth test.
  //TODO: this one is much faster, maybe use it:
  //TODO: expose this function to world
  //TODO: use nativeIndexOf??
  var findKey = _.findKey = function(obj, iterator, context) {
    if (obj == null) return undefined;
    iterator || (iterator = _.identity);

	var len = obj.length;
	if (len === +len) {
	  for (var i = 0; i < len; i++) {
		if(i in obj && iterator.call(context, obj[i], i, obj)) return i;
	  }
	} else {
	  for (var key in obj) {
		if (hasOwnProperty.call(obj, key) && iterator.call(context, obj[key], key, obj)) return key;
	  }
	}
	return undefined;
  };

  // Return the first value which passes a truth test. Aliased as `detect`.
  // TODO: test when findKey returns undefined...?
  _.find = _.detect = function(obj, iterator, context) {
    if (obj == null) return undefined;
    return obj[findKey(obj, iterator, context)];
/*    var result;
    any(obj, function(value, index, list) {
      if (iterator.call(context, value, index, list)) {
        result = value;
        return true;
      }
    });
    return result;
*/
  };

  // Return all the elements that pass a truth test.
  // Delegates to **ECMAScript 5**'s native `filter` if available.
  // Aliased as `select`.
  _.filter = _.select = function(obj, iterator, context) {
    var results = [];
    if (obj == null) return results;
    if (obj.filter === nativeFilter) return obj.filter(iterator, context);
    each(obj, function(value, index, list) {
      if (iterator.call(context, value, index, list)) results[results.length] = value;
    });
    return results;
  };

  // Return all the elements for which a truth test fails.
  _.reject = function(obj, iterator, context) {
    return _.filter(obj, function(value, index, list) {
      return !iterator.call(context, value, index, list);
    }, context);
  };

  // Determine whether all of the elements match a truth test.
  // Delegates to **ECMAScript 5**'s native `every` if available.
  // Aliased as `all`.
  _.every = _.all = function(obj, iterator, context) {
    iterator || (iterator = _.identity);
    if (obj == null) return true;
    if (obj.every === nativeEvery) return obj.every(iterator, context);
    return till(obj, interator, context, true);
/*
    each(obj, function(value, index, list) {
      if (!(result = result && iterator.call(context, value, index, list))) return breaker;
    });
    return !!result;
*/
  };

  // Determine if at least one element in the object matches a truth test.
  // Delegates to **ECMAScript 5**'s native `some` if available.
  // Aliased as `any`.
  _.some = _.any = function(obj, iterator, context) {
    var result = false;
    if (obj == null) return false;
    if (obj.some === nativeSome) return obj.some(iterator || _.identity, context);
	return findKey(obj, iterator, context) !== undefined;
/*
	each(obj, function(value, index, list) {
      if (result || (result = iterator.call(context, value, index, list))) return breaker;
    });
    return !!result;
*/
  };

  // Determine if the array or object contains a given value (using `===`).
  // Aliased as `include`.
  _.contains = _.include = function(obj, target) {
    if (obj == null) return false;
    if (obj.indexOf === nativeIndexOf) return obj.indexOf(target) != -1;
    return !till(obj,function(value){
      return value !== target;
    }, undefined, true);
/*
    return any(obj, function(value) {
      return value === target;
    });
*/
  };

  // Invoke a method (with arguments) on every item in a collection.
  _.invoke = function(obj, method) {
    var args = slice.call(arguments, 2);
    var isFunc = _.isFunction(method);
    return map(obj, function(value) {
      return (isFunc ? method : value[method]).apply(value, args);
    });
  };

  // Convenience version of a common use case of `map`: fetching a property.
  _.pluck = function(obj, key) {
    return map(obj, function(value){ return value[key]; });
  };

  // Convenience version of a common use case of `filter`: selecting only objects
  // containing specific `key:value` pairs.
  _.where = function(obj, attrs, first) {
    if (_.isEmpty(attrs)) return first ? void 0 : [];
    return _[first ? 'find' : 'filter'](obj, function(value) {
      for (var key in attrs) {
        if (attrs[key] !== value[key]) return false;
      }
      return true;
    });
  };

  // Convenience version of a common use case of `find`: getting the first object
  // containing specific `key:value` pairs.
  _.findWhere = function(obj, attrs) {
    return _.where(obj, attrs, true);
  };

  // Return the maximum element or (element-based computation).
  // Can't optimize arrays of integers longer than 65,535 elements.
  // See: https://bugs.webkit.org/show_bug.cgi?id=80797
  _.max = function(obj, iterator, context) {
    if (!iterator && nativeIsArray(obj) && obj[0] === +obj[0] && obj.length < 65535) {
      return Math.max.apply(Math, obj);
    }
    if (!iterator && _.isEmpty(obj)) return -Infinity;
    var result = {computed : -Infinity, value: -Infinity};
    each(obj, function(value, index, list) {
      var computed = iterator ? iterator.call(context, value, index, list) : value;
      computed >= result.computed && (result = {value : value, computed : computed});
    });
    return result.value;
  };

  // Return the minimum element (or element-based computation).
  _.min = function(obj, iterator, context) {
    if (!iterator && nativeIsArray(obj) && obj[0] === +obj[0] && obj.length < 65535) {
      return Math.min.apply(Math, obj);
    }
    if (!iterator && _.isEmpty(obj)) return Infinity;
    var result = {computed : Infinity, value: Infinity};
    each(obj, function(value, index, list) {
      var computed = iterator ? iterator.call(context, value, index, list) : value;
      computed < result.computed && (result = {value : value, computed : computed});
    });
    return result.value;
  };

  // TODO: test on sparse arrays & test on objects:
  // Shuffle an array.
  _.shuffle = function(obj) {
    var shuffled = [], rand;
    each(obj, function(value,index) {
      rand = _.random(index);
      shuffled[index] = shuffled[rand];
      shuffled[rand] = value;
    });
    return shuffled;
  };

  // A version of _.shuffle that modifies original array
  // - NOTE: obviously destructive
  // - uses less memmory & fast (modified Fisher-Yates)
  // TODO: test on sparse arrays and objects:
  _.shuffleInPlace = function(obj){
	var index = obj.length,n,x;
	while(index-->0){
		n = _.random(index);
		x = obj[n];
		obj[n] = obj[index];
		obj[index] = x;
	}
	return arr;
  }

  // An internal function to generate lookup iterators.
  var lookupIterator = function(value) {
    return _.isFunction(value) ? value : function(obj){ return obj[value]; };
  };

  // Sort the object's values by a criterion produced by an iterator.
  _.sortBy = function(obj, value, context) {
    var iterator = lookupIterator(value);
    return _.pluck(map(obj, function(value, index, list) {
      return {
        value : value,
        index : index,
        criteria : iterator.call(context, value, index, list)
      };
    }).sort(function(left, right) {
      var a = left.criteria;
      var b = right.criteria;
      if (a !== b) {
        if (a > b || a === void 0) return 1;
        if (a < b || b === void 0) return -1;
      }
      return left.index < right.index ? -1 : 1;
    }), 'value');
  };

  // An internal function used for aggregate "group by" operations.
  var group = function(obj, value, context, behavior) {
    var result = {};
    var iterator = lookupIterator(value || _.identity);
    each(obj, function(value, index) {
      var key = iterator.call(context, value, index, obj);
      behavior(result, key, value);
    });
    return result;
  };

  // Groups the object's values by a criterion. Pass either a string attribute
  // to group by, or a function that returns the criterion.
  _.groupBy = function(obj, value, context) {
    return group(obj, value, context, function(result, key, value) {
      (hasOwnProperty.call(result, key) ? result[key] : (result[key] = [])).push(value);
    });
  };

  // Counts instances of an object that group by a certain criterion. Pass
  // either a string attribute to count by, or a function that returns the
  // criterion.
  _.countBy = function(obj, value, context) {
    return group(obj, value, context, function(result, key) {
      if (!hasOwnProperty.call(result, key)) result[key] = 0;
      result[key]++;
    });
  };

  // Use a comparator function to figure out the smallest index at which
  // an object should be inserted so as to maintain order. Uses binary search.
  _.sortedIndex = function(array, obj, iterator, context) {
    iterator = iterator == null ? _.identity : lookupIterator(iterator);
    var value = iterator.call(context, obj);
    var low = 0, high = array.length;
    while (low < high) {
      var mid = (low + high) >>> 1;
      iterator.call(context, array[mid]) < value ? low = mid + 1 : high = mid;
    }
    return low;
  };

  // Safely convert anything iterable into a real, live array.
  _.toArray = function(obj) {
    if (!obj) return [];
    if (nativeIsArray(obj)) return slice.call(obj);
    if (obj.length === +obj.length) return map(obj, _.identity);
    return _.values(obj);
  };

  // Return the number of elements in an object.
  _.size = function(obj) {
    if (obj == null) return 0;
    return (obj.length === +obj.length) ? obj.length : nativeKeys(obj).length;
  };

  // Array Functions
  // ---------------

  // Get the first element of an array. Passing **n** will return the first N
  // values in the array. Aliased as `head` and `take`. The **guard** check
  // allows it to work with `_.map`.
  _.first = _.head = _.take = function(array, n, guard) {
    if (array == null) return void 0;
    return (n != null) && !guard ? slice.call(array, 0, n) : array[0];
  };

  // Returns everything but the last entry of the array. Especially useful on
  // the arguments object. Passing **n** will return all the values in
  // the array, excluding the last N. The **guard** check allows it to work with
  // `_.map`.
  _.initial = function(array, n, guard) {
    return slice.call(array, 0, array.length - ((n == null) || guard ? 1 : n));
  };

  // Get the last element of an array. Passing **n** will return the last N
  // values in the array. The **guard** check allows it to work with `_.map`.
  _.last = function(array, n, guard) {
    if (array == null) return void 0;
    if ((n != null) && !guard) {
      return slice.call(array, Math.max(array.length - n, 0));
    } else {
      return array[array.length - 1];
    }
  };

  // Returns everything but the first entry of the array. Aliased as `tail` and `drop`.
  // Especially useful on the arguments object. Passing an **n** will return
  // the rest N values in the array. The **guard**
  // check allows it to work with `_.map`.
  _.rest = _.tail = _.drop = function(array, n, guard) {
    return slice.call(array, (n == null) || guard ? 1 : n);
  };

  // Trim out all falsy values from an array.
  _.compact = function(array) {
    return _.filter(array, _.identity);
  };

  // Internal implementation of a recursive `flatten` function.
  var flatten = function(input, shallow, output) {
    each(input, function(value) {
      if (nativeIsArray(value)) {
        shallow ? push.apply(output, value) : flatten(value, shallow, output);
      } else {
        output.push(value);
      }
    });
    return output;
  };

  // Return a completely flattened version of an array.
  _.flatten = function(array, shallow) {
    return flatten(array, shallow, []);
  };

  // Return a version of the array that does not contain the specified value(s).
  _.without = function(array) {
    return _.difference(array, slice.call(arguments, 1));
  };

  // Produce a duplicate-free version of the array. If the array has already
  // been sorted, you have the option of using a faster algorithm.
  // Aliased as `unique`.
  _.uniq = _.unique = function(array, isSorted, iterator, context) {
    if (_.isFunction(isSorted)) {
      context = iterator;
      iterator = isSorted;
      isSorted = false;
    }
    var initial = iterator ? map(array, iterator, context) : array;
    var results = [];
    var seen = [];
    each(initial, function(value, index) {
      if (isSorted ? (!index || seen[seen.length - 1] !== value) : !_.contains(seen, value)) {
        seen.push(value);
        results.push(array[index]);
      }
    });
    return results;
  };

  // Produce an array that contains the union: each distinct element from all of
  // the passed-in arrays.
  _.union = function() {
    return _.uniq(concat.apply(ArrayProto, arguments));
  };

  // Produce an array that contains every item shared between all the
  // passed-in arrays.
  // TODO: test against Non-array type values to start
  // TODO:  think about also having next values as non-array for test as well?
  // TODO: try with flatten? ,,, try uniq.
  // TODO: revisit and optomize!
  // TODO: Test intersection of jQuery type objects...
  _.intersection = function(array) {
	if(!isArrayLike(array)) array = _.toArray(array);
	var val, i = -1, len = array.length,
	rest = slice.call(arguments, 1),
	result = [];
	while (++i < len) {
		val = array[i];
		if (result.indexOf(val) != -1) return;
		if (till(rest, function(other){
			//can we assume each argument is array, or should we check?
			//TODO: should we use arraylike???
			//if(isArrayLike(other)) nativeIndexOf.call..
			return _.indexOf(other,val) != -1;
		},undefined,true)) result.push(val);
	}
	return result;
  };

/*
  _.intersection = function(array) {
    var rest = slice.call(arguments, 1);
    return _.filter(_.uniq(array), function(item) {
      return _.every(rest, function(other) {
        return _.indexOf(other, item) >= 0;
      });
    });
  };
*/

  // Take the difference between one array and a number of other arrays.
  // Only the elements present in just the first array will remain.
  _.difference = function(array) {
	if(!isArrayLike(array)) array = _.toArray(array);
	var rest = concat.apply(ArrayProto,slice.call(arguments, 1)),
	result = [],
	i = -1, len = array.length;
	while(++i < len){
		if(rest.indexOf(array[i])==-1) result.push(array[i]);
	}
	return result;
  };
/*
  _.difference = function(array) {
    var rest = concat.apply(ArrayProto, slice.call(arguments, 1));
    return _.filter(array, function(value){ return !_.contains(rest, value); });
  };
*/

  // Zip together multiple lists into a single array -- elements that share
  // an index go together.
  _.zip = function() {
    var args = slice.call(arguments);
    var length = _.max(_.pluck(args, 'length'));
    var results = new Array(length);
    for (var i = 0; i < length; i++) {
      results[i] = _.pluck(args, "" + i);
    }
    return results;
  };

  // Converts lists into objects. Pass either a single array of `[key, value]`
  // pairs, or two parallel arrays of the same length -- one of keys, and one of
  // the corresponding values.
  _.object = function(list, values) {
    if (list == null) return {};
    var result = {};
    for (var i = 0, l = list.length; i < l; i++) {
      if (values) {
        result[list[i]] = values[i];
      } else {
        result[list[i][0]] = list[i][1];
      }
    }
    return result;
  };

  // If the browser doesn't supply us with indexOf (I'm looking at you, **MSIE**),
  // we need this function. Return the position of the first occurrence of an
  // item in an array, or -1 if the item is not included in the array.
  // Delegates to **ECMAScript 5**'s native `indexOf` if available.
  // If the array is large and already in sort order, pass `true`
  // for **isSorted** to use binary search.
  _.indexOf = function(array, item, isSorted) {
    if (array == null) return -1;
    var i = 0, l = array.length;
    if (isSorted) {
      if (typeof isSorted == 'number') {
        i = (isSorted < 0 ? Math.max(0, l + isSorted) : isSorted);
      } else {
        i = _.sortedIndex(array, item);
        return array[i] === item ? i : -1;
      }
    }
    if (array.indexOf === nativeIndexOf) return array.indexOf(item, isSorted);
    for (; i < l; i++) if (array[i] === item) return i;
    return -1;
  };

  // Delegates to **ECMAScript 5**'s native `lastIndexOf` if available.
  _.lastIndexOf = function(array, item, from) {
    if (array == null) return -1;
    var hasIndex = from != null;
    if (array.lastIndexOf === nativeLastIndexOf) {
      return hasIndex ? array.lastIndexOf(item, from) : array.lastIndexOf(item);
    }
    var i = (hasIndex ? from : array.length);
    while (i--) if (array[i] === item) return i;
    return -1;
  };

  // Generate an integer Array containing an arithmetic progression. A port of
  // the native Python `range()` function. See
  // [the Python documentation](http://docs.python.org/library/functions.html#range).
  _.range = function(start, stop, step) {
    if (arguments.length <= 1) {
      stop = start || 0;
      start = 0;
    }
    step = arguments[2] || 1;

    var len = Math.max(Math.ceil((stop - start) / step), 0);
    var idx = 0;
    var range = new Array(len);

    while(idx < len) {
      range[idx++] = start;
      start += step;
    }

    return range;
  };

  // Function (ahem) Functions
  // ------------------

  // Create a function bound to a given object (assigning `this`, and arguments,
  // optionally). Delegates to **ECMAScript 5**'s native `Function.bind` if
  // available.
  _.bind = function(func, context) {
    if (typeof func != "function"){
        throw new TypeError( func + " is not a function" );
    }
    return nativeBind.apply(func, slice.call(arguments, 1));
/*
    var args = slice.call(arguments, 2);
    return function() {
      return func.apply(context, args.concat(slice.call(arguments)));
    };
*/
  };

  // Partially apply a function by creating a version that has had some of its
  // arguments pre-filled, without changing its dynamic `this` context.
  _.partial = function(func) {
    var args = slice.call(arguments, 1);
    return function() {
      return func.apply(this, args.concat(slice.call(arguments)));
    };
  };

  // Bind all of an object's methods to that object. Useful for ensuring that
  // all callbacks defined on an object belong to it.
  // TODO: should we remove each() ... and use native as well??
  _.bindAll = function(obj) {
    var funcs = slice.call(arguments, 1);
    if (funcs.length === 0) funcs = _.functions(obj);
    each(funcs, function(f) { obj[f] = _.bind(obj[f], obj); });
    return obj;
  };

  // Memoize an expensive function by storing its results.
  _.memoize = function(func, hasher) {
    var memo = {};
    hasher || (hasher = _.identity);
    return function() {
      var key = hasher.apply(this, arguments);
      return hasOwnProperty.call(memo, key) ? memo[key] : (memo[key] = func.apply(this, arguments));
    };
  };

  // Delays a function for the given number of milliseconds, and then calls
  // it with the arguments supplied.
  _.delay = function(func, wait) {
    var args = slice.call(arguments, 2);
    return setTimeout(function(){ return func.apply(null, args); }, wait);
  };

  // Defers a function, scheduling it to run after the current call stack has
  // cleared.
  _.defer = function(func) {
    return _.delay.apply(_, [func, 1].concat(slice.call(arguments, 1)));
  };

  // Returns a function, that, when invoked, will only be triggered at most once
  // during a given window of time.
  _.throttle = function(func, wait) {
    var context, args, timeout, result;
    var previous = 0;
    var later = function() {
      previous = new Date;
      timeout = null;
      result = func.apply(context, args);
    };
    return function() {
      var now = new Date;
      var remaining = wait - (now - previous);
      context = this;
      args = arguments;
      if (remaining <= 0) {
        clearTimeout(timeout);
        timeout = null;
        previous = now;
        result = func.apply(context, args);
      } else if (!timeout) {
        timeout = setTimeout(later, remaining);
      }
      return result;
    };
  };

  // Returns a function, that, as long as it continues to be invoked, will not
  // be triggered. The function will be called after it stops being called for
  // N milliseconds. If `immediate` is passed, trigger the function on the
  // leading edge, instead of the trailing.
  _.debounce = function(func, wait, immediate) {
    var timeout, result;
    return function() {
      var context = this, args = arguments;
      var later = function() {
        timeout = null;
        if (!immediate) result = func.apply(context, args);
      };
      var callNow = immediate && !timeout;
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
      if (callNow) result = func.apply(context, args);
      return result;
    };
  };

  // Returns a function that will be executed at most one time, no matter how
  // often you call it. Useful for lazy initialization.
  _.once = function(func) {
    var ran = false, memo;
    return function() {
      if (ran) return memo;
      ran = true;
      memo = func.apply(this, arguments);
      func = null;
      return memo;
    };
  };

  // Returns the first function passed as an argument to the second,
  // allowing you to adjust arguments, run code before and after, and
  // conditionally execute the original function.
  _.wrap = function(func, wrapper) {
    return function() {
      var args = [func];
      push.apply(args, arguments);
      return wrapper.apply(this, args);
    };
  };

  // Returns a function that is the composition of a list of functions, each
  // consuming the return value of the function that follows.
  _.compose = function() {
    var funcs = arguments;
    return function() {
      var args = arguments,
      i = funcs.length;
      while(i-->0) {
        args = [funcs[i].apply(this, args)];
      }
      return args[0];
    };
  };

  // Returns a function that will only be executed after being called N times.
  _.after = function(times, func) {
    if (times <= 0) return func();
    return function() {
      if (--times < 1) {
        return func.apply(this, arguments);
      }
    };
  };

  // Object Functions
  // ----------------

  // Retrieve the names of an object's properties.
  // Delegates to **ECMAScript 5**'s native `Object.keys`
  _.keys = nativeKeys;

  // Retrieve the values of an object's properties.
  _.values = function(obj) {
    var values = [];
    for (var key in obj) if (hasOwnProperty.call(obj, key)) values.push(obj[key]);
    return values;
  };

  // Convert an object into a list of `[key, value]` pairs.
  _.pairs = function(obj) {
    var pairs = [];
    for (var key in obj) if (hasOwnProperty.call(obj, key)) pairs.push([key, obj[key]]);
    return pairs;
  };

  // Invert the keys and values of an object. The values must be serializable.
  _.invert = function(obj) {
    var result = {};
    for (var key in obj) if (hasOwnProperty.call(obj, key)) result[obj[key]] = key;
    return result;
  };

  // Return a sorted list of the function names available on the object.
  // Aliased as `methods`
  _.functions = _.methods = function(obj) {
    var names = [];
    for (var key in obj) {
      if (_.isFunction(obj[key])) names.push(key);
    }
    return names.sort();
  };

  // Extend a given object with all the properties in passed-in object(s).
  _.extend = function(obj) {
    each(slice.call(arguments, 1), function(source) {
      if (source) {
        for (var prop in source) {
          obj[prop] = source[prop];
        }
      }
    });
    return obj;
  };

  _.extendIfNull = extendIfNull;

  // Return a copy of the object only containing the whitelisted properties.
  _.pick = function(obj) {
    var key,
    copy = {},
    props = concat.apply(ArrayProto, slice.call(arguments, 1));
    i = props.length;
    while(i-->0){
      key = props[i]
      if (key in obj) copy[key] = obj[key];
    };
    return copy;
  };

   // Return a copy of the object without the blacklisted properties.
  _.omit = function(obj) {
    var copy = {},
    keys = concat.apply(ArrayProto, slice.call(arguments, 1));
    for (var key in obj) {
      if (!_.contains(keys, key)) copy[key] = obj[key];
    }
    return copy;
  };

  // Fill in a given object with default properties.
  _.defaults = function(obj) {
    each(slice.call(arguments, 1), function(source) {
      if (source) {
        for (var prop in source) {
          if (obj[prop] == null) obj[prop] = source[prop];
        }
      }
    });
    return obj;
  };

  // Create a (shallow-cloned) duplicate of an object.
  _.clone = function(obj) {
    if (!_.isObject(obj)) return obj;
    return nativeIsArray(obj) ? obj.slice() : _.extend({}, obj);
  };

  // Invokes interceptor with the obj, and then returns obj.
  // The primary purpose of this method is to "tap into" a method chain, in
  // order to perform operations on intermediate results within the chain.
  _.tap = function(obj, interceptor) {
    interceptor(obj);
    return obj;
  };

  // Internal recursive comparison function for `isEqual`.
  var eq = function(a, b, aStack, bStack) {
    // Identical objects are equal. `0 === -0`, but they aren't identical.
    // See the Harmony `egal` proposal: http://wiki.ecmascript.org/doku.php?id=harmony:egal.
    if (a === b) return a !== 0 || 1 / a == 1 / b;
    // A strict comparison is necessary because `null == undefined`.
    if (a == null || b == null) return a === b;
    // Unwrap any wrapped objects.
    if (a instanceof _) a = a._wrapped;
    if (b instanceof _) b = b._wrapped;
    // Compare `[[Class]]` names.
    var className = toString.call(a);
    if (className != toString.call(b)) return false;
    switch (className) {
      // Strings, numbers, dates, and booleans are compared by value.
      case '[object String]':
        // Primitives and their corresponding object wrappers are equivalent; thus, `"5"` is
        // equivalent to `new String("5")`.
        return a == String(b);
      case '[object Number]':
        // `NaN`s are equivalent, but non-reflexive. An `egal` comparison is performed for
        // other numeric values.
        return a != +a ? b != +b : (a == 0 ? 1 / a == 1 / b : a == +b);
      case '[object Date]':
      case '[object Boolean]':
        // Coerce dates and booleans to numeric primitive values. Dates are compared by their
        // millisecond representations. Note that invalid dates with millisecond representations
        // of `NaN` are not equivalent.
        return +a == +b;
      // RegExps are compared by their source patterns and flags.
      case '[object RegExp]':
        return a.source == b.source &&
               a.global == b.global &&
               a.multiline == b.multiline &&
               a.ignoreCase == b.ignoreCase;
    }
    if (typeof a != 'object' || typeof b != 'object') return false;
    // Assume equality for cyclic structures. The algorithm for detecting cyclic
    // structures is adapted from ES 5.1 section 15.12.3, abstract operation `JO`.
    var length = aStack.length;
    while (length--) {
      // Linear search. Performance is inversely proportional to the number of
      // unique nested structures.
      if (aStack[length] == a) return bStack[length] == b;
    }
    // Add the first object to the stack of traversed objects.
    aStack.push(a);
    bStack.push(b);
    var size = 0, result = true;
    // Recursively compare objects and arrays.
    if (className == '[object Array]') {
      // Compare array lengths to determine if a deep comparison is necessary.
      size = a.length;
      result = size == b.length;
      if (result) {
        // Deep compare the contents, ignoring non-numeric properties.
        while (size--) {
          if (!(result = eq(a[size], b[size], aStack, bStack))) break;
        }
      }
    } else {
      // Objects with different constructors are not equivalent, but `Object`s
      // from different frames are.
      var aCtor = a.constructor, bCtor = b.constructor;
      if (aCtor !== bCtor && !(_.isFunction(aCtor) && (aCtor instanceof aCtor) &&
                               _.isFunction(bCtor) && (bCtor instanceof bCtor))) {
        return false;
      }
      // Deep compare objects.
      for (var key in a) {
        if (hasOwnProperty.call(a, key)) {
          // Count the expected number of properties.
          size++;
          // Deep compare each member.
          if (!(result = hasOwnProperty.call(b, key) && eq(a[key], b[key], aStack, bStack))) break;
        }
      }
      // Ensure that both objects contain the same number of properties.
      if (result) {
        for (key in b) {
          if (hasOwnProperty.call(b, key) && !(size--)) break;
        }
        result = !size;
      }
    }
    // Remove the first object from the stack of traversed objects.
    aStack.pop();
    bStack.pop();
    return result;
  };

  // Perform a deep comparison to check if two objects are equal.
  _.isEqual = function(a, b) {
    return eq(a, b, [], []);
  };

  // Is a given array, string, or object empty?
  // An "empty" object has no enumerable own-properties.
  _.isEmpty = function(obj) {
    if (obj == null) return true;
    if (nativeIsArray(obj) || _.isString(obj)) return obj.length === 0;
    for (var key in obj) if (hasOwnProperty.call(obj, key)) return false;
    return true;
  };

  // Is a given value a DOM element?
  _.isElement = function(obj) {
    return !!(obj && obj.nodeType === 1);
  };

  // Is a given value an array?
  // Delegates to ECMA5's native Array.isArray
  _.isArray = nativeIsArray;

  _.isArrayLike = isArrayLike;

  // Is a given variable an object?
  _.isObject = function(obj) {
    return obj === Object(obj);
  };

  // Add some isType methods: isArguments, isFunction, isString, isNumber, isDate, isRegExp.
  // ... well not isFunction, isString, isNumber we optimized those.
  each(['Arguments', 'Date', 'RegExp'], function(name) {
    _['is' + name] = function(obj) {
      return toString.call(obj) == '[object ' + name + ']';
    };
  });

  // Define a fallback version of the method in browsers (ahem, IE), where
  // there isn't any inspectable "Arguments" type.
  if (!_.isArguments(arguments)) {
    _.isArguments = function(obj) {
      return !!(obj && hasOwnProperty.call(obj, 'callee'));
    };
  }

  // Optimize `isFunction` if appropriate.
  /*if (typeof (/./) !== 'function') {
    _.isFunction = function(obj) {
      return typeof obj === 'function';
    };
  }*/

  // Is a given value a function?  Optimized!
  _.isFunction = function(obj) {
    return obj instanceof Function  //blaringly fast, so check first..
		|| typeof obj == 'function';  //works in another window, way faster than toString.call(obj)
  };

  // Is a given value a string?
  _.isString = function(obj) {
    //return toString.call(obj) == '[object String]';
    return  typeof obj == 'string' || //blaringly fast
		//obj instanceof String || //maybe skip this... less checks
		toString.call(obj) == '[object String]';
  };

  // Is a given value a number?
  _.isNumber = function(obj) {
    return typeof obj == 'number' || toString.call(obj) == '[object Number]';
  };

  // Is a given object a finite number?
  _.isFinite = function(obj) {
    return isFinite(obj) && !isNaN(parseFloat(obj));
  };

  // Is the given value `NaN`? (NaN is the only number which does not equal itself).
  _.isNaN = function(obj) {
    return _.isNumber(obj) && obj != +obj;
    // `NaN` is the only value for which `===` is not reflexive.
    //return obj !== obj;
    //TODO: optimize / speed check
  };

  // Is a given value a boolean?
  _.isBoolean = function(obj) {
    return obj === true || obj === false || toString.call(obj) == '[object Boolean]';
  };

  // Is a given value equal to null?
  _.isNull = function(obj) {
    return obj === null;
  };

  // Is a given variable undefined?
  _.isUndefined = function(obj) {
    return obj === void 0;
  };

  // Shortcut function for checking if an object has a given property directly
  // on itself (in other words, not on a prototype).
  _.has = function(obj, key) {
    return hasOwnProperty.call(obj, key);
  };

  // Utility Functions
  // -----------------

  // Run Underscore.js in *noConflict* mode, returning the `_` variable to its
  // previous owner. Returns a reference to the Underscore object.
  _.noConflict = function() {
    root._ = previousUnderscore;
    return this;
  };

  // Keep the identity function around for default iterators.
  _.identity = function(value) {
    return value;
  };

  // Run a function **n** times.
  _.times = function(n, iterator, context) {
    var accum = Array(n);
    for (var i = 0; i < n; i++) accum[i] = iterator.call(context, i);
    return accum;
  };

  // Return a random integer between min and max (inclusive).
  _.random = function(min, max) {
    if (max == null) {
      max = min;
      min = 0;
    }
    var r = min + Math.floor(Math.random() * (max - min + 1));
    return r > max ? max : r; //check for limit case Math.random()=1.0
  };

  // List of HTML entities for escaping.
  var entityMap = {
    escape: {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#x27;',
      '/': '&#x2F;'
    }
  };
  entityMap.unescape = _.invert(entityMap.escape);

  // Regexes containing the keys and values listed immediately above.
  var entityRegexes = {
    escape:   new RegExp('[' + nativeKeys(entityMap.escape).join('') + ']', 'g'),
    unescape: new RegExp('(' + nativeKeys(entityMap.unescape).join('|') + ')', 'g')
  };

  // Functions for escaping and unescaping strings to/from HTML interpolation.
  _.each(['escape', 'unescape'], function(method) {
    _[method] = function(string) {
      if (string == null) return '';
      return ('' + string).replace(entityRegexes[method], function(match) {
        return entityMap[method][match];
      });
    };
  });

  // If the value of the named property is a function then invoke it;
  // otherwise, return it.
  _.result = function(object, property) {
    if (object == null) return void 0;
    var value = object[property];
    return _.isFunction(value) ? value.call(object) : value;
  };

  // Add your own custom functions to the Underscore object.
  _.mixin = function(obj) {
    each(_.functions(obj), function(name){
      var func = _[name] = obj[name];
      _.prototype[name] = function() {
        var args = [this._wrapped];
        push.apply(args, arguments);
        return result.call(this, func.apply(_, args));
      };
    });
  };

  // Generate a unique integer id (unique within the entire client session).
  // Useful for temporary DOM ids.
  var idCounter = 0;
  _.uniqueId = function(prefix) {
    var id = ++idCounter + '';
    return prefix ? prefix + id : id;
  };

  // By default, Underscore uses ERB-style template delimiters, change the
  // following template settings to use alternative delimiters.
  _.templateSettings = {
    evaluate    : /<%([\s\S]+?)%>/g,
    interpolate : /<%=([\s\S]+?)%>/g,
    escape      : /<%-([\s\S]+?)%>/g
  };

  // When customizing `templateSettings`, if you don't want to define an
  // interpolation, evaluation or escaping regex, we need one that is
  // guaranteed not to match.
  var noMatch = /(.)^/;

  // Certain characters need to be escaped so that they can be put into a
  // string literal.
  var escapes = {
    "'":      "'",
    '\\':     '\\',
    '\r':     'r',
    '\n':     'n',
    '\t':     't',
    '\u2028': 'u2028',
    '\u2029': 'u2029'
  };

  var escaper = /\\|'|\r|\n|\t|\u2028|\u2029/g;

  // JavaScript micro-templating, similar to John Resig's implementation.
  // Underscore templating handles arbitrary delimiters, preserves whitespace,
  // and correctly escapes quotes within interpolated code.
  _.template = function(text, data, settings) {
    var render;
    settings = _.defaults({}, settings, _.templateSettings);

    // Combine delimiters into one regular expression via alternation.
    var matcher = new RegExp([
      (settings.escape || noMatch).source,
      (settings.interpolate || noMatch).source,
      (settings.evaluate || noMatch).source
    ].join('|') + '|$', 'g');

    // Compile the template source, escaping string literals appropriately.
    var index = 0;
    var source = "__p+='";
    text.replace(matcher, function(match, escape, interpolate, evaluate, offset) {
      source += text.slice(index, offset)
        .replace(escaper, function(match) { return '\\' + escapes[match]; });

      if (escape) {
        source += "'+\n((__t=(" + escape + "))==null?'':_.escape(__t))+\n'";
      }
      if (interpolate) {
        source += "'+\n((__t=(" + interpolate + "))==null?'':__t)+\n'";
      }
      if (evaluate) {
        source += "';\n" + evaluate + "\n__p+='";
      }
      index = offset + match.length;
      return match;
    });
    source += "';\n";

    // If a variable is not specified, place data values in local scope.
    if (!settings.variable) source = 'with(obj||{}){\n' + source + '}\n';

    source = "var __t,__p='',__j=Array.prototype.join," +
      "print=function(){__p+=__j.call(arguments,'');};\n" +
      source + "return __p;\n";

    try {
      render = new Function(settings.variable || 'obj', '_', source);
    } catch (e) {
      e.source = source;
      throw e;
    }

    if (data) return render(data, _);
    var template = function(data) {
      return render.call(this, data, _);
    };

    // Provide the compiled function source as a convenience for precompilation.
    template.source = 'function(' + (settings.variable || 'obj') + '){\n' + source + '}';

    return template;
  };

  // Add a "chain" function, which will delegate to the wrapper.
  _.chain = function(obj) {
    return _(obj).chain();
  };

  // OOP
  // ---------------
  // If Underscore is called as a function, it returns a wrapped object that
  // can be used OO-style. This wrapper holds altered versions of all the
  // underscore functions. Wrapped objects may be chained.

  // Helper function to continue chaining intermediate results.
  var result = function(obj) {
    return this._chain ? _(obj).chain() : obj;
  };

  // Add all of the Underscore functions to the wrapper object.
  _.mixin(_);

  // Add all mutator Array functions to the wrapper.
  each(['pop', 'push', 'reverse', 'shift', 'sort', 'splice', 'unshift'], function(name) {
    var method = ArrayProto[name];
    _.prototype[name] = function() {
      var obj = this._wrapped;
      method.apply(obj, arguments);
      if ((name == 'shift' || name == 'splice') && obj.length === 0) delete obj[0];
      return result.call(this, obj);
    };
  });

  // Add all accessor Array functions to the wrapper.
  each(['concat', 'join', 'slice'], function(name) {
    var method = ArrayProto[name];
    _.prototype[name] = function() {
      return result.call(this, method.apply(this._wrapped, arguments));
    };
  });

  _.extend(_.prototype, {

    // Start chaining a wrapped Underscore object.
    chain: function() {
      this._chain = true;
      return this;
    },

    // Extracts the result from a wrapped and chained object.
    value: function() {
      return this._wrapped;
    }

  });

}).call(this);
