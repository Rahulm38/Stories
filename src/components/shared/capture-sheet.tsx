'use client';

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mic, Type, Image, Check, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { appCopy } from '@/data/copy';

interface CaptureSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialPrompt?: string;
}

type CaptureMode = 'text' | 'voice' | 'photo';

export function CaptureSheet({ open, onOpenChange, initialPrompt }: CaptureSheetProps) {
  const [mode, setMode] = useState<CaptureMode>('text');
  const [text, setText] = useState('');
  const [saved, setSaved] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);

  const charCount = text.length;
  const charLimit = 300;

  const handleSave = useCallback(() => {
    if (text.trim() || mode === 'voice') {
      setSaved(true);
      setTimeout(() => {
        setShowConfirm(true);
      }, 800);
    }
  }, [text, mode]);

  const handleClose = useCallback(() => {
    onOpenChange(false);
    setTimeout(() => {
      setText('');
      setSaved(false);
      setShowConfirm(false);
      setIsRecording(false);
      setRecordingTime(0);
      setMode('text');
    }, 300);
  }, [onOpenChange]);

  const handleConfirmAction = useCallback((action: string) => {
    if (action === 'later') {
      // Sent to inbox
    }
    handleClose();
  }, [handleClose]);

  // Mock recording timer
  React.useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingTime((t) => t + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 z-40"
            onClick={handleClose}
          />

          {/* Sheet */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="absolute bottom-0 left-0 right-0 z-50 bg-surface-2 rounded-t-3xl border-t border-white/[0.06]"
          >
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full bg-white/20" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-5 pb-3">
              <h2 className="text-base font-semibold text-foreground">
                {appCopy.capture.sheetTitle}
              </h2>
              <button
                onClick={handleClose}
                className="p-1.5 rounded-lg hover:bg-surface-3 transition-colors"
              >
                <X className="w-5 h-5 text-text-dim" />
              </button>
            </div>

            <AnimatePresence mode="wait">
              {/* Saved state */}
              {saved && !showConfirm && (
                <motion.div
                  key="saved"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center py-12 px-5"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', damping: 15, stiffness: 300, delay: 0.1 }}
                    className="w-16 h-16 rounded-full bg-mint/20 flex items-center justify-center mb-4"
                  >
                    <Check className="w-8 h-8 text-mint" />
                  </motion.div>
                  <p className="text-base font-semibold text-foreground">{appCopy.capture.savedToast}</p>
                  <p className="text-sm text-muted-foreground mt-1">{appCopy.capture.strengthenToast}</p>
                </motion.div>
              )}

              {/* AI Confirmation Card */}
              {showConfirm && (
                <motion.div
                  key="confirm"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="px-5 pb-8"
                >
                  <div className="bg-surface-1 rounded-2xl p-4 border border-amber/10">
                    <div className="flex items-center gap-2 mb-3">
                      <Sparkles className="w-4 h-4 text-amber" />
                      <span className="text-sm font-medium text-foreground">
                        {appCopy.aiConfirm.title}
                      </span>
                    </div>

                    {/* AI Chips */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {['Life moment', 'Person: Mom', 'Place: Home', 'Recall: 1 card', 'Follow-up: 1 ask'].map((chip) => (
                        <span
                          key={chip}
                          className="px-2.5 py-1 rounded-lg bg-surface-3 text-xs text-muted-foreground border border-white/[0.04]"
                        >
                          {chip}
                        </span>
                      ))}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleConfirmAction('confirm')}
                        className="flex-1 bg-amber text-background hover:bg-amber/90 rounded-xl text-xs h-9"
                      >
                        {appCopy.aiConfirm.looksRight}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => handleConfirmAction('edit')}
                        className="flex-1 border-white/[0.08] text-foreground hover:bg-surface-3 rounded-xl text-xs h-9"
                      >
                        {appCopy.aiConfirm.edit}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => handleConfirmAction('later')}
                        className="flex-1 border-white/[0.08] text-muted-foreground hover:bg-surface-3 rounded-xl text-xs h-9"
                      >
                        {appCopy.aiConfirm.later}
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Input state */}
              {!saved && (
                <motion.div
                  key="input"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="px-5 pb-8"
                >
                  {/* Mode Switcher */}
                  <div className="flex items-center gap-1 bg-surface-1 rounded-xl p-1 mb-4">
                    {[
                      { mode: 'voice' as CaptureMode, icon: Mic, label: appCopy.capture.modes.voice },
                      { mode: 'text' as CaptureMode, icon: Type, label: appCopy.capture.modes.text },
                      { mode: 'photo' as CaptureMode, icon: Image, label: appCopy.capture.modes.photo },
                    ].map(({ mode: m, icon: Icon, label }) => (
                      <button
                        key={m}
                        onClick={() => { setMode(m); setIsRecording(false); setRecordingTime(0); }}
                        className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium transition-all duration-200 ${
                          mode === m
                            ? 'bg-surface-3 text-foreground'
                            : 'text-text-dim hover:text-muted-foreground'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        {label}
                      </button>
                    ))}
                  </div>

                  {/* Text Mode */}
                  {mode === 'text' && (
                    <div>
                      <Textarea
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder={initialPrompt || appCopy.capture.textPlaceholder}
                        className="min-h-[120px] bg-surface-1 border-white/[0.06] rounded-xl text-sm text-foreground placeholder:text-text-dim resize-none focus:ring-1 focus:ring-amber/30 focus:border-amber/30"
                      />
                      <div className="flex items-center justify-between mt-3">
                        <span className={`text-[10px] ${charCount > charLimit ? 'text-coral' : 'text-text-dim'}`}>
                          {charCount}/{charLimit} · {appCopy.capture.characterGuidance}
                        </span>
                        <Button
                          onClick={handleSave}
                          disabled={!text.trim()}
                          className="bg-amber text-background hover:bg-amber/90 rounded-xl text-xs h-9 px-6 disabled:opacity-30"
                        >
                          {appCopy.capture.saveButton}
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Voice Mode */}
                  {mode === 'voice' && (
                    <div className="flex flex-col items-center py-6">
                      <motion.button
                        whileTap={{ scale: 0.92 }}
                        onClick={() => {
                          if (isRecording) {
                            setIsRecording(false);
                            handleSave();
                          } else {
                            setIsRecording(true);
                          }
                        }}
                        className={`w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 ${
                          isRecording
                            ? 'bg-coral animate-pulse-glow'
                            : 'bg-amber/20 border-2 border-amber/40'
                        }`}
                      >
                        <Mic className={`w-8 h-8 ${isRecording ? 'text-white' : 'text-amber'}`} />
                      </motion.button>

                      <p className="text-sm text-foreground mt-4 font-medium">
                        {isRecording ? formatTime(recordingTime) : 'Tap to record'}
                      </p>
                      <p className="text-xs text-text-dim mt-1">
                        {isRecording ? appCopy.capture.voiceStop : 'Hold or tap to start'}
                      </p>

                      {/* Waveform mockup */}
                      {isRecording && (
                        <div className="flex items-center gap-[3px] mt-4 h-8">
                          {Array.from({ length: 20 }).map((_, i) => (
                            <motion.div
                              key={i}
                              animate={{
                                height: [4, Math.random() * 28 + 4, 4],
                              }}
                              transition={{
                                duration: 0.6 + Math.random() * 0.4,
                                repeat: Infinity,
                                delay: i * 0.05,
                              }}
                              className="w-[3px] rounded-full bg-amber/60"
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Photo Mode */}
                  {mode === 'photo' && (
                    <div>
                      <button className="w-full h-32 rounded-xl border-2 border-dashed border-white/[0.08] bg-surface-1 flex flex-col items-center justify-center gap-2 hover:border-amber/30 transition-colors">
                        <Image className="w-8 h-8 text-text-dim" />
                        <span className="text-xs text-muted-foreground">{appCopy.capture.photoAttach}</span>
                      </button>

                      <p className="text-xs text-text-dim mt-3 text-center">{appCopy.capture.photoPrompt}</p>

                      <div className="flex flex-wrap gap-2 mt-2 justify-center">
                        {appCopy.capture.photoOptions.map((opt) => (
                          <button
                            key={opt}
                            className="px-3 py-1.5 rounded-lg bg-surface-1 text-xs text-muted-foreground border border-white/[0.04] hover:bg-surface-3 transition-colors"
                          >
                            {opt}
                          </button>
                        ))}
                      </div>

                      <Textarea
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder="Add a note about this photo..."
                        className="mt-3 min-h-[60px] bg-surface-1 border-white/[0.06] rounded-xl text-sm text-foreground placeholder:text-text-dim resize-none"
                      />

                      <div className="flex justify-end mt-3">
                        <Button
                          onClick={handleSave}
                          className="bg-amber text-background hover:bg-amber/90 rounded-xl text-xs h-9 px-6"
                        >
                          {appCopy.capture.saveButton}
                        </Button>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
