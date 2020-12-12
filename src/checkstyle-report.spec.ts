import { CheckstyleReport } from './checkstyle-report';
import { convert } from 'xmlbuilder2';

describe('CheckstyleReport', () => {
    let checkstyleReport: CheckstyleReport;

    beforeEach(() => {
        checkstyleReport = new CheckstyleReport();
    });

    it('generates a report', () => {
        checkstyleReport.startFile('test.js');
        checkstyleReport.addError({
            severity: 'warning',
            message: 'do not do this',
            line: 32,
            column: 31,
            source: 'my checkstyle rule',
        });
        checkstyleReport.addError({
            severity: 'error',
            message: 'do not do this',
            line: 32,
            column: 31,
            source: 'my checkstyle rule',
        });
        const result = checkstyleReport.generate({
            prettyPrint: true,
        });

        const obj = convert(result, { format: 'object' });
        if (!Array.isArray(obj)) {
            expect(obj['checkstyle']).toBeTruthy();
        } else {
            fail();
        }
    });

    it('does not allow us to start two files at the same time', () => {
        checkstyleReport.startFile('test.js');
        const f = () => {
            checkstyleReport.startFile('test2.js');
        };
        expect(f).toThrow();
    });

    it('can have more than one file', () => {
        checkstyleReport.startFile('test.js');
        checkstyleReport.endFile();
        checkstyleReport.startFile('test2.js');
        checkstyleReport.endFile();
        checkstyleReport.startFile('test3.js');
        const xml = checkstyleReport.generate();
        const parsed = convert(xml, { format: 'object' });
        if (!Array.isArray(parsed)) {
            const checkstyleElement = parsed.checkstyle;
            expect(checkstyleElement).toBeTruthy();
            if (typeof checkstyleElement === 'string' || Array.isArray(checkstyleElement)) {
                fail();
            }
            expect(Array.isArray(checkstyleElement.file)).toBe(true);
            expect(checkstyleElement.file.length).toBe(3);
        } else {
            fail();
        }
    });

    it('crashes when misused', () => {
        let f = () => {
            checkstyleReport.addError({
                severity: 'warning',
                message: 'do not do this',
                line: 32,
                column: 31,
                source: 'my checkstyle rule',
            });
        };
        expect(f).toThrow();
        f = () => {
            checkstyleReport.endFile();
        };
        expect(f).toThrow();
    });
});
