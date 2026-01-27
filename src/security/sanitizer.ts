import { ValidationError } from '../types';

export class InputSanitizer {
    static sanitize(input: unknown): string {
        if (input === null || input === undefined) {
            throw new Error(ValidationError.UNSAFE_INPUT);
        }

        if (typeof input !== 'string') {
            throw new Error(ValidationError.UNSAFE_INPUT);
        }

        // Remove invisible characters and excessive whitespace
        const trimmed = input.trim();

        // Check for excessive length (prevent DoS)
        if (trimmed.length > 256) {
            throw new Error(ValidationError.UNSAFE_INPUT);
        }

        // Check for dangerous control characters
        // eslint-disable-next-line no-control-regex
        if (/[\x00-\x1F\x7F]/.test(trimmed)) {
            throw new Error(ValidationError.UNSAFE_INPUT);
        }

        return trimmed;
    }
}
