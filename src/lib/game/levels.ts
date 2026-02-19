/**
 * CodeCombat - Level Definitions
 * Mars Rover Python learning levels
 */

import type { Level, GridCell, Collectible } from './types';

// ============================================
// HELPER FUNCTIONS FOR GRID CREATION
// ============================================

/**
 * Creates a 2D grid filled with floor cells
 * @param width - Grid width
 * @param height - Grid height
 * @returns Empty grid with floor cells
 */
function createEmptyGrid(width: number, height: number): GridCell[][] {
    const grid: GridCell[][] = [];
    for (let y = 0; y < height; y++) {
        const row: GridCell[] = [];
        for (let x = 0; x < width; x++) {
            row.push({ type: 'floor' });
        }
        grid.push(row);
    }
    return grid;
}

/**
 * Sets a cell type at a specific position
 * @param grid - The grid to modify
 * @param x - X coordinate
 * @param y - Y coordinate
 * @param type - Cell type to set
 */
function setCell(
    grid: GridCell[][],
    x: number,
    y: number,
    type: GridCell['type']
): void {
    if (grid[y] && grid[y][x]) {
        grid[y][x] = { type };
    }
}

// ============================================
// LEVEL 1-1: First Steps on Mars
// ============================================

/**
 * Level 1-1: First Steps on Mars
 * 
 * The simplest level - just move forward to reach the goal.
 * Teaches: move_forward() command basics
 * 
 * Grid Layout (5x3):
 * ┌───┬───┬───┬───┬───┐
 * │   │   │   │   │   │
 * ├───┼───┼───┼───┼───┤
 * │ R │ → │ → │ ★ │   │
 * ├───┼───┼───┼───┼───┤
 * │   │   │   │   │   │
 * └───┴───┴───┴───┴───┘
 * R = Rover start (facing east)
 * ★ = Goal
 */
const level_1_1_grid = createEmptyGrid(5, 3);
setCell(level_1_1_grid, 0, 1, 'start');
setCell(level_1_1_grid, 3, 1, 'goal');

const level_1_1: Level = {
    id: '1-1',
    name: 'First Steps on Mars',
    description:
        'Welcome to Mars! Your rover has just landed. Use the move_forward() command to drive the rover to the landing beacon. Each move_forward() moves the rover one cell in the direction it\'s facing.',
    difficulty: 'tutorial',
    category: 'basics',
    grid: level_1_1_grid,
    gridWidth: 5,
    gridHeight: 3,
    startPosition: { x: 0, y: 1 },
    startDirection: 'right',
    goals: [
        {
            type: 'reach_position',
            target: { x: 3, y: 1 },
            description: 'Reach the landing beacon',
            completed: false,
        },
    ],
    collectibles: [],
    hazards: [],
    enemies: [],
    hints: [
        'The rover needs to move 3 cells to the right to reach the goal.',
        'Each move_forward() command moves the rover one cell forward.',
        'You already have one move_forward() - add two more!',
    ],
    allowedCommands: ['move_forward'],
    maxExecutionSteps: 50,
    starThresholds: {
        oneStar: 10,   // Complete with 10 or fewer steps
        twoStar: 5,    // Complete with 5 or fewer steps
        threeStar: 3,  // Complete with exactly 3 steps (optimal)
    },
    starterCode: `# Move the rover to the goal!
# Use move_forward() to move one cell forward

move_forward()
# Add two more move_forward() commands below:

`,
    solutionCode: `move_forward()
move_forward()
move_forward()`,
    nextLevelId: '1-2',
};

// ============================================
// LEVEL 1-2: Navigate Around
// ============================================

/**
 * Level 1-2: Navigate Around
 * 
 * Introduces turning - must go around an obstacle.
 * Teaches: turn_left() and turn_right() commands
 * 
 * Grid Layout (5x5):
 * ┌───┬───┬───┬───┬───┐
 * │   │   │   │   │   │
 * ├───┼───┼───┼───┼───┤
 * │   │   │ █ │   │   │
 * ├───┼───┼───┼───┼───┤
 * │ R │ → │ █ │ → │ ★ │
 * ├───┼───┼───┼───┼───┤
 * │   │   │ █ │   │   │
 * ├───┼───┼───┼───┼───┤
 * │   │   │   │   │   │
 * └───┴───┴───┴───┴───┘
 * R = Rover start (facing east)
 * █ = Wall obstacle
 * ★ = Goal
 */
