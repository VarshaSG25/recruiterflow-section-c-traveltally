import { useState, useEffect } from 'react';
import { 
  Bot, 
  Briefcase, 
  Award, 
  CheckCircle2, 
  XCircle, 
  UserCheck, 
  RefreshCw 
} from 'lucide-react';

interface Candidate {
  id: number;
  name: string;
  skills: string;
  experience_years: number;
  availability: string;
  traits: string;
  quirk: string;
}

interface Job {
  id: number;
  title: string;
  required_skills: string;
  min_experience: number;
  culture_keywords: string;
  tagline: string;
}

interface MatchResult {
  candidateId: number;
  candidateName: string;
  jobId: number;
  jobTitle: string;
  score: number;
  scoreBreakdown: {
    skillsScore: number;
    experienceScore: number;
    cultureScore: number;
    availabilityScore: number;
  };
  matchingSkills: string[];
  missingSkills: string[];
  matchingTraits: string[];
  experienceGap: number;
  reason: string;
}

const SEED_CANDIDATES: Candidate[] = [
  { id: 1, name: 'Sherlock H.', skills: 'deduction, pattern-recognition, forensics', experience_years: 8, availability: 'Immediate', traits: 'analytical, blunt', quirk: 'Solves problems by eliminating the impossible; occasionally insufferable in standups.' },
  { id: 2, name: 'Hermione G.', skills: 'research, time-management, public-speaking', experience_years: 4, availability: '2 weeks', traits: 'detail-oriented, overachiever', quirk: 'Reads the entire documentation before writing a single line of code.' },
  { id: 3, name: 'Tony S.', skills: 'systems-design, rapid-prototyping, leadership', experience_years: 12, availability: 'Not looking', traits: 'confident, innovative', quirk: 'Ships an MVP overnight, refuses to write tests.' },
  { id: 4, name: 'Leslie K.', skills: 'project-management, stakeholder-management, public-speaking', experience_years: 6, availability: 'Immediate', traits: 'tenacious, organized', quirk: 'Has a binder for everything, including the binder.' },
  { id: 5, name: 'Ron S.', skills: 'woodworking, minimalism, negotiation', experience_years: 15, availability: 'Not looking', traits: 'stubborn, principled', quirk: 'Refuses to use more than one monitor.' },
  { id: 6, name: 'Rick S.', skills: 'systems-design, rapid-prototyping, chemistry', experience_years: 20, availability: 'Immediate', traits: 'genius, reckless', quirk: 'Solution works, mechanism deeply concerning.' },
  { id: 7, name: 'Elle W.', skills: 'persuasion, research, public-speaking', experience_years: 3, availability: 'Immediate', traits: 'optimistic, sharp', quirk: 'Underestimated in every standup, correct in every retro.' },
  { id: 8, name: 'MacGyver', skills: 'rapid-prototyping, resourcefulness, chemistry, systems-design', experience_years: 10, availability: '2 weeks', traits: 'calm, improviser', quirk: 'Fixes production outages with duct tape and a paperclip metaphor.' },
  { id: 9, name: 'Sheldon C.', skills: 'theoretical-analysis, pattern-recognition, research', experience_years: 9, availability: 'Immediate', traits: 'rigid, brilliant', quirk: 'Correct 95% of the time, insufferable 100% of the time.' },
  { id: 10, name: 'Katniss E.', skills: 'precision, strategy, crisis-management', experience_years: 5, availability: 'Immediate', traits: 'resilient, decisive', quirk: 'Excellent under pressure, terrible with public speaking.' },
  { id: 11, name: 'Michael S.', skills: 'sales, public-speaking, team-building', experience_years: 11, availability: 'Not looking', traits: 'enthusiastic, chaotic', quirk: "World's best boss, according to a mug he bought himself." },
  { id: 12, name: 'Olivia P.', skills: 'crisis-management, negotiation, strategy, leadership', experience_years: 13, availability: '2 weeks', traits: 'decisive, intense', quirk: 'Handles it. Whatever it is.' },
  { id: 13, name: 'Ted L.', skills: 'team-building, optimism, mentorship, public-speaking', experience_years: 7, availability: 'Immediate', traits: 'empathetic, persistent', quirk: 'Turns every technical setback into a folksy metaphor.' },
  { id: 14, name: 'Miranda P.', skills: 'leadership, negotiation, stakeholder-management, precision', experience_years: 18, availability: 'Not looking', traits: 'demanding, decisive', quirk: 'Reviews every PR personally. Says nothing. Everyone panics.' },
  { id: 15, name: 'Dwight S.', skills: 'sales, negotiation, security, loyalty', experience_years: 9, availability: 'Immediate', traits: 'intense, loyal', quirk: 'Assistant to the regional backend engineer.' },
];

