import type { Config } from '@jest/types';

const jestConfig: Config.InitialOptions = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    coveragePathIgnorePatterns: [],
    reporters: ['default'],
    rootDir: '.',
    globals: {
        'ts-jest': {
            compiler: 'typescript',
            tsConfig: './tsconfig.spec.json',
        },
    },
};

export default jestConfig;
