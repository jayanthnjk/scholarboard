/**
 * Help Center Page - Knowledge base, FAQ, and support.
 */

import React, { useState } from 'react';
import { PageHeader } from '@/components/layout/page-header';
import { PageContent } from '@/components/layout/page-content';
import {
  Search,
  BookOpen,
  Users,
  CreditCard,
  BarChart3,
  Settings,
  ChevronDown,
  ChevronRight,
  MessageSquare,
  Sparkles,
  HelpCircle,
} from 'lucide-react';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

interface KBCategory {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  articleCount: number;
}

const KB_CATEGORIES: KBCategory[] = [
  { id: '1', title: 'Getting Started', description: 'Setup guides and first steps', icon: <BookOpen className="h-5 w-5" />, articleCount: 12 },
  { id: '2', title: 'Students', description: 'Admissions, profiles, and records', icon: <Users className="h-5 w-5" />, articleCount: 18 },
  { id: '3', title: 'Fees', description: 'Billing, payments, and concessions', icon: <CreditCard className="h-5 w-5" />, articleCount: 15 },
  { id: '4', title: 'Reports', description: 'Analytics, exports, and dashboards', icon: <BarChart3 className="h-5 w-5" />, articleCount: 9 },
  { id: '5', title: 'Settings', description: 'Configuration and customization', icon: <Settings className="h-5 w-5" />, articleCount: 11 },
];

const FAQ_ITEMS: FAQItem[] = [
  { id: '1', question: 'How do I add a new student?', answer: 'Navigate to Students → New Admission. Fill in the required fields (name, grade, guardian info) and click Save. The student will appear in the directory immediately.' },
  { id: '2', question: 'How do I generate fee receipts?', answer: 'Go to Fees → Payments, select the student, and record the payment. A receipt will be auto-generated and can be printed or emailed to the parent.' },
  { id: '3', question: 'Can I customize the report card format?', answer: 'Yes! Go to Settings → Report Templates. You can choose from pre-built templates or create a custom layout with your school branding.' },
  { id: '4', question: 'How do I mark attendance for multiple classes?', answer: 'Use the Attendance module. Select the class and date, then mark students as present/absent. You can also import attendance via CSV.' },
  { id: '5', question: 'What happens when a tenant subscription expires?', answer: 'The tenant enters a grace period of 7 days. After that, access becomes read-only. Data is retained for 30 days before archival.' },
];

const WHATS_NEW = [
  { id: '1', title: 'Bulk SMS integration now available', date: '2024-03-05' },
  { id: '2', title: 'New report card templates added', date: '2024-03-02' },
  { id: '3', title: 'Calendar module improvements', date: '2024-02-28' },
];

export function HelpCenterPage(): React.JSX.Element {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null);

  const toggleFAQ = (id: string) => {
    setExpandedFAQ((prev) => (prev === id ? null : id));
  };

  return (
    <PageContent>
      <PageHeader
        title="Help Center"
        subtitle="Find answers, browse guides, or contact support."
        breadcrumbs={[{ label: 'Help' }]}
        actions={
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            <MessageSquare className="h-4 w-4" />
            Support Ticket
          </button>
        }
      />

      {/* Search Bar */}
      <div className="mt-6">
        <div className="relative mx-auto max-w-xl">
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search help articles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-12 w-full rounded-lg border bg-background pl-12 pr-4 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            aria-label="Search help articles"
          />
        </div>
      </div>

      {/* Knowledge Base Categories */}
      <div className="mt-8">
        <h3 className="text-sm font-semibold">Knowledge Base</h3>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {KB_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              type="button"
              className="flex items-start gap-3 rounded-lg border bg-card p-4 text-left transition-colors hover:bg-accent/50"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary">
                {cat.icon}
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-semibold">{cat.title}</h4>
                <p className="mt-0.5 text-xs text-muted-foreground">{cat.description}</p>
                <p className="mt-1 text-xs text-primary">{cat.articleCount} articles</p>
              </div>
              <ChevronRight className="mt-1 h-4 w-4 text-muted-foreground" />
            </button>
          ))}
        </div>
      </div>

      {/* FAQ + What's New */}
      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        {/* FAQ Accordion */}
        <div className="lg:col-span-2">
          <h3 className="flex items-center gap-2 text-sm font-semibold">
            <HelpCircle className="h-4 w-4" />
            Frequently Asked Questions
          </h3>
          <div className="mt-3 space-y-2">
            {FAQ_ITEMS.map((faq) => (
              <div key={faq.id} className="rounded-lg border bg-card">
                <button
                  type="button"
                  onClick={() => toggleFAQ(faq.id)}
                  className="flex w-full items-center justify-between p-4 text-left"
                  aria-expanded={expandedFAQ === faq.id}
                >
                  <span className="text-sm font-medium">{faq.question}</span>
                  <ChevronDown
                    className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform ${
                      expandedFAQ === faq.id ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {expandedFAQ === faq.id && (
                  <div className="border-t px-4 py-3">
                    <p className="text-sm text-muted-foreground">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* What's New */}
        <div>
          <h3 className="flex items-center gap-2 text-sm font-semibold">
            <Sparkles className="h-4 w-4" />
            What&apos;s New
          </h3>
          <div className="mt-3 space-y-3">
            {WHATS_NEW.map((item) => (
              <div key={item.id} className="rounded-lg border bg-card p-3">
                <p className="text-sm font-medium">{item.title}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{item.date}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PageContent>
  );
}
