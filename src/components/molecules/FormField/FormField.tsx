import React from 'react';
import { Input } from '../../atoms';

interface FormFieldProps {
  label: string;
  id: string;
  error?: string;
  required?: boolean;
  leftIcon?: React.ReactNode;
  children?: React.ReactNode;
}

type InputProps = FormFieldProps & Omit<React.InputHTMLAttributes<HTMLInputElement>, 'id'>;

export const FormField: React.FC<InputProps> = ({ label, id, error, required, leftIcon, ...rest }) => {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="label">
        {label}
        {required && <span className="text-danger-400 ml-1">*</span>}
      </label>
      <Input id={id} name={id} error={error} leftIcon={leftIcon} {...rest} />
    </div>
  );
};
