/**
 * GameScene - Phaser Game Scene with CodeCombat-Style Graphics
 * Full dungeon background, seamless floor tiles, no visible grid
 * Human character sprite with detailed dungeon environment
 */

import Phaser from 'phaser';
import type { GameCommand, Position, Level } from './types';

type HeroDirection = 'north' | 'east' | 'south' | 'west';

interface SceneInitData {
    level: Level;
    onComplete: (success: boolean, message: string) => void;
}

interface InitialState {
    heroPosition: Position;
    heroDirection: HeroDirection;
    collectibleIds: string[];
}

// Forest Adventure Color Palette
const THEME = {
    // Grass terrain (lush greens)
    grassBase: 0x4a8a3a,
    grassLight: 0x5a9a4a,
    grassDark: 0x3a7a2a,
    grassHighlight: 0x6aaa5a,

    // Dirt path (warm browns)
    pathBase: 0xc4a060,
    pathLight: 0xd4b070,
    pathDark: 0xa08040,
    pathEdge: 0x8b7355,

    // River/water (blues)
    waterBase: 0x4488cc,
    waterLight: 0x66aaee,
    waterDark: 0x3377bb,
    waterFoam: 0xaaddff,

    // Forest trees
    pineGreen: 0x2a5a20,
    pineLight: 0x3a6a30,
    pineDark: 0x1a4a10,
    leafGreen: 0x55aa44,
    leafLight: 0x66bb55,
    trunkBrown: 0x664422,
    trunkDark: 0x553311,

    // Rocks and cave
    rockBase: 0x666666,
    rockLight: 0x888888,
    rockDark: 0x444444,
    rockMoss: 0x445533,
    skullBone: 0xccbbaa,

    // Bridge (wood)
    bridgeWood: 0x8b4513,
    bridgeDark: 0x6b3503,
    ropeColor: 0xaa8855,

    // Level markers
    markerBlue: 0x4488ff,
    markerGreen: 0x44cc66,
    markerGold: 0xffcc00,
    markerGlow: 0xffffff,

    // Golden gems (collectibles)
    gemGold: 0xffd700,
    gemHighlight: 0xffee88,

    // Goal/destination
    goalRed: 0xff4444,
    goalGlow: 0xff6666,

    // Hero character
    heroSkin: 0xffddbb,
    heroHairOrange: 0xdd6633,
    heroArmorBlue: 0x3366aa,
    heroArmorDark: 0x224488,
    heroCapeRed: 0xcc2222,
    heroSword: 0xcccccc,
    heroSwordHandle: 0x664422,

    // Decorations
    flowerPink: 0xff88aa,
    flowerBlue: 0x6688ff,
    mushroomRed: 0xcc4444,
    mushroomCap: 0xffeeee,

    // Enemy types
    skeletonBone: 0xeeeeee,
    skeletonDark: 0xcccccc,
    skeletonEyes: 0xff4444,
    ogreGreen: 0x558844,
    ogreDark: 0x446633,
    ogreTeeth: 0xffffcc,
    robotGray: 0x8899aa,
    robotDark: 0x667788,
    robotLight: 0xaabbcc,
    robotEyes: 0x44aaff,

    // Health bars
    healthGreen: 0x44cc44,
    healthYellow: 0xcccc44,
    healthRed: 0xcc4444,
    healthBg: 0x333333,

    // Damage effects
    damageRed: 0xff4444,
    slashWhite: 0xffffff,
};

export class GameScene extends Phaser.Scene {
    private hero!: Phaser.GameObjects.Container;
    private heroPosition: Position = { x: 0, y: 0 };
    private heroDirection: HeroDirection = 'east';
    private initialState!: InitialState;

    private gridSize: { width: number; height: number } = { width: 5, height: 5 };
    private cellSize: number = 80; // Bigger tiles
    private gridOffset: Position = { x: 0, y: 0 };

    private level!: Level;
    private collectibles: Map<string, Phaser.GameObjects.Container> = new Map();
    private collectedIds: Set<string> = new Set();
    private isExecuting: boolean = false;
    private onComplete: (success: boolean, message: string) => void = () => { };

    // Combat state
    private heroHealth: number = 100;
    private heroMaxHealth: number = 100;
    private heroDead: boolean = false;
    private heroHealthBar!: Phaser.GameObjects.Container;
    private enemies: Map<string, { sprite: Phaser.GameObjects.Container; health: number; maxHealth: number; damage: number; position: Position }> = new Map();
    private defeatedEnemies: Set<string> = new Set();

    constructor() {
        super({ key: 'GameScene' });
    }

    init(data?: SceneInitData): void {
        if (!data?.level) return;

        this.level = data.level;
        this.onComplete = data.onComplete || (() => { });
        this.gridSize = { width: data.level.gridWidth, height: data.level.gridHeight };
        this.heroPosition = { ...data.level.startPosition };
        this.heroDirection = this.directionFromType(data.level.startDirection);

        this.initialState = {
            heroPosition: { ...data.level.startPosition },
            heroDirection: this.directionFromType(data.level.startDirection),
            collectibleIds: data.level.collectibles.map(c => c.id),
        };

        this.collectibles.clear();
        this.collectedIds.clear();
        this.isExecuting = false;

        // Reset combat state
        this.heroHealth = 100;
        this.heroMaxHealth = 100;
        this.heroDead = false;
        this.enemies.clear();
        this.defeatedEnemies.clear();
    }

    private directionFromType(dir: string): HeroDirection {
        const mapping: Record<string, HeroDirection> = {
            'up': 'north', 'down': 'south', 'left': 'west', 'right': 'east',
        };
        return mapping[dir] || 'east';
    }

    create(): void {
        if (!this.level) return;
        this.calculateLayout();

        // Draw layers in order (back to front)
        this.drawDungeonBackground();  // Floor texture fills ENTIRE canvas
        this.drawGoal();
        this.drawCollectibles();
        this.drawEnemies();  // Draw enemies before hero
        this.createHero();
        this.createHeroHealthBar();  // Health bar UI
    }


    update(): void {
        if (this.hero && this.heroHealthBar) {
            const { x, y } = this.hero;
            this.heroHealthBar.setPosition(x, y - this.cellSize * 0.55);
        }
    }

    private calculateLayout(): void {
        // Make tiles fill the entire canvas with minimal margin
        const maxWidth = this.scale.width;
        const maxHeight = this.scale.height;

        // Minimal margin - floor fills almost entire canvas
        const margin = 20;
        const availableWidth = maxWidth - margin * 2;
        const availableHeight = maxHeight - margin * 2;

        const cellByWidth = Math.floor(availableWidth / this.gridSize.width);
        const cellByHeight = Math.floor(availableHeight / this.gridSize.height);
        this.cellSize = Math.min(cellByWidth, cellByHeight, 120); // Even bigger cells

        const totalWidth = this.gridSize.width * this.cellSize;
        const totalHeight = this.gridSize.height * this.cellSize;
        this.gridOffset = {
            x: (this.scale.width - totalWidth) / 2,
            y: (this.scale.height - totalHeight) / 2,
        };
    }


