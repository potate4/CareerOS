import React, { useState, useMemo } from 'react';
import { futurecastAPI } from '../services/futurecastAPI';
import { FuturecastRequestDTO, FuturecastRoadmapDTO, CareerPathDTO, RoadmapProgressDTO } from '../types';
import AuthenticatedLayout from '../../../components/layout/AuthenticatedLayout';
import { CheckCircle2, Circle, ArrowRight, Crown } from 'lucide-react';

const defaultPayload: FuturecastRequestDTO = {
  careerGoal: 'Senior Software Engineer',
  timelineYears: 5,
  preferences: { workEnvironment: 'remote' },
  userProfile: { currentRole: 'Software Engineer', skills: ['Java', 'Spring Boot', 'SQL'], education: "Bachelor's in CS", yearsOfExperience: 2 },
  marketData: { averageSalaryGrowth: 0.08, jobDemandTrend: 'increasing', industryGrowthRate: 0.1 }
};

function ProgressBar({ value }: { value: number }) {
  return (
    <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
      <div className="h-full bg-emerald-500 transition-all" style={{ width: `${Math.min(100, Math.max(0, value))}%` }} />
    </div>
  );
}

function RoadmapNodeGraph({ roadmap }: { roadmap: FuturecastRoadmapDTO }) {
  const paddingX = 80;
  const paddingY = 60;
  const rowGap = 120;
  const nodeRadius = 9;

  const paths = roadmap.paths || [];
  const years = Array.from({ length: roadmap.timelineYears }, (_, i) => i + 1);
  const height = paddingY * 2 + Math.max(1, paths.length) * rowGap;
  const width = 1000;
  const xStep = (width - paddingX * 2) / Math.max(1, years.length - 1);

  const colorForPath = (p: CareerPathDTO) => (p.isSelected ? '#059669' : '#64748b'); // emerald-600 or slate-500

  const sortedPaths = useMemo(() => (
    paths.map(p => ({
      ...p,
      milestones: [...(p.milestones || [])].sort((a, b) => a.year - b.year)
    }))
  ), [paths]);

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-slate-900">Roadmap Visualization</h3>
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <span className="inline-block w-3 h-3 rounded-full bg-emerald-500"></span>
            <span className="text-slate-600">Active Plan</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-block w-3 h-3 rounded-full bg-slate-400"></span>
            <span className="text-slate-600">Alternative</span>
          </div>
        </div>
      </div>

      <div className="w-full overflow-x-auto">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full min-w-[900px] h-[380px]">
          {years.map((y, idx) => (
            <g key={y}>
              <line x1={paddingX + idx * xStep} y1={paddingY - 30} x2={paddingX + idx * xStep} y2={height - paddingY + 20} stroke="#e2e8f0" strokeDasharray="4 6" />
              <text x={paddingX + idx * xStep} y={paddingY - 40} textAnchor="middle" className="fill-slate-500 text-xs">Year {y}</text>
            </g>
          ))}

          {sortedPaths.map((p, pi) => {
            const y = paddingY + pi * rowGap;
            const points = p.milestones.map(m => ({ x: paddingX + (Math.min(roadmap.timelineYears, Math.max(1, m.year)) - 1) * xStep, y }));
            const stroke = colorForPath(p);
            return (
              <g key={p.id}>
                {points.map((pt, i) => i > 0 && (
                  <line key={i} x1={points[i - 1].x} y1={points[i - 1].y} x2={pt.x} y2={pt.y} stroke={stroke} strokeWidth={2.5} />
                ))}
                {p.milestones.map((m, mi) => {
                  const x = paddingX + (Math.min(roadmap.timelineYears, Math.max(1, m.year)) - 1) * xStep;
                  return (
                    <g key={mi}>
                      <circle cx={x} cy={y} r={nodeRadius} fill={stroke} />
                      <text x={x} y={y - 16} textAnchor="middle" className="fill-slate-700 text-[10px]">
                        {m.title.length > 24 ? m.title.slice(0, 24) + '…' : m.title}
                      </text>
                      {m.expectedSalary && (
                        <text x={x} y={y + 20} textAnchor="middle" className="fill-emerald-600 text-[10px]">
                          ${m.expectedSalary.toLocaleString()}
                        </text>
                      )}
                    </g>
                  );
                })}
                <text x={paddingX - 12} y={y + 4} textAnchor="end" className="fill-slate-600 text-xs">
                  {p.isSelected && '★ '} {p.pathId.toUpperCase()}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}

export default function FuturecastPage() {
  const [payload, setPayload] = useState<FuturecastRequestDTO>(defaultPayload);
  const [loading, setLoading] = useState(false);
  const [roadmap, setRoadmap] = useState<FuturecastRoadmapDTO | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [listPage, setListPage] = useState(0);
  const [listSize] = useState(6);
  const [listData, setListData] = useState<{ roadmaps: FuturecastRoadmapDTO[]; totalItems: number; totalPages: number; currentPage: number; } | null>(null);
  const [progress, setProgress] = useState<RoadmapProgressDTO | null>(null);

  const loadMyRoadmaps = async (page = 0) => {
    try {
      const data = await futurecastAPI.getMyRoadmaps(page, listSize);
      setListData(data);
      setListPage(data.currentPage);
    } catch (e: any) {
      setError(e?.message || 'Failed to fetch roadmaps');
    }
  };

  const refreshProgress = async (id: number) => {
    try { const p = await futurecastAPI.getProgress(id); setProgress(p); } catch {}
  };

  const viewRoadmap = async (id: number) => {
    try {
      const rm = await futurecastAPI.getRoadmap(id);
      setRoadmap(rm);
      refreshProgress(id);
    } catch (e: any) {
      setError(e?.message || 'Failed to fetch roadmap');
    }
  };

  const removeRoadmap = async (id: number) => {
    if (!confirm('Delete this roadmap?')) return;
    try {
      await futurecastAPI.deleteRoadmap(id);
      if (roadmap?.id === id) { setRoadmap(null); setProgress(null); }
      await loadMyRoadmaps(listPage);
    } catch (e: any) {
      setError(e?.message || 'Failed to delete roadmap');
    }
  };

  const choosePath = async (roadmapId: number, pathId: string) => {
    try {
      await futurecastAPI.selectPath(roadmapId, pathId);
      await viewRoadmap(roadmapId);
    } catch (e: any) {
      setError(e?.message || 'Failed to set active plan');
    }
  };

  const toggleMilestone = async (milestoneId: number, isCompleted: boolean) => {
    try {
      if (isCompleted) {
        await futurecastAPI.markMilestoneComplete(milestoneId);
      } else {
        await futurecastAPI.markMilestoneUncomplete(milestoneId);
      }
      if (roadmap) await viewRoadmap(roadmap.id);
    } catch (e: any) {
      try {
        await futurecastAPI.updateMilestone(milestoneId, { isCompleted });
        if (roadmap) await viewRoadmap(roadmap.id);
      } catch (err: any) {
        setError(err?.message || 'Failed to update milestone');
      }
    }
  };

  const generate = async () => {
    try {
      setLoading(true);
      setError(null);
      const resp = await futurecastAPI.generateRoadmap(payload);
      await viewRoadmap(resp.roadmapId);
      await loadMyRoadmaps(0);
    } catch (e: any) {
      setError(e?.message || 'Failed to generate');
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => { loadMyRoadmaps(0); }, []);

  return (
    <AuthenticatedLayout>
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
        <div className="max-w-7xl mx-auto p-6 space-y-6">
          {/* Header / Controls */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
                  <span className="inline-flex items-center justify-center w-8 h-8 rounded-xl bg-slate-800 text-white"><Crown size={16} /></span>
                  FutureCast
                </h2>
                <p className="text-slate-600 text-sm mt-1">Choose an active plan to track progress. Selecting a path sets your "Active Plan" used for progress and reminders.</p>
              </div>
              <div className="flex items-end gap-3">
                <div>
                  <label className="block text-sm text-slate-600 mb-1">Career Goal</label>
                  <input className="w-64 rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-500"
                    value={payload.careerGoal}
                    onChange={(e) => setPayload({ ...payload, careerGoal: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm text-slate-600 mb-1">Timeline (years)</label>
                  <input type="number" className="w-32 rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-500"
                    value={payload.timelineYears}
                    onChange={(e) => setPayload({ ...payload, timelineYears: Number(e.target.value) })} />
                </div>
                <button onClick={generate} disabled={loading}
                  className="h-10 mt-6 px-5 rounded-lg font-semibold bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-50 flex items-center gap-2">
                  {loading ? 'Generating…' : 'Generate'} <ArrowRight size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* My Roadmaps List */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-slate-900">My Roadmaps</h3>
              <div className="text-sm text-slate-600">Page {listPage + 1} / {listData?.totalPages || 1}</div>
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              {listData?.roadmaps?.map(r => (
                <div key={r.id} className="rounded-2xl p-4 bg-white border border-slate-200 hover:shadow transition">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-slate-900">{r.careerGoal}</div>
                      <div className="text-xs text-slate-500">{r.timelineYears} years</div>
                    </div>
                    <div className="text-xs text-slate-500">#{r.id}</div>
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    <button onClick={() => viewRoadmap(r.id)} className="px-3 py-1.5 rounded bg-slate-900 text-white text-xs">View</button>
                    <button onClick={() => refreshProgress(r.id)} className="px-3 py-1.5 rounded bg-slate-100 text-slate-700 text-xs border border-slate-200">Progress</button>
                    <button onClick={() => removeRoadmap(r.id)} className="px-3 py-1.5 rounded bg-red-600 text-white text-xs">Delete</button>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 flex items-center justify-between">
              <button disabled={!listData || listPage <= 0} onClick={() => loadMyRoadmaps(listPage - 1)} className="px-3 py-1.5 rounded bg-slate-100 text-slate-700 text-xs border border-slate-200 disabled:opacity-50">Prev</button>
              <button disabled={!listData || (listData && listPage >= (listData.totalPages - 1))} onClick={() => loadMyRoadmaps(listPage + 1)} className="px-3 py-1.5 rounded bg-slate-100 text-slate-700 text-xs border border-slate-200 disabled:opacity-50">Next</button>
            </div>
          </div>

          {roadmap && (
            <>
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-semibold text-slate-900">{roadmap.careerGoal} • {roadmap.timelineYears} years</h3>
                    {roadmap.explanation && <p className="text-slate-600 text-sm mt-1">{roadmap.explanation}</p>}
                  </div>
                  {progress && (
                    <div className="w-64">
                      <div className="flex items-center justify-between text-xs text-slate-600 mb-1">
                        <span>Overall Progress</span>
                        <span>{Math.round(progress.overallProgress)}%</span>
                      </div>
                      <ProgressBar value={progress.overallProgress} />
                    </div>
                  )}
                </div>
              </div>

              <RoadmapNodeGraph roadmap={roadmap} />

              <div className="grid md:grid-cols-3 gap-4">
                {roadmap.paths?.map((p) => (
                  <div key={p.id} className={`rounded-2xl p-4 bg-white border ${p.isSelected ? 'border-emerald-500 shadow-md' : 'border-slate-200 hover:shadow'}`}>
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-slate-900 flex items-center gap-2">
                        {p.isSelected && <span className="inline-flex items-center text-emerald-600 text-xs font-semibold gap-1"><Crown size={14} /> Active Plan</span>}
                        {p.description}
                      </h4>
                      <span className="text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-600">{p.pathId}</span>
                    </div>
                    <div className="mt-2 text-sm text-slate-600">
                      <div>Difficulty: <b>{p.difficulty || 'MEDIUM'}</b></div>
                      {p.probability != null && <div>Probability: <b>{Math.round(p.probability * 100)}%</b></div>}
                      <div>Risk: <b>{p.riskLevel || 'MEDIUM'}</b></div>
                    </div>
                    <div className="mt-3 flex items-center gap-2">
                      <button onClick={() => choosePath(roadmap.id, p.pathId)} disabled={p.isSelected} className={`px-3 py-1.5 rounded text-xs ${p.isSelected ? 'bg-emerald-100 text-emerald-700 cursor-default' : 'bg-emerald-600 text-white hover:bg-emerald-700'}`}>
                        {p.isSelected ? 'Active Plan' : 'Set Active Plan'}
                      </button>
                      <button onClick={() => refreshProgress(roadmap.id)} className="px-3 py-1.5 rounded bg-slate-100 text-slate-700 text-xs border border-slate-200">Refresh Progress</button>
                    </div>
                    <div className="mt-4">
                      <div className="text-xs text-slate-500 mb-2">Milestones</div>
                      <div className="space-y-2">
                        {p.milestones?.map(m => (
                          <div key={m.id} className="bg-slate-50 rounded-lg p-2 border border-slate-200 flex items-center justify-between">
                            <div className="flex flex-col">
                              <span className="text-sm text-slate-800">Year {m.year}: {m.title}</span>
                              {m.expectedSalary && <span className="text-xs text-emerald-700">${m.expectedSalary.toLocaleString()}</span>}
                            </div>
                            <button onClick={() => toggleMilestone(m.id, !m.isCompleted)} className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded ${m.isCompleted ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'}`}>
                              {m.isCompleted ? <CheckCircle2 size={14} /> : <Circle size={14} />}
                              {m.isCompleted ? 'Completed' : 'Mark Complete'}
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 rounded-xl p-3 text-sm shadow-sm">{error}</div>
          )}
        </div>
      </div>
    </AuthenticatedLayout>
  );
} 