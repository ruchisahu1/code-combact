'use client';

/**
 * CommandTooltip - Hover help box for commands
 * Shows description, example, and parameters when hovering over a command
 */

import { useState, useRef, useEffect } from 'react';

interface CommandInfo {
  name: string;
  description: string;
  example: string;
  parameters?: {
    name: string;
    type: string;
    description: string;
    default?: string;
  }[];
}

// Command definitions with help information
export const COMMAND_INFO: Record<string, CommandInfo> = {
  'move_forward': {
    name: 'move_forward()',
    description: 'Moves the rover one cell forward in the direction it is facing.',
    example: 'move_forward()',
    parameters: [],
  },
  'move_backward': {
    name: 'move_backward()',
    description: 'Moves the rover one cell backward, opposite to the direction it is facing.',
    example: 'move_backward()',
    parameters: [],
  },
  'turn_left': {
    name: 'turn_left()',
    description: 'Rotates the rover 90 degrees to the left.',
    example: 'turn_left()',
    parameters: [],
  },
  'turn_right': {
    name: 'turn_right()',
    description: 'Rotates the rover 90 degrees to the right.',
    example: 'turn_right()',
    parameters: [],
  },
  'collect_sample': {
    name: 'collect_sample()',
    description: 'Collects a sample from the current position if one is available.',
    example: 'collect_sample()',
    parameters: [],
  },
  'attack': {
    name: 'attack()',
    description: 'Attacks the enemy directly in front of you. Deals 20 damage. Be careful - enemies fight back!',
    example: 'attack()',
    parameters: [],
  },
  'get_enemy_ahead': {
    name: 'get_enemy_ahead()',
    description: 'Checks if there is an enemy in the cell directly ahead. Returns True if an enemy is present, False otherwise.',
    example: 'if get_enemy_ahead():\n    attack()',
    parameters: [],
  },
  'get_health': {
    name: 'get_health()',
    description: 'Returns the current health of your hero.',
    example: 'health = get_health()',
    parameters: [],
  },
  'is_enemy_defeated': {
    name: 'is_enemy_defeated(id)',
    description: 'Checks if a specific enemy has been defeated.',
    example: 'while not is_enemy_defeated("ogre1"):\n    attack()',
    parameters: [{
      name: 'id',
      type: 'string',
      description: 'The unique ID of the enemy to check',
    }],
  },
};

interface CommandTooltipProps {
  commandKey: string;
  children: React.ReactNode;
}

export function CommandTooltip({ commandKey, children }: CommandTooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const triggerRef = useRef<HTMLSpanElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const command = COMMAND_INFO[commandKey];

  useEffect(() => {
    if (isVisible && triggerRef.current && tooltipRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const tooltipRect = tooltipRef.current.getBoundingClientRect();

      // Position above the trigger element
      let x = rect.left;
      let y = rect.top - tooltipRect.height - 8;

      // Keep tooltip within viewport
      if (y < 10) {
        y = rect.bottom + 8; // Show below if not enough space above
      }
      if (x + tooltipRect.width > window.innerWidth - 10) {
        x = window.innerWidth - tooltipRect.width - 10;
      }

      setPosition({ x, y });
    }
  }, [isVisible]);

  if (!command) return <>{children}</>;

  return (
    <>
      <span
        ref={triggerRef}
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        className="tooltip-trigger"
      >
        {children}
      </span>

      {isVisible && (
        <div
          ref={tooltipRef}
          className="tooltip"
          style={{ left: position.x, top: position.y }}
        >
          <div className="tooltip-header">
            <span className="tooltip-name">{command.name}</span>
            <span className="tooltip-badge">method</span>
          </div>
          <p className="tooltip-desc">{command.description}</p>
          <div className="tooltip-example">
            <span className="label">Example:</span>
            <code>{command.example}</code>
          </div>
          {command.parameters && command.parameters.length > 0 && (
            <div className="tooltip-params">
              <span className="label">Parameters:</span>
              {command.parameters.map((param, i) => (
                <div key={i} className="param">
                  <code>{param.name}</code>
                  <span className="param-type">{param.type}</span>
                  <span className="param-desc">{param.description}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <style jsx>{`
        .tooltip-trigger {
          cursor: help;
        }
        .tooltip {
          position: fixed;
          z-index: 1000;
          background: linear-gradient(135deg, #1a1a3a 0%, #12122a 100%);
          border: 1px solid #3a3a5a;
          border-radius: 10px;
          padding: 0.75rem;
          min-width: 240px;
          max-width: 320px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
          animation: fadeIn 0.15s ease;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .tooltip-header {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 0.5rem;
        }
        .tooltip-name {
          color: #22d3ee;
          font-family: 'Monaco', 'Menlo', monospace;
          font-size: 0.9rem;
          font-weight: 600;
        }
        .tooltip-badge {
          font-size: 0.6rem;
          background: #2a2a4a;
          color: #a0a0c0;
          padding: 0.15rem 0.4rem;
          border-radius: 4px;
          text-transform: uppercase;
        }
        .tooltip-desc {
          color: #e0e0e0;
          font-size: 0.8rem;
          line-height: 1.4;
          margin: 0 0 0.5rem 0;
        }
        .tooltip-example {
          background: #0d0d18;
          border-radius: 6px;
          padding: 0.4rem 0.6rem;
          margin-bottom: 0.5rem;
        }
        .label {
          display: block;
          font-size: 0.65rem;
          color: #6b6b8a;
          text-transform: uppercase;
          margin-bottom: 0.2rem;
        }
        .tooltip-example code {
          color: #ff6b4a;
          font-size: 0.8rem;
          font-family: 'Monaco', 'Menlo', monospace;
        }
        .tooltip-params {
          font-size: 0.75rem;
        }
        .param {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-top: 0.25rem;
        }
        .param code {
          color: #fbbf24;
          background: #0d0d18;
          padding: 0.1rem 0.3rem;
          border-radius: 3px;
        }
        .param-type {
          color: #8b5cf6;
          font-size: 0.7rem;
        }
        .param-desc {
          color: #a0a0c0;
        }
      `}</style>
    </>
  );
}
