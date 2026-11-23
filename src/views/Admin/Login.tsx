"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Lock } from "lucide-react";
import { api } from "../../lib/api";
import { Button, Notice, fieldInput, labelClass } from "../../components/admin/ui";

type DevelopmentCredentials = { email: string; password: string };

export function AdminLogin({ developmentCredentials }: { developmentCredentials?: DevelopmentCredentials }) {
  const [email, setEmail] = useState(developmentCredentials?.email ?? "");
  const [password, setPassword] = useState(developmentCredentials?.password ?? "");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleLogin(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await api.login(email, password);
      router.push("/admin");
    } catch (reason: unknown) {
      setError(reason instanceof Error ? reason.message : "Unable to sign in.");
      setLoading(false);
    }
  }

  return (
    <div className="grid min-h-screen bg-white lg:grid-cols-[minmax(0,1fr)_560px] xl:grid-cols-[minmax(0,1fr)_640px]">
      <div className="relative hidden overflow-hidden bg-navy-950 lg:block">
        <img src="/assets/featured-project-details/projects-image/slider-05.jpg" alt="" className="absolute inset-0 h-full w-full object-cover opacity-60" />
        <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-navy-950 via-navy-950/40 to-navy-950/20" />
        <div className="relative flex h-full flex-col justify-between p-12 text-white">
          <div className="flex items-center gap-3"><img src="/images/hpg-logo.png" alt="" className="h-11 w-auto" /><span className="font-heading text-[22px]">HP Global Infrra</span></div>
          <div className="max-w-lg">
            <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-gold-400">Admin panel</p>
            <p className="mt-3 font-heading text-[40px] leading-[48px]">Manage projects, leads and stories in one place.</p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center px-5 py-12 sm:px-10">
        <div className="w-full max-w-[400px]">
          <div className="mb-10 flex items-center gap-3 lg:hidden"><img src="/images/hpg-logo.png" alt="" className="h-10 w-auto" /><span className="font-heading text-[20px] text-ink">HP Global Infrra</span></div>
          <h1 className="font-heading text-[32px] leading-10 text-ink">Sign in</h1>
          <p className="mt-2 text-[15px] leading-6 text-ink-muted">Use your admin email and password.</p>

          <form onSubmit={handleLogin} className="mt-8 space-y-5">
            {error && <Notice tone="error">{error}</Notice>}
            <label className={labelClass}>Email
              <input type="email" required autoComplete="username" value={email} onChange={(event) => setEmail(event.target.value)} className={`mt-1.5 ${fieldInput} h-12`} placeholder="you@hpglobalinfra.com" />
            </label>
            <label className={labelClass}>Password
              <span className="relative mt-1.5 block">
                <input type={showPassword ? "text" : "password"} required autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} className={`${fieldInput} h-12 pr-12`} />
                <button type="button" onClick={() => setShowPassword((value) => !value)} className="absolute inset-y-0 right-0 flex w-12 items-center justify-center text-ink-muted hover:text-ink" aria-label={showPassword ? "Hide password" : "Show password"}>{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button>
              </span>
            </label>
            <Button type="submit" size="lg" className="w-full" disabled={loading}><Lock size={17} aria-hidden />{loading ? "Signing in…" : "Sign in"}</Button>
          </form>
          <p className="mt-8 text-[13px] leading-5 text-ink-muted">Forgot the password? Ask the website administrator to reset it.</p>
        </div>
      </div>
    </div>
  );
}