const SEED_JOBS: Job[] = [
  { id: 1, title: 'Backend Detective', required_skills: 'deduction, pattern-recognition, forensics', min_experience: 3, culture_keywords: 'analytical, autonomous', tagline: 'We have a bug. We have no leads. We have you.' },
  { id: 2, title: 'Rapid Prototyping Engineer', required_skills: 'rapid-prototyping, systems-design', min_experience: 2, culture_keywords: 'innovative, fast-paced', tagline: 'Ship first, document never (kidding — please document).' },
  { id: 3, title: 'Developer Relations Lead', required_skills: 'public-speaking, research', min_experience: 2, culture_keywords: 'energetic, curious', tagline: 'Explain complex things to confused humans, cheerfully.' },
  { id: 4, title: 'Engineering Manager, Chaos Team', required_skills: 'team-building, stakeholder-management, leadership', min_experience: 5, culture_keywords: 'empathetic, organized', tagline: 'Herd cats. The cats are senior engineers.' },
  { id: 5, title: 'Incident Commander', required_skills: 'crisis-management, strategy, negotiation', min_experience: 4, culture_keywords: 'decisive, calm-under-pressure', tagline: "3am page. You're the one who picks up." },
  { id: 6, title: 'Sales Engineer', required_skills: 'sales, public-speaking, negotiation', min_experience: 3, culture_keywords: 'enthusiastic, persistent', tagline: 'Sell the vision, then go build it.' },
];

