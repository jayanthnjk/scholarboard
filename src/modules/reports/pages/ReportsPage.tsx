/**
 * Reports Module - Full implementation with tabbed categories,
 * report generation, export options, and history view.
 */

import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/layout/page-header';
import { PageContent } from '@/components/layout/page-content';
import { AnimatePresence, motion } from 'framer-motion';
import {
  BarChart3, FileText, Download, Clock, Play,
  ChevronLeft, ChevronRight, FileSpreadsheet,
  File, History, Search, RefreshCw,
} from 'lucide-react';
import {
  REPORT_DEFINITIONS, GENERATED_REPORTS, CATEGORY_META,
} from '../data';
import type { ReportCategory, ReportDefinition, GeneratedReport } from '../data';

// --- Types ---

type TabKey = 'reports' | 'history';

const PAGE_SIZE = 8;
const CATEGORIES: ReportCategory[] = ['academic', 'attendance', 'fees', 'admissions', 'staff', 'students'];

// --- Helpers ---

function getFormatIcon(format: string): React.ReactNode {
  switch (format) {
    case 'PDF': return <File className="h-4 w-4 text-red-600" />;
    case 'Excel': return <FileSpreadsheet className="h-4 w-4 text-green-600" />;
    case 'CSV': return <FileText className="h-4 w-4 text-blue-600" />;
    default: return <FileText className="h-4 w-4 text-gray-600" />;
  }
}

function getFrequencyBadge(frequency: string): { bg: string; text: string } {
  switch (frequency) {
    case 'Daily': return { bg: 'bg-blue-100', text: 'text-blue-700' };
    case 'Weekly': return { bg: 'bg-purple-100', text: 'text-purple-700' };
    case 'Monthly': return { bg: 'bg-indigo-100', text: 'text-indigo-700' };
    case 'Quarterly': return { bg: 'bg-amber-100', text: 'text-amber-700' };
    case 'On Demand': return { bg: 'bg-gray-100', text: 'text-gray-700' };
    default: return { bg: 'bg-gray-100', text: 'text-gray-700' };
  }
}

function getCategoryBadge(category: ReportCategory): { bg: string; text: string } {
  switch (category) {
    case 'academic': return { bg: 'bg-blue-100', text: 'text-blue-700' };
    case 'attendance': return { bg: 'bg-green-100', text: 'text-green-700' };
    case 'fees': return { bg: 'bg-amber-100', text: 'text-amber-700' };
    case 'admissions': return { bg: 'bg-purple-100', text: 'text-purple-700' };
    case 'staff': return { bg: 'bg-indigo-100', text: 'text-indigo-700' };
    case 'students': return { bg: 'bg-rose-100', text: 'text-rose-700' };
    default: return { bg: 'bg-gray-100', text: 'text-gray-700' };
  }
}

// --- Component ---