    private drawDungeonBackground(): void {
        // Draw lush forest terrain across ENTIRE canvas
        const graphics = this.add.graphics();
        const width = this.scale.width;
        const height = this.scale.height;

        // Fill entire canvas with grass base color
        graphics.fillStyle(THEME.grassBase, 1);
        graphics.fillRect(0, 0, width, height);

        // Add natural grass texture across entire canvas
        const tileSize = 60; // Smaller tiles for more natural look
        const random = (x: number, y: number, offset: number = 0) => {
            const n = Math.sin(x * 12.9898 + y * 78.233 + offset + 54321) * 43758.5453;
            return n - Math.floor(n);
        };

        for (let ty = 0; ty < Math.ceil(height / tileSize); ty++) {
            for (let tx = 0; tx < Math.ceil(width / tileSize); tx++) {
                const px = tx * tileSize;
                const py = ty * tileSize;

                // Natural grass color variation
                if (random(tx, ty, 0) > 0.6) {
                    graphics.fillStyle(THEME.grassLight, 0.25);
                    graphics.fillRect(px, py, tileSize, tileSize);
                } else if (random(tx, ty, 1) > 0.7) {
                    graphics.fillStyle(THEME.grassDark, 0.2);
                    graphics.fillRect(px, py, tileSize, tileSize);
                }

                // Small grass blade details
                if (random(tx, ty, 2) > 0.5) {
                    graphics.fillStyle(THEME.grassHighlight, 0.15);
                    const bladeX = px + random(tx, ty, 10) * tileSize;
                    const bladeY = py + random(tx, ty, 11) * tileSize;
                    graphics.fillTriangle(
                        bladeX, bladeY,
                        bladeX - 2, bladeY + 6,
                        bladeX + 2, bladeY + 6
                    );
                }

                // Occasional small clover patches
                if (random(tx, ty, 3) > 0.88) {
                    graphics.fillStyle(THEME.grassHighlight, 0.3);
                    const cloverX = px + random(tx, ty, 20) * tileSize;
                    const cloverY = py + random(tx, ty, 21) * tileSize;
                    graphics.fillCircle(cloverX, cloverY, 3);
                    graphics.fillCircle(cloverX + 3, cloverY - 2, 3);
                    graphics.fillCircle(cloverX + 3, cloverY + 2, 3);
                }

                // Small flowers scattered
                if (random(tx, ty, 4) > 0.92) {
                    const flowerX = px + random(tx, ty, 30) * tileSize;
                    const flowerY = py + random(tx, ty, 31) * tileSize;
                    const flowerColor = random(tx, ty, 32) > 0.5 ? THEME.flowerPink : THEME.flowerBlue;
                    graphics.fillStyle(flowerColor, 0.8);
                    graphics.fillCircle(flowerX, flowerY, 3);
                    graphics.fillStyle(0xffff88, 0.9);
                    graphics.fillCircle(flowerX, flowerY, 1.5);
                }
            }
        }

        // Draw decorative trees around the edges
        this.drawForestDecorations();

        // Add soft outdoor lighting (subtle gradient from top)
        const lighting = this.add.graphics();
        for (let i = 0; i < 30; i++) {
            const alpha = 0.008 * (30 - i) / 30;
            lighting.fillStyle(0xffffee, alpha);
            lighting.fillRect(0, i, width, 1);
        }
    }

    private drawFloorTiles(): void {
        // Floor is already drawn by drawDungeonBackground across entire canvas
        // This function is no longer needed for visual purposes
        // Grid logic is handled separately in calculateLayout
    }


    // Legacy method - no longer used with forest theme
    private drawSeamlessTile(
        graphics: Phaser.GameObjects.Graphics,
        px: number, py: number,
        gridX: number, gridY: number,
        random: (x: number, y: number, offset?: number) => number
    ): void {
        const size = this.cellSize;
        graphics.fillStyle(THEME.grassBase, 1);
        graphics.fillRect(px, py, size, size);
    }


    private drawForestDecorations(): void {
        const width = this.scale.width;
        const height = this.scale.height;
        const floorLeft = this.gridOffset.x;
        const floorRight = this.gridOffset.x + this.gridSize.width * this.cellSize;
        const floorTop = this.gridOffset.y;
        const floorBottom = this.gridOffset.y + this.gridSize.height * this.cellSize;

        // Draw trees around the edges (outside play area)
        const margin = 40;

        // Top edge trees
        if (floorTop > 60) {
            for (let i = 0; i < 5; i++) {
                const x = floorLeft + (floorRight - floorLeft) * (0.1 + i * 0.2);
                const y = floorTop - margin;
                if (i % 2 === 0) {
                    this.drawPineTree(x, y, 0.8 + Math.random() * 0.4);
                } else {
                    this.drawDeciduousTree(x, y, 0.7 + Math.random() * 0.3);
                }
            }
        }

        // Bottom edge decorations (bushes and flowers)
        if (height - floorBottom > 40) {
            for (let i = 0; i < 4; i++) {
                const x = floorLeft + (floorRight - floorLeft) * (0.15 + i * 0.25);
                this.drawBush(x, floorBottom + 25);
            }
        }

        // Left edge trees
        if (floorLeft > 60) {
            for (let i = 0; i < 3; i++) {
                const x = floorLeft - margin - 10;
                const y = floorTop + (floorBottom - floorTop) * (0.2 + i * 0.3);
                this.drawPineTree(x, y, 0.9 + Math.random() * 0.3);
            }
        }

        // Right edge trees
        if (width - floorRight > 60) {
            for (let i = 0; i < 3; i++) {
                const x = floorRight + margin + 10;
                const y = floorTop + (floorBottom - floorTop) * (0.2 + i * 0.3);
                this.drawDeciduousTree(x, y, 0.8 + Math.random() * 0.3);
            }
        }

        // Corner decorations (rocks and mushrooms)
        this.drawRocks(floorLeft - 25, floorTop - 15, 0.6);
        this.drawRocks(floorRight + 20, floorBottom + 10, 0.5);
        this.drawMushroom(floorLeft + 15, floorBottom + 20);
        this.drawMushroom(floorRight - 15, floorTop - 25);
    }

    private drawPineTree(x: number, y: number, scale: number = 1): void {
        const container = this.add.container(x, y);
        const graphics = this.add.graphics();
        const s = scale;

        // Tree trunk
        graphics.fillStyle(THEME.trunkBrown, 1);
        graphics.fillRect(-6 * s, 0, 12 * s, 35 * s);
        graphics.fillStyle(THEME.trunkDark, 0.5);
        graphics.fillRect(-6 * s, 0, 4 * s, 35 * s);

        // Pine layers (bottom to top)
        const layers = [
            { y: -5, w: 40, h: 25 },
            { y: -25, w: 32, h: 22 },
            { y: -42, w: 24, h: 20 },
            { y: -56, w: 16, h: 16 },
        ];

        for (const layer of layers) {
            // Shadow layer
            graphics.fillStyle(THEME.pineDark, 1);
            graphics.beginPath();
            graphics.moveTo(0, (layer.y - layer.h) * s);
            graphics.lineTo((layer.w / 2 + 3) * s, layer.y * s);
            graphics.lineTo((-layer.w / 2 - 3) * s, layer.y * s);
            graphics.closePath();
            graphics.fill();

            // Main foliage
            graphics.fillStyle(THEME.pineGreen, 1);
            graphics.beginPath();
            graphics.moveTo(0, (layer.y - layer.h) * s);
            graphics.lineTo((layer.w / 2) * s, layer.y * s);
            graphics.lineTo((-layer.w / 2) * s, layer.y * s);
            graphics.closePath();
            graphics.fill();

            // Highlight
            graphics.fillStyle(THEME.pineLight, 0.6);
            graphics.beginPath();
            graphics.moveTo(-2 * s, (layer.y - layer.h + 2) * s);
            graphics.lineTo((-layer.w / 4) * s, (layer.y - 3) * s);
            graphics.lineTo((-layer.w / 2 + 3) * s, layer.y * s);
            graphics.closePath();
            graphics.fill();
        }

        container.add(graphics);
    }

