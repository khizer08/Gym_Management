const { body, validationResult } = require('express-validator');
// hello
const validateMember = [
    body('member_name')
        .trim()
        .notEmpty()
        .withMessage('Name is required')
        .isLength({ min: 2 })
        .withMessage('Name must be at least 2 characters long'),
    
    body('member_age')
        .isInt({ min: 16, max: 100 })
        .withMessage('Age must be between 16 and 100'),
    
    body('member_gender')
        .trim()
        .notEmpty()
        .withMessage('Gender is required')
        .isIn(['Male', 'Female', 'Other'])
        .withMessage('Invalid gender'),
    
    body('member_phone')
        .trim()
        .notEmpty()
        .withMessage('Phone number is required')
        .matches(/^[0-9]{10}$/)
        .withMessage('Phone number must be 10 digits'),
    
    body('member_email')
        .trim()
        .notEmpty()
        .withMessage('Email is required')
        .isEmail()
        .withMessage('Invalid email format'),
    
    body('membership_plan')
        .trim()
        .notEmpty()
        .withMessage('Membership plan is required')
        .isIn(['Monthly', 'Quarterly', 'Yearly'])
        .withMessage('Invalid membership plan'),
    
    body('assigned_trainer')
        .optional()
        .isInt()
        .withMessage('Invalid trainer ID'),

    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }
        next();
    }
];

const validateLogin = [
    body('id')
        .optional()
        .trim()
        .notEmpty()
        .withMessage('ID is required'),
    
    body('username')
        .optional()
        .trim()
        .notEmpty()
        .withMessage('Username is required'),
    
    body('password')
        .optional()
        .trim()
        .notEmpty()
        .withMessage('Password is required'),

    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }
        next();
    }
];

module.exports = {
    validateMember,
    validateLogin
}; 