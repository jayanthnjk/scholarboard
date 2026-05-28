/**
 * Communication Module - Full messaging system with inbox, sent, announcements,
 * compose, message detail, read/unread, star, delete, reply, search.
 */

import React, { useState, useMemo } from 'react';
import { PageHeader } from '@/components/layout/page-header';
import { PageContent } from '@/components/layout/page-content';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Mail, Send, Megaphone, Plus, Search, Star, Paperclip,
  ArrowLeft, Reply, Trash2, ChevronLeft, ChevronRight,
  X, AlertCircle, Clock,
} from 'lucide-react';
import {
  INITIAL_MESSAGES, INITIAL_ANNOUNCEMENTS, CONTACTS,
} from '../data';
import type { Message, Announcement, MessagePriority, AnnouncementCategory } from '../data';

// --- Types ---
type TabKey = 'inbox' | 'sent' | 'announcements';
const PAGE_SIZE = 6;

// --- Helpers ---
function getCategoryBadge(cat: AnnouncementCategory): { bg: string; text: string } {
  switch (cat) {
    case 'Exam': return { bg: 'bg-red-100', text: 'text-red-700' };
    case 'Fee': return { bg: 'bg-amber-100', text: 'text-amber-700' };
    case 'Event': return { bg: 'bg-purple-100', text: 'text-purple-700' };
    case 'Holiday': return { bg: 'bg-green-100', text: 'text-green-700' };
    case 'Academic': return { bg: 'bg-blue-100', text: 'text-blue-700' };
    default: return { bg: 'bg-gray-100', text: 'text-gray-700' };
  }
}

function getPriorityDot(priority: MessagePriority): string {
  switch (priority) {
    case 'urgent': return 'bg-red-500';
    case 'high': return 'bg-amber-500';
    default: return '';
  }
}

