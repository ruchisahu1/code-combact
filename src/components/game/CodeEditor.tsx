'use client';

/**
 * CodeEditor - Monaco-based Python code editor
 * Space-themed with auto-save functionality
 */

import { useRef, useEffect, useState, useCallback } from 'react';
import Editor, { OnMount } from '@monaco-editor/react';
import { LocalStorage } from '@/lib/utils/storage';

interface CodeEditorProps {
    initialCode: string;
    onCodeChange: (code: string) => void;
    isRunning: boolean;
    levelId: string;
}

// Custom space theme for Monaco
const SPACE_THEME = {
    base: 'vs-dark' as const,
    inherit: true,
    rules: [
        { token: 'comment', foreground: '6b6b8a', fontStyle: 'italic' },
        { token: 'keyword', foreground: 'ff6b4a' },
        { token: 'string', foreground: '22c55e' },
        { token: 'number', foreground: 'fbbf24' },
        { token: 'function', foreground: '22d3ee' },
        { token: 'variable', foreground: 'a0a0c0' },
        { token: 'type', foreground: '8b5cf6' },
    ],
    colors: {
        'editor.background': '#1e1e2e',
        'editor.foreground': '#e0e0e0',
        'editor.lineHighlightBackground': '#2a2a3a',
        'editor.selectionBackground': '#3a3a5a',
        'editorCursor.foreground': '#ff6b4a',
        'editorLineNumber.foreground': '#4a4a6a',
        'editorLineNumber.activeForeground': '#a0a0c0',
        'editor.inactiveSelectionBackground': '#2a2a4a',
    },
};

export function CodeEditor({
    initialCode,
    onCodeChange,
    isRunning,
    levelId,
}: CodeEditorProps) {
    const [code, setCode] = useState(initialCode);
    const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const editorRef = useRef<Parameters<OnMount>[0] | null>(null);

    // Load saved code on mount
    useEffect(() => {
        const savedCode = LocalStorage.getLevelCode(levelId);
        if (savedCode) {
            setCode(savedCode);
            onCodeChange(savedCode);
        } else {
            setCode(initialCode);
            onCodeChange(initialCode);
        }
    }, [levelId]);

    // Auto-save with debounce
    const handleEditorChange = useCallback(
        (value: string | undefined) => {
            const newCode = value || '';
            setCode(newCode);
            onCodeChange(newCode);

            if (saveTimeoutRef.current) {
                clearTimeout(saveTimeoutRef.current);
            }

            saveTimeoutRef.current = setTimeout(() => {
                LocalStorage.saveLevelCode(levelId, newCode);
            }, 1000);
        },
        [levelId, onCodeChange]
    );

    // Cleanup timeout on unmount
    useEffect(() => {
        return () => {
            if (saveTimeoutRef.current) {
                clearTimeout(saveTimeoutRef.current);
            }
        };
    }, []);

    const handleEditorMount: OnMount = (editor, monaco) => {
        editorRef.current = editor;

        // Define custom theme
        monaco.editor.defineTheme('space-dark', SPACE_THEME);
        monaco.editor.setTheme('space-dark');

        // Focus editor
        editor.focus();
    };

    return (
        <div className="editor-wrapper">
            <Editor
                height="320px"
                language="python"
                value={code}
                onChange={handleEditorChange}
                onMount={handleEditorMount}
                options={{
                    fontSize: 14,
                    fontFamily: "'JetBrains Mono', 'Fira Code', Monaco, monospace",
                    minimap: { enabled: false },
                    scrollBeyondLastLine: true,
                    lineNumbers: 'on',
                    glyphMargin: false,
                    folding: false,
                    lineDecorationsWidth: 10,
                    lineNumbersMinChars: 3,
                    renderLineHighlight: 'line',
                    scrollbar: {
                        vertical: 'auto',
                        horizontal: 'hidden',
                        verticalScrollbarSize: 8,
                    },
                    padding: { top: 12, bottom: 100 },
                    readOnly: isRunning,
                    wordWrap: 'on',
                    tabSize: 4,
                    insertSpaces: true,
                    automaticLayout: true,
                }}
            />

            {isRunning && (
                <div className="running-overlay">
                    <span className="spinner">⚙️</span>
                    <span>Running...</span>
                </div>
            )}

            <style jsx>{`
        .editor-wrapper {
          position: relative;
          border-radius: 0 0 12px 12px;
          overflow: hidden;
        }
        .running-overlay {
          position: absolute;
          inset: 0;
          background: rgba(30, 30, 46, 0.9);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          color: #a0a0c0;
          font-size: 0.875rem;
          z-index: 10;
        }
        .spinner {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
        </div>
    );
}
