/**
 * CodeCombat - TypeScript Type Definitions
 * Core interfaces for the Python learning game
 */

// ============================================
// GRID & POSITION TYPES
// ============================================

/** Represents a position on the game grid */
export interface Position {
  x: number;
  y: number;
}

/** Represents a direction the player can face */
export type Direction = 'up' | 'down' | 'left' | 'right';

/** Represents a single cell in the game grid */
export interface GridCell {
  type: CellType;
  collectible?: Collectible;
  hazard?: Hazard;
}

/** Types of cells that can exist in the grid */
export type CellType = 'floor' | 'wall' | 'water' | 'lava' | 'goal' | 'start';

// ============================================
// GAME ENTITY TYPES
// ============================================

/** Player character state */
export interface Player {
  position: Position;
  direction: Direction;
  health: number;
  maxHealth: number;
  inventory: Collectible[];
  isAlive: boolean;
}

/** Collectible item that can be picked up */
export interface Collectible {
  id: string;
  type: CollectibleType;
  position: Position;
  value: number;
  collected: boolean;
}

export type CollectibleType = 'gem' | 'coin' | 'key' | 'potion' | 'scroll' | 'sample' | 'rock';

/** Hazard that can damage or hinder the player */
export interface Hazard {
  id: string;
  type: HazardType;
  position: Position;
  damage: number;
  active: boolean;
}

export type HazardType = 'spike' | 'fire' | 'pit' | 'enemy' | 'laser';

/** Enemy entity */
export interface Enemy {
  id: string;
  type: EnemyType;
  position: Position;
  direction: Direction;
  health: number;
  damage: number;
  movementPattern: MovementPattern;
  isAlive: boolean;
}

export type EnemyType = 'ogre' | 'skeleton' | 'munchkin' | 'thrower' | 'boss';

export type MovementPattern = 'stationary' | 'patrol' | 'chase' | 'random';

// ============================================
// LEVEL & GAME STATE TYPES
// ============================================

/** Complete level definition */
export interface Level {
  id: string;
  name: string;
  description: string;
  difficulty: Difficulty;
  category: LevelCategory;
  grid: GridCell[][];
  gridWidth: number;
  gridHeight: number;
  startPosition: Position;
  startDirection: Direction;
  goals: LevelGoal[];
  collectibles: Collectible[];
  hazards: Hazard[];
  enemies: Enemy[];
  hints: string[];
  allowedCommands: PythonCommand[];
  maxExecutionSteps: number;
  starThresholds: StarThresholds;
  starterCode: string;
  solutionCode?: string;
  nextLevelId?: string;
}

export type Difficulty = 'tutorial' | 'easy' | 'medium' | 'hard' | 'expert';

export type LevelCategory =
  | 'basics'
  | 'loops'
  | 'conditionals'
  | 'functions'
  | 'variables'
  | 'algorithms';

/** Goal conditions for completing a level */
export interface LevelGoal {
  type: GoalType;
  target?: Position;
  count?: number;
  collectibleType?: CollectibleType;
  description: string;
  completed: boolean;
}

export type GoalType =
  | 'reach_position'
  | 'collect_all'
  | 'collect_type'
  | 'defeat_enemies'
  | 'survive';

/** Thresholds for earning stars on a level */
export interface StarThresholds {
  oneStar: number;
  twoStar: number;
  threeStar: number;
}

/** Current game state during play */
export interface GameState {
  level: Level;
  player: Player;
  executionStep: number;
  isRunning: boolean;
  isPaused: boolean;
  isComplete: boolean;
  isFailed: boolean;
  score: number;
  starsEarned: number;
  executionHistory: ExecutionStep[];
  errorMessage?: string;
}

/** A single step in the execution history */
export interface ExecutionStep {
  stepNumber: number;
  command: string;
  previousPosition: Position;
  newPosition: Position;
  previousDirection: Direction;
  newDirection: Direction;
  action: PlayerAction;
  result: ExecutionResult;
  timestamp: number;
}

