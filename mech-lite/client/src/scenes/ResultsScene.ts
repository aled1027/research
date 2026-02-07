import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../config/game-config';
import { TeamId } from '../../../shared/src/types';
import { MatchManager } from '../../../server/src/simulation/match-manager';

/**
 * End-of-match results screen.
 */
export class ResultsScene extends Phaser.Scene {
  private matchManager!: MatchManager;
  private playerId: string = '';
  private teamId: TeamId = 'team1';

  constructor() {
    super({ key: 'ResultsScene' });
  }

  init(data: any): void {
    this.matchManager = data.matchManager;
    this.playerId = data.playerId;
    this.teamId = data.teamId;
  }

  create(): void {
    const state = this.matchManager.getState();
    const winner = state.winner;
    const isWin = winner === this.teamId;
    const isDraw = !winner;

    // Background
    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x0d1117);

    // Result title
    const title = isDraw ? 'DRAW' : isWin ? 'VICTORY!' : 'DEFEAT';
    const titleColor = isDraw ? '#cccc44' : isWin ? '#00ff88' : '#ff4444';

    this.add.text(GAME_WIDTH / 2, 100, title, {
      fontSize: '64px',
      fontFamily: 'monospace',
      color: titleColor,
      fontStyle: 'bold',
    }).setOrigin(0.5);

    // Final scores
    const t1Score = state.teams.team1.score;
    const t2Score = state.teams.team2.score;

    this.add.text(GAME_WIDTH / 2, 200, `Final Score`, {
      fontSize: '20px',
      fontFamily: 'monospace',
      color: '#8888aa',
    }).setOrigin(0.5);

    this.add.text(GAME_WIDTH / 2, 240, `${t1Score} - ${t2Score}`, {
      fontSize: '48px',
      fontFamily: 'monospace',
      color: '#ffffff',
    }).setOrigin(0.5);

    // Team labels
    this.add.text(GAME_WIDTH / 2 - 80, 290, 'YOU', {
      fontSize: '16px',
      fontFamily: 'monospace',
      color: '#4488ff',
    }).setOrigin(0.5);

    this.add.text(GAME_WIDTH / 2 + 80, 290, 'ENEMY', {
      fontSize: '16px',
      fontFamily: 'monospace',
      color: '#ff4444',
    }).setOrigin(0.5);

    // Match stats
    this.add.text(GAME_WIDTH / 2, 350, `Rounds Played: ${state.roundNumber}`, {
      fontSize: '14px',
      fontFamily: 'monospace',
      color: '#888899',
    }).setOrigin(0.5);

    // Buttons
    this.createButton(GAME_WIDTH / 2, 460, 'PLAY AGAIN', () => {
      this.scene.start('LobbyScene', { mode: 'coop' });
    });

    this.createButton(GAME_WIDTH / 2, 530, 'MAIN MENU', () => {
      this.scene.start('MenuScene');
    });
  }

  private createButton(x: number, y: number, text: string, callback: () => void): void {
    const btn = this.add.image(x, y, 'btn_normal').setInteractive({ useHandCursor: true });
    const label = this.add.text(x, y, text, {
      fontSize: '16px',
      fontFamily: 'monospace',
      color: '#ccddee',
    }).setOrigin(0.5);

    btn.on('pointerover', () => {
      btn.setTexture('btn_hover');
      label.setColor('#ffffff');
    });
    btn.on('pointerout', () => {
      btn.setTexture('btn_normal');
      label.setColor('#ccddee');
    });
    btn.on('pointerdown', callback);
  }
}