const level_1_2_grid = createEmptyGrid(5, 5);
setCell(level_1_2_grid, 0, 2, 'start');
setCell(level_1_2_grid, 4, 2, 'goal');
// Vertical wall at x=2
setCell(level_1_2_grid, 2, 1, 'wall');
setCell(level_1_2_grid, 2, 2, 'wall');
setCell(level_1_2_grid, 2, 3, 'wall');

const level_1_2: Level = {
    id: '1-2',
    name: 'Navigate Around',
    description:
        'There\'s a rock formation blocking the direct path. Use turn_left() and turn_right() to change the rover\'s direction, then move around the obstacle.',
    difficulty: 'tutorial',
    category: 'basics',
    grid: level_1_2_grid,
    gridWidth: 5,
    gridHeight: 5,
    startPosition: { x: 0, y: 2 },
    startDirection: 'right',
    goals: [
        {
            type: 'reach_position',
            target: { x: 4, y: 2 },
            description: 'Reach the goal without crashing',
            completed: false,
        },
    ],
    collectibles: [],
    hazards: [],
    enemies: [],
    hints: [
        'You cannot move through walls - the rover will crash!',
        'Use turn_left() or turn_right() to face a different direction.',
        'Try going up and around the wall, or down and around.',
        'One solution: move forward, turn up, move forward, turn right, move forward 3 times.',
    ],
    allowedCommands: ['move_forward', 'turn_left', 'turn_right'],
    maxExecutionSteps: 100,
    starThresholds: {
        oneStar: 15,  // Complete with 15 or fewer steps
        twoStar: 10,  // Complete with 10 or fewer steps
        threeStar: 7, // Complete with 7 steps (optimal)
    },
    starterCode: `# Navigate around the obstacles!
# 
# Available commands:
#   move_forward()  - Move one cell forward
#   turn_left()     - Turn 90 degrees left
#   turn_right()    - Turn 90 degrees right
#
# Plan your path and write your commands below:

`,
    solutionCode: `move_forward()
turn_left()
move_forward()
turn_right()
move_forward()
move_forward()
move_forward()`,
    nextLevelId: '1-3',
};

// ============================================
// LEVEL 1-3: Collect Sample
// ============================================

/**
 * Level 1-3: Collect Sample
 * 
 * Introduces collection - pick up a sample and return to base.
 * Teaches: collect_sample() command and multi-objective missions
 * 
 * Grid Layout (6x3):
 * ┌───┬───┬───┬───┬───┬───┐
 * │   │   │   │   │   │   │
 * ├───┼───┼───┼───┼───┼───┤
 * │ R │ → │ → │ ◆ │   │   │
 * ├───┼───┼───┼───┼───┼───┤
 * │   │   │   │   │   │   │
 * └───┴───┴───┴───┴───┴───┘
 * R = Rover start AND goal (return to base)
 * ◆ = Sample to collect
 */
const level_1_3_grid = createEmptyGrid(6, 3);
setCell(level_1_3_grid, 0, 1, 'start');
// Goal is the same as start - return to base

const level_1_3_collectibles: Collectible[] = [
    {
        id: 'sample-1',
        type: 'sample',
        position: { x: 3, y: 1 },
        value: 100,
        collected: false,
    },
];

const level_1_3: Level = {
    id: '1-3',
    name: 'Collect Sample',
    description:
        'A valuable rock sample has been detected! Drive to the sample, use collect_sample() to pick it up, then return to the starting position (base station).',
    difficulty: 'easy',
    category: 'basics',
    grid: level_1_3_grid,
    gridWidth: 6,
    gridHeight: 3,
    startPosition: { x: 0, y: 1 },
    startDirection: 'right',
    goals: [
        {
            type: 'collect_all',
            description: 'Collect the rock sample',
            completed: false,
        },
        {
            type: 'reach_position',
            target: { x: 0, y: 1 },
            description: 'Return to base station',
            completed: false,
        },
    ],
    collectibles: level_1_3_collectibles,
    hazards: [],
    enemies: [],
    hints: [
        'Move to the sample location first, then use collect_sample().',
        'After collecting, you need to go back to where you started.',
        'Use turn_left() or turn_right() twice to turn around (180 degrees).',
        'The rover must be ON the sample to collect it.',
    ],
    allowedCommands: ['move_forward', 'turn_left', 'turn_right', 'collect_sample'],
    maxExecutionSteps: 100,
    starThresholds: {
        oneStar: 15,  // Complete with 15 or fewer steps
        twoStar: 10,  // Complete with 10 or fewer steps
        threeStar: 9, // Complete with 9 steps (optimal)
    },
    starterCode: `# Mission: Collect the sample and return to base!
#
# Available commands:
#   move_forward()   - Move one cell forward
#   turn_left()      - Turn 90 degrees left
#   turn_right()     - Turn 90 degrees right
#   collect_sample() - Pick up a sample (must be on top of it)
#
# Write your solution below:

`,
    solutionCode: `move_forward()
move_forward()
move_forward()
collect_sample()
turn_right()
turn_right()
move_forward()
move_forward()
move_forward()`,
    nextLevelId: '1-4',
};

