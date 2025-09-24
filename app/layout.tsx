export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <body style={{ fontFamily: "system-ui, sans-serif", maxWidth: 900, margin: "0 auto", padding: 24 }}>
        <h1>Delegated Subscription & Social Pay Hub</h1>
        <nav style={{ display: "flex", gap: 12, marginBottom: 24 }}>
          <a href="/">Home</a>
          <a href="/upgrade-eoa">Upgrade EOA</a>
          <a href="/subscription">Tạo Subscription</a>
          <a href="/social-pay">Social Tip</a>
          <a href="/dashboard">Dashboard</a>
          <a href="/balance-checker">Balance Checker</a>
        </nav>
        {children}
      </body>
    </html>
  );
}

