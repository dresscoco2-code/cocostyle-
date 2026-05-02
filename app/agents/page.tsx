'use client';

import { useCallback, useState } from 'react';
import Link from 'next/link';

type AgentStatus = 'idle' | 'running' | 'done' | 'error';

type AgentCard = {
  id: string;
  name: string;
  role: string;
  status: AgentStatus;
  doing: string;
  result: unknown;
  error?: string;
};

const initialAgents: AgentCard[] = [
  {
    id: 'style-analyst',
    name: 'Style Analyst',
    role: 'Clothing photo → name, color, style, occasion, tip',
    status: 'idle',
    doing: 'Waiting to analyze a garment description.',
    result: null,
  },
  {
    id: 'skin-tone',
    name: 'Skin Tone',
    role: 'Selfie context → tone, undertone, best colors',
    status: 'idle',
    doing: 'Waiting for skin tone signals.',
    result: null,
  },
  {
    id: 'outfit-builder',
    name: 'Outfit Builder',
    role: 'Uses Skin Tone + profile → full outfit',
    status: 'idle',
    doing: 'Will combine palette with age, gender, occasion.',
    result: null,
  },
  {
    id: 'confidence-coach',
    name: 'Confidence Coach',
    role: 'Personalized affirmations',
    status: 'idle',
    doing: 'Needs your name, gender, age, style personality.',
    result: null,
  },
  {
    id: 'weather-stylist',
    name: 'Weather Stylist',
    role: "Today's weather → wardrobe fit + outfit",
    status: 'idle',
    doing: 'Needs your city for live weather.',
    result: null,
  },
  {
    id: 'shopping-advisor',
    name: 'Shopping Advisor',
    role: 'Uses Style Analyst → gaps + 3 buys',
    status: 'idle',
    doing: 'Will read Style Analyst output for gaps.',
    result: null,
  },
  {
    id: 'style-scorer',
    name: 'Style Scorer',
    role: 'Scores Outfit Builder /10 + reasons + fix',
    status: 'idle',
    doing: 'Will score the outfit from Outfit Builder.',
    result: null,
  },
];

function setAgent(
  list: AgentCard[],
  id: string,
  patch: Partial<AgentCard>,
): AgentCard[] {
  return list.map((a) => (a.id === id ? { ...a, ...patch } : a));
}

