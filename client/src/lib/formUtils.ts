import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// Common form utility classes
export const formClasses = {
  // Form container styles
  container: "space-y-6",
  section: "space-y-4",
  
  // Input group styles
  inputGroup: "space-y-2",
  label: "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
  
  // Button styles
  primaryButton: "bg-primary text-primary-foreground hover:bg-primary/90 transition-colors",
  secondaryButton: "bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors",
  destructiveButton: "bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors",
  
  // Loading states
  loading: "opacity-50 cursor-not-allowed",
  spinner: "animate-spin",
  
  // Error states
  error: "border-red-500 focus:border-red-500 focus:ring-red-500",
  errorText: "text-sm text-red-500 mt-1",
  
  // Success states
  success: "border-green-500 focus:border-green-500 focus:ring-green-500",
  successText: "text-sm text-green-500 mt-1"
};

// Validation helpers
export const validateRequired = (value: any, fieldName: string) => {
  if (!value || (typeof value === 'string' && value.trim() === '')) {
    return `${fieldName} is required`;
  }
  return null;
};

export const validateEmail = (email: string) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return "Please enter a valid email address";
  }
  return null;
};

export const validateMinLength = (value: string, minLength: number, fieldName: string) => {
  if (value && value.length < minLength) {
    return `${fieldName} must be at least ${minLength} characters`;
  }
  return null;
};

// Form state helpers
export const getFieldError = (errors: Record<string, any>, fieldName: string) => {
  return errors[fieldName]?.message || null;
};

export const hasFieldError = (errors: Record<string, any>, fieldName: string) => {
  return !!errors[fieldName];
};

// Class name utilities for form elements
export const cn = (...inputs: ClassValue[]) => {
  return twMerge(clsx(inputs));
};

export const getInputClassName = (hasError: boolean, className?: string) => {
  return cn(
    "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
    hasError && formClasses.error,
    className
  );
};

export const getButtonClassName = (variant: 'primary' | 'secondary' | 'destructive' = 'primary', loading?: boolean, className?: string) => {
  return cn(
    "inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-10 px-4 py-2",
    formClasses[`${variant}Button`],
    loading && formClasses.loading,
    className
  );
};