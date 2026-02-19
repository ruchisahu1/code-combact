/**
 * CodeCombat - Python Execution Engine
 * Runs student Python code safely in the browser using Pyodide
 */

import type { GameCommand, RunnerExecutionResult } from './types';

// Pyodide types
interface PyodideInterface {
    runPythonAsync: (code: string) => Promise<unknown>;
    setStdout: (options: { batched: (text: string) => void }) => void;
}

/**
 * Python API code injected into Pyodide
 * Defines the rover control functions available to students
 */
const ROVER_API = `
# Mars Rover Command API
# These functions control your rover!

# Internal command storage - don't modify this!
_commands = []

# Combat state (injected by game engine before each run)
_hero_health = 100
_defeated_enemies = set()
_enemy_ahead = False

def move_forward():
    """Move the rover one cell in the direction it's facing."""
    _commands.append('move_forward')

def move_backward():
    """Move the rover one cell backward (opposite to facing direction)."""
    _commands.append('move_backward')

def turn_left():
    """Rotate the rover 90 degrees to the left."""
    _commands.append('turn_left')

def turn_right():
    """Rotate the rover 90 degrees to the right."""
    _commands.append('turn_right')

def collect_sample():
    """Pick up a sample at the rover's current position."""
    _commands.append('collect_sample')

def attack():
    """Attack enemy directly in front of the hero."""
    _commands.append('attack')

def get_enemy_ahead():
    """Check if there's an enemy in front of the hero. Returns True/False."""
    return _enemy_ahead

def get_health():
    """Get the hero's current health (0-100)."""
    return _hero_health

def is_enemy_defeated(enemy_id):
    """Check if a specific enemy has been defeated."""
    return enemy_id in _defeated_enemies

def _reset_commands():
    """Internal: Clear the command list for a new run."""
    global _commands
    _commands = []

def _get_commands():
    """Internal: Return the list of recorded commands."""
    return _commands.copy()

def _set_combat_state(health, defeated, enemy_ahead):
    """Internal: Set combat state from game engine."""
    global _hero_health, _defeated_enemies, _enemy_ahead
    _hero_health = health
    _defeated_enemies = set(defeated) if defeated else set()
    _enemy_ahead = enemy_ahead
`;

/**
 * PythonRunner - Executes student Python code in a sandboxed environment
 * 
 * Uses Pyodide to run Python in WebAssembly, providing a safe way to
 * execute untrusted student code without server-side execution.
 */
export class PythonRunner {
    private pyodide: PyodideInterface | null = null;
    private initialized: boolean = false;

    /**
     * Check if the runner is ready to execute code
     */
    get isInitialized(): boolean {
        return this.initialized;
    }

    /**
     * Initialize the Pyodide runtime and inject the rover API
     * This can take a few seconds on first load as it downloads the Python runtime
     */
    async initialize(): Promise<void> {
        if (this.initialized) {
            return;
        }

        try {
            // Dynamically load Pyodide from CDN using script tag
            // This avoids Next.js bundling issues
            if (typeof window !== 'undefined') {
                // Check if already loaded
                if ((window as unknown as { loadPyodide?: unknown }).loadPyodide) {
                    const loadPyodide = (window as unknown as { loadPyodide: (options: { indexURL: string }) => Promise<PyodideInterface> }).loadPyodide;
                    this.pyodide = await loadPyodide({
                        indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.25.0/full/',
                    });
                } else {
                    // Load Pyodide script
                    await new Promise<void>((resolve, reject) => {
                        const script = document.createElement('script');
                        script.src = 'https://cdn.jsdelivr.net/pyodide/v0.25.0/full/pyodide.js';
                        script.async = true;
                        script.onload = () => resolve();
                        script.onerror = () => reject(new Error('Failed to load Pyodide script'));
                        document.head.appendChild(script);
                    });

                    // Wait a bit for the script to initialize
                    await new Promise(resolve => setTimeout(resolve, 100));

                    const loadPyodide = (window as unknown as { loadPyodide: (options: { indexURL: string }) => Promise<PyodideInterface> }).loadPyodide;
                    if (!loadPyodide) {
                        throw new Error('Pyodide not available after loading script');
                    }

                    this.pyodide = await loadPyodide({
                        indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.25.0/full/',
                    });
                }

                // Inject the rover API into Python's global scope
                await this.pyodide.runPythonAsync(ROVER_API);

                this.initialized = true;
                console.log('🚀 Python runner initialized successfully!');
            }
        } catch (error) {
            console.error('Failed to initialize Pyodide:', error);
            throw new Error('Could not start the Python engine. Please refresh the page and try again.');
        }
    }

    /**
     * Execute student Python code and return the list of commands
     * 
     * @param code - The Python code to execute
     * @returns ExecutionResult with success status and commands or error
     */
    async runCode(code: string): Promise<RunnerExecutionResult> {
        // Ensure Pyodide is initialized
        if (!this.initialized || !this.pyodide) {
            return {
                success: false,
                commands: [],
                error: 'The Python engine is still loading. Please wait a moment and try again.',
            };
        }

        try {
            // Reset the command list before running new code
            await this.pyodide.runPythonAsync('_reset_commands()');

            // Capture any print() output
            const output: string[] = [];

            // Set up stdout capture
            this.pyodide.setStdout({
                batched: (text: string) => {
                    output.push(text);
                },
            });

            // Execute the student's code
            await this.pyodide.runPythonAsync(code);

            // Retrieve the recorded commands
            const commandsProxy = await this.pyodide.runPythonAsync('_get_commands()') as { toJs: () => GameCommand[] };
            const commands = commandsProxy.toJs ? commandsProxy.toJs() : commandsProxy as unknown as GameCommand[];

            return {
                success: true,
                commands,
                output: output.length > 0 ? output : undefined,
            };
        } catch (error) {
            return {
                success: false,
                commands: [],
                error: this.formatError(error),
            };
        }
    }

