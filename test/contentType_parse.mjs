import { strictEqual, ok, throws } from 'node:assert'
import { parse } from '../index.mjs'
import deepEqual from 'deep-equal'

const invalidTypes = [
  ' ',
  'null',
  'undefined',
  '/',
  'text / plain',
  'text/;plain',
  'text/"plain"',
  'text/p£ain',
  'text/(plain)',
  'text/@plain',
  'text/plain,wrong'
]

describe('contentType.parse(string) [esm]', function () {
  it('should parse basic type', function () {
    const type = parse('text/html')
    strictEqual(type.type, 'text/html')
  })

  it('should parse with suffix', function () {
    const type = parse('image/svg+xml')
    strictEqual(type.type, 'image/svg+xml')
  })

  it('should parse basic type with surrounding OWS', function () {
    const type = parse(' text/html ')
    strictEqual(type.type, 'text/html')
  })

  it('should parse parameters', function () {
    const type = parse('text/html; charset=utf-8; foo=bar')
    strictEqual(type.type, 'text/html')
    ok(deepEqual(type.parameters, {
      charset: 'utf-8',
      foo: 'bar'
    }))
  })

  it('should parse parameters with extra LWS', function () {
    const type = parse('text/html ; charset=utf-8 ; foo=bar')
    strictEqual(type.type, 'text/html')
    ok(deepEqual(type.parameters, {
      charset: 'utf-8',
      foo: 'bar'
    }))
  })

  it('should lower-case type', function () {
    const type = parse('IMAGE/SVG+XML')
    strictEqual(type.type, 'image/svg+xml')
  })

  it('should lower-case parameter names', function () {
    const type = parse('text/html; Charset=UTF-8')
    strictEqual(type.type, 'text/html')
    ok(deepEqual(type.parameters, {
      charset: 'UTF-8'
    }))
  })

  it('should unquote parameter values', function () {
    const type = parse('text/html; charset="UTF-8"')
    strictEqual(type.type, 'text/html')
    ok(deepEqual(type.parameters, {
      charset: 'UTF-8'
    }))
  })

  it('should unquote parameter values with escapes', function () {
    const type = parse('text/html; charset = "UT\\F-\\\\\\"8\\""')
    strictEqual(type.type, 'text/html')
    ok(deepEqual(type.parameters, {
      charset: 'UTF-\\"8"'
    }))
  })

  it('should handle balanced quotes', function () {
    const type = parse('text/html; param="charset=\\"utf-8\\"; foo=bar"; bar=foo')
    strictEqual(type.type, 'text/html')
    ok(deepEqual(type.parameters, {
      param: 'charset="utf-8"; foo=bar',
      bar: 'foo'
    }))
  })

  invalidTypes.forEach(function (type) {
    it('should throw on invalid media type ' + type, function () {
      throws(parse.bind(null, type), /invalid media type/)
    })
  })

  it('should throw on invalid parameter format', function () {
    throws(parse.bind(null, 'text/plain; foo="bar'), /invalid parameter format/)
    throws(parse.bind(null, 'text/plain; profile=http://localhost; foo=bar'), /invalid parameter format/)
    throws(parse.bind(null, 'text/plain; profile=http://localhost'), /invalid parameter format/)
  })

  it('should require argument', function () {
    throws(parse.bind(null), /string.*required/)
  })

  it('should reject non-strings', function () {
    throws(parse.bind(null, 7), /string.*required/)
  })
})

describe('contentType.parse(req) [esm]', function () {
  it('should parse content-type header', function () {
    const req = { headers: { 'content-type': 'text/html' } }
    const type = parse(req)
    strictEqual(type.type, 'text/html')
  })

  it('should reject objects without headers property', function () {
    throws(parse.bind(null, {}), /content-type header is missing/)
  })

  it('should reject missing content-type', function () {
    const req = { headers: {} }
    throws(parse.bind(null, req), /content-type header is missing/)
  })
})

describe('contentType.parse(res) [esm]', function () {
  it('should parse content-type header', function () {
    const res = { getHeader: function () { return 'text/html' } }
    const type = parse(res)
    strictEqual(type.type, 'text/html')
  })

  it('should reject objects without getHeader method', function () {
    throws(parse.bind(null, {}), /content-type header is missing/)
  })

  it('should reject missing content-type', function () {
    const res = { getHeader: function () { } }
    throws(parse.bind(null, res), /content-type header is missing/)
  })
})
