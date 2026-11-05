"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { siGithub, siGoogle } from "simple-icons"

import { ArrowLeftIcon, ArrowRightIcon, CheckCircleIcon, InboxIcon, WarningIcon } from "@paneui/ui/icons"
import { OTPInput, type OTPStatus } from "@paneui/ui/blocks/otp-input/otp-input"
import { SignupForm } from "@paneui/ui/blocks/signup-form/signup-form"
import { Alert, AlertContent, AlertDescription, AlertIcon } from "@paneui/ui/components/alert"
import { Avatar, AvatarFallback } from "@paneui/ui/components/avatar"
import { BrandIcon } from "@paneui/ui/components/brand-icon"
import { Button } from "@paneui/ui/components/button"
import { StatefulButton, type ButtonState } from "@paneui/ui/components/button-stateful"
import { Checkbox } from "@paneui/ui/components/checkbox"
import { Field, FieldError, FieldGroup, FieldLabel, FieldLabelRow } from "@paneui/ui/components/field"
import { IconChip } from "@paneui/ui/components/icon-chip"
import { Input } from "@paneui/ui/components/input"
import { PasswordInput } from "@paneui/ui/components/password-input"
import { StatCardDelta } from "@paneui/ui/components/stat-card"
import { ThemeToggle } from "@paneui/ui/components/theme-toggle"
import { TrendChart } from "@paneui/ui/components/trend-chart"

import { AuthError, requestPasswordReset, signIn, signUp, verifyCode } from "../../lib/auth"
import { brand, demoUser, kpis, revenue, revenueSeries, testimonials } from "../../lib/data"
import { AppLink, routes, useHref } from "../../lib/routes"
import { BrandMark, initials, SaasProviders } from "../providers"

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

/* ───────────────────────── Shell ───────────────────────── */

/** Split auth layout: the form on the left; on lg+ a tinted panel with this month's two headline numbers, the revenue chart and a customer quote. */
export function AuthShell({ children }: { children: React.ReactNode }) {
  const t = testimonials[0]
  return (
    <SaasProviders>
      <div className="grid min-h-svh grid-cols-1 bg-background text-foreground lg:grid-cols-2">
        <div className="flex flex-col px-5 py-6 sm:px-10">
          <div className="flex items-center justify-between">
            <BrandMark />
            <ThemeToggle variant="ghost" modes="tri" />
          </div>
          <div className="flex flex-1 items-center justify-center py-12">
            <div className="w-full max-w-sm">{children}</div>
          </div>
          <p className="text-center text-xs text-muted-foreground">
            © {new Date().getFullYear()} {brand.company}
          </p>
        </div>
        <aside className="m-3 hidden flex-col justify-between gap-10 rounded-3xl bg-muted p-10 shadow-well lg:flex">
          <dl aria-label="This month in Tessel" className="grid max-w-md grid-cols-2">
            {kpis.slice(0, 2).map((k, i) => (
              <div key={k.id} className={i > 0 ? "flex flex-col gap-1 border-s border-border ps-6" : "flex flex-col gap-1 pe-6"}>
                <dt className="text-sm text-muted-foreground">{k.label}</dt>
                <dd className="flex flex-wrap items-center gap-2">
                  <span className="text-2xl font-semibold tracking-tight tabular-nums">{new Intl.NumberFormat("en-US", k.format).format(k.value)}</span>
                  <StatCardDelta value={k.delta} invert={k.invert} />
                </dd>
              </div>
            ))}
          </dl>
          <div aria-hidden className="-mx-2">
            <TrendChart series={revenueSeries} data={revenue} variant="area" stacked height={220} showLegend={false} label="Revenue by plan" />
          </div>
          <figure className="flex max-w-md flex-col gap-6">
            <blockquote className="text-2xl leading-snug font-medium tracking-tight text-balance">“{t.quote}”</blockquote>
            <figcaption className="flex items-center gap-3">
              <Avatar size="lg">
                <AvatarFallback>{initials(t.name)}</AvatarFallback>
              </Avatar>
              <span className="flex flex-col leading-tight">
                <span className="text-sm font-medium">{t.name}</span>
                <span className="text-sm text-muted-foreground">{t.role}</span>
              </span>
            </figcaption>
          </figure>
        </aside>
      </div>
    </SaasProviders>
  )
}

function AuthHeading({ title, description }: { title: string; description: React.ReactNode }) {
  return (
    <div className="mb-6 flex flex-col gap-1.5">
      <h1 className="text-balance text-2xl font-semibold tracking-tight">{title}</h1>
      <p className="text-sm text-pretty text-muted-foreground">{description}</p>
    </div>
  )
}