export type PlayerAction =
  | 'move_forward'
  | 'turn_left'
  | 'turn_right'
  | 'attack'
  | 'collect'
  | 'use_item'
  | 'wait';

export type ExecutionResult = 'success' | 'blocked' | 'damage' | 'death' | 'goal_reached';

// ============================================
// PYTHON CODE EXECUTION TYPES
// ============================================

/** Allowed Python commands in the game */
export type PythonCommand =
  | 'move_forward'
  | 'move_backward'
  | 'turn_left'
  | 'turn_right'
  | 'attack'
  | 'collect'
  | 'collect_sample'
  | 'if'
  | 'else'
  | 'elif'
  | 'while'
  | 'for'
  | 'def'
  | 'range'
  | 'print';

/** Result of parsing/executing Python code */
export interface CodeExecutionResult {
  success: boolean;
  steps: ExecutionStep[];
  error?: CodeError;
  output: string[];
  finalState: GameState;
}

/** Error that occurred during code execution */
export interface CodeError {
  type: ErrorType;
  message: string;
  line?: number;
  column?: number;
  suggestion?: string;
}

export type ErrorType =
  | 'syntax_error'
  | 'runtime_error'
  | 'logic_error'
  | 'command_not_allowed'
  | 'execution_timeout'
  | 'infinite_loop';

/** Commands that can be issued to the rover */
export type GameCommand =
  | 'move_forward'
  | 'move_backward'
  | 'turn_left'
  | 'turn_right'
  | 'collect_sample'
  | 'attack';

/** Result from PythonRunner execution (before game simulation) */
export interface RunnerExecutionResult {
  success: boolean;
  commands: GameCommand[];
  error?: string;
  output?: string[];
}

// ============================================
// USER PROGRESS & STORAGE TYPES
// ============================================

/** User's overall progress in the game */
export interface StoredProgress {
  userId?: string;
  currentLevelId: string;
  completedLevels: CompletedLevel[];
  totalStars: number;
  totalScore: number;
  achievements: Achievement[];
  settings: UserSettings;
  lastPlayedAt: string;
  createdAt: string;
}

/** Record of a completed level */
export interface CompletedLevel {
  levelId: string;
  starsEarned: number;
  bestScore: number;
  bestCode: string;
  completedAt: string;
  attempts: number;
}

/** Achievement unlocked by the player */
export interface Achievement {
  id: string;
  name: string;
  description: string;
  unlockedAt: string;
  icon: string;
}

/** User preferences and settings */
export interface UserSettings {
  soundEnabled: boolean;
  musicEnabled: boolean;
  animationSpeed: AnimationSpeed;
  theme: Theme;
  fontSize: FontSize;
  showHints: boolean;
  showLineNumbers: boolean;
}

export type AnimationSpeed = 'slow' | 'normal' | 'fast' | 'instant';
export type Theme = 'light' | 'dark' | 'system';
export type FontSize = 'small' | 'medium' | 'large';

// ============================================
// UI & COMPONENT TYPES
// ============================================

/** Props for the code editor component */
export interface CodeEditorProps {
  initialCode: string;
  allowedCommands: PythonCommand[];
  onChange: (code: string) => void;
  onRun: () => void;
  onReset: () => void;
  isRunning: boolean;
  readOnly?: boolean;
}

/** Props for the game grid component */
export interface GameGridProps {
  grid: GridCell[][];
  player: Player;
  collectibles: Collectible[];
  hazards: Hazard[];
  enemies: Enemy[];
  cellSize: number;
  isAnimating: boolean;
}

/** Props for level selection component */
export interface LevelSelectProps {
  levels: Level[];
  completedLevels: CompletedLevel[];
  currentLevelId: string;
  onSelectLevel: (levelId: string) => void;
}

/** Toast notification type */
export interface Toast {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

export type ToastType = 'success' | 'error' | 'warning' | 'info';
