# File Structure

## Complete Structure
```
coderover/
├── app/                        # Next.js pages
│   ├── page.tsx                # Home/landing page
│   ├── levels/
│   │   └── [levelId]/
│   │       └── page.tsx        # Main game page
│   ├── worlds/
│   │   └── page.tsx            # Level selector
│   ├── layout.tsx              # Root layout
│   └── globals.css             # Global styles
│
├── components/                 # React components
│   ├── game/
│   │   ├── GameCanvas.tsx      # Phaser game wrapper
│   │   ├── CodeEditor.tsx      # Monaco editor wrapper
│   │   ├── OutputConsole.tsx   # Shows code output/errors
│   │   └── MissionBrief.tsx    # Shows level instructions
│   │
│   └── ui/
│       ├── Button.tsx          # Reusable button
│       ├── Card.tsx            # Reusable card
│       └── Modal.tsx           # Reusable modal
│
├── lib/                        # Core logic (NO React here)
│   ├── game/
│   │   ├── types.ts            # TypeScript types
│   │   ├── levels.ts           # Level definitions
│   │   ├── PythonRunner.ts     # Pyodide wrapper
│   │   └── GameScene.ts        # Phaser game scene
│   │
│   ├── services/
│   │   └── progress.service.ts # Save/load progress
│   │
│   └── utils/
│       ├── storage.ts          # LocalStorage helpers
│       └── constants.ts        # App constants
│
├── public/
│   └── assets/
│       ├── sprites/            # Rover, rocks, etc.
│       └── sounds/             # Sound effects
│
├── docs/                       # Documentation
│   ├── PROJECT-OVERVIEW.md
│   ├── FILE-STRUCTURE.md       # This file!
│   └── (more docs...)
│
├── .cursorrules                # AI coding rules
├── package.json
├── tsconfig.json
└── tailwind.config.ts
```

## What Goes Where?

### app/ - Pages (Routes)
- Each folder = a URL route
- `app/page.tsx` = homepage (/)
- `app/levels/[levelId]/page.tsx` = /levels/1-1, /levels/1-2, etc.

### components/ - UI Components
- **game/** - Components specific to the game
- **ui/** - Generic reusable components
- ALL files here need `'use client'` at the top

### lib/ - Business Logic
- **game/** - Core game code (Phaser, Python execution)
- **services/** - Functions that do specific tasks (save progress, etc.)
- **utils/** - Helper functions
- NO React components here!

### public/ - Static Files
- Images, sounds, fonts
- Accessed with `/assets/sprites/rover.png`

## Key Files You'll Create

### Must Create First
1. `lib/game/types.ts` - Define all your types
2. `lib/utils/storage.ts` - LocalStorage helpers
3. `lib/game/levels.ts` - Your level data
4. `lib/game/PythonRunner.ts` - Run Python code
5. `lib/game/GameScene.ts` - Phaser game

### Then Build UI
6. `components/game/CodeEditor.tsx`
7. `components/game/GameCanvas.tsx`
8. `app/levels/[levelId]/page.tsx` - Combine everything

## Import Examples
```typescript
// Import from lib
import { PythonRunner } from '@/lib/game/PythonRunner';
import { Level } from '@/lib/game/types';
import { LocalStorage } from '@/lib/utils/storage';

// Import components
import { GameCanvas } from '@/components/game/GameCanvas';
import { Button } from '@/components/ui/Button';

// Import from public
<img src="/assets/sprites/rover.png" />
```

## Rules

### In app/ (pages)
- Can import from `lib/` ✅
- Can import from `components/` ✅
- Should be small - just compose components

### In components/
- Can import from `lib/` ✅
- Can import other components ✅
- Should focus on UI only

### In lib/
- NO importing from `components/` ❌
- Can import other `lib/` files ✅
- Pure logic, no React hooks

## Common Mistakes

❌ Putting game logic in components
❌ Putting React hooks in lib/
❌ Forgetting 'use client' in components
❌ Importing components into lib/