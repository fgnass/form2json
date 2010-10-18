exports.decode = function(data) {
    return data.split('&').map(splitPair).reduce(fillIn(), {});
};

/**
 * A safe and fast alternative to decodeURIComponent
 */
exports.unescape = process.binding("http_parser").urlDecode;


/**
 * Returns the specified property of the given object. If the object has no such property,
 * the property is set to the given value.
 */
function putIfAbsent(obj, prop, value) {
	var v = obj[prop];
	if (!v) {
		v = obj[prop] = value;
	}
	return v;
}

/**
 * Returns a reduce-function that merges parameters into a target object.
 */
function fillIn() {
	
	var dict = {};
	var resolve = function(path, prop) {
		var d = dict[path];
		if (!d) {
			d = dict[path] = {index: 0};
		}
		var i = d[prop];
		if (i === undefined) {
			i = d[prop] = d.index++;
		}
		return i;
	}; 

	return function self(target, param) {
		var m = /^((.*?)\]?)(?:(\[|\.)(.+))?$/.exec(param.name);
		if (m) {
			var head = m[1],
				prop = m[2],
				op = m[3],
				tail = m[4],
				nested;

			if (target instanceof Array && isNaN(prop)) {
				prop = resolve(param.path, prop);
			}
		
			if (tail) {
				nested = putIfAbsent(target, prop, op == '[' ? [] : {});
				self(nested, {
					name: tail, 
					path: (param.path || '') + head + op,
					value: param.value
				});
			}
			else {
				if (prop === '' && target instanceof Array) {
					target.push(param.value);
				}
				else {
					target[prop] = param.value;
				}
			}
		}
		return target;
	};
}

/**
 * Splits the given key-value pair at the equals sign and returns an object holding the unescaped parts.
 */
function splitPair(pair) {
	var s = pair.split('=');
	return {
		name: exports.unescape(s.shift()),
		value: exports.unescape(s.join('=')) || ''
	};
}