// --- Component ---
export function CommunicationPage(): React.JSX.Element {
  const [activeTab, setActiveTab] = useState<TabKey>('inbox');
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [announcements] = useState<Announcement[]>(INITIAL_ANNOUNCEMENTS);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [showCompose, setShowCompose] = useState(false);
  const [showReply, setShowReply] = useState(false);
  const [composeForm, setComposeForm] = useState({ to: '', subject: '', body: '', priority: 'normal' as MessagePriority });
  const [composeErrors, setComposeErrors] = useState<Record<string, string>>({});

  // Filtered messages
  const inboxMessages = useMemo(() => {
    let result = messages.filter((m) => m.folder === 'inbox');
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((m) => m.subject.toLowerCase().includes(q) || m.from.toLowerCase().includes(q) || m.body.toLowerCase().includes(q));
    }
    return result;
  }, [messages, searchQuery]);

  const sentMessages = useMemo(() => {
    let result = messages.filter((m) => m.folder === 'sent');
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((m) => m.subject.toLowerCase().includes(q) || m.to.toLowerCase().includes(q) || m.body.toLowerCase().includes(q));
    }
    return result;
  }, [messages, searchQuery]);

  const filteredAnnouncements = useMemo(() => {
    if (!searchQuery.trim()) return announcements;
    const q = searchQuery.toLowerCase();
    return announcements.filter((a) => a.title.toLowerCase().includes(q) || a.body.toLowerCase().includes(q));
  }, [announcements, searchQuery]);

  const currentList = activeTab === 'inbox' ? inboxMessages : activeTab === 'sent' ? sentMessages : filteredAnnouncements;
  const totalPages = Math.max(1, Math.ceil(currentList.length / PAGE_SIZE));
  const paginatedList = currentList.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Stats
  const unreadCount = messages.filter((m) => m.folder === 'inbox' && m.status === 'unread').length;

  // Actions
  function handleOpenMessage(msg: Message): void {
    setSelectedMessage(msg);
    if (msg.status === 'unread') {
      setMessages((prev) => prev.map((m) => m.id === msg.id ? { ...m, status: 'read' } : m));
    }
  }

  function handleToggleStar(id: string): void {
    setMessages((prev) => prev.map((m) => m.id === id ? { ...m, starred: !m.starred } : m));
    if (selectedMessage?.id === id) setSelectedMessage((prev) => prev ? { ...prev, starred: !prev.starred } : prev);
  }

  function handleDelete(id: string): void {
    setMessages((prev) => prev.filter((m) => m.id !== id));
    if (selectedMessage?.id === id) setSelectedMessage(null);
  }

  function handleSendMessage(): void {
    const errors: Record<string, string> = {};
    if (!composeForm.to.trim()) errors.to = 'Required';
    if (!composeForm.subject.trim()) errors.subject = 'Required';
    if (!composeForm.body.trim()) errors.body = 'Required';
    setComposeErrors(errors);
    if (Object.keys(errors).length > 0) return;

    const newMsg: Message = {
      id: `m${Date.now()}`,
      from: 'You', fromRole: 'Admin',
      to: composeForm.to, toRole: 'Recipient',
      subject: composeForm.subject.trim(),
      body: composeForm.body.trim(),
      date: new Date().toISOString().split('T')[0] ?? '',
      time: new Date().toTimeString().slice(0, 5),
      status: 'read', priority: composeForm.priority,
      starred: false, hasAttachment: false, folder: 'sent',
    };
    setMessages((prev) => [newMsg, ...prev]);
    setShowCompose(false);
    setShowReply(false);
    setComposeForm({ to: '', subject: '', body: '', priority: 'normal' });
    setComposeErrors({});
  }

  function handleReply(): void {
    if (!selectedMessage) return;
    setComposeForm({
      to: selectedMessage.from,
      subject: `Re: ${selectedMessage.subject}`,
      body: '',
      priority: 'normal',
    });
    setShowReply(true);
  }

  const tabs: { key: TabKey; label: string; icon: React.ReactNode; count?: number }[] = [
    { key: 'inbox', label: 'Inbox', icon: <Mail className="h-4 w-4" />, count: unreadCount > 0 ? unreadCount : undefined },
    { key: 'sent', label: 'Sent', icon: <Send className="h-4 w-4" /> },
    { key: 'announcements', label: 'Announcements', icon: <Megaphone className="h-4 w-4" /> },
  ];

  // --- Message Detail View ---
  if (selectedMessage) {
    return (
      <PageContent>
        <PageHeader title="Messages" subtitle="Communication hub" breadcrumbs={[{ label: 'Home' }, { label: 'Messages' }, { label: selectedMessage.subject }]} />
        <div className="mt-6">
          <button type="button" onClick={() => setSelectedMessage(null)} className="inline-flex items-center gap-2 text-sm text-[#363473] hover:underline mb-4">
            <ArrowLeft className="h-4 w-4" /> Back to {activeTab === 'sent' ? 'Sent' : 'Inbox'}
          </button>
          <div className="rounded-xl border border-[#ECEDF3] bg-white shadow-sm">
            {/* Header */}
            <div className="p-5 border-b border-[#ECEDF3]">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-[#1B1D3A]">{selectedMessage.subject}</h2>
                  <div className="mt-1 flex items-center gap-3 text-sm text-[#6E7191]">
                    <span><strong>From:</strong> {selectedMessage.from}</span>
                    <span><strong>To:</strong> {selectedMessage.to}</span>
                  </div>
                  <div className="mt-1 flex items-center gap-2 text-xs text-[#A0A3BD]">
                    <Clock className="h-3 w-3" />
                    <span>{selectedMessage.date} at {selectedMessage.time}</span>
                    {selectedMessage.hasAttachment && <><Paperclip className="h-3 w-3 ml-2" /><span>Attachment</span></>}
                    {selectedMessage.priority !== 'normal' && <span className={`ml-2 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${selectedMessage.priority === 'urgent' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}><AlertCircle className="h-3 w-3" />{selectedMessage.priority}</span>}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button type="button" onClick={() => handleToggleStar(selectedMessage.id)} className={`rounded-lg p-1.5 hover:bg-[#F5F6FA] ${selectedMessage.starred ? 'text-amber-500' : 'text-[#A0A3BD]'}`}>
                    <Star className="h-4 w-4" fill={selectedMessage.starred ? 'currentColor' : 'none'} />
                  </button>
                  <button type="button" onClick={() => handleDelete(selectedMessage.id)} className="rounded-lg p-1.5 text-red-500 hover:bg-red-50">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
            {/* Body */}
            <div className="p-5">
              <pre className="whitespace-pre-wrap font-sans text-sm text-[#1B1D3A] leading-relaxed">{selectedMessage.body}</pre>
            </div>
            {/* Actions */}
            {selectedMessage.folder === 'inbox' && (
              <div className="p-5 border-t border-[#ECEDF3]">
                <button type="button" onClick={handleReply} className="inline-flex items-center gap-2 rounded-lg bg-[#363473] px-4 py-2 text-sm font-medium text-white hover:bg-[#1B1D3A] transition-colors">
                  <Reply className="h-4 w-4" /> Reply
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Reply Modal */}
        <AnimatePresence>
          {showReply && (
            <div className="fixed inset-0 z-50 flex items-center justify-center">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/40" onClick={() => setShowReply(false)} />
              <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} transition={{ duration: 0.2 }} className="relative z-10 w-full max-w-lg rounded-xl bg-white p-6 shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-[#1B1D3A]">Reply</h2>
                  <button type="button" onClick={() => setShowReply(false)} className="rounded-lg p-1 hover:bg-[#F5F6FA]"><X className="h-5 w-5 text-[#6E7191]" /></button>
                </div>
                <div className="space-y-3">
                  <div><label className="block text-sm font-medium text-[#1B1D3A] mb-1">To</label><input type="text" value={composeForm.to} disabled className="w-full rounded-lg border border-[#ECEDF3] bg-[#F5F6FA] px-3 py-2 text-sm text-[#6E7191]" /></div>
                  <div><label className="block text-sm font-medium text-[#1B1D3A] mb-1">Subject</label><input type="text" value={composeForm.subject} disabled className="w-full rounded-lg border border-[#ECEDF3] bg-[#F5F6FA] px-3 py-2 text-sm text-[#6E7191]" /></div>
                  <div><label className="block text-sm font-medium text-[#1B1D3A] mb-1">Message *</label><textarea rows={5} value={composeForm.body} onChange={(e) => setComposeForm({ ...composeForm, body: e.target.value })} className="w-full rounded-lg border border-[#ECEDF3] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#363473] resize-none" />{composeErrors.body && <p className="mt-1 text-xs text-red-600">{composeErrors.body}</p>}</div>
                </div>
                <div className="mt-5 flex justify-end gap-3">
                  <button type="button" onClick={() => setShowReply(false)} className="rounded-lg border border-[#ECEDF3] px-4 py-2 text-sm font-medium text-[#6E7191] hover:bg-[#F5F6FA]">Cancel</button>
                  <button type="button" onClick={handleSendMessage} className="inline-flex items-center gap-2 rounded-lg bg-[#363473] px-4 py-2 text-sm font-medium text-white hover:bg-[#1B1D3A] transition-colors"><Send className="h-4 w-4" /> Send</button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </PageContent>
    );
  }

  // --- Main List View ---
  return (
    <PageContent>
      <PageHeader title="Messages" subtitle="Announcements, messaging, and notifications." breadcrumbs={[{ label: 'Home' }, { label: 'Messages' }]} />

      {/* Tabs */}
      <div className="mt-6 flex items-center gap-1 rounded-xl bg-[#F5F6FA] p-1">
        {tabs.map((tab) => (
          <button key={tab.key} type="button" onClick={() => { setActiveTab(tab.key); setPage(1); setSearchQuery(''); }}
            className={`inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium transition-colors ${activeTab === tab.key ? 'bg-[#363473] text-white shadow-sm' : 'text-[#6E7191] hover:text-[#1B1D3A] hover:bg-white'}`}>
            {tab.icon} {tab.label}
            {tab.count && <span className="ml-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">{tab.count}</span>}
          </button>
        ))}
      </div>

      {/* Toolbar */}
      <div className="mt-5 flex flex-wrap items-center gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#A0A3BD]" />
          <input type="text" placeholder="Search messages..." value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
            className="rounded-lg border border-[#ECEDF3] bg-white pl-9 pr-3 py-2 text-sm text-[#1B1D3A] focus:outline-none focus:ring-2 focus:ring-[#363473] w-[260px]" />
        </div>
        <div className="ml-auto">
          <button type="button" onClick={() => { setShowCompose(true); setComposeForm({ to: '', subject: '', body: '', priority: 'normal' }); }}
            className="inline-flex items-center gap-2 rounded-lg bg-[#363473] px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-[#1B1D3A] transition-colors">
            <Plus className="h-4 w-4" /> Compose
          </button>
        </div>
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {(activeTab === 'inbox' || activeTab === 'sent') && (
          <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
            <div className="mt-4 rounded-xl border border-[#ECEDF3] bg-white shadow-sm divide-y divide-[#ECEDF3]">
              {(paginatedList as Message[]).map((msg) => {
                const priorityDot = getPriorityDot(msg.priority);
                return (
                  <div key={msg.id} onClick={() => handleOpenMessage(msg)}
                    className={`flex items-center gap-3 px-4 py-3.5 cursor-pointer hover:bg-[#F5F6FA] transition-colors ${msg.status === 'unread' ? 'bg-blue-50/40' : ''}`}>
                    {/* Star */}
                    <button type="button" onClick={(e) => { e.stopPropagation(); handleToggleStar(msg.id); }}
                      className={`shrink-0 ${msg.starred ? 'text-amber-500' : 'text-[#ECEDF3] hover:text-[#A0A3BD]'}`}>
                      <Star className="h-4 w-4" fill={msg.starred ? 'currentColor' : 'none'} />
                    </button>
                    {/* Priority dot */}
                    <div className="w-2 shrink-0">{priorityDot && <div className={`h-2 w-2 rounded-full ${priorityDot}`} />}</div>
                    {/* From/To */}
                    <div className="w-[140px] shrink-0">
                      <p className={`text-sm truncate ${msg.status === 'unread' ? 'font-semibold text-[#1B1D3A]' : 'text-[#6E7191]'}`}>
                        {activeTab === 'inbox' ? msg.from : msg.to}
                      </p>
                    </div>
                    {/* Subject + preview */}
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm truncate ${msg.status === 'unread' ? 'font-semibold text-[#1B1D3A]' : 'text-[#1B1D3A]'}`}>{msg.subject}</p>
                      <p className="text-xs text-[#A0A3BD] truncate mt-0.5">{msg.body.slice(0, 80)}...</p>
                    </div>
                    {/* Meta */}
                    <div className="shrink-0 flex items-center gap-2">
                      {msg.hasAttachment && <Paperclip className="h-3.5 w-3.5 text-[#A0A3BD]" />}
                      <span className="text-xs text-[#A0A3BD] whitespace-nowrap">{msg.date}</span>
                    </div>
                  </div>
                );
              })}
              {paginatedList.length === 0 && (
                <div className="px-4 py-12 text-center text-[#A0A3BD]">
                  <Mail className="h-8 w-8 mx-auto mb-2 opacity-40" />
                  <p>No messages found.</p>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {activeTab === 'announcements' && (
          <motion.div key="announcements" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
            <div className="mt-4 space-y-3">
              {(paginatedList as Announcement[]).map((ann) => {
                const badge = getCategoryBadge(ann.category);
                return (
                  <div key={ann.id} className={`rounded-xl border ${ann.pinned ? 'border-[#363473]/30 bg-[#363473]/5' : 'border-[#ECEDF3] bg-white'} shadow-sm p-5`}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          {ann.pinned && <span className="text-xs font-medium text-[#363473]">📌 Pinned</span>}
                          <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${badge.bg} ${badge.text}`}>{ann.category}</span>
                        </div>
                        <h3 className="mt-1.5 text-sm font-semibold text-[#1B1D3A]">{ann.title}</h3>
                        <p className="mt-1.5 text-sm text-[#6E7191] leading-relaxed">{ann.body}</p>
                      </div>
                    </div>
                    <div className="mt-3 flex items-center gap-4 text-xs text-[#A0A3BD]">
                      <span>By: {ann.postedBy}</span>
                      <span>Posted: {ann.postedDate}</span>
                      {ann.expiryDate && <span>Expires: {ann.expiryDate}</span>}
                      <span>For: {ann.targetAudience}</span>
                    </div>
                  </div>
                );
              })}
              {paginatedList.length === 0 && (
                <div className="rounded-xl border border-[#ECEDF3] bg-white shadow-sm px-4 py-12 text-center text-[#A0A3BD]">
                  <Megaphone className="h-8 w-8 mx-auto mb-2 opacity-40" />
                  <p>No announcements found.</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between">
          <p className="text-sm text-[#6E7191]">Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, currentList.length)} of {currentList.length}</p>
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="inline-flex items-center gap-1 rounded-lg border border-[#ECEDF3] px-3 py-1.5 text-sm text-[#6E7191] hover:bg-[#F5F6FA] disabled:opacity-40"><ChevronLeft className="h-4 w-4" /> Prev</button>
            <span className="text-sm font-medium text-[#1B1D3A]">{page} / {totalPages}</span>
            <button type="button" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="inline-flex items-center gap-1 rounded-lg border border-[#ECEDF3] px-3 py-1.5 text-sm text-[#6E7191] hover:bg-[#F5F6FA] disabled:opacity-40">Next <ChevronRight className="h-4 w-4" /></button>
          </div>
        </div>
      )}

      {/* Compose Modal */}
      <AnimatePresence>
        {showCompose && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/40" onClick={() => setShowCompose(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} transition={{ duration: 0.2 }} className="relative z-10 w-full max-w-lg rounded-xl bg-white p-6 shadow-lg">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-semibold text-[#1B1D3A]">New Message</h2>
                <button type="button" onClick={() => setShowCompose(false)} className="rounded-lg p-1 hover:bg-[#F5F6FA]"><X className="h-5 w-5 text-[#6E7191]" /></button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#1B1D3A] mb-1">To *</label>
                  <select value={composeForm.to} onChange={(e) => setComposeForm({ ...composeForm, to: e.target.value })} className="w-full rounded-lg border border-[#ECEDF3] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#363473]">
                    <option value="">Select Recipient</option>
                    {CONTACTS.map((c) => <option key={c.id} value={c.name}>{c.name} ({c.role})</option>)}
                  </select>
                  {composeErrors.to && <p className="mt-1 text-xs text-red-600">{composeErrors.to}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#1B1D3A] mb-1">Subject *</label>
                  <input type="text" value={composeForm.subject} onChange={(e) => setComposeForm({ ...composeForm, subject: e.target.value })} className="w-full rounded-lg border border-[#ECEDF3] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#363473]" />
                  {composeErrors.subject && <p className="mt-1 text-xs text-red-600">{composeErrors.subject}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#1B1D3A] mb-1">Priority</label>
                  <select value={composeForm.priority} onChange={(e) => setComposeForm({ ...composeForm, priority: e.target.value as MessagePriority })} className="w-full rounded-lg border border-[#ECEDF3] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#363473]">
                    <option value="normal">Normal</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#1B1D3A] mb-1">Message *</label>
                  <textarea rows={6} value={composeForm.body} onChange={(e) => setComposeForm({ ...composeForm, body: e.target.value })} className="w-full rounded-lg border border-[#ECEDF3] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#363473] resize-none" placeholder="Type your message..." />
                  {composeErrors.body && <p className="mt-1 text-xs text-red-600">{composeErrors.body}</p>}
                </div>
              </div>
              <div className="mt-6 flex justify-end gap-3">
                <button type="button" onClick={() => setShowCompose(false)} className="rounded-lg border border-[#ECEDF3] px-4 py-2 text-sm font-medium text-[#6E7191] hover:bg-[#F5F6FA]">Cancel</button>
                <button type="button" onClick={handleSendMessage} className="inline-flex items-center gap-2 rounded-lg bg-[#363473] px-4 py-2 text-sm font-medium text-white hover:bg-[#1B1D3A] transition-colors"><Send className="h-4 w-4" /> Send Message</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </PageContent>
  );
}
