var _ = require('lodash');
var checkstyleVersion = '4.3'; // Why? Because that's what ESLint uses, I suppose

module.exports = function(stylelintResults) {
  var xml = '<?xml version="1.0" encoding="utf-8"?>';
  xml += '\n<checkstyle version="' + checkstyleVersion + '">';
  stylelintResults.forEach(function(stylelintResult) {
    xml += '\n  <file name="' + _.escape(stylelintResult.source) + '">';
    if (!stylelintResult.warnings.length) {
      xml += '</file>';
      return;
    }
    stylelintResult.warnings.forEach(function(warning) {
      xml += '\n    <error source="' + _.escape('stylelint.rules.' + warning.rule) + '" ';
      xml += 'line="' + _.escape(warning.line) + '" ';
      xml += 'column="' + _.escape(warning.column) + '" ';
      xml += 'severity="' + _.escape(warning.severity) + '" ';
      xml += 'message="' + _.escape(warning.text) + '" ';
      xml += '/>';
    });
    xml += '\n  </file>';
  });
  xml += '\n</checkstyle>';
  return xml;
}
