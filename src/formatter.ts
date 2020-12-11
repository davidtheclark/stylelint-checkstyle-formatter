import { LintResult, Warning } from 'stylelint';
import { CheckstyleReport } from './checkstyle-report';
import { XMLWriterOptions } from 'xmlbuilder2/lib/interfaces';

export const stylelintToCheckstyle = (stylelintResults: LintResult[], outputConfig?: XMLWriterOptions): string => {
    const checkStyleReport = new CheckstyleReport();
    stylelintResults.forEach((stylelintResult: LintResult) => {
        checkStyleReport.startFile(stylelintResult.source);
        stylelintResult.warnings.forEach((warning: Warning) => {
            checkStyleReport.addError({
                source: `stylelint.rules.${warning.rule}`,
                column: warning.column,
                line: warning.line,
                severity: warning.severity,
                message: warning.text,
            });
        });
        checkStyleReport.endFile();
    });
    return checkStyleReport.generate(outputConfig);
};
