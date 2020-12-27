import { CheckstyleError, CheckstyleReport } from './checkstyle-report';
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

    it('adds all the required attributes', () => {
        checkstyleReport.startFile('test.js');
        const checkstyleError: CheckstyleError = {
            column: 33,
            line: 92,
            message: 'This should be different',
            severity: 'warning',
            source: 'warning_source',
        };
        checkstyleReport.addError(checkstyleError);
        checkstyleReport.endFile();
        const xml: string = checkstyleReport.generate();
        const parsed = convert(xml, { format: 'object' });
        if (!Array.isArray(parsed)) {
            const checkstyleElement = parsed.checkstyle;
            expect(checkstyleElement).toBeTruthy();
            if (typeof checkstyleElement === 'string' || Array.isArray(checkstyleElement)) {
                fail();
            }
            const file = checkstyleElement.file;
            if (Array.isArray(file) || typeof file === 'string') {
                fail();
                return;
            }
            const error = file.error;
            if (Array.isArray(error) || typeof error === 'string') {
                fail();
                return;
            }
            for (const [key, value] of Object.entries(checkstyleError)) {
                expect(error[`@${key}`]).toBe(value.toString());
            }
            expect(Object.keys(error).length).toBe(Object.keys(checkstyleError).length);
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
