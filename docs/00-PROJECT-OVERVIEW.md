# Project Overview
# CodeRover - Project Overview

## What Are We Building?
A web game where students (ages 10-16) learn Python by programming a Mars rover.

## The Core Idea
- Student writes Python code in a code editor
- Code controls a rover on Mars (moving, collecting samples)
- Rover animates based on their code
- Complete objectives to pass levels
- Learn programming concepts progressively

## Why This Approach?
- ✅ Students write REAL Python (not blocks)
- ✅ Instant visual feedback (see rover move)
- ✅ Engaging space theme
- ✅ Progressive difficulty (starts very easy)

## MVP Scope (What We're Building First)
- 10-15 levels teaching basic Python
- Code editor with Python support
- Mars rover game with grid movement
- Progress saved locally (localStorage)
- Works in any browser
- NO login, NO database (yet)

## Example Level Flow
```
Level 1: "First Steps"
┌─────────────────────────────┐
│ Objective: Move 3 spaces    │
│                              │
│ Grid: [Rover] → → → [Goal]  │
│                              │
│ Student writes:              │
│   move_forward()             │
│   move_forward()             │
│   move_forward()             │
│                              │
│ Result: Rover reaches goal!  │
│ ⭐⭐⭐ Complete!              │
└─────────────────────────────┘
```

## Tech Choices Explained

**Next.js** - Modern React framework, everything in one project
**Phaser** - Game engine that handles graphics/animation
**Pyodide** - Runs Python in the browser (no server needed!)
**Monaco** - The VS Code editor (familiar, powerful)
**LocalStorage** - Browser storage (simple, no database needed)

## Development Phases

### Phase 1 (Week 1-2): Core Game Working
- Setup project
- Get Pyodide running Python
- Build basic game with 3 levels
- Save progress locally

### Phase 2 (Week 3-4): More Content
- Add 10-15 levels
- Better UI/animations
- Hints system
- Achievement badges

### Phase 3 (Later): Scale Up
- Add auth/database
- Teacher dashboard
- More worlds/levels
- Mobile optimization

## Success Criteria for MVP
- [ ] Student can load level
- [ ] Write Python code in editor
- [ ] Code executes and moves rover
- [ ] Complete level and see success
- [ ] Progress saves (survives page refresh)
- [ ] Works smoothly (no lag/bugs)

## What We're NOT Building Yet
- ❌ User accounts/login
- ❌ Database
- ❌ Teacher features
- ❌ Multiplayer
- ❌ Mobile app
- ❌ Advanced Python features

Focus: Make the core game loop PERFECT first!