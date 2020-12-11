import { exec } from 'child_process';
import { bindCallback, from, of, Subscription } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { promises as fs } from 'fs';
import { convert } from 'xmlbuilder2';

const REPORT_FILE = 'test/temp/report.xml';

describe('integration with stylelint', () => {
    let subscription: Subscription;

    beforeEach(() => {
        subscription = new Subscription();
    });

    afterEach(() => {
        subscription.unsubscribe();
    });

    it('should produce an xml file', (done) => {
        const boundExec = bindCallback(exec);
        const command = `npx stylelint ./test/assets/*.scss --config test/config/.stylelintrc.json --custom-formatter index.js -o ${REPORT_FILE}`;
        subscription.add(
            from(fs.unlink(REPORT_FILE))
                .pipe(
                    catchError(() => of(null)),
                    switchMap(() => boundExec(command)),
                    switchMap(() => from(fs.readFile(REPORT_FILE))),
                    map((buffer: Buffer) => buffer.toString()),
                    tap((xmlContent: string) => {
                        expect(xmlContent.length).toBeGreaterThan(10);
                        const f = () => {
                            convert(xmlContent);
                        };
                        expect(f).not.toThrow();
                        done();
                    }),
                )
                .subscribe(),
        );
    });
});
