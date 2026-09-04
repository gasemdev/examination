"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

import { useAuth } from "@/auth/useAuth";
import { login } from "@/services/auth";
import { useLocale, useTranslations } from "next-intl";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { BrandMark } from "@/components/ui/BrandMark";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, initialized, setUser } = useAuth();
  const locale = useLocale();
  const t = useTranslations("login");
  const landing = useTranslations("landing");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (initialized && user) router.replace(searchParams.get("next") || `/${locale}`);
  }, [initialized, locale, router, searchParams, user]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;
    setError("");
    setSubmitting(true);
    try {
      const response = await login(identifier, password);
      setUser(response.user);
      router.replace(searchParams.get("next") || `/${locale}`);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : t("invalid"));
    } finally {
      setSubmitting(false);
    }
  }

  const showLoginForm = searchParams.get("mode") === "form" || searchParams.has("next");

  if (showLoginForm) {
    return (
      <main className="app-shell flex h-dvh items-center justify-center overflow-hidden px-4 py-3 sm:px-5 sm:py-5">
        <section className="app-panel w-full max-w-md p-5 md:p-6">
          <div className="flex justify-end"><LanguageSwitcher /></div><BrandMark href={`/${locale}/login`} compact />
          <div className="mt-3 text-center"><h1 className="text-lg font-extrabold text-white">{t("brand")}</h1><p className="mt-1 text-xs font-semibold text-[#7e72ff]">{t("track")}</p><p className="mt-2 text-[10px] text-[var(--muted)]">{t("subtitle")}</p><span className="mt-2 inline-block rounded-full border border-[#245a2d] bg-[#14291a] px-3 py-1 text-[10px] font-semibold text-[#9be56b]">👥 {t("users", { count: "13,808" })}</span></div>
          <form onSubmit={handleSubmit} className="mt-5 space-y-3">
            <label className="block text-xs font-semibold">{t("identifier")}<input required autoComplete="username" value={identifier} onChange={(event) => setIdentifier(event.target.value)} className="mt-2 w-full rounded-lg border border-[var(--border)] bg-[#15161b] px-4 py-3 text-sm text-white outline-none transition focus:border-[#6257ec]" placeholder={t("identifierPlaceholder")} /></label>
            <label className="block text-xs font-semibold"><span className="flex justify-between">{t("password")}<a href="#forgot" className="font-normal text-[#7e72ff]">{t("forgotPassword")}</a></span><input required type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} className="mt-2 w-full rounded-lg border border-[var(--border)] bg-[#15161b] px-4 py-3 text-sm text-white outline-none transition focus:border-[#6257ec]" placeholder={t("passwordPlaceholder")} /></label>
            {error && <p role="alert" className="rounded-lg border border-[rgba(242,100,118,0.35)] bg-[rgba(242,100,118,0.1)] px-4 py-3 text-sm text-[#ff9aa7]">{error}</p>}
            <button disabled={submitting} className="w-full rounded-lg bg-[#4f46dd] px-5 py-3 text-sm font-bold text-white shadow-[0_8px_20px_rgba(79,70,221,0.35)] transition hover:bg-[#665cf2] disabled:cursor-not-allowed disabled:opacity-60">{submitting ? t("submitting") : t("submit")}</button>
          </form>
          <div className="my-3 flex items-center gap-3 text-[10px] text-[var(--muted)]"><span className="h-px flex-1 bg-[var(--border)]" />{t("or")}<span className="h-px flex-1 bg-[var(--border)]" /></div>
          <button type="button" className="w-full rounded-lg border border-[var(--border)] bg-transparent px-5 py-3 text-xs font-semibold text-white transition hover:border-[#6257ec]">G&nbsp;&nbsp; {t("google")}</button>
          <p className="mt-3 whitespace-pre-line text-center text-[10px] leading-4 text-[#7167de]">{t("googleHint")}</p>
          <div className="my-3 flex items-center gap-3 text-[10px] text-[var(--muted)]"><span className="h-px flex-1 bg-[var(--border)]" />{t("or")}<span className="h-px flex-1 bg-[var(--border)]" /></div>
          <button type="button" onClick={() => router.push(`/${locale}/login`)} className="w-full rounded-lg border border-[var(--border)] bg-transparent px-5 py-3 text-xs font-semibold text-white transition hover:border-[#6257ec]">📝 {t("register")}</button>
          <p className="mt-4 text-center text-[10px] text-[var(--muted)]">{t("pricing")}</p>
          <Link href={`/${locale}/login`} className="mt-4 block text-center text-xs font-semibold text-[var(--muted)] transition hover:text-white">{t("backHome")}</Link>
        </section>
      </main>
    );
  }

  return (
    <main className="app-shell min-h-screen overflow-hidden">
      <header className="app-header">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3.5 md:px-8">
          <Link href={`/${locale}/login`} className="flex items-center gap-2.5 text-sm font-bold tracking-tight text-white">
            <span className="grid size-8 place-items-center rounded-full border border-[#7e72ff] text-sm text-[#bdb8ff]">✦</span>
            {landing("brand")}
          </Link>
          <nav className="flex items-center gap-3 text-xs font-semibold">
            <LanguageSwitcher />
            <button className="hidden rounded-lg border border-[var(--border)] px-3 py-2 text-[var(--muted)] transition hover:border-[var(--primary-bright)] hover:text-white sm:block">{landing("shop")}</button>
            <button type="button" onClick={() => router.push(`/${locale}/login?mode=form`)} className="hidden rounded-lg border border-[var(--border)] px-3 py-2 text-white transition hover:border-[var(--primary-bright)] sm:block">{t("submit")}</button>
            <button type="button" onClick={() => router.push(`/${locale}/login?mode=form`)} className="rounded-lg bg-[var(--primary)] px-3.5 py-2 text-white transition hover:bg-[var(--primary-bright)]">{landing("freeSignup")}</button>
          </nav>
        </div>
      </header>

      <section className="relative mx-auto flex max-w-4xl flex-col items-center px-5 pb-12 pt-12 text-center md:pt-16">
        <div className="absolute left-1/2 top-0 -z-0 h-72 w-[min(70vw,42rem)] -translate-x-1/2 rounded-full bg-[rgba(92,76,221,0.08)] blur-3xl" />
        <span className="relative rounded-full border border-[rgba(126,114,255,0.4)] bg-[rgba(102,88,232,0.1)] px-4 py-1.5 text-[11px] font-semibold text-[#bdb8ff]">{landing("badge")}</span>
        <h1 className="relative mt-7 max-w-2xl text-4xl font-extrabold leading-[1.18] tracking-tight text-white md:text-6xl">{landing("headlineBefore")} <span className="text-[#6557eb]">{landing("headlineAccent")}</span><br />{landing("headlineAfter")}</h1>
        <p className="relative mt-5 max-w-xl whitespace-pre-line text-xs leading-6 text-[var(--muted)] md:text-sm">{landing("description")}</p>
        <p className="relative mt-4 text-xs font-semibold text-[var(--warning)]">{landing("savedNotice")}</p>

        <div className="relative mt-5 flex flex-wrap justify-center gap-2 text-[10px] font-semibold">
          <span className="rounded-md border border-[#394b42] bg-[#1d3b24] px-3 py-2 text-[#9be56b]">{landing("questions")}</span>
          <span className="rounded-md border border-[#35485f] bg-[#1c385c] px-3 py-2 text-[#b1d6ff]">{landing("timer")}</span>
          <span className="rounded-md border border-[#513d70] bg-[#39215e] px-3 py-2 text-[#d6b8ff]">{landing("subjects")}</span>
          <span className="rounded-md border border-[#464082] bg-[#302b78] px-3 py-2 text-[#beb8ff]">{landing("instantResult")}</span>
        </div>
        <span className="relative mt-2 rounded-md border border-[#277a57] bg-[#137447] px-4 py-2 text-[10px] font-bold text-[#c4ffde]">{landing("submitted")}</span>

        <div className="relative mt-7 grid w-full max-w-xl gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-[var(--border)] bg-[rgba(29,30,38,0.82)] px-5 py-4"><p className="text-[10px] text-[var(--muted)]">{landing("administration")}</p><p className="mt-1 text-[10px] text-[var(--muted)]">{landing("administrationTrack")}</p><strong className="mt-2 block text-2xl text-[#8e82ff]">85 <small className="text-[10px] text-[var(--muted)]">{landing("days")}</small></strong><div className="mt-3 grid grid-cols-3 gap-2"><span className="rounded-md bg-[#0d0e12] py-2 text-xs font-bold text-white">14<small className="block text-[9px] font-normal text-[var(--muted)]">{landing("hours")}</small></span><span className="rounded-md bg-[#0d0e12] py-2 text-xs font-bold text-white">22<small className="block text-[9px] font-normal text-[var(--muted)]">{landing("minutes")}</small></span><span className="rounded-md bg-[#0d0e12] py-2 text-xs font-bold text-white">19<small className="block text-[9px] font-normal text-[var(--muted)]">{landing("seconds")}</small></span></div></div>
          <div className="rounded-xl border border-[var(--border)] bg-[rgba(29,30,38,0.82)] px-5 py-4"><p className="text-[10px] text-[var(--muted)]">{landing("suppression")}</p><p className="mt-1 text-[10px] text-[var(--muted)]">{landing("suppressionTrack")}</p><strong className="mt-2 block text-2xl text-[#8e82ff]">134 <small className="text-[10px] text-[var(--muted)]">{landing("days")}</small></strong><div className="mt-3 grid grid-cols-3 gap-2"><span className="rounded-md bg-[#0d0e12] py-2 text-xs font-bold text-white">14<small className="block text-[9px] font-normal text-[var(--muted)]">{landing("hours")}</small></span><span className="rounded-md bg-[#0d0e12] py-2 text-xs font-bold text-white">22<small className="block text-[9px] font-normal text-[var(--muted)]">{landing("minutes")}</small></span><span className="rounded-md bg-[#0d0e12] py-2 text-xs font-bold text-white">19<small className="block text-[9px] font-normal text-[var(--muted)]">{landing("seconds")}</small></span></div></div>
        </div>

        <div className="relative mt-5 flex flex-wrap justify-center gap-2">
          <button type="button" onClick={() => router.push(`/${locale}/login?mode=form`)} className="rounded-lg bg-[var(--primary)] px-5 py-3 text-xs font-bold text-white transition hover:bg-[var(--primary-bright)]">{landing("signupFree")}</button>
          <button type="button" onClick={() => router.push(`/${locale}/login?mode=form`)} className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-5 py-3 text-xs font-bold text-white transition hover:border-[var(--primary-bright)]">{landing("loginArrow")}</button>
          <button type="button" className="rounded-lg bg-white px-5 py-3 text-xs font-bold text-[#22232a] transition hover:bg-[#e8e8ef]">{landing("google")}</button>
        </div>
        <p className="relative mt-3 text-[10px] text-[var(--muted)]">{landing("googleNotice")}</p>

      </section>
    </main>
  );
}
