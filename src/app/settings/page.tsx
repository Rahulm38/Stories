'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Shield, Bell, Info, Clock, ChevronRight, Plus, CheckCircle, AlarmClock } from 'lucide-react';
import { AppShell } from '@/components/layout/app-shell';
import { Button } from '@/components/ui/button';
import { appCopy } from '@/data/copy';
import Link from 'next/link';

export default function SettingsPage() {
  const [privacyToggles, setPrivacyToggles] = useState([true, true, true]);
  const [notifToggles, setNotifToggles] = useState([true, true]);

  // Implementation Intentions mock data
  const [intentions, setIntentions] = useState([
    { id: '1', text: 'Before standup, ask about MoEngage whitelisting', time: '9:45 AM', completed: false },
    { id: '2', text: 'After lunch, review auth refactor PR', time: '1:00 PM', completed: false },
    { id: '3', text: 'Remind Ravi about anniversary before June 10', time: 'June 10', completed: false },
  ]);

  const toggleIntention = (id: string) => {
    setIntentions(prev => prev.map(i => i.id === id ? { ...i, completed: !i.completed } : i));
  };

  return (
    <AppShell>
      <div className="px-5 pt-2 pb-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center gap-3 mb-6"
        >
          <Link href="/today">
            <button className="p-2 -ml-2 rounded-xl hover:bg-surface-1 transition-colors">
              <ArrowLeft className="w-5 h-5 text-foreground" />
            </button>
          </Link>
          <h1 className="text-xl font-semibold text-foreground">{appCopy.settings.title}</h1>
        </motion.div>

        <div className="space-y-6">
          {/* Privacy Section */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
          >
            <div className="flex items-center gap-2 mb-3">
              <Shield className="w-4 h-4 text-mint" />
              <h2 className="text-sm font-semibold text-foreground">
                {appCopy.settings.sections.privacy.title}
              </h2>
            </div>
            <div className="bg-surface-1 rounded-2xl border border-white/[0.04] overflow-hidden">
              {appCopy.settings.sections.privacy.items.map((item, i) => (
                <div
                  key={item.label}
                  className={`flex items-center justify-between px-4 py-3.5 ${
                    i < appCopy.settings.sections.privacy.items.length - 1
                      ? 'border-b border-white/[0.04]'
                      : ''
                  }`}
                >
                  <div>
                    <p className="text-sm text-foreground">{item.label}</p>
                    <p className="text-[10px] text-text-dim mt-0.5">{item.description}</p>
                  </div>
                  <button
                    onClick={() => {
                      const newToggles = [...privacyToggles];
                      newToggles[i] = !newToggles[i];
                      setPrivacyToggles(newToggles);
                    }}
                    className={`w-10 h-6 rounded-full transition-colors duration-200 flex items-center ${
                      privacyToggles[i] ? 'bg-mint justify-end' : 'bg-surface-3 justify-start'
                    }`}
                  >
                    <div className="w-4.5 h-4.5 mx-1 rounded-full bg-white shadow-sm transition-all w-[18px] h-[18px]" />
                  </button>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Notifications Section */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="flex items-center gap-2 mb-3">
              <Bell className="w-4 h-4 text-amber" />
              <h2 className="text-sm font-semibold text-foreground">
                {appCopy.settings.sections.notifications.title}
              </h2>
            </div>
            <div className="bg-surface-1 rounded-2xl border border-white/[0.04] overflow-hidden">
              {appCopy.settings.sections.notifications.items.map((item, i) => (
                <div
                  key={item.label}
                  className={`flex items-center justify-between px-4 py-3.5 ${
                    i < appCopy.settings.sections.notifications.items.length - 1
                      ? 'border-b border-white/[0.04]'
                      : ''
                  }`}
                >
                  <div className="flex-1">
                    <p className="text-sm text-foreground">{item.label}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <p className="text-[10px] text-text-dim">{item.description}</p>
                      <span className="text-[10px] text-amber/70 flex items-center gap-0.5">
                        <Clock className="w-2.5 h-2.5" />
                        {item.time}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      const newToggles = [...notifToggles];
                      newToggles[i] = !newToggles[i];
                      setNotifToggles(newToggles);
                    }}
                    className={`w-10 h-6 rounded-full transition-colors duration-200 flex items-center ${
                      notifToggles[i] ? 'bg-amber justify-end' : 'bg-surface-3 justify-start'
                    }`}
                  >
                    <div className="w-[18px] h-[18px] mx-1 rounded-full bg-white shadow-sm transition-all" />
                  </button>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Implementation Intentions / Reminders */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <AlarmClock className="w-4 h-4 text-lavender" />
                <h2 className="text-sm font-semibold text-foreground">
                  {appCopy.intentions.title}
                </h2>
              </div>
              <button className="text-xs text-amber flex items-center gap-1 hover:underline">
                <Plus className="w-3 h-3" />
                {appCopy.intentions.addNew}
              </button>
            </div>
            <div className="bg-surface-1 rounded-2xl border border-white/[0.04] overflow-hidden">
              {intentions.map((intention, i) => (
                <div
                  key={intention.id}
                  className={`flex items-center gap-3 px-4 py-3.5 ${
                    i < intentions.length - 1 ? 'border-b border-white/[0.04]' : ''
                  }`}
                >
                  <button
                    onClick={() => toggleIntention(intention.id)}
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-200 flex-shrink-0 ${
                      intention.completed
                        ? 'bg-mint border-mint'
                        : 'border-text-dim/40 hover:border-mint/60'
                    }`}
                  >
                    {intention.completed && <CheckCircle className="w-3 h-3 text-background" />}
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm transition-all ${
                      intention.completed ? 'text-text-dim line-through' : 'text-foreground'
                    }`}>
                      {intention.text}
                    </p>
                    <span className="text-[10px] text-amber/60 flex items-center gap-0.5 mt-0.5">
                      <Clock className="w-2.5 h-2.5" />
                      {intention.time}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* About Section */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center gap-2 mb-3">
              <Info className="w-4 h-4 text-text-dim" />
              <h2 className="text-sm font-semibold text-foreground">
                {appCopy.settings.sections.about.title}
              </h2>
            </div>
            <div className="bg-surface-1 rounded-2xl border border-white/[0.04] overflow-hidden">
              {appCopy.settings.sections.about.items.map((item, i) => (
                <div
                  key={item.label}
                  className={`px-4 py-3.5 ${
                    i < appCopy.settings.sections.about.items.length - 1
                      ? 'border-b border-white/[0.04]'
                      : ''
                  }`}
                >
                  <p className="text-sm text-muted-foreground">{item.label}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        <div className="h-4" />
      </div>
    </AppShell>
  );
}
