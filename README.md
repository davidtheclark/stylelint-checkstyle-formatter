# stylelint-checkstyle-reporter

[![Build Status](https://travis-ci.org/lucavb/stylelint-checkstyle-reporter.svg?branch=master)](https://travis-ci.org/lucavb/stylelint-checkstyle-reporter)

Output [Checkstyle](http://checkstyle.sourceforge.net/) XML reports of stylelint results,
which might be handy if you use the Jenkins [Checkstyle Plugin](https://wiki.jenkins-ci.org/display/JENKINS/Checkstyle+Plugin), so you can have graphs and be professional.

## Usage

You will want to run this command

`stylelint "**/*.css" --custom-formatter node_modules/stylelint-checkstyle-reporter/index.js -o stylelint.xml >/dev/null 2>&1`

The pipe to `/dev/null` is optional but spares you the XML output on your console.

You can also use this project in a JavaScript file of yours to customise the output. An example can be found
[here](examples/prettyprint.js). The second parameter is passed along to `xmlbuilder2`, so you can see possible values
in the [XMLWriterOptions](https://github.com/oozcitak/xmlbuilder2/blob/bf22aeef1b6fd91e717d70298db8129573890518/src/interfaces.ts#L444)
interface.

For more information, read the [stylelint](https://github.com/stylelint/stylelint) documentation about using formatters
and follow those instructions.

## Credit

This project has initial been written by [David Clark](https://github.com/davidtheclark)
under the name [stylelint-checkstyle-formatter](https://github.com/davidtheclark/stylelint-checkstyle-formatter).