// ============================================
// LEVEL 1-4: First Battle
// ============================================

/**
 * Level 1-4: First Battle
 * 
 * Introduces combat - defeat a skeleton to proceed.
 * Teaches: attack() command
 * 
 * Grid Layout (5x3):
 * ┌───┬───┬───┬───┬───┐
 * │   │   │   │   │   │
 * ├───┼───┼───┼───┼───┤
 * │ H │ → │ 💀 │ → │ ★ │
 * ├───┼───┼───┼───┼───┤
 * │   │   │   │   │   │
 * └───┴───┴───┴───┴───┘
 * H = Hero, 💀 = Skeleton (20 HP)
 */
const level_1_4_grid = createEmptyGrid(5, 3);
setCell(level_1_4_grid, 0, 1, 'start');
setCell(level_1_4_grid, 4, 1, 'goal');

const level_1_4: Level = {
    id: '1-4',
    name: 'First Battle',
    description:
        'A skeleton blocks your path! Use attack() to defeat it. Be careful - enemies will fight back! Move to the skeleton, attack it, then proceed to the goal.',
    difficulty: 'easy',
    category: 'basics',
    grid: level_1_4_grid,
    gridWidth: 5,
    gridHeight: 3,
    startPosition: { x: 0, y: 1 },
    startDirection: 'right',
    goals: [
        {
            type: 'defeat_enemies',
            description: 'Defeat the skeleton',
            completed: false,
        },
        {
            type: 'reach_position',
            target: { x: 4, y: 1 },
            description: 'Reach the goal',
            completed: false,
        },
    ],
    collectibles: [],
    hazards: [],
    enemies: [
        {
            id: 'skeleton1',
            type: 'skeleton',
            position: { x: 2, y: 1 },
            direction: 'left',
            health: 20,
            damage: 10,
            movementPattern: 'stationary',
            isAlive: true,
        },
    ],
    hints: [
        'Move next to the skeleton first, then use attack().',
        'Each attack() does 20 damage - one hit defeats this skeleton!',
        'After defeating the enemy, continue to the goal.',
    ],
    allowedCommands: ['move_forward', 'turn_left', 'turn_right', 'attack'],
    maxExecutionSteps: 50,
    starThresholds: {
        oneStar: 10,
        twoStar: 6,
        threeStar: 4,
    },
    starterCode: `# Defeat the skeleton and reach the goal!
#
# Available commands:
#   move_forward()  - Move one cell forward
#   turn_left()     - Turn 90 degrees left
#   turn_right()    - Turn 90 degrees right
#   attack()        - Attack enemy in front of you
#
# Write your solution below:

move_forward()
# Add attack() and more commands here!

`,
    solutionCode: `move_forward()
attack()
move_forward()
move_forward()`,
    nextLevelId: '1-5',
};

// ============================================
// LEVEL 1-5: Double Trouble
// ============================================

/**
 * Level 1-5: Double Trouble
 * 
 * Two skeletons - practice the attack pattern.
 * Teaches: repeating attack() pattern manually
 * 
 * Grid Layout (5x3):
 * ┌───┬───┬───┬───┬───┐
 * │   │   │   │   │   │
 * ├───┼───┼───┼───┼───┤
 * │ H │ 💀 │   │ 💀 │ ★ │
 * ├───┼───┼───┼───┼───┤
 * │   │   │   │   │   │
 * └───┴───┴───┴───┴───┘
 */