function OAuthButtons({ onSelect }: { onSelect: () => void }) {
  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <Button variant="outline" size="lg" className="w-full" onClick={onSelect}>
          <BrandIcon icon={siGithub} data-icon="inline-start" />
          GitHub
        </Button>
        <Button variant="outline" size="lg" className="w-full" onClick={onSelect}>
          <BrandIcon icon={siGoogle} color="brand" data-icon="inline-start" />
          Google
        </Button>
      </div>
      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        <span className="h-px flex-1 bg-border" />
        or with email
        <span className="h-px flex-1 bg-border" />
      </div>
    </div>
  )
}

/* ───────────────────────── Login ───────────────────────── */

type LoginErrors = { email?: string; password?: string; form?: string }

function validateLogin(email: string, password: string): LoginErrors {
  const e: LoginErrors = {}
  if (!email.trim()) e.email = "Enter your email address."
  else if (!EMAIL.test(email.trim())) e.email = "That doesn't look like an email address."
  if (!password) e.password = "Enter your password."
  return e
}

/** `/login`: email + password, validated on submit and re-checked as you type; redirects to the dashboard. */
export function LoginPage() {
  const router = useRouter()
  const href = useHref()
  const [email, setEmail] = React.useState(demoUser.email)
  const [password, setPassword] = React.useState("")
  const [errors, setErrors] = React.useState<LoginErrors>({})
  const [submitted, setSubmitted] = React.useState(false)
  const [state, setState] = React.useState<ButtonState>("idle")
  const emailRef = React.useRef<HTMLInputElement>(null)
  const passwordRef = React.useRef<HTMLInputElement>(null)

  const recheck = (nextEmail: string, nextPassword: string) => {
    if (submitted) setErrors(validateLogin(nextEmail, nextPassword))
    if (state === "error") setState("idle")
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
    const found = validateLogin(email, password)
    setErrors(found)
    if (found.email) return emailRef.current?.focus()
    if (found.password) return passwordRef.current?.focus()
    setState("loading")
    try {
      await signIn({ email: email.trim(), password })
      setState("success")
      router.push(href(routes.dashboard))
    } catch (err) {
      setState("error")
      if (err instanceof AuthError && err.field === "password") {
        setErrors({ password: err.message })
        passwordRef.current?.focus()
      } else setErrors({ form: err instanceof Error ? err.message : "Something went wrong." })
    }
  }

  return (
    <>
      <AuthHeading
        title="Welcome back"
        description={
          <>
            New to {brand.name}?{" "}
            <AppLink href={routes.signup} className="font-medium text-foreground underline-offset-4 hover:underline">
              Create an account
            </AppLink>
          </>
        }
      />
      <div className="flex flex-col gap-4">
        <OAuthButtons
          onSelect={async () => {
            await signIn({ email: demoUser.email, password: "github" })
            router.push(href(routes.dashboard))
          }}
        />
        <form noValidate onSubmit={submit} className="flex flex-col gap-5">
          <FieldGroup>
            <Field invalid={!!errors.email}>
              <FieldLabel>Email</FieldLabel>
              <Input
                ref={emailRef}
                type="email"
                autoComplete="email"
                inputMode="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  recheck(e.target.value, password)
                }}
                placeholder="you@company.com"
              />
              <FieldError>{errors.email}</FieldError>
            </Field>
            <Field invalid={!!errors.password}>
              <FieldLabelRow>
                <FieldLabel>Password</FieldLabel>
                <AppLink href={routes.forgotPassword} className="text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline">
                  Forgot password?
                </AppLink>
              </FieldLabelRow>
              <PasswordInput
                ref={passwordRef}
                autoComplete="current-password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                  recheck(email, e.target.value)
                }}
              />
              <FieldError>{errors.password}</FieldError>
            </Field>
            <label className="flex cursor-pointer items-center gap-2.5 text-ui text-muted-foreground select-none">
              <Checkbox defaultChecked />
              Keep me signed in
            </label>
          </FieldGroup>
          {errors.form && (
            <Alert variant="destructive" size="sm">
              <AlertIcon>
                <WarningIcon />
              </AlertIcon>
              <AlertContent>
                <AlertDescription>{errors.form}</AlertDescription>
              </AlertContent>
            </Alert>
          )}
          <StatefulButton
            type="submit"
            size="lg"
            state={state}
            loadingText="Signing in"
            successText="Signed in"
            errorText="Try again"
            icon={<ArrowRightIcon className="rtl:-scale-x-100" />}
            className="w-full"
          >
            Sign in
          </StatefulButton>
          <p className="text-center text-xs text-muted-foreground">Demo: any password works; one containing “wrong” fails.</p>
        </form>
      </div>
    </>
  )
}

/* ───────────────────────── Signup ───────────────────────── */

