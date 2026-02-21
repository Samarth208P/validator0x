import { EthereumValidator } from './ethereum';
import { ValidationResult, ValidationOptions } from '../types';

export class BscValidator extends EthereumValidator {
    protected validateImplementation(address: string, options?: ValidationOptions): ValidationResult {
        const result = super.validateImplementation(address, options);
        if (result.valid) {
            result.blockchain = 'bsc';
        }
        return result;
    }
}

export class AvalancheValidator extends EthereumValidator {
    protected validateImplementation(address: string, options?: ValidationOptions): ValidationResult {
        const result = super.validateImplementation(address, options);
        if (result.valid) {
            result.blockchain = 'avalanche';
        }
        return result;
    }
}

export class ArbitrumValidator extends EthereumValidator {
    protected validateImplementation(address: string, options?: ValidationOptions): ValidationResult {
        const result = super.validateImplementation(address, options);
        if (result.valid) {
            result.blockchain = 'arbitrum';
        }
        return result;
    }
}

export class OptimismValidator extends EthereumValidator {
    protected validateImplementation(address: string, options?: ValidationOptions): ValidationResult {
        const result = super.validateImplementation(address, options);
        if (result.valid) {
            result.blockchain = 'optimism';
        }
        return result;
    }
}

export class BaseValidator extends EthereumValidator {
    protected validateImplementation(address: string, options?: ValidationOptions): ValidationResult {
        const result = super.validateImplementation(address, options);
        if (result.valid) {
            result.blockchain = 'base';
        }
        return result;
    }
}
