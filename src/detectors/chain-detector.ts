import { BlockchainType, ValidationOptions, EVM_CHAINS } from '../types';
import { SUPPORTED_CHAINS, getValidator } from '../registry';
import { InputSanitizer } from '../security/sanitizer';

/** Format candidates only: never use detection as proof of a destination's chain. */
export function detectBlockchain(address: unknown, options?: ValidationOptions): BlockchainType | BlockchainType[] | null {
    let safe: string;
    try { safe = InputSanitizer.sanitize(address); } catch { return null; }
    if (!safe) return null;
    const matches: BlockchainType[] = [];
    // All EVM chains share one check. Avoid repeating Keccak for each alias.
    if (getValidator('ethereum').validate(safe, options).valid) matches.push(...EVM_CHAINS);
    for (const chain of SUPPORTED_CHAINS) {
        if ((EVM_CHAINS as readonly string[]).includes(chain)) continue;
        // Plain NEAR names are too broad for useful auto-detection. Explicit validation still accepts them.
        if (chain === 'near' && !/(\.near|\.testnet)$/.test(safe) && !/^[0-9a-f]{64}$/.test(safe) && !/^0[xs][0-9a-f]{40}$/.test(safe) && !/^0u[0-9a-hjkmnp-tv-z]{51}[0g]$/.test(safe)) continue;
        if (getValidator(chain).validate(safe, options).valid) matches.push(chain);
    }
    return matches.length === 0 ? null : matches.length === 1 ? matches[0] : matches;
}
