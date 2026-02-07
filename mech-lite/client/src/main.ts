import Phaser from 'phaser';
import { gameConfig } from './config/game-config';

/**
 * Mechabellum Lite — Entry Point
 * A cooperative auto-battler for the browser.
 */

// Launch Phaser
const game = new Phaser.Game(gameConfig);

// Debug access
(window as any).__mechLiteGame = game;

console.log('Mechabellum Lite v0.1.0 initialized');
