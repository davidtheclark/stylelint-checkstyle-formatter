import { stylelintToCheckstyle } from './formatter';
import { LintResult } from 'stylelint';
import { convert } from 'xmlbuilder2';

const mockResults: LintResult[] = [
    {
        source: 'path/to/fileA.css',
        warnings: [
            {
                line: 3,
                column: 8,
                rule: 'block-no-empty',
                severity: 'warning',
                text: 'No empty block!',
            },
        ],
        deprecations: [],
        errored: true,
        invalidOptionWarnings: [],
        ignored: false,
    },
    {
        source: 'path/to/fileB.css',
        errored: true,
        warnings: [
            {
                line: 1,
                column: 2,
                rule: 'foo',
                severity: 'error',
                text: 'foo text',
            },
            {
                line: 2,
                column: 5,
                rule: 'bar',
                severity: 'error',
                text: 'bar text',
            },
        ],
        deprecations: [],
        invalidOptionWarnings: [],
        ignored: false,
    },
    {
        source: 'path/to/fileC.css',
        errored: false,
        warnings: [],
        deprecations: [],
        invalidOptionWarnings: [],
        ignored: false,
    },
];

const expectedXml = convert(
    '<?xml version="1.0" encoding="utf-8"?>\n' +
        '<checkstyle version="4.3">\n' +
        '  <file name="path/to/fileA.css">\n' +
        '    <error source="stylelint.rules.block-no-empty" line="3" column="8" severity="warning" message="No empty block!" />\n' +
        '  </file>\n' +
        '  <file name="path/to/fileB.css">\n' +
        '    <error source="stylelint.rules.foo" line="1" column="2" severity="error" message="foo text" />\n' +
        '    <error source="stylelint.rules.bar" line="2" column="5" severity="error" message="bar text" />\n' +
        '  </file>\n' +
        '  <file name="path/to/fileC.css"></file>\n' +
        '</checkstyle>',
    { format: 'object' },
);

describe('checkstyle formatter', () => {
    it('output XML string', () => {
        const output = stylelintToCheckstyle(mockResults);
        expect(convert(output, { format: 'object' })).toEqual(expectedXml);
        const crashes = () => {
            convert('not an xml string<<>>><<<');
        };
        expect(crashes).toThrow();
        const f = () => {
            convert(output);
        };
        expect(f).not.toThrow();
    });
});
