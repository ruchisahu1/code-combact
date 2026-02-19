 'use client';
 
 import { useState, useEffect, useRef, useCallback } from 'react';
 import { useParams, useRouter } from 'next/navigation';
 import dynamic from 'next/dynamic';
 import Link from 'next/link';
 import { getLevel } from '@/lib/game/levels';
 import { PythonRunner, getPythonRunner } from '@/lib/game/PythonRunner';
 import { LocalStorage } from '@/lib/utils/storage';
 import type { Level } from '@/lib/game/types';
 import type { GameCanvasHandle } from '@/components/game/GameCanvas';
 import { CommandTooltip } from '@/components/ui/CommandTooltip';
 
 const GameCanvas = dynamic(
   () => import('@/components/game/GameCanvas').then((mod) => mod.GameCanvas),
   { ssr: false, loading: () => <div className="game-loading"><div className="loader" /></div> }
 );
 
 const CodeEditor = dynamic(
   () => import('@/components/game/CodeEditor').then((mod) => mod.CodeEditor),
   { ssr: false, loading: () => <div className="editor-loading" /> }
 );
 
 export default function LevelClientPage() {
   const params = useParams();
   const router = useRouter();
   const levelId = params?.levelId as string;
 
   const [level, setLevel] = useState<Level | null>(null);
   const [code, setCode] = useState('');
   const [isRunning, setIsRunning] = useState(false);
   const [isPythonReady, setIsPythonReady] = useState(false);
   const [output, setOutput] = useState<string[]>([]);
   const [showSuccess, setShowSuccess] = useState(false);
   const [showFailure, setShowFailure] = useState(false);
 
   const pythonRunnerRef = useRef<PythonRunner | null>(null);
   const gameCanvasRef = useRef<GameCanvasHandle | null>(null);
   const outputRef = useRef<HTMLDivElement>(null);
 
   useEffect(() => {
     if (!levelId) return;
     const levelData = getLevel(levelId);
     if (levelData) {
       setLevel(levelData);
       const savedCode = LocalStorage.getLevelCode(levelId);
       setCode(savedCode || levelData.starterCode);
     }
   }, [levelId]);
 
   useEffect(() => {
     const initPython = async () => {
       try {
         pythonRunnerRef.current = getPythonRunner();
         await pythonRunnerRef.current.initialize();
         setIsPythonReady(true);
       } catch (error) {
         setOutput(['❌ Failed to load Python engine.']);
       }
     };
     initPython();
   }, []);
 
   useEffect(() => {
     if (outputRef.current) {
       outputRef.current.scrollTop = outputRef.current.scrollHeight;
     }
   }, [output]);
 
   const handleRunCode = useCallback(async () => {
     if (!pythonRunnerRef.current || !isPythonReady) return;
     setIsRunning(true);
     setOutput(['⚔️ Executing commands...']);
     setShowSuccess(false);
 
     try {
       const result = await pythonRunnerRef.current.runCode(code);
       if (result.success) {
         setOutput(['✅ Commands executed!', `Actions: ${result.commands.join(', ') || 'none'}`]);
         if (gameCanvasRef.current && result.commands.length > 0) {
           await gameCanvasRef.current.executeCommands(result.commands);
         }
       } else {
         setOutput(['❌ Error:', result.error || 'Unknown error']);
       }
     } catch {
       setOutput(['❌ Something went wrong.']);
     } finally {
       setIsRunning(false);
     }
   }, [code, isPythonReady]);
 
   const handleLevelComplete = useCallback(
     (success: boolean, message: string) => {
       setOutput((prev) => [...prev, message]);
       if (success && level) {
         setShowSuccess(true);
         try {
           const progress = LocalStorage.getProgress();
           if (!progress.completedLevels.find((cl) => cl.levelId === level.id)) {
             progress.completedLevels.push({
               levelId: level.id, starsEarned: 3, bestScore: 1000,
               bestCode: code, completedAt: new Date().toISOString(), attempts: 1,
             });
             progress.totalStars += 3;
             progress.currentLevelId = level.nextLevelId || level.id;
             LocalStorage.saveProgress(progress);
           }
         } catch { }
       } else if (!success) {
         setShowFailure(true);
       }
     },
     [level, code]
   );
 
   const handleReset = useCallback(() => {
     setOutput([]);
     setShowSuccess(false);
     setShowFailure(false);
     gameCanvasRef.current?.resetScene();
   }, []);
 
   const handleRetry = useCallback(() => {
     handleReset();
   }, [handleReset]);
 
   if (!level) {
     return (
       <div className="error-page">
         <h1>Quest Not Found</h1>
         <Link href="/">← Return to Kingdom</Link>
         <style jsx>{`
           .error-page { min-height: 100vh; background: #1a1a2e; display: flex; flex-direction: column; align-items: center; justify-content: center; color: #fff; gap: 1rem; }
           h1 { color: #ff6b4a; font-family: 'Cinzel', serif; }
           a { padding: 0.75rem 1.5rem; background: linear-gradient(180deg, #8b6914 0%, #5c4033 100%); border: 2px solid #aa8833; border-radius: 4px; color: #ffd700; text-decoration: none; font-weight: 600; }
         `}</style>
       </div>
     );
   }
 
   return (
     <div className="level-page">
       <header className="header">
         <div className="header-left">
           <Link href="/" className="back-btn">⬅</Link>
           <div className="title-frame">
             <h1>{level.name}</h1>
             <span className="level-badge">Quest {level.id}</span>
           </div>
         </div>
         <div className="header-right">
           {isPythonReady ? (
             <span className="status ready">🐍 Spells Ready</span>
           ) : (
             <span className="status loading">⏳ Preparing...</span>
           )}
         </div>
       </header>
 
       <main className="main">
         <div className="game-section">
           <div className="game-wrapper">
             <div className="stone-frame">
               <GameCanvas
                 ref={gameCanvasRef}
                 level={level}
                 onComplete={handleLevelComplete}
               />
             </div>
 
             <div className="objectives-overlay">
               <div className="scroll-header">📜 Quest Objectives</div>
               {level.goals.map((goal, i) => (
                 <div key={i} className="objective-item">
                   <span className="objective-icon">{goal.completed ? '✅' : '⬜'}</span>
                   <span>{goal.description}</span>
                 </div>
               ))}
             </div>
           </div>
         </div>
 
         <div className="editor-section">
           <div className="file-tab">
             <span className="file-icon">📜</span>
             <span>hero_spells.py</span>
             <button onClick={() => setCode(level.starterCode)} title="Reset scroll">↺</button>
           </div>
 
           <div className="editor-wrapper">
             <CodeEditor
               initialCode={level.starterCode}
               onCodeChange={setCode}
               isRunning={isRunning}
               levelId={level.id}
             />
           </div>
 
           <div className="controls">
             <button
               className="run-btn"
               onClick={handleRunCode}
               disabled={isRunning || !isPythonReady}
             >
               <span className="btn-icon">⚔️</span>
               <span>CAST SPELLS</span>
             </button>
             <button className="reset-btn" onClick={handleReset} disabled={isRunning}>
               🔄
             </button>
           </div>
 
           <div className="output-section">
             <div className="output-header">🔮 Oracle Vision</div>
             <div className="output-content" ref={outputRef}>
               {output.length === 0 ? (
                 <span className="placeholder">The oracle awaits your commands...</span>
               ) : (
                 output.map((line, i) => (
                   <div key={i} className={line.startsWith('❌') ? 'error' : line.startsWith('✅') ? 'success' : ''}>
                     {line}
                   </div>
                 ))
               )}
             </div>
           </div>
 
           <div className="commands-ref">
             <div className="commands-title">⚡ Available Spells:</div>
             <div className="commands-list">
               {level.allowedCommands
                 .filter(cmd => !['for', 'range', 'if', 'else', 'while'].includes(cmd))
                 .map((cmd) => {
                   const displayNames: Record<string, string> = {
                     'move_forward': 'move_forward()',
                     'move_backward': 'move_backward()',
                     'turn_left': 'turn_left()',
                     'turn_right': 'turn_right()',
                     'collect_sample': 'collect_sample()',
                     'attack': 'attack()',
                     'get_enemy_ahead': 'get_enemy_ahead()',
                     'get_health': 'get_health()',
                     'is_enemy_defeated': 'is_enemy_defeated(id)',
                   };
                   return (
                     <CommandTooltip key={cmd} commandKey={cmd}>
                       <code>{displayNames[cmd] || cmd}</code>
                     </CommandTooltip>
                   );
                 })}
             </div>
           </div>
         </div>
       </main>
 
       {showSuccess && (
         <div className="modal-overlay">
           <div className="modal">
             <div className="victory-banner">
               <div className="modal-icon">🏆</div>
               <h2>QUEST COMPLETE!</h2>
               <div className="modal-stars">⭐⭐⭐</div>
               <p className="victory-text">The dungeon has been conquered!</p>
             </div>
             <div className="modal-actions">
               <button onClick={() => setShowSuccess(false)}>Stay Here</button>
               {level.nextLevelId && (
                 <Link href={`/levels/${level.nextLevelId}`} className="next-btn">
                   Next Quest →
                 </Link>
               )}
             </div>
           </div>
         </div>
       )}
 
       {showFailure && (
         <div className="modal-overlay">
           <div className="modal failure-modal">
             <div className="victory-banner failure-banner">
               <div className="modal-icon">💀</div>
               <h2 className="failure-title">YOU DIED</h2>
               <p className="victory-text">Your hero has fallen in battle.</p>
             </div>
             <div className="modal-actions">
               <button onClick={handleRetry} className="retry-btn">
                 Try Again ↻
               </button>
             </div>
           </div>
         </div>
       )}
 
       <style jsx>{`
         .level-page {
           min-height: 100vh;
           background: linear-gradient(180deg, #1a1a2e 0%, #0f0f1a 100%);
           color: #e0d4c0;
           font-family: 'Inter', system-ui, sans-serif;
         }
 
         .header {
           display: flex;
           justify-content: space-between;
           align-items: center;
           padding: 0.75rem 1.25rem;
           background: linear-gradient(180deg, #3d2817 0%, #2a1a0f 100%);
           border-bottom: 3px solid #5c4033;
           box-shadow: 0 2px 10px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,200,100,0.1);
         }
         
         .header-left {
           display: flex;
           align-items: center;
           gap: 1rem;
         }
         
         .back-btn {
           width: 40px;
           height: 40px;
           display: flex;
           align-items: center;
           justify-content: center;
           background: linear-gradient(180deg, #5c4033 0%, #3d2817 100%);
           border: 2px solid #7a5533;
           border-radius: 6px;
           color: #ffd700;
           text-decoration: none;
           font-size: 1.2rem;
           transition: all 0.2s;
         }
         
         .back-btn:hover {
           background: linear-gradient(180deg, #7a5533 0%, #5c4033 100%);
           box-shadow: 0 0 10px rgba(255,200,100,0.3);
         }
         
         .title-frame {
           display: flex;
           align-items: center;
           gap: 0.75rem;
         }
         
         .header h1 {
           font-size: 1.3rem;
           font-weight: 700;
           color: #ffd700;
           text-shadow: 0 2px 4px rgba(0,0,0,0.5);
           margin: 0;
         }
         
         .level-badge {
           font-size: 0.7rem;
           background: linear-gradient(180deg, #8b6914 0%, #5c4033 100%);
           border: 1px solid #aa8833;
           padding: 0.2rem 0.6rem;
           border-radius: 4px;
           color: #ffeebb;
           font-weight: 600;
         }
         
         .status {
           font-size: 0.85rem;
           padding: 0.4rem 0.8rem;
           border-radius: 4px;
         }
         
         .status.ready {
           color: #66ff88;
           background: rgba(102,255,136,0.1);
           border: 1px solid rgba(102,255,136,0.3);
         }
         
         .status.loading {
           color: #ffcc66;
           background: rgba(255,204,102,0.1);
           border: 1px solid rgba(255,204,102,0.3);
         }
 
         .main {
           display: flex;
           height: calc(100vh - 60px);
         }
 
         .game-section {
           flex: 0 0 62%;
           padding: 1.25rem;
           display: flex;
           align-items: stretch;
           justify-content: center;
           background: radial-gradient(ellipse at center, #252540 0%, #1a1a2e 70%);
         }
         
         .game-wrapper {
           position: relative;
           width: 100%;
           height: 100%;
         }
         
         .stone-frame {
           width: 100%;
           height: 100%;
           border: 6px solid #5c4033;
           border-radius: 8px;
           box-shadow: 
             inset 0 0 20px rgba(0,0,0,0.5),
             0 0 30px rgba(0,0,0,0.5),
             0 0 60px rgba(139,105,20,0.1);
           background: #1a1a2e;
           overflow: hidden;
           position: relative;
         }
         
         .stone-frame::before,
         .stone-frame::after {
           content: '◆';
           position: absolute;
           font-size: 1rem;
           color: #aa8833;
           text-shadow: 0 0 5px rgba(255,200,100,0.5);
         }
         
         .stone-frame::before { top: -2px; left: 8px; }
         .stone-frame::after { top: -2px; right: 8px; }
 
         .objectives-overlay {
           position: absolute;
           top: 16px;
           left: 16px;
           background: linear-gradient(180deg, #3d3020 0%, #2a2015 100%);
           border: 2px solid #5c4a33;
           border-radius: 6px;
           padding: 0.6rem 0.9rem;
           font-size: 0.8rem;
           max-width: 220px;
           box-shadow: 0 4px 12px rgba(0,0,0,0.4);
         }
         
         .scroll-header {
           color: #ffd700;
           margin-bottom: 0.4rem;
           font-weight: 700;
           font-size: 0.75rem;
           text-transform: uppercase;
           letter-spacing: 0.5px;
         }
         
         .objective-item {
           display: flex;
           align-items: center;
           gap: 0.4rem;
           color: #d4c4a0;
           padding: 0.2rem 0;
           font-size: 0.75rem;
         }
         
         .objective-icon {
           font-size: 0.7rem;
         }
 
         .editor-section {
           flex: 0 0 38%;
           display: flex;
           flex-direction: column;
           background: linear-gradient(180deg, #1e1e30 0%, #151522 100%);
           border-left: 3px solid #3d3050;
           overflow: visible;
         }
 
         .file-tab {
           display: flex;
           align-items: center;
           gap: 0.5rem;
           padding: 0.6rem 0.9rem;
           background: linear-gradient(180deg, #2a2a40 0%, #1e1e30 100%);
           border-bottom: 2px solid #3d3050;
           font-size: 0.85rem;
           color: #c0b090;
           flex-shrink: 0;
         }
         
         .file-icon { font-size: 1.1rem; }
         
         .file-tab button {
           margin-left: auto;
           background: none;
           border: none;
           color: #8080a0;
           cursor: pointer;
           font-size: 1.1rem;
           padding: 0.25rem;
           transition: all 0.2s;
         }
         
         .file-tab button:hover {
           color: #ffd700;
           text-shadow: 0 0 5px rgba(255,200,100,0.5);
         }
 
         .editor-wrapper {
           flex: 1;
           min-height: 260px;
           max-height: 300px;
           overflow: hidden;
           border-bottom: 2px solid #3d3050;
         }
 
         .controls {
           display: flex;
           gap: 0.6rem;
           padding: 0.9rem;
           background: linear-gradient(180deg, #252540 0%, #1e1e30 100%);
           flex-shrink: 0;
           z-index: 10;
         }
         
         .run-btn {
           flex: 1;
           display: flex;
           align-items: center;
           justify-content: center;
           gap: 0.5rem;
           padding: 0.9rem 1.2rem;
           background: linear-gradient(180deg, #4a7c10 0%, #2d5000 100%);
           border: 2px solid #6a9c20;
           border-radius: 6px;
           color: #fff;
           font-size: 0.95rem;
           font-weight: 700;
           cursor: pointer;
           text-transform: uppercase;
           letter-spacing: 1px;
           transition: all 0.2s;
           box-shadow: 
             0 4px 0 #1a3000,
             0 6px 12px rgba(0,0,0,0.3);
         }
         
         .run-btn:hover:not(:disabled) {
           background: linear-gradient(180deg, #5a8c20 0%, #3d6010 100%);
           box-shadow: 
             0 2px 0 #1a3000,
             0 4px 8px rgba(0,0,0,0.3);
           transform: translateY(2px);
         }
         
         .run-btn:active:not(:disabled) {
           box-shadow: 0 0 0 #1a3000;
           transform: translateY(4px);
         }
         
         .run-btn:disabled {
           opacity: 0.5;
           cursor: not-allowed;
         }
         
         .btn-icon { font-size: 1.1rem; }
         
         .reset-btn {
           padding: 0.9rem 1rem;
           background: linear-gradient(180deg, #4a4a60 0%, #2d2d40 100%);
           border: 2px solid #5a5a70;
           border-radius: 6px;
           color: #c0c0d0;
           cursor: pointer;
           font-size: 1.1rem;
           transition: all 0.2s;
           box-shadow: 
             0 4px 0 #1a1a25,
             0 6px 12px rgba(0,0,0,0.3);
         }
         
         .reset-btn:hover:not(:disabled) {
           background: linear-gradient(180deg, #5a5a70 0%, #3d3d50 100%);
           transform: translateY(2px);
         }
         
         .reset-btn:disabled { opacity: 0.5; }
 
         .output-section {
           background: linear-gradient(180deg, #151520 0%, #0d0d15 100%);
           border-top: 2px solid #3d3050;
         }
         
         .output-header {
           padding: 0.5rem 0.9rem;
           background: linear-gradient(180deg, #252535 0%, #1e1e2a 100%);
           font-size: 0.8rem;
           color: #9090b0;
           border-bottom: 1px solid #3d3050;
           font-weight: 600;
         }
         
         .output-content {
           padding: 0.6rem 0.9rem;
           font-family: 'JetBrains Mono', 'Fira Code', monospace;
           font-size: 0.75rem;
           min-height: 50px;
           max-height: 90px;
           overflow-y: auto;
           line-height: 1.5;
           color: #a0a0c0;
         }
         
         .placeholder { color: #5a5a7a; font-style: italic; }
         .error { color: #ff6b6b; }
         .success { color: #66ff88; }
 
         .commands-ref {
           padding: 0.5rem 0.7rem;
           background: linear-gradient(180deg, #2a2a3a 0%, #1e1e2a 100%);
           border-top: 2px solid #3d3050;
           max-height: 55px;
           overflow-y: auto;
           flex-shrink: 0;
         }
         
         .commands-title {
           font-size: 0.65rem;
           color: #ffd700;
           text-transform: uppercase;
           letter-spacing: 0.5px;
           margin-bottom: 0.3rem;
           font-weight: 600;
         }
         
         .commands-list {
           display: flex;
           flex-wrap: wrap;
           gap: 0.3rem;
         }
         
         .commands-list code {
           font-size: 0.65rem;
           background: linear-gradient(180deg, #1a1a25 0%, #0d0d15 100%);
           border: 1px solid #3d3050;
           padding: 0.2rem 0.4rem;
           border-radius: 3px;
         }
 
         .modal-overlay {
           position: fixed;
           inset: 0;
           background: rgba(0,0,0,0.6);
           display: flex;
           align-items: center;
           justify-content: center;
           z-index: 1000;
         }
         .modal {
           background: linear-gradient(180deg, #252535 0%, #1e1e2a 100%);
           border: 2px solid #3d3050;
           border-radius: 10px;
           padding: 1rem;
           color: #c0c0e0;
           width: 400px;
           max-width: 90%;
           box-shadow: 0 6px 16px rgba(0,0,0,0.35);
           text-align: center;
         }
         .victory-banner {
           display: flex;
           flex-direction: column;
           align-items: center;
           gap: 0.5rem;
           margin-bottom: 0.5rem;
         }
         .modal-icon { font-size: 2rem; }
         .modal-stars { font-size: 1.2rem; color: #ffd700; }
         .victory-text { font-size: 0.9rem; }
         .modal-actions {
           display: flex;
           align-items: center;
           justify-content: center;
           gap: 0.5rem;
         }
         .next-btn {
           padding: 0.5rem 0.75rem;
           background: linear-gradient(180deg, #6baa2a 0%, #4d7a1a 100%);
           border: 1px solid #8bc34a;
           border-radius: 6px;
           font-weight: 700;
           color: #0a0a14;
         }
 
         .failure-banner { color: #ff6b6b; }
         .failure-title { margin: 0.5rem 0; }
 
         @media (max-width: 900px) {
           .main {
             grid-template-columns: 1fr;
           }
         }
 
         .retry-btn {
           padding: 0.6rem 0.9rem;
           background: linear-gradient(180deg, #cc4444 0%, #992a2a 100%);
           border: 2px solid #dd6666;
           border-radius: 6px;
           color: #fff;
           cursor: pointer;
           font-weight: 700;
         }
       `}</style>
     </div>
   );
 }