export default function AgentsPage() {
  const [agents, setAgents] = useState(initialAgents);
  const [garmentDescription, setGarmentDescription] = useState(
    'Navy wool blazer, notch lapels, gold buttons, worn with dark denim.',
  );
  const [skinNotes, setSkinNotes] = useState(
    'Warm lighting selfie, medium complexion, visible olive undertone.',
  );
  const [city, setCity] = useState('London');
  const [name, setName] = useState('Alex');
  const [gender, setGender] = useState('non-binary');
  const [age, setAge] = useState('32');
  const [occasion, setOccasion] = useState('creative office');
  const [stylePersonality, setStylePersonality] = useState(
    'minimal with statement outerwear',
  );
  const [topOccasions, setTopOccasions] = useState(
    'client meetings, gallery openings, weekend brunch',
  );
  const [wardrobeSummary, setWardrobeSummary] = useState(
    'Lots of neutrals, two trench coats, white sneakers, silk shirts.',
  );

  const runAll = useCallback(async () => {
    setAgents(initialAgents.map((a) => ({ ...a, status: 'idle', result: null, error: undefined })));

    const patch = (id: string, p: Partial<AgentCard>) =>
      setAgents((prev) => setAgent(prev, id, p));

    const post = async (path: string, body: unknown) => {
      const res = await fetch(path, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || res.statusText);
      return json;
    };

    try {
      patch('style-analyst', {
        status: 'running',
        doing: 'Describing garment and styling cues…',
      });
      const styleAnalysis = await post('/api/agents/style-analyst', {
        description: garmentDescription,
      });
      patch('style-analyst', {
        status: 'done',
        doing: 'Returned structured garment insights.',
        result: styleAnalysis,
      });

      patch('skin-tone', { status: 'running', doing: 'Reading undertone and palette…' });
      const skinTone = await post('/api/agents/skin-tone', { notes: skinNotes });
      patch('skin-tone', {
        status: 'done',
        doing: 'Mapped flattering colors for next steps.',
        result: skinTone,
      });

      patch('outfit-builder', {
        status: 'running',
        doing: 'Cross-referencing skin palette with profile…',
      });
      const outfit = await post('/api/agents/outfit-builder', {
        skinTone,
        age,
        gender,
        occasion,
        wardrobeSummary,
      });
      patch('outfit-builder', {
        status: 'done',
        doing: 'Shared outfit JSON with Style Scorer next.',
        result: outfit,
      });

      patch('confidence-coach', { status: 'running', doing: 'Drafting affirmations…' });
      const coach = await post('/api/agents/confidence-coach', {
        name,
        gender,
        age,
        stylePersonality,
      });
      patch('confidence-coach', {
        status: 'done',
        doing: 'Personalized copy ready.',
        result: coach,
      });

      patch('weather-stylist', { status: 'running', doing: 'Pulling live weather…' });
      const weather = await post('/api/agents/weather-stylist', {
        city,
        wardrobeSummary,
      });
      patch('weather-stylist', {
        status: 'done',
        doing: 'Merged forecast with closet hints.',
        result: weather,
      });

      patch('shopping-advisor', {
        status: 'running',
        doing: 'Using Style Analyst output for gap analysis…',
      });
      const shopping = await post('/api/agents/shopping-advisor', {
        styleAnalysis,
        topOccasions: topOccasions.split(',').map((s) => s.trim()),
        wardrobeSummary,
      });
      patch('shopping-advisor', {
        status: 'done',
        doing: 'Linked analyst insights to purchase list.',
        result: shopping,
      });

      patch('style-scorer', { status: 'running', doing: 'Scoring outfit from builder…' });
      const score = await post('/api/agents/style-scorer', {
        outfit,
        context: `Skin tone: ${skinTone.undertone}; occasion: ${occasion}`,
      });
      patch('style-scorer', {
        status: 'done',
        doing: 'Consumed Outfit Builder JSON directly.',
        result: score,
      });
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Run failed';
      setAgents((prev) => {
        let blamed = false;
        return prev.map((a) => {
          if (a.status === 'running' && !blamed) {
            blamed = true;
            return { ...a, status: 'error' as const, error: message };
          }
          if (a.status === 'running') {
            return {
              ...a,
              status: 'idle' as const,
              doing: 'Skipped after an earlier agent failed.',
            };
          }
          return a;
        });
      });
    }
  }, [
    garmentDescription,
    skinNotes,
    city,
    name,
    gender,
    age,
    occasion,
    stylePersonality,
    topOccasions,
    wardrobeSummary,
  ]);

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-zinc-100">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-violet-300/80">CocoStyle</p>
            <h1 className="mt-2 text-3xl font-semibold text-white md:text-4xl">
              Seven agents, one thread
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-zinc-400">
              Outfit Builder consumes Skin Tone. Style Scorer grades Outfit Builder. Shopping Advisor
              reads Style Analyst. Run the crew to see live statuses and JSON outputs.
            </p>
          </div>
          <div className="flex gap-3">
            <Link
              href="/dashboard"
              className="rounded-lg border border-white/10 px-4 py-2 text-sm text-zinc-300 hover:border-white/30"
            >
              ← Dashboard
            </Link>
            <button
              type="button"
              onClick={runAll}
              className="rounded-lg bg-gradient-to-r from-violet-500 to-fuchsia-500 px-5 py-2 text-sm font-medium text-white shadow-lg shadow-violet-500/25 hover:opacity-95"
            >
              Run all agents
            </button>
          </div>
        </div>

        <div className="mb-10 grid gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-6 md:grid-cols-2">
          <label className="text-xs text-zinc-500">
            Garment description (Style Analyst)
            <textarea
              className="mt-1 w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-zinc-100"
              rows={3}
              value={garmentDescription}
              onChange={(e) => setGarmentDescription(e.target.value)}
            />
          </label>
          <label className="text-xs text-zinc-500">
            Skin / selfie notes (Skin Tone)
            <textarea
              className="mt-1 w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-zinc-100"
              rows={3}
              value={skinNotes}
              onChange={(e) => setSkinNotes(e.target.value)}
            />
          </label>
          <label className="text-xs text-zinc-500">
            City (Weather Stylist)
            <input
              className="mt-1 w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm"
              value={city}
              onChange={(e) => setCity(e.target.value)}
            />
          </label>
          <div className="grid grid-cols-3 gap-3">
            <label className="text-xs text-zinc-500">
              Name
              <input
                className="mt-1 w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </label>
            <label className="text-xs text-zinc-500">
              Gender
              <input
                className="mt-1 w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm"
                value={gender}
                onChange={(e) => setGender(e.target.value)}
              />
            </label>
            <label className="text-xs text-zinc-500">
              Age
              <input
                className="mt-1 w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm"
                value={age}
                onChange={(e) => setAge(e.target.value)}
              />
            </label>
          </div>
          <label className="text-xs text-zinc-500">
            Occasion (Outfit Builder)
            <input
              className="mt-1 w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm"
              value={occasion}
              onChange={(e) => setOccasion(e.target.value)}
            />
          </label>
          <label className="text-xs text-zinc-500">
            Style personality (Confidence Coach)
            <input
              className="mt-1 w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm"
              value={stylePersonality}
              onChange={(e) => setStylePersonality(e.target.value)}
            />
          </label>
          <label className="text-xs text-zinc-500 md:col-span-2">
            Top occasions, comma-separated (Shopping Advisor)
            <input
              className="mt-1 w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm"
              value={topOccasions}
              onChange={(e) => setTopOccasions(e.target.value)}
            />
          </label>
          <label className="text-xs text-zinc-500 md:col-span-2">
            Wardrobe summary
            <textarea
              className="mt-1 w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm"
              rows={2}
              value={wardrobeSummary}
              onChange={(e) => setWardrobeSummary(e.target.value)}
            />
          </label>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {agents.map((agent) => (
            <article
              key={agent.id}
              className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.07] to-transparent p-6 shadow-[0_20px_80px_rgba(0,0,0,0.45)]"
            >
              <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-violet-500/20 blur-3xl" />
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-wide text-zinc-500">{agent.role}</p>
                  <h2 className="text-xl font-semibold text-white">{agent.name}</h2>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-medium ${
                    agent.status === 'done'
                      ? 'bg-emerald-500/15 text-emerald-200'
                      : agent.status === 'running'
                        ? 'bg-amber-400/15 text-amber-100'
                        : agent.status === 'error'
                          ? 'bg-rose-500/15 text-rose-100'
                          : 'bg-white/5 text-zinc-400'
                  }`}
                >
                  {agent.status}
                </span>
              </div>
              <p className="mt-3 text-sm text-zinc-300">{agent.doing}</p>
              {agent.error ? (
                <p className="mt-3 text-sm text-rose-300">{agent.error}</p>
              ) : null}
              {agent.result ? (
                <pre className="mt-4 max-h-64 overflow-auto rounded-xl bg-black/50 p-4 text-xs leading-relaxed text-emerald-100/90 ring-1 ring-white/10">
                  {JSON.stringify(agent.result, null, 2)}
                </pre>
              ) : (
                <p className="mt-4 text-xs text-zinc-500">No result yet — run the crew.</p>
              )}
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
