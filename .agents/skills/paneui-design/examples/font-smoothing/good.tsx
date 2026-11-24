// app/layout.tsx: smoothing is set once, on the root (the theme also sets it on body).
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  )
}
