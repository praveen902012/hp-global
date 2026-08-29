"use client";

import { api } from '../../lib/api';
import type { PublishedArticle } from '../../lib/api';
import { type FormEvent, useEffect, useState } from 'react';
import Link from 'next/link';
import { FileText, Building, KeyRound, Eye, EyeOff, ExternalLink } from 'lucide-react';
import { Button } from '../../components/ui/Button';

export function AdminDashboard() {
  const [blogCount, setBlogCount] = useState(0);
  const [propCount, setPropCount] = useState(0);
  const [publishedArticles, setPublishedArticles] = useState<PublishedArticle[]>([]);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);
  const [passwordStatus, setPasswordStatus] = useState<{ type: 'error' | 'success'; message: string } | null>(null);
  const [savingPassword, setSavingPassword] = useState(false);

  useEffect(() => {
    async function loadStats() {
      try {
        const stats = await api.getDashboardStats();
        setBlogCount(stats.blogs);
        setPropCount(stats.properties);
        setPublishedArticles(stats.publishedArticles);
      } catch (error) {
        console.error('Error loading dashboard stats:', error);
      }
    }
    loadStats();
  }, []);

  async function handlePasswordChange(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPasswordStatus(null);

    if (newPassword !== confirmPassword) {
      setPasswordStatus({ type: 'error', message: 'New passwords do not match.' });
      return;
    }

    setSavingPassword(true);
    try {
      await api.changeAdminPassword(currentPassword, newPassword);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setPasswordStatus({ type: 'success', message: 'Password updated successfully.' });
    } catch (error) {
      setPasswordStatus({
        type: 'error',
        message: error instanceof Error ? error.message : 'Unable to update password.',
      });
    } finally {
      setSavingPassword(false);
    }
  }

  return (
    <div className="p-10">
      <div className="mb-10">
        <h1 className="text-3xl font-heading text-brand-charcoal mb-2">Welcome to your Dashboard</h1>
        <p className="text-slate-500 font-light">Here's an overview of your platform content.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 border border-slate-200 shadow-sm rounded-lg bg-white flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-widest text-slate-400 font-bold mb-1">Articles</p>
            <h3 className="text-4xl font-heading text-brand-charcoal">{blogCount}</h3>
          </div>
          <div className="w-12 h-12 rounded-full bg-brand-champagne/10 text-brand-champagne flex items-center justify-center">
            <FileText size={24} />
          </div>
        </div>

        <div className="p-6 border border-slate-200 shadow-sm rounded-lg bg-white flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-widest text-slate-400 font-bold mb-1">Properties</p>
            <h3 className="text-4xl font-heading text-brand-charcoal">{propCount}</h3>
          </div>
          <div className="w-12 h-12 rounded-full bg-brand-champagne/10 text-brand-champagne flex items-center justify-center">
            <Building size={24} />
          </div>
        </div>
      </div>

      <section className="mt-10 overflow-hidden border border-slate-200 bg-white shadow-sm rounded-lg">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
          <div>
            <h2 className="text-lg font-heading text-brand-charcoal">Published Articles</h2>
            <p className="mt-1 text-sm text-slate-500">All articles currently visible in the Journal.</p>
          </div>
          <Link href="/admin/articles" className="text-sm font-medium text-brand-champagne hover:text-brand-charcoal">
            Manage articles
          </Link>
        </div>
        {publishedArticles.length === 0 ? (
          <p className="p-8 text-center text-sm text-slate-500">No published articles yet.</p>
        ) : (
          <div className="divide-y divide-slate-100">
            {publishedArticles.map((article) => (
              <div key={article.id} className="flex items-center justify-between gap-4 px-6 py-4">
                <div className="min-w-0">
                  <p className="truncate font-medium text-brand-charcoal">{article.title}</p>
                  <p className="mt-1 text-xs text-slate-500">Published {new Date(article.publishedAt).toLocaleDateString()}</p>
                </div>
                <Link href={`/blog/${article.slug}`} target="_blank" aria-label={`View ${article.title}`} title="View article" className="flex h-9 w-9 shrink-0 items-center justify-center text-slate-500 hover:text-brand-champagne">
                  <ExternalLink size={17} />
                </Link>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="mt-10 max-w-2xl border border-slate-200 shadow-sm rounded-lg bg-white">
        <div className="flex items-center gap-3 border-b border-slate-200 px-6 py-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-champagne/10 text-brand-champagne">
            <KeyRound size={20} />
          </div>
          <div>
            <h2 className="text-lg font-heading text-brand-charcoal">Change admin password</h2>
            <p className="text-sm text-slate-500">Use at least 10 characters for the new password.</p>
          </div>
        </div>

        <form onSubmit={handlePasswordChange} className="space-y-5 p-6">
          {[
            { id: 'current-password', label: 'Current password', value: currentPassword, setter: setCurrentPassword },
            { id: 'new-password', label: 'New password', value: newPassword, setter: setNewPassword },
            { id: 'confirm-password', label: 'Confirm new password', value: confirmPassword, setter: setConfirmPassword },
          ].map((field, index) => (
            <div key={field.id}>
              <label htmlFor={field.id} className="mb-2 block text-sm font-medium text-slate-700">
                {field.label}
              </label>
              <div className="relative">
                <input
                  id={field.id}
                  type={showPasswords ? 'text' : 'password'}
                  value={field.value}
                  onChange={(event) => field.setter(event.target.value)}
                  minLength={index === 0 ? undefined : 10}
                  autoComplete={index === 0 ? 'current-password' : 'new-password'}
                  required
                  className="w-full rounded-md border border-slate-300 px-3 py-2.5 pr-11 text-sm text-slate-900 outline-none transition focus:border-brand-champagne focus:ring-2 focus:ring-brand-champagne/20"
                />
                {index === 0 && (
                  <button
                    type="button"
                    onClick={() => setShowPasswords((visible) => !visible)}
                    aria-label={showPasswords ? 'Hide passwords' : 'Show passwords'}
                    title={showPasswords ? 'Hide passwords' : 'Show passwords'}
                    className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-slate-400 hover:text-slate-700"
                  >
                    {showPasswords ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                )}
              </div>
            </div>
          ))}

          {passwordStatus && (
            <p
              role="status"
              className={`text-sm ${passwordStatus.type === 'success' ? 'text-emerald-700' : 'text-red-600'}`}
            >
              {passwordStatus.message}
            </p>
          )}

          <Button type="submit" variant="primary" disabled={savingPassword}>
            {savingPassword ? 'Updating...' : 'Update password'}
          </Button>
        </form>
      </section>
    </div>
  );
}
