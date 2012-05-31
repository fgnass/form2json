var qs = require('querystring')

/**
 * Returns the specified property of the given object. If the object has no such property,
 * the property is set to the given value.
 */
function setIfAbsent(obj, prop, value) {
  var v = obj[prop]
  if (!v) v = obj[prop] = value
  return v
}

/**
 * Pushes all values to the given array, converting numbers if necessary.
 */
function pushAll(a, values) {
  for (var i=0; i < values.length; i++) {
    var v = values[i]
    if (!isNaN(v)) v = +v
    a.push(v)
  }
}

/**
 * Returns a reduce-function that merges parameters into a target object.
 */
function fillIn() {
  var dict = {}

  function resolve(path, prop) {
    var d = dict[path]
    if (!d) {
      d = dict[path] = {index: 0}
    }
    var i = d[prop]
    if (i === undefined) {
      i = d[prop] = d.index++
    }
    return i
  }

  return function self(target, param) {
    var m = /^((.*?)\]?)(?:(\[|\.)(.+))?$/.exec(param.name)
    if (m) {
      var head = m[1]
        , prop = m[2]
        , op = m[3]
        , tail = m[4]
        , nested

      if (target instanceof Array && isNaN(prop)) {
        prop = resolve(param.path, prop)
      }

      if (tail) {
        nested = setIfAbsent(target, prop, op == '[' ? [] : {})
        self(nested, {
          name: tail,
          path: (param.path || '') + head + op,
          value: param.value
        })
      }
      else {
        if (prop === '' && target instanceof Array) {
          pushAll(target, param.value)
        }
        else {
          target[prop] = param.value
        }
      }
    }
    return target
  }
}

/**
 * Transforms a flat object into a hierarchy using the same rules as decode().
 */
exports.transform = function(obj) {
  var pairs = []
  for (var name in obj) {
    if (obj.hasOwnProperty(name)) {
      var val = obj[name]
      if (!isNaN(val)) val = +val
      pairs.push({name: name, value: val})
    }
  }
  return pairs.reduce(fillIn(), {})
}

var rplus = /\+/g

exports.decode = function(data) {
  var body = qs.parse(data)
  return exports.transform(body)
};

/**
 * Connect middleware that adds a `req.json` property.
 * @param flatBody If `true`, connect's default decoder for
 *  application/x-www-form-urlencoded data is overwritten with
 * `querystring.parse`. Hence `req.body` will be a *flat* object,
 *  whereas `req.json` will be nested object graph.
 */
exports.middleware = function(flatBody) {

  if (flatBody) {
    require('connect').middleware.bodyDecoder.decode['application/x-www-form-urlencoded'] = qs.parse
  }

  return function form2json(req, res, next) {
    var body;
    if (!req.json) {
      try {
        if (flatBody) {
          body = req.body
        }
        else {
          body = qs.parse(rawBody)
        }
        req.json = body ? exports.transform(body) : {}
      }
      catch (err) {
        return next(err)
      }
      next()
    }
    else {
      next()
    }
  }
}