/** `/signup`: the SignupForm block, then the email code step. */
export function SignupPage() {
  const router = useRouter()
  const href = useHref()
  return (
    <>
      <AuthHeading
        title="Create your account"
        description={
          <>
            Already have one?{" "}
            <AppLink href={routes.login} className="font-medium text-foreground underline-offset-4 hover:underline">
              Sign in
            </AppLink>
          </>
        }
      />
      <div className="flex flex-col gap-4">
        <OAuthButtons
          onSelect={async () => {
            await signIn({ email: demoUser.email, password: "github" })
            router.push(href(routes.dashboard))
          }}
        />
        <SignupForm
          title=""
          description={null}
          variant="plain"
          termsLabel="I agree to the Terms of Service and Privacy Policy"
          onSubmit={async (values) => {
            try {
              await signUp(values)
            } catch (err) {
              if (err instanceof AuthError && err.field === "email") return { email: err.message }
              throw err
            }
            setTimeout(() => router.push(`${href(routes.verify)}?email=${encodeURIComponent(values.email)}`), 600)
          }}
          footer="Demo: an email starting with “taken@” is already registered."
        />
      </div>
    </>
  )
}

/* ───────────────────────── Forgot password ───────────────────────── */

/** `/forgot-password`: asks for the email, then confirms the link was sent. */
export function ForgotPasswordPage() {
  const [email, setEmail] = React.useState("")
  const [error, setError] = React.useState<string>()
  const [state, setState] = React.useState<ButtonState>("idle")
  const [sent, setSent] = React.useState(false)

  if (sent) {
    return (
      <div className="flex flex-col items-start gap-5">
        <IconChip size="lg" tone="success">
          <CheckCircleIcon />
        </IconChip>
        <AuthHeading title="Check your inbox" description={<>If an account exists for {email}, a reset link is on its way. It expires in 30 minutes.</>} />
        <div className="flex w-full flex-col gap-2">
          <Button size="lg" className="w-full" nativeButton={false} render={<AppLink href={routes.verify} />}>
            I have a code
          </Button>
          <Button variant="ghost" size="lg" className="w-full" onClick={() => setSent(false)}>
            Use a different email
          </Button>
        </div>
      </div>
    )
  }

  return (
    <>
      <AuthHeading title="Reset your password" description="Enter the email you sign in with and we'll send you a reset link." />
      <form
        noValidate
        className="flex flex-col gap-5"
        onSubmit={async (e) => {
          e.preventDefault()
          if (!EMAIL.test(email.trim())) return setError(email.trim() ? "That doesn't look like an email address." : "Enter your email address.")
          setError(undefined)
          setState("loading")
          await requestPasswordReset(email.trim())
          setState("success")
          setTimeout(() => setSent(true), 400)
        }}
      >
        <Field invalid={!!error}>
          <FieldLabel>Email</FieldLabel>
          <Input
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value)
              if (error && EMAIL.test(e.target.value.trim())) setError(undefined)
            }}
            placeholder="you@company.com"
          />
          <FieldError>{error}</FieldError>
        </Field>
        <StatefulButton type="submit" size="lg" state={state} loadingText="Sending link" successText="Link sent" className="w-full">
          Send reset link
        </StatefulButton>
        <Button variant="ghost" nativeButton={false} render={<AppLink href={routes.login} />} className="self-center">
          <ArrowLeftIcon className="rtl:-scale-x-100" data-icon="inline-start" />
          Back to sign in
        </Button>
      </form>
    </>
  )
}

/* ───────────────────────── Verify ───────────────────────── */

/** `/verify`: six-digit code; completes automatically, redirects to the dashboard. */
export function VerifyPage() {
  const router = useRouter()
  const href = useHref()
  const [code, setCode] = React.useState("")
  const [status, setStatus] = React.useState<OTPStatus>("idle")
  const [error, setError] = React.useState("That code didn't match.")
  const [resent, setResent] = React.useState(false)
  const [email, setEmail] = React.useState("your email")
  React.useEffect(() => {
    const e = new URLSearchParams(window.location.search).get("email")
    if (e) setEmail(e)
  }, [])

  const check = async (value: string) => {
    try {
      await verifyCode(value)
      setStatus("success")
      setTimeout(() => router.push(href(routes.dashboard)), 700)
    } catch (err) {
      setError(err instanceof Error ? err.message : "That code didn't match.")
      setStatus("error")
    }
  }

  return (
    <div className="flex flex-col items-start gap-6">
      <IconChip size="lg" tone="primary">
        <InboxIcon />
      </IconChip>
      <AuthHeading title="Verify your email" description={<>We sent a six-digit code to {email}. Demo: any code but 000000 works.</>} />
      <OTPInput
        label="Verification code"
        groupSize={3}
        value={code}
        status={status}
        errorMessage={error}
        successMessage="Verified. Opening your dashboard…"
        onValueChange={(v) => {
          setCode(v)
          if (status !== "idle") setStatus("idle")
        }}
        onValueComplete={check}
      />
      <div className="flex w-full flex-col gap-2">
        <Button size="lg" className="w-full" disabled={code.length < 6 || status === "success"} onClick={() => check(code)}>
          Verify
        </Button>
        <Button variant="ghost" size="lg" className="w-full" onClick={() => setResent(true)} disabled={resent}>
          {resent ? "Code sent again" : "Resend code"}
        </Button>
      </div>
    </div>
  )
}
