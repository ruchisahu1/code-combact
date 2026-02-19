# Types Reference

## Core Game Types

### Level
```typescript
interface Level {
  id: string;              // e.g., "1-1", "1-2"
  title: string;           // e.g., "First Steps on Mars"
  description: string;     // What the student needs to do
  
  starterCode: string;     // Pre-filled code in editor
  hint?: string;           // Optional hint text
  
  gridSize: {
    width: number;         // e.g., 5
    height: number;        // e.g., 5
  };
  
  initialState: GameState; // Starting game state
  objectives: Objective[]; // Win conditions
}
```

### GameState
```typescript
interface GameState {
  rover: {
    position: { x: number; y: number };
    direction: 'north' | 'east' | 'south' | 'west';
  };
  
  collectibles: Array<{ x: number; y: number }>; // Samples to collect
  obstacles: Array<{ x: number; y: number }>;    // Rocks/craters
  goal: { x: number; y: number };                // Target position
  
  samplesCollected: number;
}
```

### Objective
```typescript
interface Objective {
  id: string;                           // e.g., "reach-goal"
  description: string;                  // e.g., "Reach the landing zone"
  checkFunction: (state: GameState) => boolean;  // Returns true if complete
}
```

### GameCommand
```typescript
type GameCommand = 
  | { type: 'move'; direction: 'forward' | 'backward' }
  | { type: 'turn'; direction: 'left' | 'right' }
  | { type: 'collect' };
```

## Progress/Storage Types

### StoredProgress
```typescript
interface StoredProgress {
  version: number;                      // Data version (for migrations)
  levels: Record<string, LevelProgress>; // Key = levelId (e.g., "1-1")
  totalStars: number;
  currentLevel: string;                 // Last played level
  updatedAt: string;                    // ISO date string
}
```

### LevelProgress
```typescript
interface LevelProgress {
  completed: boolean;
  stars: number;           // 0-3
  bestCode?: string;       // Their best solution
  attempts: number;        // How many times tried
  completedAt?: string;    // ISO date string
}
```

### StoredSettings
```typescript
interface StoredSettings {
  version: number;
  soundEnabled: boolean;
  musicEnabled: boolean;
  theme: 'light' | 'dark' | 'space';
  updatedAt: string;
}
```

## Execution Types

### ExecutionResult
```typescript
interface ExecutionResult {
  success: boolean;
  commands?: GameCommand[];  // If success
  error?: string;            // If failed
  output?: string[];         // Console output
}
```

## Example Data

### Example Level
```typescript
const level_1_1: Level = {
  id: '1-1',
  title: 'First Steps on Mars',
  description: 'Move your rover 3 spaces forward to reach the landing zone.',
  
  starterCode: `# Move to the landing zone
move_forward()
# Add more commands here`,
  
  hint: 'You need to call move_forward() three times',
  
  gridSize: { width: 5, height: 3 },
  
  initialState: {
    rover: {
      position: { x: 0, y: 1 },
      direction: 'east'
    },
    collectibles: [],
    obstacles: [],
    goal: { x: 3, y: 1 },
    samplesCollected: 0
  },
  
  objectives: [
    {
      id: 'reach-goal',
      description: 'Reach the landing zone',
      checkFunction: (state) => 
        state.rover.position.x === 3 && 
        state.rover.position.y === 1
    }
  ]
};
```

### Example Progress
```typescript
const exampleProgress: StoredProgress = {
  version: 1,
  levels: {
    '1-1': {
      completed: true,
      stars: 3,
      bestCode: 'move_forward()\nmove_forward()\nmove_forward()',
      attempts: 2,
      completedAt: '2024-02-04T10:30:00Z'
    },
    '1-2': {
      completed: false,
      stars: 0,
      attempts: 1
    }
  },
  totalStars: 3,
  currentLevel: '1-2',
  updatedAt: '2024-02-04T10:30:00Z'
};
```

## Where to Use These Types
```typescript
// In levels.ts
import { Level } from './types';
export const levels: Record<string, Level> = { ... };

// In PythonRunner.ts
import { ExecutionResult, GameCommand } from './types';
async runCode(code: string): Promise<ExecutionResult> { ... }

// In storage.ts
import { StoredProgress, LevelProgress } from './types';
static getProgress(): StoredProgress { ... }

// In components
import { Level, GameState } from '@/lib/game/types';
```

## Quick Reference

**Position**: `{ x: number; y: number }`
**Direction**: `'north' | 'east' | 'south' | 'west'`
**Command**: `{ type: 'move'|'turn'|'collect', ... }`
**Level ID**: `string` like "1-1", "2-5"
**Date**: Always ISO string `new Date().toISOString()`