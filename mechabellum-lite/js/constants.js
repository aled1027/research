// Game constants
const GAME_WIDTH = 1280;
const GAME_HEIGHT = 800;

// Battlefield dimensions
const FIELD_X = 0;
const FIELD_Y = 60;
const FIELD_WIDTH = 1280;
const FIELD_HEIGHT = 640;

// Grid
const GRID_COLS = 16;
const GRID_ROWS = 10;
const CELL_WIDTH = FIELD_WIDTH / GRID_COLS;
const CELL_HEIGHT = FIELD_HEIGHT / GRID_ROWS;

// Player zones: top half = enemy (rows 0-4), bottom half = player (rows 5-9)
const PLAYER_ZONE_START_ROW = 5;
const ENEMY_ZONE_END_ROW = 4;

// Flank zones (available from round 2+)
const FLANK_COLS_LEFT = [0, 1];
const FLANK_COLS_RIGHT = [14, 15];

// Economy
const BASE_SUPPLY_PER_ROUND = 200;
const STARTING_HP = 30;
const SKIP_CARD_BONUS = 50;
const MAX_NEW_DEPLOYMENTS = 4; // Slightly more generous for the lite version

// Timing
const PLANNING_TIME = 60000; // 60 seconds planning phase
const BATTLE_SPEED = 1; // multiplier

// Unit size categories
const SIZE = {
    SMALL: 'small',
    MEDIUM: 'medium',
    LARGE: 'large',
    GIANT: 'giant'
};

// Targeting
const TARGET = {
    GROUND: 'ground',
    AIR: 'air',
    BOTH: 'both'
};

// Movement type
const MOVE_TYPE = {
    GROUND: 'ground',
    AIR: 'air'
};

// Colors
const COLORS = {
    PLAYER: 0x4488ff,
    ENEMY: 0xff4444,
    PLAYER_LIGHT: 0x6699ff,
    ENEMY_LIGHT: 0xff6666,
    GRID_LINE: 0x1a2a3a,
    GRID_PLAYER: 0x112244,
    GRID_ENEMY: 0x221122,
    SUPPLY: 0xffcc00,
    HP_GREEN: 0x44ff44,
    HP_RED: 0xff4444,
    UI_BG: 0x0d1117,
    UI_BORDER: 0x30363d,
    UI_HIGHLIGHT: 0x1f6feb,
    BUTTON: 0x238636,
    BUTTON_HOVER: 0x2ea043,
    TEXT: 0xc9d1d9,
    SPLASH: 0xff8800,
    HEAL: 0x44ff88,
    SHIELD: 0x44aaff,
};

// Unit tier colors
const TIER_COLORS = {
    1: 0x88cc88, // green - cheap units
    2: 0x4488ff, // blue - mid tier
    3: 0xcc88ff, // purple - expensive
    4: 0xffaa00, // orange - giant units
};
