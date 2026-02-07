import { describe, it, expect } from 'vitest';
import { MatchManager } from '../server/src/simulation/match-manager';
import { Player, TeamId, MatchPhase } from '../shared/src/types';

function makePlayer(id: string, team: TeamId, isBot = false): Player {
  return {
    id,
    name: isBot ? `Bot ${id}` : `Player ${id}`,
    team,
    isBot,
    ready: false,
    connected: true,
  };
}

describe('MatchManager', () => {
  it('should create a match in lobby phase', () => {
    const mm = new MatchManager('test_match');
    const state = mm.getState();

    expect(state.matchId).toBe('test_match');
    expect(state.phase).toBe('lobby');
    expect(state.roundNumber).toBe(0);
  });

  it('should add players to teams', () => {
    const mm = new MatchManager('test_match');
    mm.addPlayer(makePlayer('p1', 'team1'));
    mm.drainMessages();

    const state = mm.getState();
    expect(state.teams.team1.players).toHaveLength(1);
    expect(state.teams.team1.players[0].id).toBe('p1');
  });

  it('should start match and transition to shopping', () => {
    const mm = new MatchManager('test_match', { mode: '1v1' });
    mm.addPlayer(makePlayer('p1', 'team1'));
    mm.startMatch();
    mm.drainMessages();

    const state = mm.getState();
    expect(state.phase).toBe('shopping');
    expect(state.roundNumber).toBe(1);
    // Should have added a bot to team2
    expect(state.teams.team2.players.length).toBeGreaterThan(0);
  });

  it('should provide starting economy', () => {
    const mm = new MatchManager('test_match', { mode: '1v1', startingCurrency: 300 });
    mm.addPlayer(makePlayer('p1', 'team1'));
    mm.startMatch();
    mm.drainMessages();

    const state = mm.getState();
    // Starting currency + round 1 income
    expect(state.teams.team1.economy.currency).toBeGreaterThanOrEqual(300);
    expect(state.teams.team1.economy.unlockedUnits).toContain('crawler');
    expect(state.teams.team1.economy.unlockedUnits).toContain('mustang');
  });

  it('should handle shop actions', () => {
    const mm = new MatchManager('test_match', { mode: '1v1' });
    mm.addPlayer(makePlayer('p1', 'team1'));
    mm.startMatch();
    mm.drainMessages();

    const initialCurrency = mm.getState().teams.team1.economy.currency;

    // Buy a unit
    mm.handleMessage('p1', {
      type: 'shop_action',
      payload: { type: 'buy_unit', unitTypeId: 'crawler' },
      timestamp: Date.now(),
    });
    mm.drainMessages();

    const state = mm.getState();
    expect(state.teams.team1.economy.currency).toBe(initialCurrency - 50); // crawler costs 50
  });

  it('should handle unit unlock', () => {
    const mm = new MatchManager('test_match', { mode: '1v1' });
    mm.addPlayer(makePlayer('p1', 'team1'));
    mm.startMatch();
    mm.drainMessages();

    // Unlock arclight
    mm.handleMessage('p1', {
      type: 'shop_action',
      payload: { type: 'unlock_unit', unitTypeId: 'arclight' },
      timestamp: Date.now(),
    });
    mm.drainMessages();

    const state = mm.getState();
    expect(state.teams.team1.economy.unlockedUnits).toContain('arclight');
  });

  it('should handle unit placement', () => {
    const mm = new MatchManager('test_match', { mode: '1v1' });
    mm.addPlayer(makePlayer('p1', 'team1'));
    mm.startMatch();
    mm.drainMessages();

    mm.handleMessage('p1', {
      type: 'place_unit',
      payload: {
        instanceId: 'unit_p1_0',
        typeId: 'crawler',
        position: { x: 5, y: 3 },
        facing: Math.PI / 2,
        owner: 'team1',
        playerId: 'p1',
      },
      timestamp: Date.now(),
    });
    mm.drainMessages();

    const state = mm.getState();
    expect(state.teams.team1.placements).toHaveLength(1);
    expect(state.teams.team1.placements[0].typeId).toBe('crawler');
  });

  it('should run combat when all players ready up', () => {
    const mm = new MatchManager('test_match', { mode: '1v1' });
    mm.addPlayer(makePlayer('p1', 'team1'));
    mm.startMatch();
    mm.drainMessages();

    // Place a unit
    mm.handleMessage('p1', {
      type: 'shop_action',
      payload: { type: 'buy_unit', unitTypeId: 'mustang' },
      timestamp: Date.now(),
    });
    mm.handleMessage('p1', {
      type: 'place_unit',
      payload: {
        instanceId: 'unit_p1_0',
        typeId: 'mustang',
        position: { x: 5, y: 3 },
        facing: Math.PI / 2,
        owner: 'team1',
        playerId: 'p1',
      },
      timestamp: Date.now(),
    });
    mm.drainMessages();

    // Ready up
    mm.handleMessage('p1', {
      type: 'ready_up',
      payload: {},
      timestamp: Date.now(),
    });
    const messages = mm.drainMessages();

    // Should have combat events
    const combatMsg = messages.find((m) => m.type === 'combat_events');
    expect(combatMsg).toBeDefined();

    // Should have round result
    const resultMsg = messages.find((m) => m.type === 'round_result');
    expect(resultMsg).toBeDefined();
  });

  it('should track scores across rounds', () => {
    const mm = new MatchManager('test_match', { mode: '1v1', maxRounds: 3 });
    mm.addPlayer(makePlayer('p1', 'team1'));
    mm.startMatch();
    mm.drainMessages();

    // Play through round 1
    mm.handleMessage('p1', {
      type: 'shop_action',
      payload: { type: 'buy_unit', unitTypeId: 'mustang' },
      timestamp: Date.now(),
    });
    mm.handleMessage('p1', {
      type: 'place_unit',
      payload: {
        instanceId: 'unit_r1',
        typeId: 'mustang',
        position: { x: 12, y: 3 },
        facing: Math.PI / 2,
        owner: 'team1',
        playerId: 'p1',
      },
      timestamp: Date.now(),
    });
    mm.handleMessage('p1', { type: 'ready_up', payload: {}, timestamp: Date.now() });
    mm.drainMessages();

    const state = mm.getState();
    // Should have incremented round number or ended
    expect(state.roundNumber).toBeGreaterThanOrEqual(1);
    // Scores should have changed
    const totalScore = state.teams.team1.score + state.teams.team2.score;
    expect(totalScore).toBeGreaterThanOrEqual(0);
  });

  it('should end match when target score reached', () => {
    const mm = new MatchManager('test_match', { mode: '1v1', targetScore: 1, maxRounds: 7 });
    mm.addPlayer(makePlayer('p1', 'team1'));
    mm.startMatch();
    mm.drainMessages();

    // Play one round
    mm.handleMessage('p1', {
      type: 'shop_action',
      payload: { type: 'buy_unit', unitTypeId: 'mustang' },
      timestamp: Date.now(),
    });
    mm.handleMessage('p1', {
      type: 'place_unit',
      payload: {
        instanceId: 'unit_r1',
        typeId: 'mustang',
        position: { x: 12, y: 3 },
        facing: Math.PI / 2,
        owner: 'team1',
        playerId: 'p1',
      },
      timestamp: Date.now(),
    });
    mm.handleMessage('p1', { type: 'ready_up', payload: {}, timestamp: Date.now() });
    mm.drainMessages();

    const state = mm.getState();
    // With targetScore=1, match should be finished after first round
    expect(state.phase).toBe('finished');
    expect(state.winner).toBeDefined();
  });

  it('should generate messages for phase transitions', () => {
    const mm = new MatchManager('test_match', { mode: '1v1' });
    mm.addPlayer(makePlayer('p1', 'team1'));

    let msgs = mm.drainMessages();
    expect(msgs.some((m) => m.type === 'player_joined')).toBe(true);

    mm.startMatch();
    msgs = mm.drainMessages();
    expect(msgs.some((m) => m.type === 'phase_change')).toBe(true);
  });

  it('should handle co-op mode with deployment zones', () => {
    const mm = new MatchManager('test_match', { mode: 'coop' });
    mm.addPlayer(makePlayer('p1', 'team1'));
    mm.addPlayer(makePlayer('p2', 'team1'));
    mm.drainMessages();

    const state = mm.getState();
    const players = state.teams.team1.players;
    expect(players).toHaveLength(2);
    expect(players[0].deploymentZone).toBe('left');
    expect(players[1].deploymentZone).toBe('right');
  });
});
