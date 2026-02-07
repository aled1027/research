import Phaser from 'phaser';
import { UnitTypeId, TeamId, Position, TargetingType } from '../../../shared/src/types';
import { UNIT_DEFINITIONS } from '../../../shared/src/config';

/**
 * Visual entity representing a unit on the board.
 * Manages sprite, HP bar, team indicator, and selection state.
 */
export class UnitEntity {
  public instanceId: string;
  public typeId: UnitTypeId;
  public owner: TeamId;
  public position: Position;
  public facing: number;
  public targetingOverride?: TargetingType;

  public container: Phaser.GameObjects.Container;
  public sprite: Phaser.GameObjects.Image;
  public teamRing: Phaser.GameObjects.Image;
  public nameLabel: Phaser.GameObjects.Text;
  public hpBarBg: Phaser.GameObjects.Image | null = null;
  public hpBarFill: Phaser.GameObjects.Image | null = null;

  private selected = false;

  constructor(
    scene: Phaser.Scene,
    instanceId: string,
    typeId: UnitTypeId,
    owner: TeamId,
    position: Position,
    facing: number,
    screenX: number,
    screenY: number
  ) {
    this.instanceId = instanceId;
    this.typeId = typeId;
    this.owner = owner;
    this.position = { ...position };
    this.facing = facing;

    const def = UNIT_DEFINITIONS[typeId];

    this.container = scene.add.container(screenX, screenY);

    // Team ring
    this.teamRing = scene.add.image(0, 0, `team_ring_${owner}`);
    this.container.add(this.teamRing);

    // Unit sprite
    this.sprite = scene.add.image(0, 0, `unit_${typeId}`);
    this.sprite.setRotation(facing);
    this.container.add(this.sprite);

    // Name label
    const color = owner === 'team1' ? '#88aaff' : '#ff8888';
    this.nameLabel = scene.add.text(0, 20, def.name, {
      fontSize: '8px',
      fontFamily: 'monospace',
      color,
    }).setOrigin(0.5);
    this.container.add(this.nameLabel);
  }

  setSelected(selected: boolean): void {
    this.selected = selected;
    if (selected) {
      this.teamRing.setTint(0xffff44);
      this.teamRing.setScale(1.3);
    } else {
      this.teamRing.clearTint();
      this.teamRing.setScale(1);
    }
  }

  updatePosition(screenX: number, screenY: number): void {
    this.container.setPosition(screenX, screenY);
  }

  setFacing(radians: number): void {
    this.facing = radians;
    this.sprite.setRotation(radians);
  }

  destroy(): void {
    this.container.destroy();
  }
}