    private drawDeciduousTree(x: number, y: number, scale: number = 1): void {
        const container = this.add.container(x, y);
        const graphics = this.add.graphics();
        const s = scale;

        // Tree trunk
        graphics.fillStyle(THEME.trunkBrown, 1);
        graphics.fillRect(-5 * s, 5 * s, 10 * s, 30 * s);
        graphics.fillStyle(THEME.trunkDark, 0.4);
        graphics.fillRect(-5 * s, 5 * s, 3 * s, 30 * s);

        // Leafy crown (multiple circles)
        const leafPositions = [
            { x: 0, y: -30, r: 30 },
            { x: -20, y: -20, r: 22 },
            { x: 20, y: -20, r: 22 },
            { x: -12, y: -40, r: 18 },
            { x: 12, y: -40, r: 18 },
            { x: 0, y: -50, r: 15 },
        ];

        // Shadow circles
        graphics.fillStyle(THEME.grassDark, 0.8);
        for (const leaf of leafPositions) {
            graphics.fillCircle((leaf.x + 3) * s, (leaf.y + 3) * s, leaf.r * s);
        }

        // Main leaf circles
        graphics.fillStyle(THEME.leafGreen, 1);
        for (const leaf of leafPositions) {
            graphics.fillCircle(leaf.x * s, leaf.y * s, leaf.r * s);
        }

        // Highlight circles
        graphics.fillStyle(THEME.leafLight, 0.6);
        for (const leaf of leafPositions) {
            graphics.fillCircle((leaf.x - 5) * s, (leaf.y - 5) * s, (leaf.r * 0.5) * s);
        }

        container.add(graphics);
    }

    private drawBush(x: number, y: number): void {
        const graphics = this.add.graphics();

        // Bush shadow
        graphics.fillStyle(THEME.grassDark, 0.5);
        graphics.fillEllipse(x + 3, y + 5, 28, 12);

        // Bush body (overlapping circles)
        graphics.fillStyle(THEME.leafGreen, 1);
        graphics.fillCircle(x - 8, y, 12);
        graphics.fillCircle(x + 8, y, 12);
        graphics.fillCircle(x, y - 5, 14);

        // Highlights
        graphics.fillStyle(THEME.leafLight, 0.5);
        graphics.fillCircle(x - 5, y - 5, 5);
        graphics.fillCircle(x + 3, y - 8, 4);

        // Small flowers on bush
        graphics.fillStyle(THEME.flowerBlue, 0.9);
        graphics.fillCircle(x - 10, y - 3, 3);
        graphics.fillCircle(x + 12, y + 2, 2.5);
    }

    private drawRocks(x: number, y: number, scale: number = 1): void {
        const graphics = this.add.graphics();
        const s = scale;

        // Large rock
        graphics.fillStyle(THEME.rockDark, 1);
        graphics.fillEllipse(x, y + 5 * s, 25 * s, 15 * s);
        graphics.fillStyle(THEME.rockBase, 1);
        graphics.fillEllipse(x, y, 22 * s, 14 * s);
        graphics.fillStyle(THEME.rockLight, 0.5);
        graphics.fillEllipse(x - 5 * s, y - 4 * s, 8 * s, 5 * s);

        // Small rock
        graphics.fillStyle(THEME.rockDark, 1);
        graphics.fillEllipse(x + 18 * s, y + 8 * s, 12 * s, 8 * s);
        graphics.fillStyle(THEME.rockBase, 1);
        graphics.fillEllipse(x + 18 * s, y + 5 * s, 10 * s, 7 * s);

        // Moss detail
        graphics.fillStyle(THEME.rockMoss, 0.7);
        graphics.fillCircle(x - 8 * s, y + 3 * s, 4 * s);
        graphics.fillCircle(x + 5 * s, y + 5 * s, 3 * s);
    }

    private drawMushroom(x: number, y: number): void {
        const graphics = this.add.graphics();

        // Stem
        graphics.fillStyle(THEME.mushroomCap, 1);
        graphics.fillRect(x - 4, y, 8, 12);

        // Cap shadow
        graphics.fillStyle(THEME.mushroomRed, 0.7);
        graphics.fillEllipse(x, y + 3, 18, 8);

        // Cap
        graphics.fillStyle(THEME.mushroomRed, 1);
        graphics.fillEllipse(x, y, 16, 10);

        // White spots
        graphics.fillStyle(THEME.mushroomCap, 0.9);
        graphics.fillCircle(x - 4, y - 2, 2.5);
        graphics.fillCircle(x + 3, y + 1, 2);
        graphics.fillCircle(x + 5, y - 3, 1.5);
    }

    private drawGoal(): void {
        const goalPositions: Position[] = [];

        for (let y = 0; y < this.gridSize.height; y++) {
            for (let x = 0; x < this.gridSize.width; x++) {
                if (this.level.grid[y]?.[x]?.type === 'goal') {
                    goalPositions.push({ x, y });
                }
            }
        }

        for (const goal of this.level.goals) {
            if (goal.type === 'reach_position' && goal.target) {
                goalPositions.push(goal.target);
            }
        }

        for (const pos of goalPositions) {
            this.createGoalMarker(pos.x, pos.y);
        }
    }

    private createGoalMarker(gridX: number, gridY: number): void {
        const { px, py } = this.gridToScreen(gridX, gridY);
        const container = this.add.container(px, py);
        const size = this.cellSize * 0.35;

        // Red glow
        const glow = this.add.circle(0, 0, size * 1.5, THEME.goalGlow, 0.25);
        container.add(glow);

        // X marker
        const marker = this.add.graphics();
        marker.lineStyle(5, THEME.goalRed, 1);
        marker.lineBetween(-size * 0.5, -size * 0.5, size * 0.5, size * 0.5);
        marker.lineBetween(-size * 0.5, size * 0.5, size * 0.5, -size * 0.5);

        marker.fillStyle(THEME.goalGlow, 1);
        marker.fillCircle(0, 0, 5);
        container.add(marker);

        // Pulse animation
        this.tweens.add({
            targets: glow,
            alpha: { from: 0.25, to: 0.5 },
            scale: { from: 1, to: 1.3 },
            duration: 800,
            yoyo: true,
            repeat: -1,
        });
    }

    private drawCollectibles(): void {
        // Draw walls/obstacles first
        for (let y = 0; y < this.gridSize.height; y++) {
            for (let x = 0; x < this.gridSize.width; x++) {
                if (this.level.grid[y]?.[x]?.type === 'wall') {
                    this.createRockObstacle(x, y);
                }
            }
        }

        // Draw gems
        for (const collectible of this.level.collectibles) {
            if (this.collectedIds.has(collectible.id)) continue;
            if (this.collectibles.has(collectible.id)) continue;
            this.createGem(collectible.id, collectible.position.x, collectible.position.y);
        }
    }

