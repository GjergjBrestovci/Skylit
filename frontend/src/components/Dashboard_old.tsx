import { useState } from 'react';

interface DashboardProps {
  authToken: string;
}

export function Dashboard({ authToken }: DashboardProps) {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ generated: string; createdAt: string } | null>(null);

  const handleGenerate = async () => {
    setError(null);
    setResult(null);
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/generate-site', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({ prompt }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate');
      }
      setResult({ generated: data.generated, createdAt: data.createdAt });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unexpected error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex-1 p-6 overflow-y-auto">
      <div className="max-w-5xl mx-auto space-y-10">
        <header className="space-y-2">
          <h2 className="text-3xl font-bold">Generate Your Website</h2>
          <p className="text-text/70 text-sm">Describe what you want; AI generation coming soon.</p>
        </header>

        <section className="bg-[#1e1e1e] border border-accent-purple/20 rounded-lg p-6 space-y-4">
          <div>
            <label htmlFor="prompt" className="block text-sm font-medium mb-2">Website Description</label>
            <textarea
              id="prompt"
              rows={4}
              className="w-full p-3 bg-[#232323] border border-accent-purple/30 rounded-md text-sm placeholder-text/50 focus:outline-none focus:ring-2 focus:ring-accent-cyan/40"
              placeholder="e.g., A SaaS landing page with pricing, features grid, and a hero section..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
          </div>
          <button
            onClick={handleGenerate}
            disabled={!prompt.trim() || loading}
            className="inline-flex items-center justify-center rounded-md bg-gradient-to-r from-accent-cyan to-accent-purple text-background font-semibold text-sm px-6 py-3 disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition"
          >
            {loading ? 'Generating...' : 'Generate'}
          </button>
          {error && <p className="text-sm text-red-400">{error}</p>}
          {result && (
            <div className="mt-4 border border-accent-purple/30 rounded-md bg-[#222] p-4 space-y-2">
              <div className="text-xs text-text/50 flex justify-between"><span>Generated Preview</span><span>{new Date(result.createdAt).toLocaleTimeString()}</span></div>
              <pre className="text-xs whitespace-pre-wrap leading-relaxed text-text/80 overflow-x-auto max-h-64">{result.generated}</pre>
            </div>
          )}
        </section>

        <section className="space-y-4">
          <h3 className="text-lg font-semibold text-accent-cyan">Recent Projects (placeholder)</h3>
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((id) => (
              <div
                key={id}
                className="p-4 rounded-lg bg-[#1e1e1e] border border-accent-purple/20 hover:border-accent-cyan/40 transition-colors"
              >
                <div className="text-sm font-medium mb-1 text-accent-cyan">Project {id}</div>
                <p className="text-xs text-text/60 line-clamp-2">Prompt preview...</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
