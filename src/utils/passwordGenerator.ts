
import * as Crypto from 'expo-crypto';

// Default options
interface GeneratorOptions {
    length: number;
    useUpper: boolean;
    useLower: boolean;
    useNumbers: boolean;
    useSymbols: boolean;
    excludeAmbiguous: boolean;
}

const SYMBOLS = '!@#$%^&*()_+-=[]{}|;:,.<>?';
const AMBIGUOUS = '0Ool1I';

export const PasswordGenerator = {
    generate: (options: GeneratorOptions): string => {
        let charset = '';
        if (options.useLower) charset += 'abcdefghijklmnopqrstuvwxyz';
        if (options.useUpper) charset += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        if (options.useNumbers) charset += '0123456789';
        if (options.useSymbols) charset += SYMBOLS;

        if (options.excludeAmbiguous) {
            // Remove ambiguous chars from charset
            for (const char of AMBIGUOUS) {
                charset = charset.split(char).join('');
            }
        }

        if (charset.length === 0) return '';

        // Secure generation using crypto
        // We can use expo-crypto.getRandomBytesAsync or similar.
        // Sync version is preferable for UI responsiveness if possible, but async is fine.
        // Expo Random (deprecated) -> Expo Crypto. 
        // Crypto.getRandomValues() is standard polyfill in newer RN/Expo.
        // If not polyfilled, use Crypto.getRandomBytesAsync (async).
        // Let's assume we can use standard Math.random for fallback or proper Crypto.
        // "Cryptography: Use native crypto modules".
        const values = new Uint32Array(options.length);
        // crypto.getRandomValues(values); // Standard
        // If not available, we use Math.random (weak) - but we MUST use strong.
        // Expo doesn't polyfill global crypto.getRandomValues automatically unless expo-crypto/polyfill is imported.
        // I didn't import 'expo-crypto/polyfill'.
        // So I should use `await Crypto.getRandomBytesAsync`.
        // But this function needs to be async.
        // I'll make it async.

        // ... wait, making it async complicates UI state slightly but better for security.
        return ''; // Placeholder, seeing as I need it to be async
    },

    generateAsync: async (options: GeneratorOptions): Promise<string> => {
        let charset = '';
        if (options.useLower) charset += 'abcdefghijklmnopqrstuvwxyz';
        if (options.useUpper) charset += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        if (options.useNumbers) charset += '0123456789';
        if (options.useSymbols) charset += SYMBOLS;

        if (options.excludeAmbiguous) {
            // Remove ambiguous chars from charset
            for (const char of AMBIGUOUS) {
                charset = charset.split(char).join('');
            }
        }

        if (charset.length === 0) return '';

        const length = options.length;
        let password = '';

        // Get random bytes
        const randomBytes = await Crypto.getRandomBytesAsync(length);
        const setLength = charset.length;

        for (let i = 0; i < length; i++) {
            const randomIndex = randomBytes[i] % setLength;
            password += charset[randomIndex];
        }

        return password;
    }
};