    private createRockObstacle(gridX: number, gridY: number): void {
        const { px, py } = this.gridToScreen(gridX, gridY);
        const container = this.add.container(px, py);
        const s = this.cellSize / 80; // Scale factor

        // Rocky cave entrance with skull decorations
        const graphics = this.add.graphics();

        // Shadow/depth behind rocks
        graphics.fillStyle(0x222222, 0.6);
        graphics.fillEllipse(0, 5 * s, 55 * s, 30 * s);

        // Large back rock
        graphics.fillStyle(THEME.rockDark, 1);
        graphics.fillEllipse(0, -5 * s, 50 * s, 35 * s);

        // Main rock body
        graphics.fillStyle(THEME.rockBase, 1);
        graphics.fillEllipse(0, -8 * s, 45 * s, 32 * s);

        // Rock highlight
        graphics.fillStyle(THEME.rockLight, 0.6);
        graphics.fillEllipse(-10 * s, -15 * s, 18 * s, 12 * s);

        // Cave entrance (dark opening)
        graphics.fillStyle(0x111111, 1);
        graphics.fillEllipse(0, 0, 20 * s, 18 * s);

        // Moss on rocks
        graphics.fillStyle(THEME.rockMoss, 0.7);
        graphics.fillCircle(-18 * s, -5 * s, 6 * s);
        graphics.fillCircle(15 * s, 2 * s, 5 * s);
        graphics.fillCircle(-8 * s, 10 * s, 4 * s);

        // Small skull decoration
        graphics.fillStyle(THEME.skullBone, 1);
        graphics.fillCircle(0, -22 * s, 8 * s);
        graphics.fillRect(-5 * s, -22 * s, 10 * s, 8 * s);

        // Skull eyes
        graphics.fillStyle(0x000000, 1);
        graphics.fillCircle(-3 * s, -22 * s, 2 * s);
        graphics.fillCircle(3 * s, -22 * s, 2 * s);

        // Skull nose
        graphics.fillStyle(0x000000, 0.8);
        graphics.beginPath();
        graphics.moveTo(0, -19 * s);
        graphics.lineTo(-1.5 * s, -16 * s);
        graphics.lineTo(1.5 * s, -16 * s);
        graphics.closePath();
        graphics.fill();

        // Vines hanging
        graphics.lineStyle(2 * s, THEME.leafGreen, 0.8);
        graphics.lineBetween(-20 * s, -20 * s, -22 * s, 5 * s);
        graphics.lineBetween(18 * s, -18 * s, 20 * s, 8 * s);

        container.add(graphics);

        // Subtle ambient animation
        this.tweens.add({
            targets: container,
            scaleX: { from: 1, to: 1.02 },
            scaleY: { from: 1, to: 0.98 },
            duration: 2000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut',
        });
    }

    private createGem(id: string, gridX: number, gridY: number): void {
        const { px, py } = this.gridToScreen(gridX, gridY);
        const container = this.add.container(px, py);
        const size = this.cellSize * 0.18;

        // Glow
        const glow = this.add.circle(0, 0, size * 2.5, THEME.gemGold, 0.2);
        container.add(glow);

        // Gem (diamond shape)
        const gem = this.add.graphics();

        // Shadow
        gem.fillStyle(0xaa7700, 0.5);
        gem.beginPath();
        gem.moveTo(2, -size);
        gem.lineTo(size + 2, 0);
        gem.lineTo(2, size);
        gem.lineTo(-size + 2, 0);
        gem.closePath();
        gem.fill();

        // Main body
        gem.fillStyle(THEME.gemGold, 1);
        gem.beginPath();
        gem.moveTo(0, -size);
        gem.lineTo(size, 0);
        gem.lineTo(0, size);
        gem.lineTo(-size, 0);
        gem.closePath();
        gem.fill();

        // Top highlight
        gem.fillStyle(THEME.gemHighlight, 0.7);
        gem.beginPath();
        gem.moveTo(0, -size);
        gem.lineTo(size * 0.5, -size * 0.3);
        gem.lineTo(0, 0);
        gem.lineTo(-size * 0.5, -size * 0.3);
        gem.closePath();
        gem.fill();

        // Sparkle
        gem.fillStyle(0xffffff, 0.9);
        gem.fillCircle(-size * 0.3, -size * 0.4, 2.5);

        container.add(gem);

        // Float animation
        this.tweens.add({
            targets: container,
            y: py - 6,
            duration: 1000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut',
        });

        // Sparkle glow
        this.tweens.add({
            targets: glow,
            alpha: { from: 0.2, to: 0.4 },
            scale: { from: 1, to: 1.2 },
            duration: 600,
            yoyo: true,
            repeat: -1,
        });

        this.collectibles.set(id, container);
    }

    private createHero(): void {
        const { px, py } = this.gridToScreen(this.heroPosition.x, this.heroPosition.y);
        this.hero = this.add.container(px, py);

        const s = this.cellSize / 80; // Scale factor

        // Shadow
        const shadow = this.add.ellipse(0, 22 * s, 30 * s, 12 * s, 0x000000, 0.3);
        this.hero.add(shadow);

        // Create human-like character sprite
        const body = this.add.graphics();

        // Cape (behind body)
        body.fillStyle(THEME.heroCapeRed, 1);
        body.beginPath();
        body.moveTo(-12 * s, -5 * s);
        body.lineTo(-16 * s, 24 * s);
        body.lineTo(0, 28 * s);
        body.lineTo(16 * s, 24 * s);
        body.lineTo(12 * s, -5 * s);
        body.closePath();
        body.fill();

        // Cape shadow
        body.fillStyle(0x991111, 0.5);
        body.beginPath();
        body.moveTo(4 * s, 0);
        body.lineTo(10 * s, 24 * s);
        body.lineTo(16 * s, 24 * s);
        body.lineTo(12 * s, -5 * s);
        body.closePath();
        body.fill();

        // Body/armor
        body.fillStyle(THEME.heroArmorBlue, 1);
        body.fillRoundedRect(-14 * s, -10 * s, 28 * s, 35 * s, 6 * s);

        // Armor dark section
        body.fillStyle(THEME.heroArmorDark, 1);
        body.fillRect(-12 * s, 10 * s, 24 * s, 15 * s);

        // Belt
        body.fillStyle(0x553322, 1);
        body.fillRect(-14 * s, 8 * s, 28 * s, 5 * s);
        body.fillStyle(0xccaa00, 1);
        body.fillCircle(0, 10 * s, 4 * s); // Buckle

        // Shoulders
        body.fillStyle(THEME.heroArmorBlue, 1);
        body.fillCircle(-14 * s, -3 * s, 6 * s);
        body.fillCircle(14 * s, -3 * s, 6 * s);

        // Head
        body.fillStyle(THEME.heroSkin, 1);
        body.fillCircle(0, -20 * s, 14 * s);

        // Hair (orange/red, flowing)
        body.fillStyle(THEME.heroHairOrange, 1);
        body.beginPath();
        body.arc(0, -20 * s, 14 * s, -2.8, -0.3, false);
        body.lineTo(16 * s, -12 * s);
        body.lineTo(14 * s, -5 * s);
        body.lineTo(8 * s, -2 * s);
        body.lineTo(-8 * s, -2 * s);
        body.lineTo(-14 * s, -5 * s);
        body.lineTo(-16 * s, -12 * s);
        body.closePath();
        body.fill();

        // Hair highlights
        body.fillStyle(0xff8844, 0.6);
        body.beginPath();
        body.arc(-4 * s, -24 * s, 6 * s, -2.5, -0.8, false);
        body.lineTo(-2 * s, -20 * s);
        body.closePath();
        body.fill();

        // Eyes
        body.fillStyle(0xffffff, 1);
        body.fillEllipse(-5 * s, -20 * s, 5 * s, 4 * s);
        body.fillEllipse(5 * s, -20 * s, 5 * s, 4 * s);

        body.fillStyle(0x3366aa, 1);
        body.fillCircle(-5 * s, -20 * s, 2.5 * s);
        body.fillCircle(5 * s, -20 * s, 2.5 * s);

        body.fillStyle(0x000000, 1);
        body.fillCircle(-5 * s, -20 * s, 1.5 * s);
        body.fillCircle(5 * s, -20 * s, 1.5 * s);

        // Eye highlights
        body.fillStyle(0xffffff, 0.8);
        body.fillCircle(-6 * s, -21 * s, 1 * s);
        body.fillCircle(4 * s, -21 * s, 1 * s);

        // Eyebrows
        body.lineStyle(2 * s, 0x994422, 1);
        body.lineBetween(-8 * s, -25 * s, -2 * s, -24 * s);
        body.lineBetween(2 * s, -24 * s, 8 * s, -25 * s);

        // Nose
        body.fillStyle(THEME.heroSkin, 1);
        body.beginPath();
        body.moveTo(0, -18 * s);
        body.lineTo(-2 * s, -13 * s);
        body.lineTo(2 * s, -13 * s);
        body.closePath();
        body.fill();

        // Mouth (slight smile)
        body.lineStyle(1.5 * s, 0xcc8877, 1);
        body.beginPath();
        body.arc(0, -12 * s, 3 * s, 0.2, 2.9, false);
        body.stroke();

        this.hero.add(body);

        // Create sword as separate animatable element
        const swordContainer = this.add.container(14 * s, 0);
        const swordGraphics = this.add.graphics();

        // Sword blade
        swordGraphics.fillStyle(THEME.heroSword, 1);
        swordGraphics.fillRect(2 * s, -35 * s, 4 * s, 30 * s);

        // Sword tip
        swordGraphics.beginPath();
        swordGraphics.moveTo(4 * s, -40 * s);
        swordGraphics.lineTo(7 * s, -35 * s);
        swordGraphics.lineTo(1 * s, -35 * s);
        swordGraphics.closePath();
        swordGraphics.fill();

        // Sword guard
        swordGraphics.fillStyle(0xccaa00, 1);
        swordGraphics.fillRect(-1 * s, -6 * s, 10 * s, 4 * s);

        // Sword handle
        swordGraphics.fillStyle(THEME.heroSwordHandle, 1);
        swordGraphics.fillRect(2 * s, -2 * s, 4 * s, 10 * s);

        swordContainer.add(swordGraphics);
        this.hero.add(swordContainer);
        this.hero.setData('swordContainer', swordContainer);

        // Idle animation
        this.tweens.add({
            targets: body,
            y: -2,
            duration: 800,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut',
        });

        this.updateHeroRotation();
    }

