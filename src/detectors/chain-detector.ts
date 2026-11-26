import { BlockchainType, ValidationOptions, EVM_CHAINS } from '../types';
import { SUPPORTED_CHAINS, getValidator } from '../registry';
import { InputSanitizer } from '../security/sanitizer';
import { assertValidationOptions } from '../validators/base';

const nonEvmChains = SUPPORTED_CHAINS.filter(chain => !(EVM_CHAINS as readonly BlockchainType[]).includes(chain));

/** Format candidates only: never use detection as proof of a destination's chain. */
export function detectBlockchain(address: unknown, options?: ValidationOptions): BlockchainType | BlockchainType[] | null {
    // Check options before the input, so empty or unsafe input cannot hide a misconfiguration.
    assertValidationOptions(options);
    const safe = InputSanitizer.trySanitize(address);
    if (!safe) return null;
    const matches: BlockchainType[] = [];
    // All EVM chains share one check. Avoid repeating Keccak for each alias.
    if (getValidator('ethereum').validate(safe, options).valid) matches.push(...EVM_CHAINS);
    for (const chain of nonEvmChains) {
        const result = getValidator(chain).validate(safe, options);
        if (!result.valid) continue;
        // Plain NEAR names are too broad for useful auto-detection. Explicit validation still accepts them.
        if (chain === 'near' && result.details?.format === 'named' && !safe.endsWith('.near') && !safe.endsWith('.testnet')) continue;
        matches.push(chain);
    }
    return matches.length === 0 ? null : matches.length === 1 ? matches[0] : matches;
}
