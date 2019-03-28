import test from 'ava'

import loadYaml, {getKeysRecursive, getValueByKey} from '../source/lib/load-yaml'

const exampleJson = {
	a: {
		b: 'foo',
		c: {
			d: 'bar'
		}
	}
}

test('getKeysRecursive', t => {
	t.deepEqual(getKeysRecursive(exampleJson), [
		'a.b', 'a.c.d'
	])
})

test('getValueByKey', t => {
	t.is(getValueByKey(exampleJson, 'a.b'), 'foo')
	t.is(getValueByKey(exampleJson, 'a.c.d'), 'bar')
})

test('loadYaml', t => {
	const input = `a:
  b:
    c: foo
    d: bar
  e: Hi!`
	t.deepEqual(loadYaml(input), {
		'a.b.c': 'foo',
		'a.b.d': 'bar',
		'a.e': 'Hi!'
	})
})