    private updateHeroRotation(): void {
        const angles: Record<HeroDirection, number> = {
            'east': 0, 'south': 90, 'west': 180, 'north': -90,
        };
        this.hero.setAngle(angles[this.heroDirection]);
    }

    private gridToScreen(x: number, y: number): { px: number; py: number } {
        return {
            px: this.gridOffset.x + x * this.cellSize + this.cellSize / 2,
            py: this.gridOffset.y + y * this.cellSize + this.cellSize / 2,
        };
    }

    resetGame(): void {
        this.heroPosition = { ...this.initialState.heroPosition };
        this.heroDirection = this.initialState.heroDirection;
        this.collectedIds.clear();

        // Reset collectibles
        for (const collectible of this.level.collectibles) {
            const sprite = this.collectibles.get(collectible.id);
            if (sprite) {
                sprite.destroy();
                this.collectibles.delete(collectible.id);
            }
        }
        this.drawCollectibles();

        // Reset combat state
        this.heroHealth = 100;
        this.heroMaxHealth = 100;
        this.heroDead = false;
        this.defeatedEnemies.clear();

        // Reset enemies
        for (const [, data] of this.enemies) {
            data.sprite.destroy();
        }
        this.enemies.clear();
        this.drawEnemies();

        // Update hero health bar
        if (this.heroHealthBar) {
            const fill = this.heroHealthBar.getData('healthFill') as Phaser.GameObjects.Rectangle;
            if (fill) {
                fill.width = 100;
                fill.setFillStyle(THEME.healthGreen, 1);
            }
        }

        // Reset hero visual state (in case died)
        this.hero.setAlpha(1);
        this.hero.setScale(1);

        // Reset camera fade
        this.cameras.main.resetFX();

        const { px, py } = this.gridToScreen(this.heroPosition.x, this.heroPosition.y);
        this.hero.setPosition(px, py);
        this.updateHeroRotation();
        this.isExecuting = false;
    }

    async executeCommands(commands: GameCommand[]): Promise<void> {
        if (this.isExecuting) return;
        this.resetGame();
        this.isExecuting = true;

        for (const command of commands) {
            // Check if hero is dead before each command
            if (this.heroDead || this.heroHealth <= 0) {
                this.isExecuting = false;
                return;
            }
            await this.executeCommand(command);
            await this.delay(300);
        }

        if (!this.heroDead) {
            this.isExecuting = false;
            this.checkWinCondition();
        }
    }

    private async executeCommand(command: GameCommand): Promise<void> {
        switch (command) {
            case 'move_forward': await this.moveHero(1); break;
            case 'move_backward': await this.moveHero(-1); break;
            case 'turn_left': await this.turnHero('left'); break;
            case 'turn_right': await this.turnHero('right'); break;
            case 'collect_sample': await this.collectGem(); break;
            case 'attack': await this.attackEnemy(); break;
        }
    }

    private async moveHero(steps: number): Promise<boolean> {
        const newPos = this.getPositionInDirection(this.heroPosition, this.heroDirection, steps);

        if (!this.isValidPosition(newPos)) {
            const origX = this.hero.x;
            this.tweens.add({ targets: this.hero, x: origX + 8, duration: 50, yoyo: true, repeat: 3 });
            this.cameras.main.shake(100, 0.01);
            return false;
        }

        this.heroPosition = newPos;
        const { px, py } = this.gridToScreen(newPos.x, newPos.y);

        await new Promise<void>((resolve) => {
            this.tweens.add({
                targets: this.hero, x: px, y: py, duration: 180, ease: 'Quad.easeOut',
                onComplete: () => resolve(),
            });
        });

        // Check for adjacent enemies after moving
        await this.checkAdjacentEnemies();

        return true;
    }

    private async turnHero(direction: 'left' | 'right'): Promise<void> {
        const turns: Record<HeroDirection, { left: HeroDirection; right: HeroDirection }> = {
            'north': { left: 'west', right: 'east' },
            'east': { left: 'north', right: 'south' },
            'south': { left: 'east', right: 'west' },
            'west': { left: 'south', right: 'north' },
        };

        this.heroDirection = turns[this.heroDirection][direction];
        const targetAngle = { 'east': 0, 'south': 90, 'west': 180, 'north': -90 }[this.heroDirection];

        await new Promise<void>((resolve) => {
            this.tweens.add({
                targets: this.hero, angle: targetAngle, duration: 120, ease: 'Quad.easeOut',
                onComplete: () => resolve(),
            });
        });
    }

