export type HookType = 'Problem' | 'Curiosity Gap' | 'Contrarian' | 'Proof' | 'FOMO' | 'Benefit' | 'Story';

export interface Hook {
  id: string;
  type: HookType;
  text: string;
  score: number; // scroll stop power score out of 100
  explanation: string;
}

export interface ScriptSegment {
  time: string;
  label: 'Hook' | 'Problem' | 'Solution' | 'Proof' | 'CTA';
  text: string;
}

export interface Script {
  title: string;
  spokenSeconds: number; // 30, 60 or 90
  scriptText: string;
  wordCount: number;
  readingGrade: string;
  structuredSegments: ScriptSegment[];
}

export interface StoryboardScene {
  id: string;
  timestamp: string;
  visualPrompt: string; // scene visual representation prompt (for storyboard creation)
  onScreenText: string;
  avatarDirection: string;
  audioDescription: string;
  imageUrl?: string;
}

export interface LandingPageHero {
  heading: string;
  subheading: string;
  cta: string;
}

export interface MarketingKit {
  linkedin: string;
  twitterThread: string[];
  coldEmail: string;
  landingPageHero: LandingPageHero;
  youtubeDescription: string;
}

export interface CompanionMessage {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  timestamp: string;
  actionRequired?: 'create' | 'script' | 'marketing';
}

export interface Project {
  id: string;
  name: string;
  concept: string;
  audience: string;
  outcome: string;
  platform: '9:16' | '1:1' | '16:9';
  length: '30s' | '60s' | '90s';
  tone: string;
  hooks: Hook[];
  selectedHookId?: string;
  script?: Script;
  scenes?: StoryboardScene[];
  marketing?: MarketingKit;
  createdAt: string;
}
