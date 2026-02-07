import {
  MatchState,
  MatchPhase,
  TeamId,
  PlacedUnit,
  Economy,
  BattleEvent,
  UnitTypeId,
  UpgradeId,
  Player,
} from '../../../shared/src/types';

/**
 * Client-side game state manager.
 * Stores current match state and provides convenient accessors.
 */
export class GameStateManager {
  private state: MatchState | null = null;
  private localPlayerId: string = '';
  private localTeamId: TeamId = 'team1';
  private battleEvents: BattleEvent[] = [];
  private listeners: (() => void)[] = [];

  setLocalPlayer(playerId: string, teamId: TeamId): void {
    this.localPlayerId = playerId;
    this.localTeamId = teamId;
  }

  updateState(state: MatchState): void {
    this.state = state;
    this.notifyListeners();
  }

  updatePhase(phase: MatchPhase, roundNumber: number): void {
    if (this.state) {
      this.state.phase = phase;
      this.state.roundNumber = roundNumber;
      this.notifyListeners();
    }
  }

  setBattleEvents(events: BattleEvent[]): void {
    this.battleEvents = events;
  }

  getBattleEvents(): BattleEvent[] {
    return this.battleEvents;
  }

  onStateChange(listener: () => void): void {
    this.listeners.push(listener);
  }

  private notifyListeners(): void {
    for (const listener of this.listeners) {
      listener();
    }
  }

  // ── Accessors ──

  getState(): MatchState | null {
    return this.state;
  }

  getPhase(): MatchPhase {
    return this.state?.phase || 'lobby';
  }

  getRoundNumber(): number {
    return this.state?.roundNumber || 0;
  }

  getLocalTeam(): TeamId {
    return this.localTeamId;
  }

  getLocalPlayerId(): string {
    return this.localPlayerId;
  }

  getMyTeamState() {
    return this.state?.teams[this.localTeamId];
  }

  getEnemyTeamState() {
    const enemyId: TeamId = this.localTeamId === 'team1' ? 'team2' : 'team1';
    return this.state?.teams[enemyId];
  }

  getMyEconomy(): Economy | undefined {
    return this.getMyTeamState()?.economy;
  }

  getMyPlacements(): PlacedUnit[] {
    return this.getMyTeamState()?.placements || [];
  }

  getMyPlayers(): Player[] {
    return this.getMyTeamState()?.players || [];
  }

  getMyScore(): number {
    return this.getMyTeamState()?.score || 0;
  }

  getEnemyScore(): number {
    return this.getEnemyTeamState()?.score || 0;
  }

  getUnlockedUnits(): UnitTypeId[] {
    return this.getMyEconomy()?.unlockedUnits || [];
  }

  getCurrency(): number {
    return this.getMyEconomy()?.currency || 0;
  }

  isAllReady(): boolean {
    if (!this.state) return false;
    return Object.values(this.state.teams).every((team) =>
      team.players.every((p) => p.ready || !p.connected)
    );
  }

  getWinner(): TeamId | undefined {
    return this.state?.winner;
  }
}

/** Singleton game state instance */
export const gameState = new GameStateManager();
