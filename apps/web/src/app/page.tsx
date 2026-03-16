export default function HomePage() {
  return (
    <main style={{ fontFamily: "sans-serif", padding: "2rem" }}>
      <h1>Health Watchers</h1>
      <p>AI-assisted EMR powered by Stellar blockchain.</p>
      <nav>
        <a href="/patients">Patients</a> &nbsp;|&nbsp;
        <a href="/encounters">Encounters</a> &nbsp;|&nbsp;
        <a href="/payments">Payments</a>
      </nav>
    </main>
  );
}
