import { create } from 'xmlbuilder2';
import { XMLBuilder, XMLWriterOptions } from 'xmlbuilder2/lib/interfaces';

const checkstyleVersion = '4.3';

export interface CheckstyleError {
    source: string;
    line: number;
    column: number;
    severity: 'warning' | 'error';
    message: string;
}

export class CheckstyleReport {
    private builder: XMLBuilder;

    private fileLevel = false;

    constructor() {
        this.builder = create({ version: '1.0', encoding: 'utf-8' });
        this.builder = this.builder.ele('checkstyle', {
            version: checkstyleVersion,
        });
    }

    startFile(path: string): void {
        if (this.fileLevel) {
            throw new Error(
                'You have already started a file. Please call endFile first.',
            );
        }
        this.builder = this.builder.ele('file', { name: path });
        this.fileLevel = true;
    }

    endFile(): void {
        if (!this.fileLevel) {
            throw new Error(
                'You have not started a file yet. Call startFile first.',
            );
        }
        this.builder = this.builder.up();
        this.fileLevel = false;
    }

    addError(error: CheckstyleError): void {
        if (!this.fileLevel) {
            throw new Error(
                'You have not started a file yet. Call startFile first.',
            );
        }
        this.builder = this.builder.ele('error', error).up();
    }

    generate(options?: XMLWriterOptions): string {
        return this.builder.end(options ?? {});
    }
}
