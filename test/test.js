var assert = require('assert')
  , form2json = require('..')

function test(input, json) {
	return function() {
		var obj = typeof input == 'string' ? form2json.decode(input) : form2json.transform(input)
		assert.deepEqual(obj, json)
	}
}

module.exports = {
	strings: test('a=a&b=b', {a: 'a', b: 'b'}),
	numbers: test('a=1&b=2.2', {a: 1, b: 2.2}),
	nested: test('a=a&b.a=ba&b.b=bb', {a: 'a', b: {a: 'ba', b: 'bb'}}),
	transformNested: test({a: 'a', 'b.a': 'ba', 'b.b': 'bb'}, {a: 'a', b: {a: 'ba', b: 'bb'}}),
	deeplyNested: test('a.a.a=aaa&a.b=ab', {a: {a: {a: 'aaa'}, b: 'ab'}}),
	transformDeeplyNested: test({'a.a.a' : 'aaa', 'a.b' : 'ab'}, {a: {a: {a: 'aaa'}, b: 'ab'}}),
	array: test('a[0]=0&a[1]=1&a[2]=2', {a: [0, 1, 2]}),
	reverseArray: test('a[2]=0&a[1]=1&a[0]=2', {a: [2, 1, 0]}),
	orderedArray: test('a[x]=0&a[z]=1&a[y]=2', {a: [0, 1, 2]}),
	arrayPush: test('a[]=0&a[]=1&a[]=2', {a: [0, 1, 2]}),
	nestedArrays: test('a[0][0]=a00&a[0][1]=a01&a[1][0]=a10&a[1][1]=a11', {a: [['a00', 'a01'], ['a10', 'a11']]}),
	unescapedEqualSigns: test('a=b=b&b=c=c', {a: 'b=b', b: 'c=c'})
}
