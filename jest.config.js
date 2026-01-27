module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',

    collectCoverage: true,

    collectCoverageFrom: [
        'src/**/*.{ts,js}',
        '!src/**/*.d.ts',
        '!src/index.ts',
        '!src/types.ts',
        '!src/utils/keccak256.ts',
        '!src/utils/sha256.ts'
    ],

    coveragePathIgnorePatterns: [
        '/node_modules/',
        'src/utils/keccak256.ts',
        'src/utils/sha256.ts',
        'src/types.ts',
        'src/index.ts'
    ],
    coverageDirectory: 'coverage',
    coverageReporters: ['text', 'lcov', 'json-summary']
};
