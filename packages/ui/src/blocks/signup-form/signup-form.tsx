"use client"

import { useLocale, localeLabels, type LocaleLabels } from "@paneui/ui/components/locale-provider"

import * as React from "react"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"

import { AlertCircleIcon, ArrowRightIcon, EyeIcon, EyeOffIcon } from "@paneui/ui/icons"
import { cn } from "@paneui/ui/lib/utils"
import { StatefulButton, type ButtonState } from "@paneui/ui/components/button-stateful"
import { Checkbox } from "@paneui/ui/components/checkbox"
import { Input } from "@paneui/ui/components/input"

type SignupValues = { name: string; email: string; password: string; terms: boolean }
type SignupField = keyof SignupValues
type SignupErrors = Partial<Record<SignupField, string>>

type SignupFormProps = Omit<React.ComponentProps<"form">, "onSubmit" | "children"> & {
  /**
   * Called with valid values. Resolve to succeed; throw (or reject) to fail.
   * Return field errors (e.g. `{ email: "Already registered" }`) to flag fields
   * from the server.
   */
  onSubmit?: (values: SignupValues) => Promise<SignupErrors | void> | SignupErrors | void
  /** Minimum password length. Default 8. */
  minPasswordLength?: number
  title?: React.ReactNode
  description?: React.ReactNode
  submitLabel?: React.ReactNode
  successLabel?: React.ReactNode
  /** Rendered next to the terms checkbox. */
  termsLabel?: React.ReactNode
  /** Rendered under the submit button, e.g. a sign-in link. */
  footer?: React.ReactNode
  /** `card` (default) is a raised card; `plain` drops the surface for pages that frame the form themselves. */
  variant?: "card" | "plain"
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

function validate(v: SignupValues, min: number, l10n: LocaleLabels): SignupErrors {
  const e: SignupErrors = {}
  if (!v.name.trim()) e.name = l10n.tellUsWhatToCallYou
  if (!v.email.trim()) e.email = l10n.enterYourEmailAddress
  else if (!EMAIL.test(v.email.trim())) e.email = l10n.thatDoesntLookLikeAnEmailAddress
  if (!v.password) e.password = l10n.chooseAPassword
  else if (v.password.length < min) e.password = l10n.minimumCharacters(min)
  if (!v.terms) e.terms = l10n.pleaseAcceptTheTermsToContinue
  return e
}

/** 0–4. Length carries most of the weight; variety adds a little on top. */
function strength(pw: string, min: number) {
  if (!pw) return 0
  const variety = [/[a-z]/, /[A-Z]/, /\d/, /[^A-Za-z0-9]/].filter((r) => r.test(pw)).length
  const len = pw.length < min ? 0 : pw.length < min + 4 ? 1 : pw.length < min + 8 ? 2 : 3
  const score = len + (variety >= 3 ? 1 : 0)
  return Math.max(1, Math.min(4, pw.length < min ? 1 : score))
}
function getStrengthLabels(l10n: LocaleLabels = localeLabels.en) {
  return ([
  { label: "", tone: "" },
  { label: l10n.weak, tone: "bg-destructive" },
  { label: l10n.fair, tone: "bg-warning" },
  { label: l10n.good, tone: "bg-primary" },
  { label: l10n.strong, tone: "bg-success" },
])
}


/**
 * Composed sign-up form. A field is only flagged once it has been left (or on
 * submit), then re-checks as you type so the error clears the moment it is
 * fixed. Includes a password reveal, a length-weighted strength meter and a
 * submit button that walks through loading, success and error.
 */
function SignupForm({
  onSubmit,
  minPasswordLength = 8,
  title,
  description,
  submitLabel,
  successLabel,
  termsLabel,
  footer,
  variant = "card",
  className,
  ...props
}: SignupFormProps) {
  const l10n = useLocale().labels
  const STRENGTH = getStrengthLabels(l10n)

  if (title === undefined) title = l10n.createYourAccount
  if (description === undefined) description = l10n.startFreeNoCardRequired
  if (submitLabel === undefined) submitLabel = l10n.createAccount
  if (successLabel === undefined) successLabel = l10n.accountCreated
  if (termsLabel === undefined) termsLabel = l10n.iAgreeToTheTermsAndPrivacyPolicy

  const reduce = useReducedMotion()
  const uid = React.useId()
  const [values, setValues] = React.useState<SignupValues>({ name: "", email: "", password: "", terms: false })
  // A field is flagged when it is left invalid (or on submit) and unflagged as soon as it is valid.
  const [flagged, setFlagged] = React.useState<Partial<Record<SignupField, boolean>>>({})
  const [serverErrors, setServerErrors] = React.useState<SignupErrors>({})
  const [formError, setFormError] = React.useState<string | null>(null)
  const [state, setState] = React.useState<ButtonState>("idle")
  const [reveal, setReveal] = React.useState(false)
  const refs = {
    name: React.useRef<HTMLInputElement>(null),
    email: React.useRef<HTMLInputElement>(null),
    password: React.useRef<HTMLInputElement>(null),
    terms: React.useRef<HTMLElement>(null),
  }

  const clientErrors = validate(values, minPasswordLength, l10n)
  const errorFor = (f: SignupField) => serverErrors[f] ?? (flagged[f] ? clientErrors[f] : undefined)
  const score = strength(values.password, minPasswordLength)
  const done = state === "success"

  const set = <K extends SignupField>(field: K, v: SignupValues[K]) => {
    const next = { ...values, [field]: v }
    setValues(next)
    if (flagged[field] && !validate(next, minPasswordLength, l10n)[field]) setFlagged((f) => ({ ...f, [field]: false }))
    if (serverErrors[field]) setServerErrors((e) => ({ ...e, [field]: undefined }))
    if (state === "error") setState("idle")
    setFormError(null)
  }
  const leave = (field: SignupField, current: SignupValues = values) => {
    const invalid = !!validate(current, minPasswordLength, l10n)[field]
    // Leaving an empty, never-typed field does not nag; only a real attempt does.
    if (invalid && (current[field] !== "" || flagged[field])) setFlagged((f) => ({ ...f, [field]: true }))
  }

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (state === "loading" || done) return
    setFlagged({ name: !!clientErrors.name, email: !!clientErrors.email, password: !!clientErrors.password, terms: !!clientErrors.terms })
    const first = (["name", "email", "password", "terms"] as const).find((f) => clientErrors[f])
    if (first) {
      refs[first].current?.focus()
      return
    }
    setState("loading")
    setFormError(null)
    try {
      const result = await onSubmit?.(values)
      if (result && Object.values(result).some(Boolean)) {
        setServerErrors(result)
        setState("error")
        const f = (["name", "email", "password", "terms"] as const).find((k) => result[k])
        if (f) refs[f].current?.focus()
        return
      }
      setState("success")
    } catch (err) {
      setState("error")
      setFormError(err instanceof Error && err.message ? err.message : l10n.somethingWentWrongPleaseTryAgain)
    }
  }

  const field = (f: "name" | "email" | "password") => {
    const error = errorFor(f)
    return {
      id: `${uid}-${f}`,
      name: f,
      ref: refs[f],
      value: values[f],
      disabled: done,
      "aria-invalid": error ? true : undefined,
      "aria-describedby": error ? `${uid}-${f}-error` : f === "password" ? `${uid}-password-hint` : undefined,
      onChange: (e: React.ChangeEvent<HTMLInputElement>) => set(f, e.target.value),
      onBlur: () => leave(f),
    }
  }

  return (
    <form
      data-slot="signup-form"
      noValidate
      onSubmit={submit}
      data-variant={variant}
      className={cn(
        "flex w-full flex-col gap-5",
        variant === "card" && "max-w-sm rounded-2xl bg-card p-5 shadow-raised",
        className
      )}
      {...props}
    >
      {(title || description) && (
        <div className="flex flex-col gap-1">
          {title && <h2 className="text-balance text-lg font-semibold">{title}</h2>}
          {description && <p className="text-ui text-muted-foreground">{description}</p>}
        </div>
      )}

      <div className="flex flex-col gap-4">
        <FieldShell id={`${uid}-name`} label={l10n.name} error={errorFor("name")}>
          <Input {...field("name")} autoComplete="name" placeholder="Ada Lovelace" />
        </FieldShell>

        <FieldShell id={`${uid}-email`} label={l10n.email} error={errorFor("email")}>
          <Input {...field("email")} type="email" inputMode="email" autoComplete="email" placeholder="ada@example.com" />
        </FieldShell>

        <FieldShell id={`${uid}-password`} label={l10n.password} error={errorFor("password")}>
          <div className="relative">
            <Input
              {...field("password")}
              type={reveal ? "text" : "password"}
              autoComplete="new-password"
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => setReveal((r) => !r)}
              aria-label={reveal ? l10n.hidePassword : l10n.showPassword}
              aria-pressed={reveal}
              disabled={done}
              className="absolute top-1/2 right-1.5 flex size-7 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full text-muted-foreground outline-none transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring [&_svg]:size-4"
            >
              <AnimatePresence initial={false} mode="popLayout">
                <motion.span
                  key={reveal ? "hide" : "show"}
                  initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.25, filter: "blur(4px)" }}
                  animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                  exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.25, filter: "blur(4px)" }}
                  transition={{ type: "spring", duration: 0.3, bounce: 0 }}
                  className="flex"
                >
                  {reveal ? <EyeOffIcon /> : <EyeIcon />}
                </motion.span>
              </AnimatePresence>
            </button>
          </div>
          <div id={`${uid}-password-hint`} className="flex items-center gap-2" aria-live="polite">
            <div className="flex flex-1 gap-1" aria-hidden>
              {[1, 2, 3, 4].map((i) => (
                <span key={i} className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted shadow-well">
                  <motion.span
                    className={cn("block h-full rounded-full", STRENGTH[score].tone)}
                    initial={false}
                    animate={{ scaleX: i <= score ? 1 : 0 }}
                    style={{ originX: 0 }}
                    transition={
                      reduce ? { duration: 0 } : { type: "spring", stiffness: 380, damping: 30, delay: (i - 1) * 0.03 }
                    }
                  />
                </span>
              ))}
            </div>
            <span className="w-24 text-end text-ui-sm text-muted-foreground">
              {values.password ? `${STRENGTH[score].label} password` : `${minPasswordLength}+ characters`}
            </span>
          </div>
        </FieldShell>

        <div className="flex flex-col gap-1.5">
          <label className="flex cursor-pointer items-start gap-2.5 text-ui text-muted-foreground select-none">
            <Checkbox
              ref={refs.terms}
              checked={values.terms}
              disabled={done}
              onCheckedChange={(c) => set("terms", c)}
              aria-invalid={errorFor("terms") ? true : undefined}
              aria-describedby={errorFor("terms") ? `${uid}-terms-error` : undefined}
              className="mt-px"
            />
            <span className="leading-5">{termsLabel}</span>
          </label>
          <FieldError id={`${uid}-terms-error`} error={errorFor("terms")} />
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <AnimatePresence initial={false}>
          {formError && (
            <motion.p
              role="alert"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <span className="flex items-center gap-2 rounded-xl bg-destructive/10 px-3 py-2 text-ui-sm text-destructive-text [&_svg]:size-4">
                <AlertCircleIcon />
                {formError}
              </span>
            </motion.p>
          )}
        </AnimatePresence>
        <StatefulButton
          type="submit"
          size="lg"
          state={state}
          loadingText="Creating account"
          successText={successLabel}
          errorText="Try again"
          icon={<ArrowRightIcon className="rtl:-scale-x-100" />}
          className="w-full"
        >
          {submitLabel}
        </StatefulButton>
        {footer && <div className="text-center text-ui-sm text-muted-foreground">{footer}</div>}
      </div>
    </form>
  )
}

function FieldShell({
  id,
  label,
  error,
  children,
}: {
  id: string
  label: string
  error?: string
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-1.5" data-invalid={error ? "" : undefined}>
      <label htmlFor={id} className="text-ui font-medium">
        {label}
      </label>
      {children}
      <FieldError id={`${id}-error`} error={error} />
    </div>
  )
}

function FieldError({ id, error }: { id: string; error?: string }) {
  const reduce = useReducedMotion()
  return (
    <AnimatePresence initial={false}>
      {error && (
        <motion.p
          key="err"
          id={id}
          initial={reduce ? { opacity: 0 } : { opacity: 0, height: 0, y: -4 }}
          animate={{ opacity: 1, height: "auto", y: 0 }}
          exit={reduce ? { opacity: 0 } : { opacity: 0, height: 0, y: -4 }}
          transition={{ type: "spring", stiffness: 460, damping: 36 }}
          className="overflow-hidden text-ui-sm text-destructive-text"
        >
          {error}
        </motion.p>
      )}
    </AnimatePresence>
  )
}

export { SignupForm, type SignupFormProps, type SignupValues, type SignupErrors }
