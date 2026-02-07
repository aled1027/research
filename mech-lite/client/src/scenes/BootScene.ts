import Phaser from 'phaser';

/**
 * Boot scene: generates all sprite textures procedurally
 * and loads any external assets.
 */
export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  preload(): void {
    // Create a loading bar
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    const progressBar = this.add.graphics();
    const progressBox = this.add.graphics();
    progressBox.fillStyle(0x222222, 0.8);
    progressBox.fillRect(width / 2 - 160, height / 2 - 15, 320, 30);

    this.load.on('progress', (value: number) => {
      progressBar.clear();
      progressBar.fillStyle(0x00ff88, 1);
      progressBar.fillRect(width / 2 - 155, height / 2 - 10, 310 * value, 20);
    });

    this.load.on('complete', () => {
      progressBar.destroy();
      progressBox.destroy();
    });

    // No external assets to load — we generate textures procedurally
    // Add a dummy load to trigger the loading flow
    this.load.image('__dummy', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==');
  }

  create(): void {
    this.generateUnitTextures();
    this.generateUITextures();
    this.scene.start('MenuScene');
  }

  private generateUnitTextures(): void {
    // Unit color scheme by type
    const unitColors: Record<string, { fill: number; stroke: number; shape: string }> = {
      crawler: { fill: 0x44aa44, stroke: 0x66dd66, shape: 'triangle' },
      mustang: { fill: 0x4488cc, stroke: 0x66aaee, shape: 'circle' },
      arclight: { fill: 0xcc44cc, stroke: 0xee66ee, shape: 'diamond' },
      marksman: { fill: 0xccaa44, stroke: 0xeecc66, shape: 'circle' },
      sledgehammer: { fill: 0xcc6644, stroke: 0xee8866, shape: 'hexagon' },
      vulcan: { fill: 0xcc4444, stroke: 0xee6666, shape: 'octagon' },
      rhino: { fill: 0x888888, stroke: 0xaaaaaa, shape: 'square' },
    };

    const sizes: Record<number, number> = { 1: 16, 2: 24, 3: 32 };
    const unitSizes: Record<string, number> = {
      crawler: 1, mustang: 1,
      arclight: 2, marksman: 2, sledgehammer: 2,
      vulcan: 3, rhino: 3,
    };

    for (const [unitId, colors] of Object.entries(unitColors)) {
      const size = sizes[unitSizes[unitId]] || 16;
      const g = this.make.graphics({ x: 0, y: 0 });

      g.lineStyle(2, colors.stroke, 1);
      g.fillStyle(colors.fill, 1);

      switch (colors.shape) {
        case 'triangle':
          g.fillTriangle(size, 0, 0, size * 2, size * 2, size * 2);
          g.strokeTriangle(size, 0, 0, size * 2, size * 2, size * 2);
          break;
        case 'circle':
          g.fillCircle(size, size, size);
          g.strokeCircle(size, size, size);
          break;
        case 'diamond':
          g.fillPoints([
            new Phaser.Geom.Point(size, 0),
            new Phaser.Geom.Point(size * 2, size),
            new Phaser.Geom.Point(size, size * 2),
            new Phaser.Geom.Point(0, size),
          ], true);
          break;
        case 'hexagon':
          this.drawRegularPolygon(g, size, size, size, 6, colors.fill, colors.stroke);
          break;
        case 'octagon':
          this.drawRegularPolygon(g, size, size, size, 8, colors.fill, colors.stroke);
          break;
        case 'square':
          g.fillRect(2, 2, size * 2 - 4, size * 2 - 4);
          g.strokeRect(2, 2, size * 2 - 4, size * 2 - 4);
          break;
      }

      // Direction indicator (small line showing facing)
      g.lineStyle(2, 0xffffff, 0.8);
      g.lineBetween(size, size, size + size * 0.7, size);

      g.generateTexture(`unit_${unitId}`, size * 2, size * 2);
      g.destroy();

      // Ghost version (translucent, for placement preview)
      const gGhost = this.make.graphics({ x: 0, y: 0 });
      gGhost.lineStyle(2, colors.stroke, 0.4);
      gGhost.fillStyle(colors.fill, 0.3);

      switch (colors.shape) {
        case 'circle':
          gGhost.fillCircle(size, size, size);
          gGhost.strokeCircle(size, size, size);
          break;
        default:
          gGhost.fillRect(2, 2, size * 2 - 4, size * 2 - 4);
          gGhost.strokeRect(2, 2, size * 2 - 4, size * 2 - 4);
      }
      gGhost.generateTexture(`unit_${unitId}_ghost`, size * 2, size * 2);
      gGhost.destroy();
    }

    // Team color overlays
    for (const team of ['team1', 'team2']) {
      const color = team === 'team1' ? 0x4488ff : 0xff4444;
      const g = this.make.graphics({ x: 0, y: 0 });
      g.lineStyle(3, color, 0.8);
      g.strokeCircle(16, 16, 14);
      g.generateTexture(`team_ring_${team}`, 32, 32);
      g.destroy();
    }
  }

  private generateUITextures(): void {
    // Button texture
    const btn = this.make.graphics({ x: 0, y: 0 });
    btn.fillStyle(0x334455, 1);
    btn.fillRoundedRect(0, 0, 200, 50, 8);
    btn.lineStyle(2, 0x5588aa, 1);
    btn.strokeRoundedRect(0, 0, 200, 50, 8);
    btn.generateTexture('btn_normal', 200, 50);
    btn.destroy();

    const btnHover = this.make.graphics({ x: 0, y: 0 });
    btnHover.fillStyle(0x445566, 1);
    btnHover.fillRoundedRect(0, 0, 200, 50, 8);
    btnHover.lineStyle(2, 0x77aacc, 1);
    btnHover.strokeRoundedRect(0, 0, 200, 50, 8);
    btnHover.generateTexture('btn_hover', 200, 50);
    btnHover.destroy();

    // Panel background
    const panel = this.make.graphics({ x: 0, y: 0 });
    panel.fillStyle(0x1a1a2e, 0.9);
    panel.fillRoundedRect(0, 0, 300, 400, 8);
    panel.lineStyle(1, 0x333355, 1);
    panel.strokeRoundedRect(0, 0, 300, 400, 8);
    panel.generateTexture('panel_bg', 300, 400);
    panel.destroy();

    // Grid cell
    const cell = this.make.graphics({ x: 0, y: 0 });
    cell.lineStyle(1, 0x333355, 0.3);
    cell.strokeRect(0, 0, 40, 40);
    cell.generateTexture('grid_cell', 40, 40);
    cell.destroy();

    // Deployment zone highlight
    for (const team of ['team1', 'team2']) {
      const color = team === 'team1' ? 0x4488ff : 0xff4444;
      const zone = this.make.graphics({ x: 0, y: 0 });
      zone.fillStyle(color, 0.1);
      zone.fillRect(0, 0, 40, 40);
      zone.lineStyle(1, color, 0.2);
      zone.strokeRect(0, 0, 40, 40);
      zone.generateTexture(`deploy_zone_${team}`, 40, 40);
      zone.destroy();
    }

    // Health bar components
    const hpBg = this.make.graphics({ x: 0, y: 0 });
    hpBg.fillStyle(0x222222, 1);
    hpBg.fillRect(0, 0, 32, 4);
    hpBg.generateTexture('hp_bar_bg', 32, 4);
    hpBg.destroy();

    const hpFill = this.make.graphics({ x: 0, y: 0 });
    hpFill.fillStyle(0x44cc44, 1);
    hpFill.fillRect(0, 0, 32, 4);
    hpFill.generateTexture('hp_bar_fill', 32, 4);
    hpFill.destroy();

    // Projectile
    const proj = this.make.graphics({ x: 0, y: 0 });
    proj.fillStyle(0xffff44, 1);
    proj.fillCircle(3, 3, 3);
    proj.generateTexture('projectile', 6, 6);
    proj.destroy();

    // Explosion
    const expl = this.make.graphics({ x: 0, y: 0 });
    expl.fillStyle(0xff8800, 0.7);
    expl.fillCircle(16, 16, 16);
    expl.fillStyle(0xffcc00, 0.5);
    expl.fillCircle(16, 16, 10);
    expl.generateTexture('explosion', 32, 32);
    expl.destroy();
  }

  private drawRegularPolygon(
    g: Phaser.GameObjects.Graphics,
    cx: number, cy: number,
    radius: number, sides: number,
    fill: number, stroke: number
  ): void {
    const points: Phaser.Geom.Point[] = [];
    for (let i = 0; i < sides; i++) {
      const angle = (Math.PI * 2 * i) / sides - Math.PI / 2;
      points.push(new Phaser.Geom.Point(
        cx + Math.cos(angle) * radius,
        cy + Math.sin(angle) * radius
      ));
    }
    g.fillPoints(points, true);
    g.lineStyle(2, stroke, 1);
    g.strokePoints(points, true);
  }
}
