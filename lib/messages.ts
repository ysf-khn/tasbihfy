// Encouraging messages and Islamic phrases for the dhikr app

export const greetings = {
  general: [
    "Assalamu Alaikum!",
    "Peace be upon you!",
    "May Allah bless your dhikr today",
    "Welcome back, dear brother/sister",
  ],
  morning: [
    "Assalamu Alaikum! May your morning be blessed",
    "Good morning! Start your day with dhikr",
    "SubhanAllahi wa bihamdihi - Glory to Allah and praise Him",
  ],
  afternoon: [
    "Assalamu Alaikum! Time for some peaceful dhikr",
    "May Allah accept your dhikr this afternoon",
    "La hawla wa la quwwata illa billah",
  ],
  evening: [
    "Assalamu Alaikum! End your day with remembrance",
    "Evening blessings upon you",
    "Alhamdulillahi rabbil alameen",
  ],
};

export const encouragements = {
  milestones: {
    25: [
      "MashaAllah! Quarter way there!",
      "SubhanAllah! Great start!",
      "May Allah bless your consistency",
    ],
    50: [
      "Alhamdulillah! Halfway complete!",
      "MashaAllah! You're doing amazing!",
      "Allah is with those who remember Him",
    ],
    75: [
      "SubhanAllah! Almost there!",
      "MashaAllah! Your dedication shines!",
      "May Allah accept your dhikr",
    ],
  },
  instantTasbih: {
    10: [
      "SubhanAllah! Great start!",
      "MashaAllah! 10 counts reached!",
      "May Allah bless your dhikr",
    ],
    33: [
      "SubhanAllah! 33 - A blessed number!",
      "MashaAllah! Like the 33 dhikrs after prayer!",
      "33 times - beautifully done!",
    ],
    50: [
      "Alhamdulillah! Halfway to 100!",
      "MashaAllah! 50 counts completed!",
      "Your dedication is inspiring!",
    ],
    67: [
      "Keep going! Allah sees your dedication!",
      "SubhanAllah! 67 and counting!",
      "May Allah reward your persistence!",
    ],
    100: [
      "SubhanAllah! 100 counts reached!",
      "MashaAllah! A century of dhikr!",
      "Alhamdulillah! 100 times completed!",
      "Your heart is filled with dhikr!",
    ],
  },
  completion: [
    "Alhamdulillah! Target completed!",
    "SubhanAllah! Well done!",
    "MashaAllah! May Allah accept it",
    "Barakallahu feek! Excellently done!",
    "Allah has blessed your efforts",
    "Your dhikr is complete - Alhamdulillah!",
  ],
  reset: [
    "Starting fresh with Allah's name",
    "Beginning anew - Bismillah",
    "Clean slate, pure intention",
  ],
};

export const tips = [
  "Remember Allah in your heart even when your tongue is silent",
  "The best dhikr is La ilaha illa Allah",
  "Dhikr purifies the heart and brings peace",
  "Even a small amount of consistent dhikr is beloved to Allah",
  "Dhikr in the morning and evening brings protection",
  "The Prophet ﷺ said: 'Remember often the destroyer of pleasures - death'",
  "SubhanAllah, Alhamdulillah, and Allahu Akbar are beloved to Allah",
];

export const emptyStates = {
  noDhikrs: {
    title: "Begin Your Journey",
    subtitle: "Create your first dhikr to start your spiritual journey",
    cta: "Create Your First Dhikr",
  },
  welcomeHome: {
    title: "Welcome to Your Dhikr Space",
    subtitle: "Start counting your dhikr with a beautiful digital companion",
    cta: "Choose a Dhikr to Count",
  },
};

// Helper functions
export const getRandomMessage = (messages: string[]): string => {
  return messages[Math.floor(Math.random() * messages.length)];
};

export const getTimeBasedGreeting = (userName?: string): string => {
  const hour = new Date().getHours();
  let timeOfDay: keyof typeof greetings;
  
  if (hour < 12) {
    timeOfDay = 'morning';
  } else if (hour < 17) {
    timeOfDay = 'afternoon';
  } else {
    timeOfDay = 'evening';
  }
  
  const greeting = getRandomMessage(greetings[timeOfDay]);
  return userName ? greeting.replace(/dear brother\/sister|brother\/sister/, userName) : greeting;
};

export const getMilestoneMessage = (percentage: number): string => {
  if (percentage >= 75) {
    return getRandomMessage(encouragements.milestones[75]);
  } else if (percentage >= 50) {
    return getRandomMessage(encouragements.milestones[50]);
  } else if (percentage >= 25) {
    return getRandomMessage(encouragements.milestones[25]);
  }
  return "";
};

export const getInstantTasbihMilestone = (count: number): string => {
  if (count === 10) {
    return getRandomMessage(encouragements.instantTasbih[10]);
  } else if (count === 33) {
    return getRandomMessage(encouragements.instantTasbih[33]);
  } else if (count === 50) {
    return getRandomMessage(encouragements.instantTasbih[50]);
  } else if (count === 67) {
    return getRandomMessage(encouragements.instantTasbih[67]);
  } else if (count === 100) {
    return getRandomMessage(encouragements.instantTasbih[100]);
  } else if (count > 100 && count % 25 === 0) {
    // Every 25 after 100: 125, 150, 175, etc.
    const messages = [
      `MashaAllah! ${count} counts completed!`,
      `SubhanAllah! ${count} times - amazing dedication!`,
      `Alhamdulillah! ${count} dhikr and counting!`,
      `May Allah accept your ${count} counts!`,
    ];
    return getRandomMessage(messages);
  }
  return "";
};