    private async collectGem(): Promise<boolean> {
        const collectible = this.level.collectibles.find(
            (c) => c.position.x === this.heroPosition.x && c.position.y === this.heroPosition.y && !this.collectedIds.has(c.id)
        );

        if (!collectible) return false;

        this.collectedIds.add(collectible.id);
        const sprite = this.collectibles.get(collectible.id);

        if (sprite) {
            const { px, py } = this.gridToScreen(this.heroPosition.x, this.heroPosition.y);

            for (let i = 0; i < 8; i++) {
                const angle = (i / 8) * Math.PI * 2;
                const particle = this.add.circle(px, py, 4, THEME.gemGold, 1);
                this.tweens.add({
                    targets: particle, x: px + Math.cos(angle) * 40, y: py + Math.sin(angle) * 40,
                    alpha: 0, scale: 0, duration: 350, onComplete: () => particle.destroy(),
                });
            }

            await new Promise<void>((resolve) => {
                this.tweens.add({
                    targets: sprite, y: py - 25, scale: 0, alpha: 0, duration: 250, ease: 'Back.easeIn',
                    onComplete: () => { sprite.destroy(); this.collectibles.delete(collectible.id); resolve(); },
                });
            });
        }

        return true;
    }

    private checkWinCondition(): void {
        let allGoalsMet = true;
        const messages: string[] = [];

        for (const goal of this.level.goals) {
            let goalMet = false;

            switch (goal.type) {
                case 'reach_position':
                    if (goal.target) goalMet = this.heroPosition.x === goal.target.x && this.heroPosition.y === goal.target.y;
                    break;
                case 'collect_all':
                    goalMet = this.collectedIds.size === this.level.collectibles.length;
                    break;
                case 'collect_type':
                    const collected = this.level.collectibles.filter(c => c.type === goal.collectibleType && this.collectedIds.has(c.id));
                    goalMet = collected.length >= (goal.count || 1);
                    break;
                case 'defeat_enemies':
                    // Check if all enemies are defeated
                    goalMet = this.defeatedEnemies.size === this.level.enemies.length;
                    break;
            }

            if (!goalMet) { allGoalsMet = false; messages.push(`❌ ${goal.description}`); }
            else { messages.push(`✅ ${goal.description}`); }
        }

        if (allGoalsMet) {
            this.cameras.main.flash(400, 255, 215, 0);
            this.onComplete(true, '🎉 Quest Complete!');
        } else {
            this.onComplete(false, `Quest incomplete:\n${messages.join('\n')}`);
        }
    }

    private isValidPosition(pos: Position): boolean {
        if (pos.x < 0 || pos.x >= this.gridSize.width) return false;
        if (pos.y < 0 || pos.y >= this.gridSize.height) return false;
        if (this.level.grid[pos.y]?.[pos.x]?.type === 'wall') return false;

        // Check if enemy is blocking this position
        for (const [, data] of this.enemies) {
            if (data.position.x === pos.x && data.position.y === pos.y && data.health > 0) {
                return false; // Enemy blocks movement
            }
        }

        return true;
    }

    private getPositionInDirection(pos: Position, dir: HeroDirection, steps: number): Position {
        const deltas: Record<HeroDirection, Position> = {
            'north': { x: 0, y: -1 }, 'east': { x: 1, y: 0 }, 'south': { x: 0, y: 1 }, 'west': { x: -1, y: 0 },
        };
        const d = deltas[dir];
        return { x: pos.x + d.x * steps, y: pos.y + d.y * steps };
    }

    private delay(ms: number): Promise<void> {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }

    resetScene(): void {
        this.scene.restart();
    }

    // ============================================
    // COMBAT METHODS
    // ============================================

    private drawEnemies(): void {
        for (const enemy of this.level.enemies) {
            this.createEnemy(enemy);
        }
    }

    private createEnemy(enemy: { id: string; type: string; position: Position; health: number; damage: number }): void {
        const { px, py } = this.gridToScreen(enemy.position.x, enemy.position.y);
        const container = this.add.container(px, py);
        const s = this.cellSize / 80;

        const graphics = this.add.graphics();

        // Draw based on enemy type
        switch (enemy.type) {
            case 'skeleton':
                this.drawSkeleton(graphics, s);
                break;
            case 'ogre':
                this.drawOgre(graphics, s);
                break;
            case 'robot':
                this.drawRobot(graphics, s);
                break;
            default:
                this.drawSkeleton(graphics, s);
        }

        container.add(graphics);

        // Add health bar above enemy
        const healthBar = this.createEnemyHealthBar(s, enemy.health);
        healthBar.setPosition(0, -35 * s);
        container.add(healthBar);

        // Store health bar reference on sprite container for easy access during attacks
        const healthFill = healthBar.getData('healthFill') as Phaser.GameObjects.Rectangle;
        container.setData('healthFill', healthFill);

        // Store enemy data
        this.enemies.set(enemy.id, {
            sprite: container,
            health: enemy.health,
            maxHealth: enemy.health,
            damage: enemy.damage,
            position: { ...enemy.position }
        });

        // Idle animation
        this.tweens.add({
            targets: graphics,
            y: -3,
            duration: 600 + Math.random() * 200,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut',
        });
    }

    private drawSkeleton(graphics: Phaser.GameObjects.Graphics, s: number): void {
        // Skull
        graphics.fillStyle(THEME.skeletonBone, 1);
        graphics.fillCircle(0, -15 * s, 12 * s);

        // Eye sockets
        graphics.fillStyle(0x000000, 1);
        graphics.fillCircle(-4 * s, -16 * s, 3 * s);
        graphics.fillCircle(4 * s, -16 * s, 3 * s);

        // Glowing eyes
        graphics.fillStyle(THEME.skeletonEyes, 1);
        graphics.fillCircle(-4 * s, -16 * s, 1.5 * s);
        graphics.fillCircle(4 * s, -16 * s, 1.5 * s);

        // Jaw
        graphics.fillStyle(THEME.skeletonDark, 1);
        graphics.fillRect(-6 * s, -8 * s, 12 * s, 4 * s);

        // Ribcage
        graphics.fillStyle(THEME.skeletonBone, 1);
        for (let i = 0; i < 4; i++) {
            graphics.fillRect(-10 * s, (i * 5) * s, 20 * s, 3 * s);
        }

        // Spine
        graphics.fillRect(-2 * s, -3 * s, 4 * s, 25 * s);
    }

    private drawOgre(graphics: Phaser.GameObjects.Graphics, s: number): void {
        // Body
        graphics.fillStyle(THEME.ogreGreen, 1);
        graphics.fillRoundedRect(-18 * s, -5 * s, 36 * s, 30 * s, 8 * s);

        // Head
        graphics.fillCircle(0, -18 * s, 14 * s);

        // Dark markings
        graphics.fillStyle(THEME.ogreDark, 0.5);
        graphics.fillCircle(-5 * s, -15 * s, 6 * s);
        graphics.fillCircle(5 * s, -15 * s, 6 * s);

        // Eyes
        graphics.fillStyle(0xffff00, 1);
        graphics.fillCircle(-5 * s, -20 * s, 4 * s);
        graphics.fillCircle(5 * s, -20 * s, 4 * s);

        graphics.fillStyle(0x000000, 1);
        graphics.fillCircle(-5 * s, -20 * s, 2 * s);
        graphics.fillCircle(5 * s, -20 * s, 2 * s);

        // Teeth
        graphics.fillStyle(THEME.ogreTeeth, 1);
        graphics.beginPath();
        graphics.moveTo(-6 * s, -8 * s);
        graphics.lineTo(-4 * s, -4 * s);
        graphics.lineTo(-2 * s, -8 * s);
        graphics.fill();
        graphics.beginPath();
        graphics.moveTo(2 * s, -8 * s);
        graphics.lineTo(4 * s, -4 * s);
        graphics.lineTo(6 * s, -8 * s);
        graphics.fill();
    }

