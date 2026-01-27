import { EthereumValidator } from './ethereum';
import { ValidationResult, ValidationOptions } from '../types';

export class PolygonValidator extends EthereumValidator {
    protected validateImplementation(address: string, options?: ValidationOptions): ValidationResult {
        const result = super.validateImplementation(address, options);
        if (result.valid) {
            result.blockchain = 'polygon';
        }
        return result;
    }
}
