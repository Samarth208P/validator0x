import { ValidationError } from '../types';

export class InputSanitizer {
    static sanitize(input: unknown): string {
        if (input === null || input === undefined) {
            throw new Error(ValidationError.UNSAFE_INPUT);
        }

        if (typeof input !== 'string') {
            throw new Error(ValidationError.UNSAFE_INPUT);
        }

        // Bound work before scanning or trimming the input.
        if (input.length > 256) {
            throw new Error(ValidationError.UNSAFE_INPUT);
        }

        // Check for dangerous control characters
        if (/[^\x20-\x7E]/.test(input)) {
            throw new Error(ValidationError.UNSAFE_INPUT);
        }

        return input.trim();
    }
}
