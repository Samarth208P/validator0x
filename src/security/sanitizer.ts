import { ValidationError } from '../types';

export class InputSanitizer {
    static trySanitize(input: unknown): string | null {
        // Bound work before scanning or trimming the input.
        if (typeof input !== 'string' || input.length > 256 || /[^\x20-\x7E]/.test(input)) return null;
        return input.trim();
    }

    static sanitize(input: unknown): string {
        const safe = InputSanitizer.trySanitize(input);
        if (safe === null) throw new Error(ValidationError.UNSAFE_INPUT);
        return safe;
    }
}