    /**
     * Convert Python errors into friendly, educational messages
     * 
     * @param error - The raw error from Pyodide
     * @returns A student-friendly error message
     */
    private formatError(error: unknown): string {
        const errorStr = String(error);

        // Extract the actual error message from Python's traceback
        const lines = errorStr.split('\n');
        const errorLine = lines.find(
            (line) =>
                line.includes('Error:') ||
                line.includes('Exception:')
        ) || errorStr;

        // === SyntaxError ===
        if (errorStr.includes('SyntaxError')) {
            if (errorStr.includes('unexpected EOF')) {
                return "🔍 Oops! Your code seems incomplete. Did you forget to finish a statement? Check for missing colons (:) or parentheses.";
            }
            if (errorStr.includes('invalid syntax')) {
                return "🔍 There's a small typo in your code. Check for:\n• Missing parentheses () after function names\n• Missing colons : after if/for/while\n• Mismatched quotes";
            }
            if (errorStr.includes('EOL while scanning string')) {
                return "🔍 A string isn't closed properly. Make sure all your quotes (\") or (') are matched.";
            }
            return "🔍 There's a syntax error in your code. Double-check your spelling and punctuation!";
        }

        // === IndentationError ===
        if (errorStr.includes('IndentationError')) {
            if (errorStr.includes('expected an indented block')) {
                return "📐 Python expected some indented code here. After if, for, while, or def, you need to indent the next line with spaces.";
            }
            if (errorStr.includes('unexpected indent')) {
                return "📐 There's an extra space at the start of a line. Make sure your indentation is consistent.";
            }
            return "📐 Check your indentation! In Python, spaces at the beginning of lines matter. Use 4 spaces for each indent level.";
        }

        // === NameError (undefined variable/function) ===
        if (errorStr.includes('NameError')) {
            // Try to extract the undefined name
            const match = errorStr.match(/name '(\w+)' is not defined/);
            if (match) {
                const name = match[1];
                const suggestions: Record<string, string> = {
                    'moveforward': "Did you mean move_forward()? Remember the underscore!",
                    'moveForward': "Did you mean move_forward()? Python uses underscores, not camelCase.",
                    'turnleft': "Did you mean turn_left()? Remember the underscore!",
                    'turnLeft': "Did you mean turn_left()? Python uses underscores, not camelCase.",
                    'turnright': "Did you mean turn_right()? Remember the underscore!",
                    'turnRight': "Did you mean turn_right()? Python uses underscores, not camelCase.",
                    'collectsample': "Did you mean collect_sample()? Remember the underscore!",
                    'collectSample': "Did you mean collect_sample()? Python uses underscores, not camelCase.",
                    'getenemyahead': "Did you mean get_enemy_ahead()? Remember the underscores!",
                    'getEnemyAhead': "Did you mean get_enemy_ahead()? Python uses underscores, not camelCase.",
                    'gethealth': "Did you mean get_health()? Remember the underscore!",
                    'getHealth': "Did you mean get_health()? Python uses underscores, not camelCase.",
                    'isenemydefeated': "Did you mean is_enemy_defeated()? Remember the underscores!",
                    'isEnemyDefeated': "Did you mean is_enemy_defeated()? Python uses underscores, not camelCase.",
                };

                if (suggestions[name]) {
                    return `🤔 "${name}" isn't recognized. ${suggestions[name]}`;
                }

                return `🤔 "${name}" isn't defined. Available commands are:\n• move_forward()\n• move_backward()\n• turn_left()\n• turn_right()\n• collect_sample()\n• attack()\n• get_enemy_ahead()\n• get_health()\n• is_enemy_defeated(id)`;
            }
            return "🤔 You're using something that hasn't been defined. Check your spelling!";
        }

        // === TypeError ===
        if (errorStr.includes('TypeError')) {
            if (errorStr.includes('takes 0 positional arguments')) {
                return "⚠️ This function doesn't need any arguments. Just use empty parentheses like move_forward()";
            }
            if (errorStr.includes("'NoneType'")) {
                return "⚠️ You're trying to use a value that doesn't exist. Make sure your function calls are correct.";
            }
            return "⚠️ There's a type mismatch. Make sure you're using the right kind of values.";
        }

        // === Infinite loop / timeout handling ===
        if (errorStr.includes('timeout') || errorStr.includes('maximum')) {
            return "⏰ Your code took too long to run. You might have an infinite loop! Check your while loops have a way to end.";
        }

        // === Generic fallback ===
        // Clean up the error for display
        const cleanError = errorLine
            .replace('PythonError:', '')
            .replace('Traceback (most recent call last):', '')
            .trim();

        return `⚠️ Something went wrong: ${cleanError}\n\nTry checking your code for typos!`;
    }

    /**
     * Destroy the Pyodide instance to free memory
     * Call this when the game component unmounts
     */
    destroy(): void {
        this.pyodide = null;
        this.initialized = false;
    }
}

// Singleton instance for the application
let runnerInstance: PythonRunner | null = null;

/**
 * Get the shared PythonRunner instance
 * Creates a new instance if one doesn't exist
 */
export function getPythonRunner(): PythonRunner {
    if (!runnerInstance) {
        runnerInstance = new PythonRunner();
    }
    return runnerInstance;
}

/**
 * Initialize the shared Python runner
 * Call this early in app startup for faster code execution later
 */
export async function initializePythonRunner(): Promise<PythonRunner> {
    const runner = getPythonRunner();
    await runner.initialize();
    return runner;
}