const level_1_5_grid = createEmptyGrid(5, 3);
setCell(level_1_5_grid, 0, 1, 'start');
setCell(level_1_5_grid, 4, 1, 'goal');

const level_1_5: Level = {
    id: '1-5',
    name: 'Double Trouble',
    description:
        'Two skeletons block your path! Attack each one and move to the goal. Remember: attack the enemy in front of you, then move forward!',
    difficulty: 'easy',
    category: 'basics',
    grid: level_1_5_grid,
    gridWidth: 5,
    gridHeight: 3,
    startPosition: { x: 0, y: 1 },
    startDirection: 'right',
    goals: [
        {
            type: 'defeat_enemies',
            description: 'Defeat both skeletons',
            completed: false,
        },
        {
            type: 'reach_position',
            target: { x: 4, y: 1 },
            description: 'Reach the goal',
            completed: false,
        },
    ],
    collectibles: [],
    hazards: [],
    enemies: [
        {
            id: 'skeleton1',
            type: 'skeleton',
            position: { x: 1, y: 1 },
            direction: 'left',
            health: 20,
            damage: 10,
            movementPattern: 'stationary',
            isAlive: true,
        },
        {
            id: 'skeleton2',
            type: 'skeleton',
            position: { x: 3, y: 1 },
            direction: 'left',
            health: 20,
            damage: 10,
            movementPattern: 'stationary',
            isAlive: true,
        },
    ],
    hints: [
        'Attack the first skeleton, move forward, attack the second, move to goal!',
        'Pattern: attack(), move_forward(), attack(), move_forward()',
    ],
    allowedCommands: ['move_forward', 'turn_left', 'turn_right', 'attack'],
    maxExecutionSteps: 50,
    starThresholds: {
        oneStar: 10,
        twoStar: 6,
        threeStar: 4,
    },
    starterCode: `# Defeat both skeletons!
#
# Available commands:
#   move_forward()  - Move one cell forward
#   attack()        - Attack enemy in front
#
# Write your solution below:

attack()
# Keep going!

`,
    solutionCode: `attack()
move_forward()
attack()
move_forward()`,
    nextLevelId: '2-1',
};

// ============================================
// LEVEL 2-1: The Orc Guard
// ============================================

/**
 * Level 2-1: The Orc Guard
 * 
 * A tougher enemy - the orc has 40 HP and needs 2 attacks!
 * Teaches: attacking the same enemy multiple times
 * 
 * Grid Layout (4x3):
 * ┌───┬───┬───┬───┐
 * │   │   │   │   │
 * ├───┼───┼───┼───┤
 * │ H │   │ 👹 │ ★ │
 * ├───┼───┼───┼───┤
 * │   │   │   │   │
 * └───┴───┴───┴───┘
 * 👹 = Orc (40 HP - needs 2 attacks!)
 */
const level_2_1_grid = createEmptyGrid(4, 3);
setCell(level_2_1_grid, 0, 1, 'start');
setCell(level_2_1_grid, 3, 1, 'goal');

const level_2_1: Level = {
    id: '2-1',
    name: 'The Orc Guard',
    description:
        'An orc blocks your path! This enemy is tougher - it has 40 health. You deal 20 damage per attack, so you\'ll need to attack TWICE to defeat it!',
    difficulty: 'easy',
    category: 'basics',
    grid: level_2_1_grid,
    gridWidth: 4,
    gridHeight: 3,
    startPosition: { x: 0, y: 1 },
    startDirection: 'right',
    goals: [
        {
            type: 'defeat_enemies',
            description: 'Defeat the orc',
            completed: false,
        },
        {
            type: 'reach_position',
            target: { x: 3, y: 1 },
            description: 'Reach the goal',
            completed: false,
        },
    ],
    collectibles: [],
    hazards: [],
    enemies: [
        {
            id: 'orc1',
            type: 'ogre',
            position: { x: 2, y: 1 },
            direction: 'left',
            health: 40,
            damage: 10,
            movementPattern: 'stationary',
            isAlive: true,
        },
    ],
    hints: [
        'The orc has 40 HP - one attack won\'t be enough!',
        'Attack twice: attack() attack()',
        'Then move to the goal',
    ],
    allowedCommands: ['move_forward', 'turn_left', 'turn_right', 'attack'],
    maxExecutionSteps: 50,
    starThresholds: {
        oneStar: 8,
        twoStar: 5,
        threeStar: 4,
    },
    starterCode: `# The orc has 40 HP - you need 2 attacks!
#
# Each attack() does 20 damage
# 40 HP / 20 damage = 2 attacks needed
#
# Write your solution below:

move_forward()
# Attack twice, then move to goal!

`,
    solutionCode: `move_forward()
attack()
attack()
move_forward()`,
    nextLevelId: '2-2',
};