export function ReportsPage(): React.JSX.Element {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabKey>('reports');
  const [selectedCategory, setSelectedCategory] = useState<ReportCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [reportsPage, setReportsPage] = useState(1);
  const [historyPage, setHistoryPage] = useState(1);
  const [generatingId, setGeneratingId] = useState<string | null>(null);
  const [generatedHistory, setGeneratedHistory] = useState<GeneratedReport[]>(GENERATED_REPORTS);

  // Filtered reports
  const filteredReports = useMemo(() => {
    let reports = REPORT_DEFINITIONS;
    if (selectedCategory !== 'all') {
      reports = reports.filter((r) => r.category === selectedCategory);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      reports = reports.filter((r) =>
        r.name.toLowerCase().includes(q) || r.description.toLowerCase().includes(q)
      );
    }
    return reports;
  }, [selectedCategory, searchQuery]);

  // Pagination for reports
  const reportsTotalPages = Math.max(1, Math.ceil(filteredReports.length / PAGE_SIZE));
  const paginatedReports = useMemo(() => {
    const start = (reportsPage - 1) * PAGE_SIZE;
    return filteredReports.slice(start, start + PAGE_SIZE);
  }, [filteredReports, reportsPage]);

  // Pagination for history
  const historyTotalPages = Math.max(1, Math.ceil(generatedHistory.length / PAGE_SIZE));
  const paginatedHistory = useMemo(() => {
    const start = (historyPage - 1) * PAGE_SIZE;
    return generatedHistory.slice(start, start + PAGE_SIZE);
  }, [generatedHistory, historyPage]);

  // Stats
  const stats = useMemo(() => ({
    totalReports: REPORT_DEFINITIONS.length,
    generated: generatedHistory.length,
    categories: CATEGORIES.length,
    scheduled: REPORT_DEFINITIONS.filter((r) => r.frequency !== 'On Demand').length,
  }), [generatedHistory]);

  function handleGenerate(report: ReportDefinition): void {
    setGeneratingId(report.id);
    // Simulate generation delay
    setTimeout(() => {
      const newReport: GeneratedReport = {
        id: `g${Date.now()}`,
        reportId: report.id,
        reportName: report.name,
        category: report.category,
        generatedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
        generatedBy: 'Admin',
        format: 'PDF',
        size: `${(Math.random() * 5 + 0.5).toFixed(1)} MB`,
        status: 'ready',
      };
      setGeneratedHistory((prev) => [newReport, ...prev]);
      setGeneratingId(null);
    }, 1500);
  }

  const tabs: { key: TabKey; label: string; icon: React.ReactNode }[] = [
    { key: 'reports', label: 'Available Reports', icon: <FileText className="h-4 w-4" /> },
    { key: 'history', label: 'Generated History', icon: <History className="h-4 w-4" /> },
  ];

  return (
    <PageContent>
      <PageHeader
        title="Reports"
        subtitle="Generate, view, and export analytics reports across all modules."
        breadcrumbs={[{ label: 'Home' }, { label: 'Reports' }]}
      />

      {/* Stats Cards */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-[#ECEDF3] bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-[#363473]/10 p-2"><FileText className="h-5 w-5 text-[#363473]" /></div>
            <div>
              <p className="text-xs text-[#A0A3BD]">Total Reports</p>
              <p className="text-xl font-bold text-[#1B1D3A]">{stats.totalReports}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-[#ECEDF3] bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-green-100 p-2"><Download className="h-5 w-5 text-green-700" /></div>
            <div>
              <p className="text-xs text-[#A0A3BD]">Generated</p>
              <p className="text-xl font-bold text-[#1B1D3A]">{stats.generated}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-[#ECEDF3] bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-purple-100 p-2"><BarChart3 className="h-5 w-5 text-purple-700" /></div>
            <div>
              <p className="text-xs text-[#A0A3BD]">Categories</p>
              <p className="text-xl font-bold text-[#1B1D3A]">{stats.categories}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-[#ECEDF3] bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-amber-100 p-2"><Clock className="h-5 w-5 text-amber-700" /></div>
            <div>
              <p className="text-xs text-[#A0A3BD]">Scheduled</p>
              <p className="text-xl font-bold text-[#1B1D3A]">{stats.scheduled}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-6 flex items-center gap-1 rounded-xl bg-[#F5F6FA] p-1">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={`inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium transition-colors ${
              activeTab === tab.key
                ? 'bg-[#363473] text-white shadow-sm'
                : 'text-[#6E7191] hover:text-[#1B1D3A] hover:bg-white'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'reports' && (
          <motion.div key="reports" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
            {/* Filters */}
            <div className="mt-5 flex flex-wrap items-center gap-3">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#A0A3BD]" />
                <input
                  type="text"
                  placeholder="Search reports..."
                  value={searchQuery}
                  onChange={(e) => { setSearchQuery(e.target.value); setReportsPage(1); }}
                  className="rounded-lg border border-[#ECEDF3] bg-white pl-9 pr-3 py-2 text-sm text-[#1B1D3A] focus:outline-none focus:ring-2 focus:ring-[#363473] w-[220px]"
                />
              </div>
              {/* Category filter */}
              <select
                value={selectedCategory}
                onChange={(e) => { setSelectedCategory(e.target.value as ReportCategory | 'all'); setReportsPage(1); }}
                className="rounded-lg border border-[#ECEDF3] bg-white px-3 py-2 text-sm text-[#1B1D3A] focus:outline-none focus:ring-2 focus:ring-[#363473]"
              >
                <option value="all">All Categories</option>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{CATEGORY_META[c].label}</option>
                ))}
              </select>
              {(selectedCategory !== 'all' || searchQuery) && (
                <button
                  type="button"
                  onClick={() => { setSelectedCategory('all'); setSearchQuery(''); setReportsPage(1); }}
                  className="text-sm font-medium text-red-600 hover:text-red-700 transition-colors"
                >
                  Reset
                </button>
              )}
              <span className="ml-auto text-sm text-[#6E7191]">{filteredReports.length} reports</span>
            </div>

            {/* Reports Table */}
            <div className="mt-4 overflow-x-auto rounded-xl border border-[#ECEDF3] bg-white shadow-sm">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#ECEDF3] bg-[#F5F6FA]">
                    <th className="px-4 py-3 text-left font-semibold text-[#1B1D3A]">Report Name</th>
                    <th className="px-4 py-3 text-left font-semibold text-[#1B1D3A]">Category</th>
                    <th className="px-4 py-3 text-left font-semibold text-[#1B1D3A]">Frequency</th>
                    <th className="px-4 py-3 text-left font-semibold text-[#1B1D3A]">Last Generated</th>
                    <th className="px-4 py-3 text-left font-semibold text-[#1B1D3A]">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedReports.map((report) => {
                    const catBadge = getCategoryBadge(report.category);
                    const freqBadge = getFrequencyBadge(report.frequency);
                    const isGenerating = generatingId === report.id;
                    return (
                      <tr
                        key={report.id}
                        className="border-b border-[#ECEDF3] last:border-b-0 hover:bg-[#F5F6FA] transition-colors"
                      >
                        <td className="px-4 py-3">
                          <div>
                            <p className="font-medium text-[#1B1D3A]">{report.name}</p>
                            <p className="text-xs text-[#A0A3BD] mt-0.5">{report.description}</p>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${catBadge.bg} ${catBadge.text}`}>
                            {CATEGORY_META[report.category].label}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex rounded-md px-2 py-0.5 text-xs font-medium ${freqBadge.bg} ${freqBadge.text}`}>
                            {report.frequency}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-[#6E7191]">{report.lastGenerated}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={(e) => { e.stopPropagation(); handleGenerate(report); }}
                              disabled={isGenerating}
                              className="inline-flex items-center gap-1.5 rounded-lg bg-[#363473] px-3 py-1.5 text-xs font-medium text-white hover:bg-[#1B1D3A] transition-colors disabled:opacity-50"
                            >
                              {isGenerating ? (
                                <><RefreshCw className="h-3 w-3 animate-spin" /> Generating...</>
                              ) : (
                                <><Play className="h-3 w-3" /> Generate</>
                              )}
                            </button>
                            <button
                              type="button"
                              onClick={() => navigate(`/reports/${report.id}`)}
                              className="inline-flex items-center gap-1.5 rounded-lg border border-[#ECEDF3] px-3 py-1.5 text-xs font-medium text-[#6E7191] hover:bg-[#F5F6FA] transition-colors"
                            >
                              <BarChart3 className="h-3 w-3" /> View
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {paginatedReports.length === 0 && (
                    <tr><td colSpan={5} className="px-4 py-8 text-center text-[#A0A3BD]">No reports found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Reports Pagination */}
            {reportsTotalPages > 1 && (
              <div className="mt-4 flex items-center justify-between">
                <p className="text-sm text-[#6E7191]">
                  Showing {(reportsPage - 1) * PAGE_SIZE + 1}–{Math.min(reportsPage * PAGE_SIZE, filteredReports.length)} of {filteredReports.length}
                </p>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setReportsPage((p) => Math.max(1, p - 1))}
                    disabled={reportsPage === 1}
                    className="inline-flex items-center gap-1 rounded-lg border border-[#ECEDF3] px-3 py-1.5 text-sm text-[#6E7191] hover:bg-[#F5F6FA] disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="h-4 w-4" /> Prev
                  </button>
                  <span className="text-sm font-medium text-[#1B1D3A]">{reportsPage} / {reportsTotalPages}</span>
                  <button
                    type="button"
                    onClick={() => setReportsPage((p) => Math.min(reportsTotalPages, p + 1))}
                    disabled={reportsPage === reportsTotalPages}
                    className="inline-flex items-center gap-1 rounded-lg border border-[#ECEDF3] px-3 py-1.5 text-sm text-[#6E7191] hover:bg-[#F5F6FA] disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Next <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {activeTab === 'history' && (
          <motion.div key="history" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
            {/* History Table */}
            <div className="mt-5 overflow-x-auto rounded-xl border border-[#ECEDF3] bg-white shadow-sm">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#ECEDF3] bg-[#F5F6FA]">
                    <th className="px-4 py-3 text-left font-semibold text-[#1B1D3A]">Report Name</th>
                    <th className="px-4 py-3 text-left font-semibold text-[#1B1D3A]">Category</th>
                    <th className="px-4 py-3 text-left font-semibold text-[#1B1D3A]">Generated At</th>
                    <th className="px-4 py-3 text-left font-semibold text-[#1B1D3A]">Generated By</th>
                    <th className="px-4 py-3 text-left font-semibold text-[#1B1D3A]">Format</th>
                    <th className="px-4 py-3 text-left font-semibold text-[#1B1D3A]">Size</th>
                    <th className="px-4 py-3 text-left font-semibold text-[#1B1D3A]">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedHistory.map((report) => {
                    const catBadge = getCategoryBadge(report.category);
                    return (
                      <tr key={report.id} className="border-b border-[#ECEDF3] last:border-b-0 hover:bg-[#F5F6FA] transition-colors">
                        <td className="px-4 py-3 font-medium text-[#1B1D3A]">{report.reportName}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${catBadge.bg} ${catBadge.text}`}>
                            {CATEGORY_META[report.category].label}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-[#6E7191]">{report.generatedAt}</td>
                        <td className="px-4 py-3 text-[#6E7191]">{report.generatedBy}</td>
                        <td className="px-4 py-3">
                          <div className="inline-flex items-center gap-1.5">
                            {getFormatIcon(report.format)}
                            <span className="text-[#6E7191]">{report.format}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-[#6E7191]">{report.size}</td>
                        <td className="px-4 py-3">
                          <button
                            type="button"
                            className="inline-flex items-center gap-1.5 rounded-lg border border-[#ECEDF3] px-3 py-1.5 text-xs font-medium text-[#6E7191] hover:bg-[#F5F6FA] transition-colors"
                          >
                            <Download className="h-3 w-3" /> Download
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                  {paginatedHistory.length === 0 && (
                    <tr><td colSpan={7} className="px-4 py-8 text-center text-[#A0A3BD]">No generated reports yet.</td></tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* History Pagination */}
            {historyTotalPages > 1 && (
              <div className="mt-4 flex items-center justify-between">
                <p className="text-sm text-[#6E7191]">
                  Showing {(historyPage - 1) * PAGE_SIZE + 1}–{Math.min(historyPage * PAGE_SIZE, generatedHistory.length)} of {generatedHistory.length}
                </p>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setHistoryPage((p) => Math.max(1, p - 1))}
                    disabled={historyPage === 1}
                    className="inline-flex items-center gap-1 rounded-lg border border-[#ECEDF3] px-3 py-1.5 text-sm text-[#6E7191] hover:bg-[#F5F6FA] disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="h-4 w-4" /> Prev
                  </button>
                  <span className="text-sm font-medium text-[#1B1D3A]">{historyPage} / {historyTotalPages}</span>
                  <button
                    type="button"
                    onClick={() => setHistoryPage((p) => Math.min(historyTotalPages, p + 1))}
                    disabled={historyPage === historyTotalPages}
                    className="inline-flex items-center gap-1 rounded-lg border border-[#ECEDF3] px-3 py-1.5 text-sm text-[#6E7191] hover:bg-[#F5F6FA] disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Next <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </PageContent>
  );
}
