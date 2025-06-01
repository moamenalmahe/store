const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

function validateEmail(email) {
    if (!email) {
        return { isValid: false, error: 'Email is required' };
    }
    if (typeof email !== 'string') {
        return { isValid: false, error: 'Email must be text' };
    }
    if (email.length > 100) {
        return { isValid: false, error: 'Email is too long (maximum 100 characters)' };
    }
    if (!emailRegex.test(email)) {
        return { isValid: false, error: 'Invalid email format. Example: user@example.com' };
    }
    return { isValid: true };
}

function validatePassword(password) {
    if (!password) {
        return { isValid: false, error: 'Password is required' };
    }
    if (typeof password !== 'string') {
        return { isValid: false, error: 'Password must be text' };
    }
    
    const errors = [];
    if (password.length < 8) {
        errors.push('at least 8 characters');
    }
    if (!/[A-Z]/.test(password)) {
        errors.push('one uppercase letter');
    }
    if (!/[a-z]/.test(password)) {
        errors.push('one lowercase letter');
    }
    if (!/\d/.test(password)) {
        errors.push('one number');
    }
    if (!/[@$!%*?&]/.test(password)) {
        errors.push('one special character (@$!%*?&)');
    }

    if (errors.length > 0) {
        return {
            isValid: false,
            error: `Password must contain ${errors.join(', ')}`,
            requirements: {
                minLength: !errors.includes('at least 8 characters'),
                hasUpperCase: !errors.includes('one uppercase letter'),
                hasLowerCase: !errors.includes('one lowercase letter'),
                hasNumber: !errors.includes('one number'),
                hasSpecial: !errors.includes('one special character (@$!%*?&)')
            }
        };
    }

    return { isValid: true };
}

function validateUsername(username) {
    if (!username) {
        return { isValid: false, error: 'Username is required' };
    }
    if (typeof username !== 'string') {
        return { isValid: false, error: 'Username must be text' };
    }
    
    const errors = [];
    if (username.length < 3) {
        errors.push('Username must be at least 3 characters long');
    }
    if (username.length > 30) {
        errors.push('Username cannot be longer than 30 characters');
    }
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
        errors.push('Username can only contain letters, numbers, and underscores');
    }
    if (/^\d/.test(username)) {
        errors.push('Username cannot start with a number');
    }

    if (errors.length > 0) {
        return { 
            isValid: false, 
            error: errors.join('. '),
            requirements: {
                validLength: username.length >= 3 && username.length <= 30,
                validCharacters: /^[a-zA-Z0-9_]+$/.test(username),
                validStart: !/^\d/.test(username)
            }
        };
    }

    return { isValid: true };
}

module.exports = {
    validateEmail,
    validatePassword,
    validateUsername
}; 