import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { RiMailLine, RiLockLine, RiUserLine } from 'react-icons/ri';
import { useAppDispatch } from '@/app/hooks';
import { setCredentials } from '@/features/auth/authSlice';
import { AuthService } from '@/services/auth.service';
import { FormField } from '@/components/molecules/FormField/FormField';
import { Button } from '@/components/atoms';
import toast from 'react-hot-toast';

export const Register: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.name || form.name.length < 2) errs.name = 'Name must be at least 2 characters';
    if (!form.email) errs.email = 'Email is required';
    if (!form.password || form.password.length < 8) errs.password = 'Password must be at least 8 characters';
    if (!/[A-Z]/.test(form.password)) errs.password = 'Password needs at least one uppercase letter';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const result = await AuthService.signup(form);
      dispatch(setCredentials({ user: result.user, tokens: result.tokens }));
      toast.success('Account created successfully!');
      navigate('/dashboard');
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white">Create your account</h2>
        <p className="text-surface-400 mt-1">Start analyzing your resume for free</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField
          label="Full Name"
          id="name"
          type="text"
          placeholder="John Doe"
          required
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          error={errors.name}
          leftIcon={<RiUserLine />}
          autoComplete="name"
        />
        <FormField
          label="Email"
          id="email"
          type="email"
          placeholder="you@example.com"
          required
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          error={errors.email}
          leftIcon={<RiMailLine />}
          autoComplete="email"
        />
        <FormField
          label="Password"
          id="password"
          type="password"
          placeholder="Min 8 chars, one uppercase"
          required
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          error={errors.password}
          leftIcon={<RiLockLine />}
          autoComplete="new-password"
        />

        <Button type="submit" loading={loading} className="w-full mt-2">
          Create Account
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-surface-500">
        Already have an account?{' '}
        <Link to="/auth/login" className="text-primary-400 hover:text-primary-300 font-medium">
          Sign in
        </Link>
      </p>
    </div>
  );
};
