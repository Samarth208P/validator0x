import { rmSync } from 'node:fs';
// Resolve relative to this script so an unexpected working directory cannot change the target.
rmSync(new URL('../dist/', import.meta.url), { recursive: true, force: true });
