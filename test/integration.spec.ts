import { exec } from 'child_process';
import { bindCallback, firstValueFrom, from, Observable, of } from 'rxjs';
import { catchError, map, switchMap, timeout } from 'rxjs/operators';
import { promises as fs } from 'fs';
import { convert } from 'xmlbuilder2';
import { F_OK } from 'constants';

const DEFAULT_REPORT_FILE = 'test/temp/report.xml';

const generateCommand = (formatter?: string, reportFile?: string) =>
    `npx stylelint ./test/assets/*.scss --config test/config/.stylelintrc.json --custom-formatter ${
        formatter ?? 'index.js'
    } -o ${reportFile ?? DEFAULT_REPORT_FILE}`;

describe('integration with stylelint', () => {
    beforeAll(async () => {
        await firstValueFrom(
            from(fs.access('dist/index.js', F_OK)).pipe(
                timeout(3 * 1000),
                catchError(() => {
                    console.warn("The file 'dist/index.js' could not be found. Did you compile the project first?");
                    return of(undefined);
                }),
            ),
        );
    });

    it('should produce an xml file', async () => {
        const boundExec = bindCallback(exec);
        const REPORT_FILE = DEFAULT_REPORT_FILE;
        const command = generateCommand();
        const xmlContent = await firstValueFrom(
            from(fs.unlink(REPORT_FILE)).pipe(
                catchError(() => of(null)),
                switchMap(() => boundExec(command, {})),
                switchMap((): Observable<Buffer> => from(fs.readFile(REPORT_FILE))),
                map((buffer: Buffer): string => buffer.toString()),
            ),
        );
        expect(xmlContent).toContain('<checkstyle');
        expect(xmlContent).not.toContain('\n');
        const f = () => convert(xmlContent, { format: 'object' });
        expect(f).not.toThrow();
    });

    it('should generate linebreaks with pretty formatting', async () => {
        const boundExec = bindCallback(exec);
        const reportFile = 'test/temp/report_pretty.xml';
        const command = generateCommand('examples/prettyprint.js', reportFile);
        const xmlContent = await firstValueFrom(
            from(fs.unlink(reportFile)).pipe(
                catchError((): Observable<null> => of(null)),
                switchMap((): Observable<unknown> => boundExec(command, {})),
                switchMap((): Observable<Buffer> => from(fs.readFile(reportFile))),
                map((buffer: Buffer): string => buffer.toString()),
            ),
        );
        expect(xmlContent).toContain('<checkstyle');
        expect(xmlContent).toContain('\n');
        const f = () => convert(xmlContent, { format: 'object' });
        expect(f).not.toThrow();
    });

    it.each(['<<', 'not xml string'])('should not use a library that accepts wrong strings, %p', (notXML) => {
        const f = () => convert(notXML, { format: 'object' });
        expect(f).toThrow();
    });
});
