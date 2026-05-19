// ============================================
// Memory OS — Adaptive Prompts
// ============================================
// 📝 EDIT THIS FILE to change capture prompts and follow-up questions.

export const adaptivePrompts = [
  { id: 'work', label: 'What did you work on?', placeholder: 'What project, task, or problem did you tackle?' },
  { id: 'read', label: 'What did you read?', placeholder: 'Save one idea, quote, or line you want to use later.' },
  { id: 'meet', label: 'Who did you meet?', placeholder: 'Name, detail, or thing you want to remember about them.' },
  { id: 'notforget', label: 'What should you not forget?', placeholder: 'Something important that might slip away.' },
  { id: 'retell', label: 'Anything worth retelling?', placeholder: 'A funny, bizarre, or meaningful moment.' },
  { id: 'painful', label: 'Any painful lesson?', placeholder: 'Something future you should remember to avoid.' },
  { id: 'decision', label: 'Any decision made?', placeholder: 'What was decided, and why?' },
  { id: 'birthday', label: 'Any birthday or detail?', placeholder: 'A personal detail, date, or preference to remember.' },
  { id: 'surprise', label: 'What surprised you?', placeholder: 'Something unexpected that happened today.' },
];

export const followUpQuestions = [
  'What made this moment unusual?',
  'Who was there?',
  'What should future you remember?',
  'Is there a lesson or warning here?',
  'Would this help a future decision?',
  'What emotion did you feel?',
  'What detail would make this vivid?',
  'What would you tell a friend about this?',
];

export const storyBuildingPrompts = [
  'What was the most bizarre thing that happened?',
  'What interaction with a local stood out?',
  'What did this trip teach you?',
  'What would you tell a friend in 60 seconds?',
  'What detail would make this story vivid?',
  'What food or place sensory detail sticks with you?',
];

export const workFollowUps = [
  'What broke?',
  'What did you decide?',
  'What should future you not repeat?',
  'What is the next step?',
  'What was the root cause?',
];
