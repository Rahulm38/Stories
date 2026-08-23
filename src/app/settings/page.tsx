import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Bell, FileText, Shield } from 'lucide-react';
import { AppShell } from '@/components/layout/app-shell';

export default function SettingsPage() {
  return (
    <AppShell>
      <div className="page-stack">
        <header className="page-header">
          <div className="flex items-center gap-2">
            <Link href="/today" className="icon-button" aria-label="Back to Today">
              <ArrowLeft className="h-[18px] w-[18px]" aria-hidden="true" />
            </Link>
            <div>
              <p className="eyebrow">Preferences</p>
              <h1 className="mt-1 text-3xl font-semibold tracking-[-0.03em] text-foreground">Settings</h1>
            </div>
          </div>
        </header>

        <section className="settings-section" aria-labelledby="privacy-heading">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Trust</p>
              <h2 id="privacy-heading" className="mt-1 text-xl font-semibold text-foreground">Privacy</h2>
            </div>
            <Shield className="mt-1 h-4 w-4 text-mint" aria-hidden="true" />
          </div>
          <div className="settings-list mt-4">
            <div><strong>Private by default</strong><span>Notes stay on this device in the current prototype.</span></div>
            <div><strong>AI is off</strong><span>This prototype stays text-first and local.</span></div>
            <div><strong>You are in control</strong><span>Edit your Markdown files anytime.</span></div>
          </div>
        </section>

        <section className="settings-section" aria-labelledby="reminder-heading">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Coming after device testing</p>
              <h2 id="reminder-heading" className="mt-1 text-xl font-semibold text-foreground">Local notifications</h2>
            </div>
            <Bell className="mt-1 h-4 w-4 text-action" aria-hidden="true" />
          </div>
          <div className="settings-list mt-4">
            <div><strong>Not enabled yet</strong><span>The app will ask permission only when reminders are ready to work on your device.</span></div>
          </div>
        </section>

        <section className="settings-section" aria-labelledby="storage-heading">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Your files</p>
              <h2 id="storage-heading" className="mt-1 text-xl font-semibold text-foreground">Local Markdown vault</h2>
            </div>
            <FileText className="mt-1 h-4 w-4 text-text-dim" aria-hidden="true" />
          </div>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">Notes are stored as Markdown documents with a rebuildable local index. The native build can map this vault to app storage without changing the files.</p>
        </section>
      </div>
    </AppShell>
  );
}
