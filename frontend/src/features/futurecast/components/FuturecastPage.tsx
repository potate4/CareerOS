import React, { useState, useMemo } from 'react';
import { futurecastAPI } from '../services/futurecastAPI';
import { FuturecastRequestDTO, FuturecastRoadmapDTO, CareerPathDTO } from '../types';
import AuthenticatedLayout from '../../../components/layout/AuthenticatedLayout';

const defaultPayload: FuturecastRequestDTO = {
  careerGoal: 'Senior Software Engineer',
  timelineYears: 5,
  preferences: { workEnvironment: 'remote' },
  userProfile: { currentRole: 'Software Engineer', skills: ['Java', 'Spring Boot', 'SQL'], education: "Bachelor's in CS", yearsOfExperience: 2 },
  marketData: { averageSalaryGrowth: 0.08, jobDemandTrend: 'increasing', industryGrowthRate: 0.1 }
};

function RoadmapNodeGraph({ roadmap }: { roadmap: FuturecastRoadmapDTO }) {
  const paddingX = 80;
  const paddingY = 60;
  const rowGap = 120;
  const nodeRadius = 9;

  const paths = roadmap.paths || [];
  const years = Array.from({ length: roadmap.timelineYears }, (_, i) => i + 1);
  const height = paddingY * 2 + Math.max(1, paths.length) * rowGap;
  const width = 1000; // responsive via viewBox
  const xStep = (width - paddingX * 2) / Math.max(1, years.length - 1);

  const colorForPath = (p: CareerPathDTO) => (p.isSelected ? '#34d399' : '#94a3b8'); // emerald-400 or slate-400

  // pre-sort milestones by year
  const sortedPaths = useMemo(() => (
    paths.map(p => ({
      ...p,
      milestones: [...(p.milestones || [])].sort((a, b) => a.year - b.year)
    }))
  ), [paths]);

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-slate-900">Roadmap Visualization</h3>
        <div className="flex items-center gap-3 text-sm">
          <div className="flex items-center gap-2">
            <span className="inline-block w-3 h-3 rounded-full" style={{ background: '#34d399' }}></span>
            <span className="text-slate-600">Recommended Path</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-block w-3 h-3 rounded-full" style={{ background: '#94a3b8' }}></span>
            <span className="text-slate-600">Alternative Path</span>
          </div>
        </div>
      </div>

      <div className="w-full overflow-x-auto">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full min-w-[800px] h-[360px]">
          {/* Year axis */}
          {years.map((y, idx) => (
            <g key={y}>
              <line
                x1={paddingX + idx * xStep}
                y1={paddingY - 30}
                x2={paddingX + idx * xStep}
                y2={height - paddingY + 20}
                stroke="#e2e8f0"
                strokeDasharray="4 6"
              />
              <text x={paddingX + idx * xStep} y={paddingY - 40} textAnchor="middle" className="fill-slate-500 text-xs">
                Year {y}
              </text>
            </g>
          ))}

          {/* Paths lines and nodes */}
          {sortedPaths.map((p, pi) => {
            const y = paddingY + pi * rowGap;
            const points = p.milestones.map(m => ({
              x: paddingX + (Math.min(roadmap.timelineYears, Math.max(1, m.year)) - 1) * xStep,
              y
            }));
            const stroke = colorForPath(p);
            return (
              <g key={p.id}>
                {/* connecting lines */}
                {points.map((pt, i) => i > 0 && (
                  <line key={i} x1={points[i - 1].x} y1={points[i - 1].y} x2={pt.x} y2={pt.y} stroke={stroke} strokeWidth={2} />
                ))}
                {/* nodes */}
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
                {/* path label */}
                <text x={paddingX - 10} y={y + 4} textAnchor="end" className="fill-slate-600 text-xs">
                  {p.pathId.toUpperCase()}
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
  const [listSize, setListSize] = useState(6);
  const [listData, setListData] = useState<{ roadmaps: FuturecastRoadmapDTO[]; totalItems: number; totalPages: number; currentPage: number; } | null>(null);

  const loadMyRoadmaps = async (page = 0) => {
    try {
      const data = await futurecastAPI.getMyRoadmaps(page, listSize);
      setListData(data);
      setListPage(data.currentPage);
    } catch (e: any) {
      setError(e?.message || 'Failed to fetch roadmaps');
    }
  };

  const viewRoadmap = async (id: number) => {
    try {
      const rm = await futurecastAPI.getRoadmap(id);
      setRoadmap(rm);
    } catch (e: any) {
      setError(e?.message || 'Failed to fetch roadmap');
    }
  };

  const removeRoadmap = async (id: number) => {
    if (!confirm('Delete this roadmap?')) return;
    try {
      await futurecastAPI.deleteRoadmap(id);
      if (roadmap?.id === id) setRoadmap(null);
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
      setError(e?.message || 'Failed to select path');
    }
  };

  const showProgress = async (roadmapId: number) => {
    try {
      const prog = await futurecastAPI.getProgress(roadmapId);
      alert(`Overall progress: ${prog.overallProgress}% (Completed ${prog.completedMilestones}/${prog.totalMilestones})`);
    } catch (e: any) {
      setError(e?.message || 'Failed to load progress');
    }
  };

  const generate = async () => {
    try {
      setLoading(true);
      setError(null);
      const resp = await futurecastAPI.generateRoadmap(payload);
      const rm = await futurecastAPI.getRoadmap(resp.roadmapId);
      setRoadmap(rm);
      await loadMyRoadmaps(0);
    } catch (e: any) {
      setError(e?.message || 'Failed to generate');
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    loadMyRoadmaps(0);
  }, []);

  return (
    <AuthenticatedLayout>
      <div className="min-h-screen bg-slate-50">
        <div className="max-w-7xl mx-auto p-6 space-y-6">
          {/* Header / Controls */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">FutureCast</h2>
                <p className="text-slate-600 text-sm mt-1">Generate AI-powered multi-path career roadmaps.</p>
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
                  className="h-10 mt-6 px-4 rounded-lg font-semibold bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-50">
                  {loading ? 'Generating…' : 'Generate'}
                </button>
              </div>
            </div>
            {error && <div className="text-red-600 text-sm mt-2">{error}</div>}
          </div>

          {/* My Roadmaps List */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-slate-900">My Roadmaps</h3>
              <div className="text-sm text-slate-600">Page {listPage + 1} / {listData?.totalPages || 1}</div>
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              {listData?.roadmaps?.map(r => (
                <div key={r.id} className="rounded-2xl p-4 bg-white border border-slate-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-slate-900">{r.careerGoal}</div>
                      <div className="text-xs text-slate-500">{r.timelineYears} years</div>
                    </div>
                    <div className="text-xs text-slate-500">#{r.id}</div>
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    <button onClick={() => viewRoadmap(r.id)} className="px-3 py-1.5 rounded bg-slate-900 text-white text-xs">View</button>
                    <button onClick={() => showProgress(r.id)} className="px-3 py-1.5 rounded bg-slate-100 text-slate-700 text-xs border border-slate-200">Progress</button>
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
              <div className="bg-white border border-slate-200 rounded-2xl p-4">
                <h3 className="text-lg font-semibold text-slate-900">{roadmap.careerGoal} • {roadmap.timelineYears} years</h3>
                {roadmap.explanation && <p className="text-slate-600 text-sm mt-1">{roadmap.explanation}</p>}
              </div>

              <RoadmapNodeGraph roadmap={roadmap} />

              {/* Path cards with actions */}
              <div className="grid md:grid-cols-3 gap-4">
                {roadmap.paths?.map((p) => (
                  <div key={p.id} className={`rounded-2xl p-4 bg-white border ${p.isSelected ? 'border-emerald-500' : 'border-slate-200'}`}>
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-slate-900">{p.description}</h4>
                      <span className="text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-600">{p.pathId}</span>
                    </div>
                    <div className="mt-2 text-sm text-slate-600">
                      <div>Difficulty: <b>{p.difficulty || 'MEDIUM'}</b></div>
                      {p.probability != null && <div>Probability: <b>{Math.round(p.probability * 100)}%</b></div>}
                      <div>Risk: <b>{p.riskLevel || 'MEDIUM'}</b></div>
                    </div>
                    <div className="mt-3 flex items-center gap-2">
                      <button onClick={() => choosePath(roadmap.id, p.pathId)} className="px-3 py-1.5 rounded bg-emerald-600 text-white text-xs">Select Path</button>
                      <button onClick={() => showProgress(roadmap.id)} className="px-3 py-1.5 rounded bg-slate-100 text-slate-700 text-xs border border-slate-200">Progress</button>
                    </div>
                    <div className="mt-3">
                      <div className="text-xs text-slate-500 mb-1">Milestones</div>
                      <div className="space-y-2">
                        {p.milestones?.map(m => (
                          <div key={m.id} className="bg-slate-50 rounded-lg p-2 border border-slate-200">
                            <div className="flex items-center justify-between text-sm text-slate-800">
                              <span>Year {m.year}: {m.title}</span>
                              {m.expectedSalary && <span className="text-emerald-600">${m.expectedSalary.toLocaleString()}</span>}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </AuthenticatedLayout>
  );
} 