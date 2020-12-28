import { exec, ExecException } from 'child_process';
import { bindCallback, from, Observable, of, Subscription } from 'rxjs';
import { catchError, map, switchMap, tap, timeout } from 'rxjs/operators';
import { promises as fs } from 'fs';
import { convert } from 'xmlbuilder2';
import { F_OK } from 'constants';
import DoneCallback = jest.DoneCallback;

const DEFAULT_REPORT_FILE = 'test/temp/report.xml';

const generateCommand = (formatter?: string, reportFile?: string) =>
    `npx stylelint ./test/assets/*.scss --config test/config/.stylelintrc.json --custom-formatter ${
        formatter ?? 'index.js'
    } -o ${reportFile ?? DEFAULT_REPORT_FILE}`;

describe('integration with stylelint', () => {
    let subscription: Subscription;

    beforeAll((done: DoneCallback) => {
        from(fs.access('dist/index.js', F_OK))
            .pipe(
                timeout(3 * 1000),
                catchError(() => {
                    console.warn("The file 'dist/index.js' could not be found. Did you compile the project first?");
                    return of(undefined);
                }),
                tap(() => done()),
            )
            .subscribe();
    });

    beforeEach(() => {
        subscription = new Subscription();
    });

    afterEach(() => {
        subscription.unsubscribe();
    });

    it('should produce an xml file', (done: DoneCallback) => {
        const boundExec = bindCallback(exec);
        const REPORT_FILE = DEFAULT_REPORT_FILE;
        const command = generateCommand();
        subscription.add(
            from(fs.unlink(REPORT_FILE))
                .pipe(
                    catchError(() => of(null)),
                    switchMap(() => boundExec(command)),
                    switchMap((): Observable<Buffer> => from(fs.readFile(REPORT_FILE))),
                    map((buffer: Buffer): string => buffer.toString()),
                    tap((xmlContent: string): void => {
                        expect(xmlContent).toContain('<checkstyle');
                        expect(xmlContent).not.toContain('\n');
                        const f = () => convert(xmlContent, { format: 'object' });
                        expect(f).not.toThrow();
                    }),
                    tap((): void => done()),
                )
                .subscribe(),
        );
    });

    it('should generate linebreaks with pretty formatting', (done: DoneCallback) => {
        const boundExec = bindCallback<string, ExecException | null, string | Buffer, string | Buffer>(exec);
        const reportFile = 'test/temp/report_pretty.xml';
        const command = generateCommand('examples/prettyprint.js', reportFile);
        subscription.add(
            from(fs.unlink(reportFile))
                .pipe(
                    catchError((): Observable<null> => of(null)),
                    switchMap((): Observable<unknown> => boundExec(command)),
                    switchMap((): Observable<Buffer> => from(fs.readFile(reportFile))),
                    map((buffer: Buffer): string => buffer.toString()),
                    tap((xmlContent: string): void => {
                        expect(xmlContent).toContain('<checkstyle');
                        expect(xmlContent).toContain('\n');
                        const f = () => convert(xmlContent, { format: 'object' });
                        expect(f).not.toThrow();
                    }),
                    tap((): void => done()),
                )
                .subscribe(),
        );
    });

    it('should not use a library that accepts wrong strings', () => {
        const notXML = ['<<', 'not xml string'];
        for (const value of notXML) {
            const f = () => convert(value, { format: 'object' });
            expect(f).toThrow();
        }
    });
});
