'use client';

/**
 * Home Page - CodeCombat Dungeon Theme
 * Clean, organized design with world-based level structure
 */

import Link from 'next/link';
import { getAllLevels } from '@/lib/game/levels';

// Group levels by world (first number in id)
function groupLevelsByWorld(levels: ReturnType<typeof getAllLevels>) {
  const worldNames: Record<string, { name: string; icon: string; description: string }> = {
    '1': { name: 'Forest Beginnings', icon: '🌲', description: 'Learn movement and basic commands' },
    '2': { name: 'Combat Training', icon: '⚔️', description: 'Master attack and defeat enemies' },
    '3': { name: 'Advanced Techniques', icon: '🏰', description: 'Loops, conditions, and complex strategies' },
  };

  const grouped: Record<string, typeof levels> = {};

  levels.forEach(level => {
    const worldNum = level.id.split('-')[0];
    if (!grouped[worldNum]) grouped[worldNum] = [];
    grouped[worldNum].push(level);
  });

  return Object.entries(grouped).map(([worldNum, worldLevels]) => ({
    id: worldNum,
    ...worldNames[worldNum] || { name: `World ${worldNum}`, icon: '🗺️', description: '' },
    levels: worldLevels,
  }));
}

export default function Home() {
  const levels = getAllLevels();
  const worlds = groupLevelsByWorld(levels);

  return (
    <div className="home-page">
      {/* Subtle Background Glow */}
      <div className="bg-glow top" />
      <div className="bg-glow bottom" />

      {/* Hero Section - Compact */}
      <header className="hero">
        <div className="hero-badge">🐍 Learn Python Through Adventure</div>
        <h1 className="title">
          <span className="title-code">Game</span>
          <span className="title-combat"> Coder</span>
        </h1>
        <p className="tagline">
          Write real Python code to guide your hero through dungeons, defeat monsters, and collect treasures.
        </p>
        <Link href="/levels/1-1" className="btn-start">
          <span className="btn-icon">⚔️</span>
          Start Your Quest
          <span className="btn-arrow">→</span>
        </Link>
      </header>

      {/* How It Works */}
      <section className="how-it-works">
        <div className="step">
          <div className="step-number">1</div>
          <div className="step-icon">📝</div>
          <h3>Write Code</h3>
          <p>Type Python commands in the editor</p>
        </div>
        <div className="step-connector">→</div>
        <div className="step">
          <div className="step-number">2</div>
          <div className="step-icon">🎮</div>
          <h3>Watch & Learn</h3>
          <p>See your hero execute commands</p>
        </div>
        <div className="step-connector">→</div>
        <div className="step">
          <div className="step-number">3</div>
          <div className="step-icon">🏆</div>
          <h3>Master Python</h3>
          <p>Complete levels and earn stars</p>
        </div>
      </section>

      {/* World Map - Levels by Chapter */}
      <section className="worlds-section">
        <h2 className="section-title">
          <span className="section-icon">🗺️</span>
          Choose Your Adventure
        </h2>

        {worlds.map((world) => (
          <div key={world.id} className="world-section">
            <div className="world-header">
              <span className="world-icon">{world.icon}</span>
              <div className="world-info">
                <h3 className="world-name">Chapter {world.id}: {world.name}</h3>
                <p className="world-description">{world.description}</p>
              </div>
            </div>

            <div className="levels-grid">
              {world.levels.map((level, idx) => (
                <Link key={level.id} href={`/levels/${level.id}`} className="level-card">
                  <div className="level-badge">Quest {level.id}</div>
                  <div className="level-number">{idx + 1}</div>
                  <h4 className="level-name">{level.name}</h4>
                  <p className="level-desc">{level.description.substring(0, 60)}...</p>
                  <div className="level-footer">
                    <span className="level-difficulty">{level.difficulty}</span>
                    <div className="level-stars">⭐⭐⭐</div>
                  </div>
                  <div className="level-play">Play →</div>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </section>

      {/* Features - Compact */}
      <section className="features">
        <div className="feature">
          <span className="feature-icon">⚔️</span>
          <h4>Combat</h4>
          <p>Battle skeletons, orcs, and ogres</p>
        </div>
        <div className="feature">
          <span className="feature-icon">💎</span>
          <h4>Collect</h4>
          <p>Gather gems and treasures</p>
        </div>
        <div className="feature">
          <span className="feature-icon">🐍</span>
          <h4>Code</h4>
          <p>Learn loops, conditions, functions</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <p>⚔️ CodeCombat - Learn to code through epic adventures</p>
      </footer>

      <style jsx>{`
        .home-page {
          min-height: 100vh;
          background: #0f0f1a;
          color: #e0d4c0;
          position: relative;
          overflow-x: hidden;
        }

        /* Background Glow */
        .bg-glow {
          position: fixed;
          width: 600px;
          height: 600px;
          border-radius: 50%;
          pointer-events: none;
          z-index: 0;
        }
        .bg-glow.top {
          top: -300px;
          left: 50%;
          transform: translateX(-50%);
          background: radial-gradient(circle, rgba(139,105,20,0.15) 0%, transparent 70%);
        }
        .bg-glow.bottom {
          bottom: -300px;
          right: -200px;
          background: radial-gradient(circle, rgba(100,50,150,0.1) 0%, transparent 70%);
        }

        /* Hero Section */
        .hero {
          position: relative;
          z-index: 1;
          text-align: center;
          padding: 5rem 2rem 3rem;
          max-width: 700px;
          margin: 0 auto;
        }

        .hero-badge {
          display: inline-block;
          background: rgba(255,215,0,0.1);
          border: 1px solid rgba(255,215,0,0.3);
          color: #ffd700;
          padding: 0.5rem 1rem;
          border-radius: 20px;
          font-size: 0.875rem;
          margin-bottom: 1.5rem;
        }

        .title {
          font-size: 4.5rem;
          font-weight: 800;
          line-height: 1;
          letter-spacing: -3px;
          margin-bottom: 1rem;
        }

        .title-code {
          color: #ffd700;
          text-shadow: 0 0 30px rgba(255,215,0,0.4);
        }

        .title-combat {
          color: #ff6b4a;
          text-shadow: 0 0 30px rgba(255,107,74,0.4);
        }

        .tagline {
          font-size: 1.125rem;
          color: #a0a0c0;
          line-height: 1.6;
          margin-bottom: 2rem;
          max-width: 500px;
          margin-left: auto;
          margin-right: auto;
        }

        .btn-start {
          display: inline-flex;
          align-items: center;
          gap: 0.75rem;
          padding: 1rem 2.5rem;
          background: linear-gradient(180deg, #b8860b 0%, #8b6914 100%);
          border: 2px solid #daa520;
          color: #fff;
          font-size: 1.25rem;
          font-weight: 700;
          border-radius: 12px;
          text-decoration: none;
          transition: all 0.3s ease;
          box-shadow: 
            0 4px 0 #5c4033,
            0 6px 20px rgba(139,105,20,0.4);
        }

        .btn-start:hover {
          transform: translateY(-3px);
          box-shadow: 
            0 7px 0 #5c4033,
            0 10px 30px rgba(139,105,20,0.5);
        }

        .btn-icon { font-size: 1.5rem; }
        .btn-arrow { opacity: 0.7; }

        /* How It Works */
        .how-it-works {
          position: relative;
          z-index: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 1rem;
          padding: 3rem 2rem;
          max-width: 900px;
          margin: 0 auto;
          flex-wrap: wrap;
        }

        .step {
          text-align: center;
          padding: 1.5rem;
          background: rgba(30,30,50,0.5);
          border: 1px solid #3d3050;
          border-radius: 12px;
          min-width: 180px;
          position: relative;
        }

        .step-number {
          position: absolute;
          top: -12px;
          left: 50%;
          transform: translateX(-50%);
          background: #8b6914;
          color: #fff;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          font-size: 0.75rem;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .step-icon { font-size: 2rem; margin-bottom: 0.5rem; }
        .step h3 { color: #ffd700; font-size: 1rem; margin-bottom: 0.25rem; }
        .step p { color: #a0a0c0; font-size: 0.875rem; }

        .step-connector {
          color: #5a5a70;
          font-size: 1.5rem;
        }

        /* Worlds Section */
        .worlds-section {
          position: relative;
          z-index: 1;
          max-width: 900px;
          margin: 0 auto;
          padding: 3rem 2rem;
        }

        .section-title {
          font-size: 1.75rem;
          font-weight: 700;
          text-align: center;
          margin-bottom: 2rem;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
          color: #e0d4c0;
        }

        .section-icon { font-size: 1.5rem; }

        /* World Sections */
        .world-section {
          margin-bottom: 3rem;
        }

        .world-header {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 1.5rem;
        }

        .world-icon { font-size: 2.5rem; }

        .world-info { flex: 1; }
        .world-name { 
          font-size: 1.5rem; 
          font-weight: 700; 
          color: #ffd700;
          margin-bottom: 0.25rem;
        }
        .world-description { color: #a0a0c0; font-size: 0.875rem; }

        /* Level Cards Grid */
        .levels-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 1.25rem;
        }

        .level-card {
          position: relative;
          background: linear-gradient(180deg, #252540 0%, #1a1a2e 100%);
          border: 2px solid #3d3050;
          border-radius: 16px;
          padding: 1.5rem;
          text-decoration: none;
          color: #e0d4c0;
          transition: all 0.3s ease;
          overflow: hidden;
        }

        .level-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: linear-gradient(90deg, #8b6914, #ffd700, #8b6914);
          opacity: 0;
          transition: opacity 0.3s;
        }

        .level-card:hover {
          transform: translateY(-6px);
          border-color: #aa8833;
          box-shadow: 0 12px 40px rgba(139,105,20,0.25);
        }

        .level-card:hover::before {
          opacity: 1;
        }

        .level-badge {
          position: absolute;
          top: 1rem;
          right: 1rem;
          background: rgba(139,105,20,0.3);
          color: #ffd700;
          padding: 0.25rem 0.75rem;
          border-radius: 4px;
          font-size: 0.75rem;
          font-weight: 600;
        }

        .level-number {
          width: 48px;
          height: 48px;
          background: linear-gradient(180deg, #3d3050 0%, #2a2a40 100%);
          border: 3px solid #5a5a70;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
          font-weight: 700;
          color: #a0a0c0;
          margin-bottom: 1rem;
          transition: all 0.3s;
        }

        .level-card:hover .level-number {
          background: linear-gradient(180deg, #8b6914 0%, #5c4033 100%);
          border-color: #ffd700;
          color: #fff;
        }

        .level-card .level-name {
          font-size: 1.125rem;
          font-weight: 700;
          color: #ffd700;
          margin-bottom: 0.5rem;
        }

        .level-desc {
          color: #8080a0;
          font-size: 0.875rem;
          line-height: 1.5;
          margin-bottom: 1rem;
          min-height: 42px;
        }

        .level-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.75rem;
        }

        .level-difficulty {
          background: #2a2a40;
          color: #a0a0c0;
          padding: 0.25rem 0.75rem;
          border-radius: 4px;
          font-size: 0.75rem;
          text-transform: capitalize;
        }

        .level-stars {
          opacity: 0.5;
          font-size: 0.875rem;
        }

        .level-play {
          color: #aa8833;
          font-weight: 600;
          font-size: 0.875rem;
          transition: color 0.2s;
        }

        .level-card:hover .level-play {
          color: #ffd700;
        }

        /* Features */
        .features {
          position: relative;
          z-index: 1;
          display: flex;
          justify-content: center;
          gap: 2rem;
          padding: 3rem 2rem;
          max-width: 700px;
          margin: 0 auto;
          flex-wrap: wrap;
        }

        .feature {
          text-align: center;
          min-width: 150px;
        }

        .feature-icon { font-size: 2rem; display: block; margin-bottom: 0.5rem; }
        .feature h4 { color: #ffd700; font-size: 1rem; margin-bottom: 0.25rem; }
        .feature p { color: #6b6b8a; font-size: 0.875rem; }

        /* Footer */
        .footer {
          position: relative;
          z-index: 1;
          text-align: center;
          padding: 2rem;
          color: #4a4a6a;
          font-size: 0.875rem;
        }

        /* Responsive */
        @media (max-width: 768px) {
          .title { font-size: 3rem; letter-spacing: -2px; }
          .tagline { font-size: 1rem; }
          .btn-start { padding: 0.875rem 1.5rem; font-size: 1rem; }

          .how-it-works { flex-direction: column; gap: 0.5rem; }
          .step-connector { transform: rotate(90deg); }
          .step { width: 100%; max-width: 300px; }

          .world-header { flex-wrap: wrap; text-align: center; justify-content: center; }
          .world-info { text-align: center; }
          
          .levels-grid {
            grid-template-columns: 1fr;
          }

          .features { flex-direction: column; align-items: center; }
        }

        @media (max-width: 480px) {
          .title { font-size: 2.5rem; }
          .hero { padding: 3rem 1rem 2rem; }
        }
      `}</style>
    </div>
  );
}
