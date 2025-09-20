import React, { useState, useMemo, useRef } from 'react';
import { futurecastAPI } from '../services/futurecastAPI';
import { FuturecastRequestDTO, FuturecastRoadmapDTO, CareerPathDTO, RoadmapProgressDTO, SubtaskDTO } from '../types';
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
    <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden shadow-inner">
      <div 
        className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full transition-all duration-500 ease-out shadow-sm" 
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }} 
      />
    </div>
  );
}

function RoadmapNodeGraph({ roadmap }: { roadmap: FuturecastRoadmapDTO }) {
  const paddingX = 100;
  const paddingY = 80;
  const rowGap = 150;
  const nodeRadius = 12;

  const paths = roadmap.paths || [];
  const years = Array.from({ length: roadmap.timelineYears }, (_, i) => i + 1);
  const height = paddingY * 2 + Math.max(1, paths.length) * rowGap;
  const width = 1200;
  const xStep = (width - paddingX * 2) / Math.max(1, years.length - 1);

  const colorForPath = (p: CareerPathDTO) => (p.isSelected ? '#6366f1' : '#64748b'); // indigo-500 or slate-500

  const sortedPaths = useMemo(() => (
    paths.map(p => ({
      ...p,
      milestones: [...(p.milestones || [])].sort((a, b) => a.year - b.year)
    }))
  ), [paths]);

  return (
    <div className="bg-white/90 backdrop-blur-sm border border-slate-200/50 rounded-3xl p-8 shadow-xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-gradient-to-r from-indigo-100 to-purple-100 border border-indigo-200">
            <ArrowRight className="h-5 w-5 text-indigo-600" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900">Career Path Visualization</h3>
            <p className="text-sm text-slate-600">Interactive timeline of your career journey</p>
          </div>
        </div>
        <div className="flex items-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <span className="inline-block w-3 h-3 rounded-full bg-indigo-500 shadow-sm"></span>
            <span className="text-slate-600 font-medium">Active Plan</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-block w-3 h-3 rounded-full bg-slate-400"></span>
            <span className="text-slate-600 font-medium">Alternative</span>
          </div>
        </div>
      </div>

      <div className="w-full overflow-x-auto bg-gradient-to-br from-slate-50 to-indigo-50 rounded-2xl p-6 border border-slate-200">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full min-w-[1100px] h-[500px]">
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
                        <text x={x} y={y + 20} textAnchor="middle" className="fill-indigo-600 text-[10px] font-semibold">
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

  const breakdownMilestone = async (mId: number, title: string, year: number) => {
    if (!roadmap) return;
    try {
      await futurecastAPI.breakdownMilestone(mId, {
        goal: roadmap.careerGoal,
        milestoneTitle: title,
        milestoneYear: year,
        timelineYears: roadmap.timelineYears,
      });
      await viewRoadmap(roadmap.id);
    } catch (e: any) {
      setError(e?.message || 'Failed to breakdown milestone');
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

  const toggleSubtask = async (subtaskId: number, isCompleted: boolean) => {
    try {
      // Try PUT first (consistent with milestone update path)
      await futurecastAPI.updateSubtask(subtaskId, { isCompleted });
      if (roadmap) await viewRoadmap(roadmap.id);
    } catch (e: any) {
      try {
        if (isCompleted) await futurecastAPI.markSubtaskComplete(subtaskId);
        else await futurecastAPI.markSubtaskUncomplete(subtaskId);
        if (roadmap) await viewRoadmap(roadmap.id);
      } catch (err: any) {
        setError(err?.message || 'Failed to update subtask');
      }
    }
  };

  // StrictMode-safe one-time init
  const initRef = useRef(false);
  React.useEffect(() => {
    if (initRef.current) return; // prevent double invoke in React 18 StrictMode (dev only)
    initRef.current = true;
    loadMyRoadmaps(0);
  }, []);

  return (
    <AuthenticatedLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-50">
        <div className="max-w-7xl mx-auto p-6 space-y-8">
          {/* Hero Header */}
          <div className="bg-white/90 backdrop-blur-sm border border-slate-200/50 rounded-3xl p-8 shadow-xl">
            <div className="flex items-start justify-between gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-700 shadow-lg">
                    <Crown className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h1 className="text-4xl font-bold text-slate-900">FutureCast</h1>
                    <p className="text-lg text-indigo-600 font-medium">AI Career Path Simulator</p>
                  </div>
                </div>
                <p className="text-slate-600 text-lg leading-relaxed max-w-2xl">
                  Visualize your career journey with AI-powered roadmaps. Set goals, track progress, and navigate your path to success with personalized milestones and actionable insights.
                </p>
              </div>
              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-6 border border-indigo-200/50">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Generate New Roadmap</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Career Goal</label>
                    <input 
                      className="w-full rounded-xl border border-slate-200 bg-white/70 px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-all duration-200 backdrop-blur-sm"
                      value={payload.careerGoal}
                      onChange={(e) => setPayload({ ...payload, careerGoal: e.target.value })} 
                      placeholder="e.g., Senior Software Engineer"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Timeline (years)</label>
                    <input 
                      type="number" 
                      className="w-full rounded-xl border border-slate-200 bg-white/70 px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-all duration-200 backdrop-blur-sm"
                      value={payload.timelineYears}
                      onChange={(e) => setPayload({ ...payload, timelineYears: Number(e.target.value) })} 
                      min="1"
                      max="20"
                    />
                  </div>
                  <button 
                    onClick={generate} 
                    disabled={loading}
                    className="w-full px-6 py-3.5 rounded-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-700 text-white hover:from-indigo-700 hover:to-purple-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl hover:-translate-y-0.5 flex items-center justify-center gap-3"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                        Generating AI Roadmap...
                      </>
                    ) : (
                      <>
                        <Crown className="h-5 w-5" />
                        Generate Career Path
                        <ArrowRight size={16} />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* My Roadmaps List */}
          <div className="bg-white/90 backdrop-blur-sm border border-slate-200/50 rounded-3xl p-8 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-slate-100">
                  <ArrowRight className="h-5 w-5 text-slate-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900">My Career Roadmaps</h3>
                  <p className="text-sm text-slate-600">Track your progress across multiple career paths</p>
                </div>
              </div>
              <div className="text-sm text-slate-600 bg-slate-50 px-3 py-2 rounded-lg">
                Page {listPage + 1} of {listData?.totalPages || 1}
              </div>
            </div>
            
            {listData?.roadmaps?.length === 0 ? (
              <div className="text-center py-12">
                <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 inline-block mb-4 shadow-lg">
                  <Crown className="h-8 w-8 text-slate-600" />
                </div>
                <h4 className="text-lg font-semibold text-slate-700 mb-2">No Roadmaps Yet</h4>
                <p className="text-sm text-slate-500 max-w-sm mx-auto leading-relaxed">
                  Generate your first AI-powered career roadmap to start visualizing your path to success.
                </p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {listData?.roadmaps?.map(r => (
                  <div key={r.id} className="group relative bg-gradient-to-br from-white to-slate-50 border border-slate-200 rounded-2xl p-6 hover:shadow-xl hover:border-indigo-200 transition-all duration-300 hover:-translate-y-1">
                    <div className="absolute top-4 right-4">
                      <div className="text-xs text-slate-400 bg-slate-100 px-2 py-1 rounded-lg">#{r.id}</div>
                    </div>
                    <div className="mb-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Crown className="h-4 w-4 text-indigo-600" />
                        <h4 className="font-bold text-slate-900 text-lg">{r.careerGoal}</h4>
                      </div>
                      <p className="text-sm text-slate-600">{r.timelineYears} year timeline</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => viewRoadmap(r.id)} 
                        className="flex-1 px-4 py-2.5 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-700 text-white text-sm font-medium hover:from-indigo-700 hover:to-purple-800 transition-all duration-200 shadow-md hover:shadow-lg"
                      >
                        View Roadmap
                      </button>
                      <button 
                        onClick={() => refreshProgress(r.id)} 
                        className="p-2.5 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors border border-slate-200"
                        title="Check Progress"
                      >
                        <ArrowRight className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => removeRoadmap(r.id)} 
                        className="p-2.5 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 transition-colors border border-red-200"
                        title="Delete Roadmap"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {listData && listData.totalPages > 1 && (
              <div className="mt-8 flex items-center justify-center gap-4">
                <button 
                  disabled={!listData || listPage <= 0} 
                  onClick={() => loadMyRoadmaps(listPage - 1)} 
                  className="px-4 py-2 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors border border-slate-200"
                >
                  Previous
                </button>
                <button 
                  disabled={!listData || (listData && listPage >= (listData.totalPages - 1))} 
                  onClick={() => loadMyRoadmaps(listPage + 1)} 
                  className="px-4 py-2 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors border border-slate-200"
                >
                  Next
                </button>
              </div>
            )}
          </div>

          {roadmap && (
            <>
              <div className="bg-white/90 backdrop-blur-sm border border-slate-200/50 rounded-3xl p-8 shadow-xl">
                <div className="flex items-start justify-between gap-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 rounded-lg bg-gradient-to-r from-indigo-100 to-purple-100 border border-indigo-200">
                        <Crown className="h-5 w-5 text-indigo-600" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-slate-900">{roadmap.careerGoal}</h3>
                        <p className="text-indigo-600 font-medium">{roadmap.timelineYears} Year Career Journey</p>
                      </div>
                    </div>
                    {roadmap.explanation && (
                      <p className="text-slate-600 leading-relaxed max-w-2xl">{roadmap.explanation}</p>
                    )}
                  </div>
                  {progress && (
                    <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-6 border border-indigo-200/50 min-w-[280px]">
                      <h4 className="text-lg font-semibold text-slate-900 mb-3">Progress Overview</h4>
                      <div className="space-y-3">
                        <div>
                          <div className="flex items-center justify-between text-sm text-slate-600 mb-2">
                            <span className="font-medium">Overall Progress</span>
                            <span className="font-bold text-indigo-600">{Math.round(progress.overallProgress)}%</span>
                          </div>
                          <ProgressBar value={progress.overallProgress} />
                        </div>
                        <div className="text-xs text-slate-500 pt-2 border-t border-indigo-200">
                          Keep up the great work! You're making steady progress toward your career goal.
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <RoadmapNodeGraph roadmap={roadmap} />

              <div className="grid md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {roadmap.paths?.map((p) => (
                  <div key={p.id} className={`rounded-2xl p-6 bg-white/90 backdrop-blur-sm border shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 ${p.isSelected ? 'border-indigo-400 bg-gradient-to-br from-indigo-50 to-purple-50' : 'border-slate-200 hover:border-slate-300'}`}>
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {p.isSelected && (
                            <div className="flex items-center gap-1 bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-xs font-bold px-2 py-1 rounded-lg shadow-sm">
                              <Crown size={12} /> Active Plan
                            </div>
                          )}
                        </div>
                        <h4 className="font-bold text-slate-900 text-lg leading-tight">{p.description}</h4>
                      </div>
                      <span className="text-xs px-2 py-1 rounded-lg bg-slate-100 text-slate-600 font-medium">{p.pathId}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-3 mb-4 text-sm">
                      <div className="text-center p-2 bg-slate-50 rounded-lg">
                        <div className="text-xs text-slate-500 mb-1">Difficulty</div>
                        <div className="font-bold text-slate-700">{p.difficulty || 'MEDIUM'}</div>
                      </div>
                      {p.probability != null && (
                        <div className="text-center p-2 bg-slate-50 rounded-lg">
                          <div className="text-xs text-slate-500 mb-1">Success Rate</div>
                          <div className="font-bold text-indigo-600">{Math.round(p.probability * 100)}%</div>
                        </div>
                      )}
                      <div className="text-center p-2 bg-slate-50 rounded-lg">
                        <div className="text-xs text-slate-500 mb-1">Risk Level</div>
                        <div className="font-bold text-slate-700">{p.riskLevel || 'MEDIUM'}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mb-4">
                      <button 
                        onClick={() => choosePath(roadmap.id, p.pathId)} 
                        disabled={p.isSelected} 
                        className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                          p.isSelected 
                            ? 'bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-700 cursor-default border border-indigo-200' 
                            : 'bg-gradient-to-r from-indigo-600 to-purple-700 text-white hover:from-indigo-700 hover:to-purple-800 shadow-md hover:shadow-lg'
                        }`}
                      >
                        {p.isSelected ? '✓ Active Plan' : 'Set as Active'}
                      </button>
                      <button 
                        onClick={() => refreshProgress(roadmap.id)} 
                        className="p-2.5 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors border border-slate-200"
                        title="Refresh Progress"
                      >
                        <ArrowRight className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                      <div className="flex items-center gap-2 mb-3">
                        <Crown className="h-4 w-4 text-indigo-600" />
                        <span className="text-sm font-semibold text-slate-700">Milestones ({p.milestones?.length || 0})</span>
                      </div>
                      <div className="space-y-3">
                        {p.milestones?.map(m => (
                          <div key={m.id} className="bg-white rounded-lg p-4 border border-slate-200 shadow-sm">
                            <div className="flex items-start justify-between gap-3 mb-3">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded-lg font-medium">Year {m.year}</span>
                                </div>
                                <h5 className="text-sm font-semibold text-slate-800 leading-tight">{m.title}</h5>
                                {m.expectedSalary && (
                                  <div className="text-xs text-indigo-600 font-semibold mt-1">
                                    💰 ${m.expectedSalary.toLocaleString()}
                                  </div>
                                )}
                              </div>
                              <div className="flex items-center gap-2">
                                <button 
                                  onClick={() => toggleMilestone(m.id, !m.isCompleted)} 
                                  className={`inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg font-medium transition-all ${
                                    m.isCompleted 
                                      ? 'bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-700 border border-indigo-200' 
                                      : 'bg-slate-200 text-slate-700 hover:bg-slate-300 border border-slate-300'
                                  }`}
                                >
                                  {m.isCompleted ? <CheckCircle2 size={14} /> : <Circle size={14} />}
                                  {m.isCompleted ? 'Completed' : 'Mark Complete'}
                                </button>
                                <button 
                                  onClick={() => breakdownMilestone(m.id, m.title, m.year)} 
                                  className="inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg bg-gradient-to-r from-slate-600 to-slate-700 text-white hover:from-slate-700 hover:to-slate-800 transition-all font-medium"
                                >
                                  Break Down
                                </button>
                              </div>
                            </div>
                            {m.subtasks && m.subtasks.length > 0 && (
                              <div className="border-l-4 border-indigo-200 pl-4 ml-2 space-y-2">
                                <div className="text-xs font-semibold text-slate-600 mb-2">Subtasks:</div>
                                {m.subtasks.map((t: SubtaskDTO) => (
                                  <div key={t.id} className="bg-slate-50 rounded-lg p-3 border border-slate-200 flex items-start justify-between gap-3">
                                    <div className="flex-1">
                                      <div className={`text-sm font-medium ${t && (t as any).isCompleted ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                                        {t.title}
                                      </div>
                                      {t.description && (
                                        <div className="text-xs text-slate-600 mt-1">{t.description}</div>
                                      )}
                                      {t.estimatedTime && (
                                        <div className="text-xs text-indigo-600 font-medium mt-1">⏱️ {t.estimatedTime}</div>
                                      )}
                                    </div>
                                    <button 
                                      onClick={() => toggleSubtask(t.id, !(t as any).isCompleted)} 
                                      className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-lg font-medium transition-all ${
                                        (t as any).isCompleted 
                                          ? 'bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-700 border border-indigo-200' 
                                          : 'bg-slate-200 text-slate-700 hover:bg-slate-300 border border-slate-300'
                                      }`}
                                    >
                                      {(t as any).isCompleted ? <CheckCircle2 size={14} /> : <Circle size={14} />}
                                      {(t as any).isCompleted ? 'Done' : 'Mark Done'}
                                    </button>
                                  </div>
                                ))}
                              </div>
                            )}
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