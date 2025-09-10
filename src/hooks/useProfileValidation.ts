import { useState, useCallback } from 'react';
import { UserProfile } from '@/hooks/useUserProfile';

export interface ValidationError {
  field: string;
  message: string;
  type: 'required' | 'format' | 'length' | 'custom';
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
  score: number;
}

export const useProfileValidation = () => {
  const [validationResult, setValidationResult] = useState<ValidationResult>({
    isValid: true,
    errors: [],
    warnings: [],
    score: 0
  });

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone: string): boolean => {
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
  };

  const validateUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const validateProfile = useCallback((profile: UserProfile | null): ValidationResult => {
    const errors: ValidationError[] = [];
    const warnings: ValidationError[] = [];
    let score = 0;
    const maxScore = 100;

    if (!profile) {
      return {
        isValid: false,
        errors: [{ field: 'profile', message: 'Profile not found', type: 'required' }],
        warnings: [],
        score: 0
      };
    }

    // Required fields validation
    if (!profile.full_name || profile.full_name.trim().length === 0) {
      errors.push({
        field: 'full_name',
        message: 'Full name is required',
        type: 'required'
      });
    } else {
      score += 10;
      if (profile.full_name.trim().length < 2) {
        warnings.push({
          field: 'full_name',
          message: 'Full name seems too short',
          type: 'length'
        });
      }
    }

    // Email validation
    if (!profile.email || profile.email.trim().length === 0) {
      errors.push({
        field: 'email',
        message: 'Email address is required',
        type: 'required'
      });
    } else if (!validateEmail(profile.email)) {
      errors.push({
        field: 'email',
        message: 'Invalid email format',
        type: 'format'
      });
    } else {
      score += 10;
    }

    // Phone validation
    if (profile.phone && profile.phone.trim().length > 0) {
      if (!validatePhone(profile.phone)) {
        warnings.push({
          field: 'phone',
          message: 'Phone number format may be invalid',
          type: 'format'
        });
      } else {
        score += 5;
      }
    }

    // Professional summary validation
    if (!profile.professional_summary || profile.professional_summary.trim().length === 0) {
      warnings.push({
        field: 'professional_summary',
        message: 'Professional summary is highly recommended',
        type: 'required'
      });
    } else {
      score += 15;
      if (profile.professional_summary.length < 50) {
        warnings.push({
          field: 'professional_summary',
          message: 'Professional summary should be at least 50 characters',
          type: 'length'
        });
      } else if (profile.professional_summary.length > 500) {
        warnings.push({
          field: 'professional_summary',
          message: 'Professional summary should be concise (under 500 characters)',
          type: 'length'
        });
      }
    }

    // Work experience validation
    const workExp = profile.work_experience || [];
    if (workExp.length === 0) {
      warnings.push({
        field: 'work_experience',
        message: 'Adding work experience will strengthen your profile',
        type: 'required'
      });
    } else {
      score += 20;
      if (workExp.length >= 3) {
        score += 5; // Bonus for comprehensive work history
      }
    }

    // Education validation
    const education = profile.education || [];
    if (education.length === 0) {
      warnings.push({
        field: 'education',
        message: 'Education information is recommended',
        type: 'required'
      });
    } else {
      score += 10;
    }

    // Skills validation
    const techSkills = profile.technical_skills || [];
    const softSkills = profile.soft_skills || [];
    
    if (techSkills.length === 0 && softSkills.length === 0) {
      warnings.push({
        field: 'skills',
        message: 'Adding skills will improve your profile visibility',
        type: 'required'
      });
    } else {
      score += 10;
      if (techSkills.length >= 5) {
        score += 5; // Bonus for diverse technical skills
      }
      if (softSkills.length >= 3) {
        score += 3; // Bonus for soft skills
      }
    }

    // LinkedIn URL validation
    if (profile.linkedin_url && profile.linkedin_url.trim().length > 0) {
      if (!validateUrl(profile.linkedin_url) || !profile.linkedin_url.includes('linkedin.com')) {
        warnings.push({
          field: 'linkedin_url',
          message: 'LinkedIn URL format may be invalid',
          type: 'format'
        });
      } else {
        score += 5;
      }
    }

    // Website/Portfolio URL validation
    if (profile.website_url && profile.website_url.trim().length > 0) {
      if (!validateUrl(profile.website_url)) {
        warnings.push({
          field: 'website_url',
          message: 'Website URL format may be invalid',
          type: 'format'
        });
      } else {
        score += 5;
      }
    }

    // GitHub URL validation
    if (profile.github_url && profile.github_url.trim().length > 0) {
      if (!validateUrl(profile.github_url) || !profile.github_url.includes('github.com')) {
        warnings.push({
          field: 'github_url',
          message: 'GitHub URL format may be invalid',
          type: 'format'
        });
      } else {
        score += 5;
      }
    }

    // Projects validation
    const projects = profile.projects || [];
    if (projects.length > 0) {
      score += 8;
      if (projects.length >= 3) {
        score += 2; // Bonus for multiple projects
      }
    }

    // Certifications validation
    const certifications = profile.certifications || [];
    if (certifications.length > 0) {
      score += 7;
    }

    // Languages validation
    const languages = profile.languages || [];
    if (languages.length > 0) {
      score += 5;
    }

    // Avatar validation
    if (profile.avatar_url && profile.avatar_url.trim().length > 0) {
      score += 3;
    }

    // Industry and experience level
    if (profile.industry && profile.industry.trim().length > 0) {
      score += 3;
    }

    if (profile.experience_level && profile.experience_level.trim().length > 0) {
      score += 2;
    }

    // Ensure score doesn't exceed maximum
    score = Math.min(score, maxScore);

    const result: ValidationResult = {
      isValid: errors.length === 0,
      errors,
      warnings,
      score
    };

    setValidationResult(result);
    return result;
  }, []);

  const getValidationMessage = (field: string): string | null => {
    const error = validationResult.errors.find(e => e.field === field);
    const warning = validationResult.warnings.find(w => w.field === field);
    
    if (error) return error.message;
    if (warning) return warning.message;
    return null;
  };

  const hasFieldError = (field: string): boolean => {
    return validationResult.errors.some(e => e.field === field);
  };

  const hasFieldWarning = (field: string): boolean => {
    return validationResult.warnings.some(w => w.field === field);
  };

  const getScoreLabel = (score: number): string => {
    if (score >= 90) return 'Excellent';
    if (score >= 80) return 'Very Good';
    if (score >= 70) return 'Good';
    if (score >= 60) return 'Fair';
    if (score >= 40) return 'Needs Improvement';
    return 'Poor';
  };

  const getScoreColor = (score: number): string => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return {
    validationResult,
    validateProfile,
    getValidationMessage,
    hasFieldError,
    hasFieldWarning,
    getScoreLabel,
    getScoreColor
  };
};