    private drawRobot(graphics: Phaser.GameObjects.Graphics, s: number): void {
        // Body
        graphics.fillStyle(THEME.robotGray, 1);
        graphics.fillRect(-14 * s, -5 * s, 28 * s, 28 * s);

        // Darker panels
        graphics.fillStyle(THEME.robotDark, 1);
        graphics.fillRect(-12 * s, 3 * s, 10 * s, 8 * s);
        graphics.fillRect(2 * s, 3 * s, 10 * s, 8 * s);

        // Head
        graphics.fillStyle(THEME.robotLight, 1);
        graphics.fillRect(-10 * s, -25 * s, 20 * s, 18 * s);

        // Antenna
        graphics.fillStyle(THEME.robotGray, 1);
        graphics.fillRect(-2 * s, -32 * s, 4 * s, 8 * s);
        graphics.fillStyle(THEME.robotEyes, 1);
        graphics.fillCircle(0, -34 * s, 3 * s);

        // Eyes
        graphics.fillStyle(THEME.robotEyes, 1);
        graphics.fillRect(-7 * s, -20 * s, 5 * s, 4 * s);
        graphics.fillRect(2 * s, -20 * s, 5 * s, 4 * s);
    }

    private createEnemyHealthBar(s: number, health: number): Phaser.GameObjects.Container {
        const container = this.add.container(0, 0);
        const width = 30 * s;
        const height = 5 * s;

        // Background
        const bg = this.add.rectangle(0, 0, width, height, THEME.healthBg, 1);
        container.add(bg);

        // Health fill
        const fill = this.add.rectangle(-width / 2, 0, width, height - 2, THEME.healthRed, 1);
        fill.setOrigin(0, 0.5);
        fill.setData('maxWidth', width);
        container.add(fill);
        container.setData('healthFill', fill);

        return container;
    }

    private createHeroHealthBar(): void {
        // Only show health bar on levels with enemies
        if (!this.level.enemies || this.level.enemies.length === 0) return;

        const s = this.cellSize / 40;
        const container = this.add.container(0, 0);
        container.setDepth(900);

        // Background bar
        const width = 30 * s;
        const height = 5 * s;
        const bg = this.add.rectangle(0, 0, width, height, THEME.healthBg, 1);
        container.add(bg);

        // Health fill
        const fill = this.add.rectangle(-width / 2, 0, width, height - 2, THEME.healthGreen, 1);
        fill.setOrigin(0, 0.5);
        fill.setData('maxWidth', width);
        container.add(fill);
        container.setData('healthFill', fill);

        // Position above hero
        const heroPos = this.gridToScreen(this.heroPosition.x, this.heroPosition.y);
        container.setPosition(heroPos.px, heroPos.py - this.cellSize * 0.55);

        this.heroHealthBar = container;
    }

    private updateHeroHealthBar(): void {
        if (!this.heroHealthBar) return;
        const fill = this.heroHealthBar.getData('healthFill') as Phaser.GameObjects.Rectangle;
        if (!fill) return;

        const ratio = Math.max(0, this.heroHealth / this.heroMaxHealth);
        const maxWidth = fill.getData('maxWidth') as number;
        const newWidth = maxWidth * ratio;

        // Color based on health
        let color = THEME.healthGreen;
        if (ratio < 0.3) color = THEME.healthRed;
        else if (ratio < 0.6) color = THEME.healthYellow;

        // Animate width decrease
        this.tweens.add({
            targets: fill,
            width: newWidth,
            duration: 300,
            ease: 'Power2',
            onUpdate: () => fill.setFillStyle(color, 1),
        });

        // Pulse effect to make damage more visible
        this.tweens.add({
            targets: this.heroHealthBar,
            scaleX: 1.1,
            scaleY: 1.1,
            duration: 100,
            yoyo: true,
            ease: 'Power2',
        });
    }

    private getEnemyAhead(): { id: string; data: { sprite: Phaser.GameObjects.Container; health: number; maxHealth: number; damage: number; position: Position } } | null {
        const aheadPos = this.getPositionInDirection(this.heroPosition, this.heroDirection, 1);

        for (const [id, data] of this.enemies) {
            if (data.position.x === aheadPos.x && data.position.y === aheadPos.y && data.health > 0) {
                return { id, data };
            }
        }
        return null;
    }

    private getAdjacentEnemies(): Array<{ id: string; data: { sprite: Phaser.GameObjects.Container; health: number; maxHealth: number; damage: number; position: Position } }> {
        const adjacentEnemies: Array<{ id: string; data: { sprite: Phaser.GameObjects.Container; health: number; maxHealth: number; damage: number; position: Position } }> = [];
        const directions: HeroDirection[] = ['north', 'east', 'south', 'west'];

        for (const dir of directions) {
            const adjacentPos = this.getPositionInDirection(this.heroPosition, dir, 1);
            for (const [id, data] of this.enemies) {
                if (data.position.x === adjacentPos.x && data.position.y === adjacentPos.y && data.health > 0) {
                    adjacentEnemies.push({ id, data });
                }
            }
        }

        return adjacentEnemies;
    }

    private async checkAdjacentEnemies(): Promise<void> {
        // Keep attacking until hero dies or no adjacent enemies
        while (this.heroHealth > 0 && !this.heroDead) {
            const adjacentEnemies = this.getAdjacentEnemies();

            if (adjacentEnemies.length === 0) {
                break; // No enemies nearby, stop attacking
            }

            // All adjacent enemies attack in sequence
            for (const enemy of adjacentEnemies) {
                if (this.heroHealth <= 0) break; // Stop if hero is dead
                await this.performEnemyAttack(enemy.id, enemy.data);
                await this.delay(300);
            }

            // If hero is still alive and enemies are still adjacent, continue loop
            if (this.heroHealth <= 0) {
                break; // Hero died, exit loop
            }
        }
    }

    private async performEnemyAttack(enemyId: string, enemyData: { sprite: Phaser.GameObjects.Container; health: number; maxHealth: number; damage: number; position: Position }): Promise<void> {
        const enemyScreen = this.gridToScreen(enemyData.position.x, enemyData.position.y);
        const heroScreen = this.gridToScreen(this.heroPosition.x, this.heroPosition.y);
        const originalX = enemyData.sprite.x;
        const originalY = enemyData.sprite.y;

        // Calculate lunge direction (toward hero)
        const lungeX = (heroScreen.px - enemyScreen.px) * 0.3;
        const lungeY = (heroScreen.py - enemyScreen.py) * 0.3;

        // Enemy lunges toward hero
        await new Promise<void>((resolve) => {
            this.tweens.add({
                targets: enemyData.sprite,
                x: originalX + lungeX,
                y: originalY + lungeY,
                duration: 100,
                ease: 'Power2',
                onComplete: () => resolve()
            });
        });

        // Show impact effect
        await this.showSlashEffect(heroScreen.px, heroScreen.py);

        // Enemy returns to position
        this.tweens.add({
            targets: enemyData.sprite,
            x: originalX,
            y: originalY,
            duration: 100,
            ease: 'Power2',
        });

        // Deal damage to hero
        this.heroHealth -= enemyData.damage;
        this.updateHeroHealthBar();
        this.showDamageNumber(heroScreen.px, heroScreen.py, enemyData.damage, true);

        // Shake hero on hit
        this.tweens.add({
            targets: this.hero,
            x: this.hero.x - 5,
            duration: 50,
            yoyo: true,
            repeat: 2,
        });

        // Flash screen red
        this.cameras.main.flash(200, 255, 0, 0, false);

        // Check if hero died
        if (this.heroHealth <= 0) {
            await this.delay(300);
            await this.handleHeroDeath();
        }
    }

