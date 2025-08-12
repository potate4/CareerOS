import React, { useState } from 'react';
import { futurecastAPI } from '../services/futurecastAPI';
import { FuturecastRequestDTO, FuturecastRoadmapDTO } from '../types';

const defaultPayload: FuturecastRequestDTO = {
  careerGoal: 'Senior Software Engineer',
  timelineYears: 5,
  preferences: { workEnvironment: 'remote' },
  userProfile: { currentRole: 'Software Engineer', skills: ['Java', 'Spring Boot', 'SQL'], education: "Bachelor's in CS", yearsOfExperience: 2 },
  marketData: { averageSalaryGrowth: 0.08, jobDemandTrend: 'increasing', industryGrowthRate: 0.1 }
};

export default function FuturecastPage() {
  const [payload, setPayload] = useState<FuturecastRequestDTO>(defaultPayload);
  const [loading, setLoading] = useState(false);
  const [roadmap, setRoadmap] = useState<FuturecastRoadmapDTO | null>(null);
  const [error, setError] = useState<string | null>(null);

  const generate = async () => {
    try {
      setLoading(true);
      setError(null);
      const resp = await futurecastAPI.generateRoadmap(payload);
      const rm = await futurecastAPI.getRoadmap(resp.roadmapId);
      setRoadmap(rm);
    } catch (e: any) {
      setError(e?.message || 'Failed to generate');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6 text-slate-100">
      <div className="bg-slate-800 rounded-lg p-4 space-y-4">
        <h2 className="text-xl font-semibold">FutureCast</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm mb-1">Career Goal</label>
            <input className="w-full rounded bg-slate-700 p-2" value={payload.careerGoal}
              onChange={(e) => setPayload({ ...payload, careerGoal: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm mb-1">Timeline (years)</label>
            <input type="number" className="w-full rounded bg-slate-700 p-2" value={payload.timelineYears}
              onChange={(e) => setPayload({ ...payload, timelineYears: Number(e.target.value) })} />
          </div>
          <div className="flex items-end">
            <button onClick={generate} disabled={loading} className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 px-4 py-2 rounded">
              {loading ? 'Generating...' : 'Generate Roadmap'}
            </button>
          </div>
        </div>
        {error && <div className="text-red-400 text-sm">{error}</div>}
      </div>

      {roadmap && (
        <div className="space-y-6">
          <div className="bg-slate-800 rounded-lg p-4">
            <h3 className="text-lg font-semibold">{roadmap.careerGoal} • {roadmap.timelineYears} years</h3>
            {roadmap.explanation && <p className="text-slate-300 text-sm mt-1">{roadmap.explanation}</p>}
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            {roadmap.paths?.map((p) => (
              <div key={p.id} className={`rounded-lg p-4 bg-slate-800 border ${p.isSelected ? 'border-emerald-500' : 'border-slate-700'}`}>
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold">{p.description}</h4>
                  <span className="text-xs px-2 py-0.5 rounded bg-slate-700">{p.pathId}</span>
                </div>
                <div className="mt-2 text-sm text-slate-300">
                  <div>Difficulty: <b>{p.difficulty || 'MEDIUM'}</b></div>
                  {p.probability != null && <div>Probability: <b>{Math.round(p.probability * 100)}%</b></div>}
                  <div>Risk: <b>{p.riskLevel || 'MEDIUM'}</b></div>
                </div>
                <div className="mt-3">
                  <div className="text-xs text-slate-400 mb-1">Milestones</div>
                  <div className="space-y-2">
                    {p.milestones?.map(m => (
                      <div key={m.id} className="bg-slate-700 rounded p-2">
                        <div className="flex items-center justify-between text-sm">
                          <span>Year {m.year}: {m.title}</span>
                          {m.expectedSalary && <span className="text-emerald-300">${m.expectedSalary.toLocaleString()}</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 