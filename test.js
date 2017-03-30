var test = require('tape')
var xml2js = require('xml2js')
var checkstyleFormatter = require('./index')

var mockResults = [
  {
    source: 'path/to/fileA.css',
    errored: false,
    warnings: [
      {
        line: 3,
        column: 8,
        rule: 'block-no-empty',
        severity: 'warning',
        text: 'No empty block!'
      }
    ]
  },
  {
    source: 'path/to/fileB.css',
    errors: true,
    warnings: [
      {
        line: 1,
        column: 2,
        rule: 'foo',
        severity: 'error',
        text: 'foo text'
      },
      {
        line: 2,
        column: 5,
        rule: 'bar',
        severity: 'error',
        text: 'bar text'
      }
    ]
  },
  {
    source: 'path/to/fileC.css',
    errors: false,
    warnings: []
  }
]

var expectedXml = '<?xml version="1.0" encoding="utf-8"?><checkstyle version="4.3"><file name="path/to/fileA.css"><error source="stylelint.rules.block-no-empty" line="3" column="8" severity="warning" message="No empty block!" /></file><file name="path/to/fileB.css"><error source="stylelint.rules.foo" line="1" column="2" severity="error" message="foo text" /><error source="stylelint.rules.bar" line="2" column="5" severity="error" message="bar text" /></file><file name="path/to/fileC.css"></file></checkstyle>'

test('output XML string', function (t) {
  var output = checkstyleFormatter(mockResults)
  t.equal(output, expectedXml, 'matches expectation')
  t.doesNotThrow(function () {
    xml2js.parseString(output, function (err) {
      if (err) throw err
    })
  }, 'is valid XML')
  t.end()
})
