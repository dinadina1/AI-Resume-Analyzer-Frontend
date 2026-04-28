import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { RiMailLine, RiLockLine, RiEyeLine, RiEyeOffLine } from 'react-icons/ri';
import { useAppDispatch } from '@/app/hooks';
import { setCredentials } from '@/features/auth/authSlice';
import { AuthService } from '@/services/auth.service';
import { FormField } from '@/components/molecules/FormField/FormField';
import { Button } from '@/components/atoms';
import toast from 'react-hot-toast';

export const Login: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.email) errs.email = 'Email is required';
    if (!form.password) errs.password = 'Password is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const result = await AuthService.login(form);
      dispatch(setCredentials({ user: result.user, tokens: result.tokens }));
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (err: any) {
      setLoading(false);
      toast.error(err?.response?.data?.message ?? 'Login failed');
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white">Welcome back</h2>
        <p className="text-surface-400 mt-1">Sign in to your account</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
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

        <div className="space-y-1.5">
          <FormField
            label="Password"
            id="password"
            type={showPassword ? 'text' : 'password'}
            placeholder="••••••••"
            required
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            error={errors.password}
            leftIcon={<RiLockLine />}
            autoComplete="current-password"
          />
          <button
            type="button"
            className="flex items-center gap-1 text-xs text-surface-500 hover:text-surface-300"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <RiEyeOffLine /> : <RiEyeLine />}
            {showPassword ? 'Hide' : 'Show'} password
          </button>
        </div>

        <Button type="submit" loading={loading} className="w-full mt-2">
          Sign In
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-surface-500">
        Don't have an account?{' '}
        <Link to="/auth/register" className="text-primary-400 hover:text-primary-300 font-medium">
          Create one
        </Link>
      </p>
    </div>
  );
};
