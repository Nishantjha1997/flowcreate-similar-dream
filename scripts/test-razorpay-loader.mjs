// Guard checkout script loading against duplicate/removal regressions.
import { readFileSync } from 'node:fs';

const source = readFileSync(new URL('../src/components/RazorpayProvider.tsx', import.meta.url), 'utf8');
const assert = (condition, message) => { if (!condition) throw new Error(message); };

assert(source.includes('document.querySelector<HTMLScriptElement>'), 'Razorpay loader must reuse an existing script');
assert(source.includes('window.Razorpay'), 'Razorpay loader must detect an already-loaded SDK');
assert(!source.includes('document.body.removeChild(existingScript)'), 'Razorpay loader must not remove the shared SDK on unmount');
assert(source.includes('addEventListener'), 'Razorpay loader must observe an in-flight SDK load');

console.log('Razorpay loader smoke checks passed');