export const RecruiterBotPage: React.FC = () => {
  const [mode, setMode] = useState<'job' | 'candidate'>('job');
  const [selectedJobId, setSelectedJobId] = useState<number>(1);
  const [selectedCandidateId, setSelectedCandidateId] = useState<number>(1);
  const [matches, setMatches] = useState<MatchResult[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [backendConnected, setBackendConnected] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    const endpoint = mode === 'job' 
      ? `http://localhost:4000/api/jobs/${selectedJobId}/matches`
      : `http://localhost:4000/api/candidates/${selectedCandidateId}/matches`;

    fetch(endpoint)
      .then(res => {
        if (!res.ok) throw new Error('Backend offline');
        return res.json();
      })
      .then(data => {
        if (isMounted) {
          setMatches(data.matches || []);
          setBackendConnected(true);
          setIsLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) {
          setBackendConnected(false);
          const selectedJob = SEED_JOBS.find(j => j.id === selectedJobId) || SEED_JOBS[0];
          const results = SEED_CANDIDATES.map(c => {
            const reqSkills = selectedJob.required_skills.split(',').map(s => s.trim().toLowerCase());
            const cSkills = c.skills.split(',').map(s => s.trim().toLowerCase());
            const matched = reqSkills.filter(s => cSkills.includes(s));
            const missing = reqSkills.filter(s => !cSkills.includes(s));
            const skillScore = Math.round((matched.length / reqSkills.length) * 45) + (cSkills.length > reqSkills.length ? 5 : 0);
            const expGap = c.experience_years - selectedJob.min_experience;
            const expScore = expGap >= 0 ? 25 : Math.max(0, 25 - Math.abs(expGap) * 8);
            const availScore = c.availability === 'Immediate' ? 10 : c.availability === '2 weeks' ? 7 : 2;
            const cultScore = 10;
            const total = Math.min(100, skillScore + expScore + cultScore + availScore);

            return {
              candidateId: c.id,
              candidateName: c.name,
              jobId: selectedJob.id,
              jobTitle: selectedJob.title,
              score: total,
              scoreBreakdown: {
                skillsScore: skillScore,
                experienceScore: expScore,
                cultureScore: cultScore,
                availabilityScore: availScore,
              },
              matchingSkills: matched,
              missingSkills: missing,
              matchingTraits: [c.traits],
              experienceGap: expGap,
              reason: `Matches ${matched.length}/${reqSkills.length} required skills. ${c.experience_years} yrs exp, ${c.availability.toLowerCase()}. Personality: "${c.quirk}"`,
            };
          }).sort((a, b) => b.score - a.score);

          setMatches(results);
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [mode, selectedJobId, selectedCandidateId]);

  const activeJob = SEED_JOBS.find(j => j.id === selectedJobId) || SEED_JOBS[0];
  const activeCandidate = SEED_CANDIDATES.find(c => c.id === selectedCandidateId) || SEED_CANDIDATES[0];

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner */}
      <div className="glass-purple-card rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4 border border-purple-500/30">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-900/60 text-purple-300 text-xs font-mono font-semibold border border-purple-500/30">
            <Bot className="w-3.5 h-3.5 text-fuchsia-400" />
            <span>Section B Core Project</span>
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">
            Build-a-Recruiter-Bot
          </h1>
          <p className="text-sm text-purple-200/80 max-w-xl">
            Candidate ingestion and deterministic matching service powered by raw SQL and multi-factor ranking.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold ${
            backendConnected 
              ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/40' 
              : 'bg-amber-950/60 text-amber-300 border border-amber-500/40'
          }`}>
            <span className={`w-2 h-2 rounded-full ${backendConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
            <span>{backendConnected ? 'Express API: Connected (Port 4000)' : 'Client Engine Mode'}</span>
          </span>
        </div>
      </div>

      {/* Mode Switcher */}
      <div className="flex items-center justify-between border-b border-purple-500/20 pb-4">
        <div className="flex items-center gap-2 p-1.5 bg-purple-950/70 rounded-2xl border border-purple-500/20">
          <button
            type="button"
            onClick={() => setMode('job')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              mode === 'job'
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md border border-purple-400/40'
                : 'text-purple-300 hover:text-white'
            }`}
          >
            Find Candidates for a Job
          </button>
          <button
            type="button"
            onClick={() => setMode('candidate')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              mode === 'candidate'
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md border border-purple-400/40'
                : 'text-purple-300 hover:text-white'
            }`}
          >
            Find Jobs for a Candidate
          </button>
        </div>

        <div className="text-xs text-purple-300 font-mono">
          Scoring: <strong className="text-white">Skills (50%) + Exp (25%) + Culture (15%) + Avail (10%)</strong>
        </div>
      </div>

      {/* Selector Toolbar */}
      {mode === 'job' ? (
        <div className="glass-purple-card p-5 rounded-3xl space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-purple-300 flex items-center gap-1.5">
              <Briefcase className="w-4 h-4 text-fuchsia-400" />
              Select Job Opening:
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {SEED_JOBS.map(job => (
              <button
                key={job.id}
                type="button"
                onClick={() => setSelectedJobId(job.id)}
                className={`text-left p-3.5 rounded-2xl border transition-all ${
                  selectedJobId === job.id
                    ? 'bg-gradient-to-br from-purple-900/80 to-indigo-950/80 border-purple-400/80 ring-2 ring-purple-500/30 shadow-lg text-white'
                    : 'bg-purple-950/40 border-purple-500/20 text-purple-200 hover:border-purple-400/40 hover:bg-purple-900/40'
                }`}
              >
                <div className="font-bold text-white text-sm">{job.title}</div>
                <div className="text-xs text-fuchsia-400 font-medium italic mt-0.5">
                  &ldquo;{job.tagline}&rdquo;
                </div>
                <div className="text-[11px] text-purple-300/80 mt-2 flex items-center justify-between">
                  <span>Min exp: {job.min_experience} yrs</span>
                  <span>Required: {job.required_skills.split(',').length} skills</span>
                </div>
              </button>
            ))}
          </div>

          <div className="pt-2 border-t border-purple-500/20 flex flex-wrap items-center justify-between text-xs text-purple-300 gap-2">
            <div>
              <strong className="text-white">Required skills:</strong> {activeJob.required_skills}
            </div>
            <div>
              <strong className="text-white">Culture keywords:</strong> {activeJob.culture_keywords}
            </div>
          </div>
        </div>
      ) : (
        <div className="glass-purple-card p-5 rounded-3xl space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-purple-300 flex items-center gap-1.5">
              <UserCheck className="w-4 h-4 text-fuchsia-400" />
              Select Candidate:
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
            {SEED_CANDIDATES.map(c => (
              <button
                key={c.id}
                type="button"
                onClick={() => setSelectedCandidateId(c.id)}
                className={`text-left p-3 rounded-2xl border transition-all ${
                  selectedCandidateId === c.id
                    ? 'bg-gradient-to-br from-purple-900/80 to-indigo-950/80 border-purple-400/80 ring-2 ring-purple-500/30 shadow-lg text-white'
                    : 'bg-purple-950/40 border-purple-500/20 text-purple-200 hover:border-purple-400/40 hover:bg-purple-900/40'
                }`}
              >
                <div className="font-bold text-white text-xs truncate">{c.name}</div>
                <div className="text-[10px] text-purple-300/80 mt-1">
                  {c.experience_years} yrs • {c.availability}
                </div>
              </button>
            ))}
          </div>

          <div className="pt-2 border-t border-purple-500/20 text-xs text-purple-300 space-y-1">
            <div><strong className="text-white">Skills:</strong> {activeCandidate.skills}</div>
            <div><strong className="text-white">Quirk:</strong> &ldquo;{activeCandidate.quirk}&rdquo;</div>
          </div>
        </div>
      )}

      {/* Matches Grid */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Award className="w-5 h-5 text-fuchsia-400" />
            <span>Ranked Matches ({matches.length})</span>
          </h2>
          {isLoading && (
            <span className="text-xs text-purple-300 flex items-center gap-1">
              <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Computing...
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {matches.map((match: MatchResult, rank: number) => {
            const isTopMatch = rank === 0;
            return (
              <div
                key={`${match.candidateId}-${match.jobId}`}
                className={`p-5 rounded-3xl border transition-all backdrop-blur-xl hover:-translate-y-1 hover:shadow-2xl ${
                  isTopMatch
                    ? 'bg-gradient-to-br from-purple-950/90 via-indigo-950/70 to-purple-950/90 border-fuchsia-400/60 shadow-xl ring-2 ring-fuchsia-500/30'
                    : 'glass-purple-card'
                }`}
              >
                {/* Header with Rank & Score */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`w-7 h-7 rounded-xl flex items-center justify-center font-extrabold text-xs ${
                        isTopMatch
                          ? 'bg-fuchsia-900/70 text-fuchsia-200 border border-fuchsia-400/50'
                          : 'bg-purple-950/60 text-purple-300 border border-purple-500/30'
                      }`}
                    >
                      #{rank + 1}
                    </span>
                    <div>
                      <h3 className="font-bold text-white text-base">
                        {mode === 'job' ? match.candidateName : match.jobTitle}
                      </h3>
                      <div className="text-xs text-purple-300">
                        {mode === 'job' ? `Candidate #${match.candidateId}` : `Role #${match.jobId}`}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-2xl font-black text-fuchsia-400 font-mono tracking-tight text-neon-glow">
                      {match.score}
                      <span className="text-xs text-purple-300 font-normal">/100</span>
                    </div>
                  </div>
                </div>

                {/* Score Breakdown Bar */}
                <div className="space-y-1.5 mb-3 bg-purple-950/60 p-2.5 rounded-xl border border-purple-500/20 text-[11px]">
                  <div className="flex justify-between text-purple-200">
                    <span>Skills: <strong className="text-white">{match.scoreBreakdown.skillsScore}/50</strong></span>
                    <span>Exp: <strong className="text-white">{match.scoreBreakdown.experienceScore}/25</strong></span>
                    <span>Culture: <strong className="text-white">{match.scoreBreakdown.cultureScore}/15</strong></span>
                    <span>Avail: <strong className="text-white">{match.scoreBreakdown.availabilityScore}/10</strong></span>
                  </div>
                  <div className="w-full bg-purple-950 h-1.5 rounded-full overflow-hidden flex border border-purple-500/20">
                    <div style={{ width: `${(match.scoreBreakdown.skillsScore / 50) * 50}%` }} className="bg-purple-500 h-full" />
                    <div style={{ width: `${(match.scoreBreakdown.experienceScore / 25) * 25}%` }} className="bg-emerald-400 h-full" />
                    <div style={{ width: `${(match.scoreBreakdown.cultureScore / 15) * 15}%` }} className="bg-amber-400 h-full" />
                    <div style={{ width: `${(match.scoreBreakdown.availabilityScore / 10) * 10}%` }} className="bg-sky-400 h-full" />
                  </div>
                </div>

                {/* Skills tags */}
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {match.matchingSkills.map((s: string) => (
                    <span key={s} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-emerald-950/60 text-emerald-300 border border-emerald-500/40">
                      <CheckCircle2 className="w-3 h-3" /> {s}
                    </span>
                  ))}
                  {match.missingSkills.map((s: string) => (
                    <span key={s} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-rose-950/60 text-rose-300 border border-rose-500/40">
                      <XCircle className="w-3 h-3" /> missing: {s}
                    </span>
                  ))}
                </div>

                {/* Human-readable Reason */}
                <div className="text-xs text-purple-200/90 bg-purple-950/50 p-3 rounded-2xl border border-purple-500/20 italic">
                  &ldquo;{match.reason}&rdquo;
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </main>
  );
};
