import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        globals: true,
        environment: 'node',
        include: ['tests/**/*.test.ts'],
        coverage: {
            provider: 'v8',
            include: ['src/**/*.ts'],
            reportsDirectory: '.coverage',
            reporter: ['text', 'lcov', 'json-summary'],
            thresholds: { statements: 95, branches: 90, functions: 95, lines: 98 },
        },
    },
});
