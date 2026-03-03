/**
 * Validate password strength
 * Requirements:
 * - At least 8 characters
 * - At least 1 uppercase letter
 * - At least 1 lowercase letter
 * - At least 1 number
 */
const validatePasswordStrength = (password) => {
    const minLength = password.length >= 8;
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);

    return {
        isValid: minLength && hasUppercase && hasLowercase && hasNumber,
        requirements: {
            minLength: { met: minLength, description: 'At least 8 characters' },
            uppercase: { met: hasUppercase, description: 'At least 1 uppercase letter' },
            lowercase: { met: hasLowercase, description: 'At least 1 lowercase letter' },
            number: { met: hasNumber, description: 'At least 1 number' }
        }
    };
};

module.exports = { validatePasswordStrength };
