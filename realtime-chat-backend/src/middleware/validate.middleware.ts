import { Request, Response, NextFunction } from "express";

interface ValidationRule {
    field: string;
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    isEmail?: boolean;
}

const EMAIL_REGEX = /^\S+@\S+\.\S+$/;

export const validate = (rules: ValidationRule[]) => {
    return (req: Request, res: Response, next: NextFunction): void => {
        const errors: string[] = [];

        for (const rule of rules) {
            const value = req.body[rule.field];

            if (rule.required && (!value || !String(value).trim())) {
                errors.push(`${rule.field} is required`);
                continue; // skip further checks for this field
            }

            if (value) {
                if (rule.minLength && String(value).length < rule.minLength) {
                    errors.push(`${rule.field} must be at least ${rule.minLength} characters`);
                }
                if (rule.maxLength && String(value).length > rule.maxLength) {
                    errors.push(`${rule.field} must be at most ${rule.maxLength} characters`);
                }
                if (rule.isEmail && !EMAIL_REGEX.test(String(value))) {
                    errors.push(`${rule.field} must be a valid email`);
                }
            }
        }

        if (errors.length > 0) {
            res.status(400).json({ message: errors.join(", ") });
            return;
        }

        next();
    };
};