import { escape } from 'lodash';
import { LintResult } from 'stylelint';

const checkstyleVersion = '4.3'; // Why? Because that's what ESLint uses, I suppose

export const stylelintToCheckstyle: (results: LintResult[]) => string = (
    stylelintResults: LintResult[],
): string => {
    let xml = '<?xml version="1.0" encoding="utf-8"?>';
    xml += '\n<checkstyle version="' + checkstyleVersion + '">';
    stylelintResults.forEach((stylelintResult: LintResult) => {
        xml += '\n  <file name="' + escape(stylelintResult.source) + '">';
        if (!stylelintResult.warnings.length) {
            xml += '</file>';
            return;
        }
        stylelintResult.warnings.forEach(function (warning) {
            xml +=
                '\n    <error source="' +
                escape('stylelint.rules.' + warning.rule) +
                '" ';
            xml += 'line="' + escape(warning.line.toString()) + '" ';
            xml += 'column="' + escape(warning.column.toString()) + '" ';
            xml += 'severity="' + escape(warning.severity) + '" ';
            xml += 'message="' + escape(warning.text) + '" ';
            xml += '/>';
        });
        xml += '\n  </file>';
    });
    xml += '\n</checkstyle>';
    return xml;
};
