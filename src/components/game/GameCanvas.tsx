'use client';

/**
 * GameCanvas - Full-screen Phaser game container
 * Fills entire parent with no borders or margins
 */

import { useEffect, useRef, useState, useImperativeHandle, forwardRef } from 'react';
import Phaser from 'phaser';
import { GameScene } from '@/lib/game/GameScene';
import type { Level, GameCommand } from '@/lib/game/types';

interface GameCanvasProps {
    level: Level;
    onComplete: (success: boolean, message: string) => void;
}

export interface GameCanvasHandle {
    executeCommands: (commands: GameCommand[]) => Promise<void>;
    resetScene: () => void;
}

export const GameCanvas = forwardRef<GameCanvasHandle, GameCanvasProps>(
    function GameCanvas({ level, onComplete }, ref) {
        const containerRef = useRef<HTMLDivElement>(null);
        const gameRef = useRef<Phaser.Game | null>(null);
        const sceneRef = useRef<GameScene | null>(null);
        const [isLoading, setIsLoading] = useState(true);
        const levelRef = useRef(level);
        const onCompleteRef = useRef(onComplete);

        levelRef.current = level;
        onCompleteRef.current = onComplete;

        useImperativeHandle(ref, () => ({
            executeCommands: async (commands: GameCommand[]) => {
                if (sceneRef.current) {
                    await sceneRef.current.executeCommands(commands);
                }
            },
            resetScene: () => {
                if (sceneRef.current) {
                    sceneRef.current.scene.restart({
                        level: levelRef.current,
                        onComplete: onCompleteRef.current
                    });
                }
            },
        }));

        useEffect(() => {
            if (!containerRef.current) return;
            if (gameRef.current) return;

            const container = containerRef.current;
            const rect = container.getBoundingClientRect();
            const width = Math.floor(rect.width) || 800;
            const height = Math.floor(rect.height) || 600;

            class GameSceneWrapper extends GameScene {
                init() {
                    super.init({
                        level: levelRef.current,
                        onComplete: onCompleteRef.current,
                    });
                }
            }

            // Phaser config - fills entire container, no borders
            const config: Phaser.Types.Core.GameConfig = {
                type: Phaser.AUTO,
                parent: container,
                width: width,
                height: height,
                transparent: false,
                backgroundColor: '#1a1510', // Dungeon wall color
                scene: GameSceneWrapper,
                scale: {
                    mode: Phaser.Scale.RESIZE, // RESIZE instead of FIT
                    autoCenter: Phaser.Scale.NO_CENTER,
                    width: '100%',
                    height: '100%',
                },
                physics: {
                    default: 'arcade',
                    arcade: { debug: false },
                },
                render: {
                    antialias: true,
                    pixelArt: false,
                },
            };

            const game = new Phaser.Game(config);
            gameRef.current = game;

            const checkScene = setInterval(() => {
                const scene = game.scene.getScene('GameScene') as GameScene;
                if (scene && scene.scene.isActive()) {
                    sceneRef.current = scene;
                    setIsLoading(false);
                    clearInterval(checkScene);
                }
            }, 100);

            const handleResize = () => {
                if (gameRef.current && containerRef.current) {
                    const newRect = containerRef.current.getBoundingClientRect();
                    gameRef.current.scale.resize(newRect.width, newRect.height);
                }
            };

            window.addEventListener('resize', handleResize);

            return () => {
                window.removeEventListener('resize', handleResize);
                clearInterval(checkScene);
                if (gameRef.current) {
                    gameRef.current.destroy(true);
                    gameRef.current = null;
                    sceneRef.current = null;
                }
            };
        }, []);

        useEffect(() => {
            if (sceneRef.current && gameRef.current && !isLoading) {
                sceneRef.current.scene.restart({ level, onComplete });
            }
        }, [level.id]);

        return (
            <div className="w-full h-full" style={{ position: 'relative' }}>
                {isLoading && (
                    <div className="loading-overlay">
                        <div className="loading-spinner" />
                        <p>Entering dungeon...</p>
                    </div>
                )}
                <div
                    ref={containerRef}
                    className="w-full h-full"
                    style={{ opacity: isLoading ? 0 : 1 }}
                />
                <style jsx>{`
                    .loading-overlay {
                        position: absolute;
                        inset: 0;
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        justify-content: center;
                        gap: 1rem;
                        color: #a0a0a0;
                        background: #1a1510;
                        z-index: 10;
                    }
                    .loading-spinner {
                        width: 40px;
                        height: 40px;
                        border: 3px solid #3a3530;
                        border-top-color: #ffd700;
                        border-radius: 50%;
                        animation: spin 1s linear infinite;
                    }
                    @keyframes spin {
                        to { transform: rotate(360deg); }
                    }
                    .loading-overlay p {
                        font-size: 0.875rem;
                    }
                `}</style>
            </div>
        );
    }
);