    private async handleHeroDeath(): Promise<void> {
        this.heroDead = true;
        this.isExecuting = false;

        // Death animation
        await new Promise<void>((resolve) => {
            this.tweens.add({
                targets: this.hero,
                alpha: 0,
                scale: 0.5,
                rotation: this.hero.rotation + Math.PI,
                duration: 600,
                ease: 'Back.easeIn',
                onComplete: () => resolve()
            });
        });

        // Show game over message
        this.cameras.main.fade(400, 0, 0, 0);

        await this.delay(500);
        this.onComplete(false, '💀 Your hero has fallen! Try again.');
    }

    private async attackEnemy(): Promise<void> {
        const enemyAhead = this.getEnemyAhead();

        // Get target position
        const aheadPos = this.getPositionInDirection(this.heroPosition, this.heroDirection, 1);
        const { px, py } = this.gridToScreen(aheadPos.x, aheadPos.y);
        const heroOriginalX = this.hero.x;
        const heroOriginalY = this.hero.y;

        // Calculate lunge offset based on direction
        let lungeX = 0, lungeY = 0;
        switch (this.heroDirection) {
            case 'north': lungeY = -20; break;
            case 'south': lungeY = 20; break;
            case 'west': lungeX = -20; break;
            case 'east': lungeX = 20; break;
        }

        // Hero lunges forward
        await new Promise<void>((resolve) => {
            this.tweens.add({
                targets: this.hero,
                x: heroOriginalX + lungeX,
                y: heroOriginalY + lungeY,
                duration: 80,
                ease: 'Power2',
                onComplete: () => resolve()
            });
        });

        // Show sword swing and slash effect simultaneously
        await Promise.all([
            this.showSwordSwing(heroOriginalX + lungeX, heroOriginalY + lungeY),
            this.showSlashEffect(px, py)
        ]);

        // Hero returns to original position
        this.tweens.add({
            targets: this.hero,
            x: heroOriginalX,
            y: heroOriginalY,
            duration: 80,
            ease: 'Power2',
        });

        if (!enemyAhead) {
            // No enemy to attack - just swing animation
            return;
        }

        const { id, data } = enemyAhead;
        const attackDamage = 20; // Hero's attack damage

        // Deal damage to enemy
        data.health -= attackDamage;
        this.showDamageNumber(px, py, attackDamage);

        // Update enemy health bar
        const healthFill = data.sprite.getData('healthFill') as Phaser.GameObjects.Rectangle;
        if (healthFill) {
            const ratio = Math.max(0, data.health / data.maxHealth);
            const maxWidth = healthFill.getData('maxWidth') as number;
            this.tweens.add({
                targets: healthFill,
                width: maxWidth * ratio,
                duration: 200,
            });
        }

        // Shake enemy on hit
        this.tweens.add({
            targets: data.sprite,
            x: data.sprite.x + 5,
            duration: 50,
            yoyo: true,
            repeat: 2,
        });

        await this.delay(200);

        // Check if enemy defeated
        if (data.health <= 0) {
            this.defeatedEnemies.add(id);

            // Death animation
            this.tweens.add({
                targets: data.sprite,
                alpha: 0,
                scale: 0.5,
                y: data.sprite.y - 20,
                duration: 400,
                ease: 'Back.easeIn',
                onComplete: () => {
                    data.sprite.destroy();
                }
            });

            // Particles on defeat
            for (let i = 0; i < 6; i++) {
                const angle = (i / 6) * Math.PI * 2;
                const particle = this.add.circle(px, py, 5, THEME.skeletonBone, 1);
                this.tweens.add({
                    targets: particle,
                    x: px + Math.cos(angle) * 50,
                    y: py + Math.sin(angle) * 50,
                    alpha: 0,
                    scale: 0,
                    duration: 400,
                    onComplete: () => particle.destroy(),
                });
            }
        } else {
            // Enemy counterattack!
            await this.delay(100);
            this.heroHealth -= data.damage;
            this.updateHeroHealthBar();

            // Show damage to hero
            const heroScreen = this.gridToScreen(this.heroPosition.x, this.heroPosition.y);
            this.showDamageNumber(heroScreen.px, heroScreen.py, data.damage, true);

            // Shake hero on hit
            this.tweens.add({
                targets: this.hero,
                x: this.hero.x - 5,
                duration: 50,
                yoyo: true,
                repeat: 2,
            });

            // Flash screen red on low health
            if (this.heroHealth <= 30 && this.heroHealth > 0) {
                this.cameras.main.flash(200, 255, 0, 0, false);
            }
        }
    }

    private async showSlashEffect(x: number, y: number): Promise<void> {
        const slash = this.add.graphics();
        slash.setPosition(x, y);

        // Draw slash arc
        slash.lineStyle(4, THEME.slashWhite, 1);
        slash.beginPath();
        slash.arc(0, 0, 25, -0.8, 0.8, false);
        slash.stroke();

        // Inner glow
        slash.lineStyle(2, 0xffff88, 0.8);
        slash.beginPath();
        slash.arc(0, 0, 20, -0.6, 0.6, false);
        slash.stroke();

        // Animate
        await new Promise<void>((resolve) => {
            this.tweens.add({
                targets: slash,
                alpha: 0,
                scale: 1.5,
                duration: 200,
                onComplete: () => {
                    slash.destroy();
                    resolve();
                }
            });
        });
    }

    private async showSwordSwing(_heroX: number, _heroY: number): Promise<void> {
        // Get the hero's actual sword container
        const swordContainer = this.hero.getData('swordContainer') as Phaser.GameObjects.Container;
        if (!swordContainer) return;

        // Swing the sword forward and back
        const swingAngle = 1.2; // radians to swing

        await new Promise<void>((resolve) => {
            // Swing forward
            this.tweens.add({
                targets: swordContainer,
                rotation: swingAngle,
                duration: 100,
                ease: 'Power2',
                onComplete: () => {
                    // Swing back to original position
                    this.tweens.add({
                        targets: swordContainer,
                        rotation: 0,
                        duration: 150,
                        ease: 'Power1',
                        onComplete: () => resolve()
                    });
                }
            });
        });
    }

    private showDamageNumber(x: number, y: number, damage: number, isHeroDamage: boolean = false): void {
        const color = isHeroDamage ? '#ff4444' : '#ffffff';
        const text = this.add.text(x, y - 10, `-${damage}`, {
            fontSize: '18px',
            fontStyle: 'bold',
            color: color,
            stroke: '#000000',
            strokeThickness: 3,
        }).setOrigin(0.5);

        this.tweens.add({
            targets: text,
            y: y - 50,
            alpha: 0,
            duration: 800,
            ease: 'Power2',
            onComplete: () => text.destroy(),
        });
    }
}