// ============================================
// LEVEL 2-2: Mighty Ogre
// ============================================

/**
 * Level 2-2: Mighty Ogre
 * 
 * A powerful ogre that requires 3 attacks!
 * Teaches: calculating damage and health
 * 
 * Grid Layout (4x3):
 * ┌───┬───┬───┬───┐
 * │   │   │   │   │
 * ├───┼───┼───┼───┤
 * │ H │   │ 👹 │ ★ │
 * ├───┼───┼───┼───┤
 * │   │   │   │   │
 * └───┴───┴───┴───┘
 * 👹 = Ogre (60 HP - needs 3 attacks!)
 */
const level_2_2_grid = createEmptyGrid(4, 3);
setCell(level_2_2_grid, 0, 1, 'start');
setCell(level_2_2_grid, 3, 1, 'goal');

const level_2_2: Level = {
    id: '2-2',
    name: 'Mighty Ogre',
    description:
        'A mighty ogre stands in your way! With 60 health, you\'ll need THREE attacks to bring it down. Watch out - it hits hard!',
    difficulty: 'easy',
    category: 'basics',
    grid: level_2_2_grid,
    gridWidth: 4,
    gridHeight: 3,
    startPosition: { x: 0, y: 1 },
    startDirection: 'right',
    goals: [
        {
            type: 'defeat_enemies',
            description: 'Defeat the mighty ogre',
            completed: false,
        },
        {
            type: 'reach_position',
            target: { x: 3, y: 1 },
            description: 'Reach the goal',
            completed: false,
        },
    ],
    collectibles: [],
    hazards: [],
    enemies: [
        {
            id: 'ogre1',
            type: 'ogre',
            position: { x: 2, y: 1 },
            direction: 'left',
            health: 60,
            damage: 15,
            movementPattern: 'stationary',
            isAlive: true,
        },
    ],
    hints: [
        'The ogre has 60 HP - you need 3 attacks!',
        '60 HP / 20 damage per attack = 3 attacks',
        'Be careful - the ogre deals 15 damage when it counter-attacks!',
    ],
    allowedCommands: ['move_forward', 'turn_left', 'turn_right', 'attack'],
    maxExecutionSteps: 50,
    starThresholds: {
        oneStar: 8,
        twoStar: 6,
        threeStar: 5,
    },
    starterCode: `# The mighty ogre has 60 HP!
#
# 60 HP / 20 damage = 3 attacks needed
# The ogre hits back for 15 damage each time!
#
# Write your solution below:

move_forward()
# Attack 3 times, then move to goal!

`,
    solutionCode: `move_forward()
attack()
attack()
attack()
move_forward()`,
    nextLevelId: undefined,
};

// ============================================
// LEVEL REGISTRY & HELPERS
// ============================================

/**
 * Registry of all game levels, keyed by level ID
 */
export const levels: Record<string, Level> = {
    '1-1': level_1_1,
    '1-2': level_1_2,
    '1-3': level_1_3,
    '1-4': level_1_4,
    '1-5': level_1_5,
    '2-1': level_2_1,
    '2-2': level_2_2,
};

/**
 * Get a level by its ID
 * @param id - The level ID (e.g., '1-1', '1-2')
 * @returns The level object or undefined if not found
 */
export function getLevel(id: string): Level | undefined {
    return levels[id];
}

/**
 * Get all levels as an array, sorted by ID
 * @returns Array of all levels
 */
export function getAllLevels(): Level[] {
    return Object.values(levels).sort((a, b) => a.id.localeCompare(b.id));
}

/**
 * Get the first level (starting level)
 * @returns The first level in the game
 */
export function getFirstLevel(): Level {
    return level_1_1;
}

/**
 * Get the next level after the current one
 * @param currentId - Current level ID
 * @returns The next level or undefined if at the end
 */
export function getNextLevel(currentId: string): Level | undefined {
    const current = levels[currentId];
    if (current?.nextLevelId) {
        return levels[current.nextLevelId];
    }
    return undefined;
}
