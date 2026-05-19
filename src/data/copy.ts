// ============================================
// Memory OS — All UI Copy & Text
// ============================================
// 📝 EDIT THIS FILE to change any text in the app.
// Every label, placeholder, and message comes from here.

export const appCopy = {
  appName: 'Memory OS',
  tagline: 'Your life, remembered.',
  
  // ---- Today Screen ----
  today: {
    greeting: (name?: string) => name ? `Good evening, ${name}` : 'Good evening',
    privacyNote: 'Private on this device',
    primaryPrompt: 'What should future you remember from today?',
    askBarPlaceholder: 'Ask your memory...',
    practiceBlock: {
      title: 'Practice 3 memories',
      duration: '2 minutes',
      button: 'Start',
    },
    inboxBlock: {
      title: (count: number) => `${count} memories need context`,
      button: 'Review',
    },
    recentTitle: 'Recent memories',
    connectionTitle: 'This connects to...',
  },

  // ---- Capture ----
  capture: {
    sheetTitle: 'Quick note to future me',
    saveButton: 'Save',
    savedToast: 'Saved. Memory captured.',
    strengthenToast: 'Want to make it stronger later?',
    characterGuidance: 'One memory. 2-3 lines.',
    modes: {
      voice: 'Voice',
      text: 'Text',
      photo: 'Photo',
    },
    textPlaceholder: 'Save this before it fades...',
    voiceRecording: 'Recording...',
    voiceStop: 'Tap to stop',
    photoAttach: 'Attach photo',
    photoPrompt: 'What is this photo about?',
    photoOptions: ['Person', 'Place', 'Book/Page', 'Work/Whiteboard', 'Moment'],
  },

  // ---- AI Confirmation ----
  aiConfirm: {
    title: 'Looks like this is about:',
    looksRight: 'Looks right',
    edit: 'Edit',
    later: 'Later',
    laterNote: 'Sent to Inbox',
  },

  // ---- Inbox ----
  inbox: {
    title: 'Memory Inbox',
    subtitle: 'Make your memories stronger',
    emptyMessage: 'All caught up! No memories need attention right now.',
    actions: {
      answer: 'Answer',
      skip: 'Skip',
      notUseful: 'Not useful',
    },
  },

  // ---- Memories ----
  memories: {
    title: 'Memories',
    searchPlaceholder: 'Search memories...',
    filters: ['All', 'Life', 'Work', 'Trips', 'People', 'Places', 'Decisions', 'Books'],
    cardMenu: {
      edit: 'Edit',
      addConnection: 'Add connection',
      addRecall: 'Add recall card',
      pin: 'Pin',
      archive: 'Archive',
      delete: 'Delete',
    },
  },

  // ---- Memory Detail ----
  memoryDetail: {
    originalCapture: 'Original capture',
    summary: 'Summary',
    people: 'People',
    place: 'Place',
    source: 'Source',
    project: 'Project',
    whyItMatters: 'Why it matters',
    recallCards: 'Recall cards',
    connectedMemories: 'Connected memories',
    actions: {
      edit: 'Edit',
      addRecall: 'Add recall card',
      connect: 'Add connection',
      askAbout: 'Ask about this',
      delete: 'Delete',
    },
    connectionReasons: {
      similar: 'Similar memory',
      samePerson: 'Same person',
      samePlace: 'Same place',
      sameConcept: 'Same book/concept',
      decision: 'Useful for decision',
    },
  },

  // ---- Edit Memory ----
  editMemory: {
    title: 'Edit memory',
    save: 'Save changes',
    cancel: 'Cancel',
    aiGenerated: 'AI suggested',
    fields: {
      title: 'Title',
      memoryText: 'Memory text',
      type: 'Type',
      date: 'Date',
      people: 'People',
      place: 'Place',
      source: 'Source / Book / Project',
      tags: 'Tags',
      whyItMatters: 'Why it matters',
      useItWhen: 'Use it when',
      followUp: 'Follow-up / Task',
    },
  },

  // ---- Library ----
  library: {
    title: 'Library',
    subtitle: 'What idea do you want to keep?',
    capturePrompt: 'Save one idea from something you read, watched, or heard.',
    actions: {
      captureIdea: 'Capture idea',
      scanPage: 'Scan page',
      addQuote: 'Add quote',
    },
    cardFields: {
      useItWhen: 'Use it when',
      connectedMemory: 'Connected to',
    },
  },

  // ---- Book Detail ----
  bookDetail: {
    rememberedIdeas: 'Remembered ideas',
    bestQuotes: 'Best quotes',
    yourMeaning: 'In your own words',
    connectedMemories: 'Connected memories',
    recallCards: 'Practice cards',
    applyToday: 'Show me how this applies to today',
  },

  // ---- Recall ----
  recall: {
    startTitle: 'Bring back 5 memories',
    startDuration: 'About 2 minutes',
    startButton: 'Start',
    showAnswer: 'Show answer',
    responses: {
      remembered: 'Remembered',
      close: 'Close',
      forgot: 'Forgot',
    },
    summaryTitle: 'Session complete',
    summaryEncouragement: [
      'Your memories are getting stronger.',
      'Nice work. Those memories are sticking.',
      'Every practice makes recall easier.',
      'Good session. Your future self will thank you.',
    ],
  },

  // ---- Ask ----
  ask: {
    title: 'Ask your memory',
    placeholder: 'What do you want to remember?',
    exampleQueries: [
      'What did I work on this week?',
      'What happened last time I took the bus?',
      'Help me tell the Goa story.',
      'What do I remember from Indistractable?',
      'Who did I meet at that offsite?',
      'What should I remember about birthdays soon?',
    ],
    answerLabels: {
      directAnswer: 'Answer',
      supporting: 'Supporting memories',
      sources: 'Sources',
      suggestedAction: 'Suggested next step',
    },
    recentQuestions: 'Recent questions',
  },

  // ---- Settings ----
  settings: {
    title: 'Settings',
    sections: {
      privacy: {
        title: 'Privacy',
        items: [
          { label: 'Private by default', description: 'All memories are private', enabled: true },
          { label: 'Saved on your device', description: 'Data stored locally', enabled: true },
          { label: 'AI suggestions are optional', description: 'You control what gets categorized', enabled: true },
        ],
      },
      notifications: {
        title: 'Daily reminders',
        items: [
          { label: 'Evening capture prompt', description: 'Get reminded to save memories', time: '9:00 PM' },
          { label: 'Morning practice', description: 'Quick recall session reminder', time: '8:00 AM' },
        ],
      },
      about: {
        title: 'About',
        items: [
          { label: 'You can edit or delete anything' },
          { label: 'Export your data (coming soon)' },
          { label: 'Version 0.1 — MVP' },
        ],
      },
    },
  },

  // ---- Implementation Intentions ----
  intentions: {
    title: 'Reminders',
    addNew: 'Add reminder',
    placeholder: 'Before standup, ask about...',
    complete: 'Done',
    snooze: 'Snooze',
  },

  // ---- Microcopy / Toasts ----
  microcopy: {
    saveBeforeFades: 'Save this before it fades.',
    addContextLater: 'Add context later.',
    thisConnectsTo: 'This may connect to...',
    wantToPractice: 'Want to practice this?',
    shortStory: 'Here\'s the short story.',
    foundPastMemory: 'I found one past memory that may help.',
    privateMemory: 'Private memory',
    noteToFutureMe: 'Note to future me',
  },

  // ---- Trip Story ----
  tripStory: {
    placesVisited: 'Places visited',
    peopleMet: 'People met',
    memorableMoments: 'Memorable moments',
    bizarreMoment: 'The bizarre moment',
    localInteraction: 'Local interaction',
    lesson: 'What this trip taught me',
    tellIn30Seconds: 'Tell it in 30 seconds',
    tellLongerStory: 'Tell it as a longer story',
    whatILearned: 'What I learned',
  },
} as const;
