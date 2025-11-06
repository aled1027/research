# Anki Git Plugin Development Notes

## Project Goal
Create an Anki plugin that backs up Anki cards, decks, and state to a GitHub repository. Each backup creates a new commit, allowing users to track changes over time.

## Inspiration
Modeled after https://github.com/Vinzent03/obsidian-git

## Initial Setup
- Created anki-git folder
- Starting research on Anki plugin development

## Research Notes

### Anki Plugin Architecture

#### Add-on Structure
- `__init__.py` - Main entry point, can initialize the add-on
- `manifest.json` - Metadata (package name, name, version, description, author, minimumAnkiVersion)
- `config.json` - Optional configuration
- Add-ons are Python modules loaded at startup
- Can use hooks to respond to Anki events
- Can modify UI (e.g., add menu items)

#### Typical manifest.json
```json
{
  "package": "anki-git",
  "name": "Anki Git Backup",
  "version": "0.1.0",
  "description": "Back up Anki cards and decks to a Git repository",
  "author": "Claude",
  "minimumAnkiVersion": "2.1.0"
}
```

### Obsidian Git Plugin Features (Model)
- Automatic backup at configurable intervals
- Manual backup on demand
- Commit and push changes
- Pull on startup
- Stage/unstage individual files
- History view
- Command palette integration

### Design Plan

#### Core Features for Anki Git Plugin
1. **Manual Backup**: Menu item to trigger backup
2. **Automatic Backup**: Configurable interval (e.g., every 10 minutes)
3. **Git Operations**: Commit and push changes
4. **Configuration**: Git repo path, remote URL, auto-backup interval
5. **Export Format**: Export decks and cards in a readable format (JSON or text)

#### Implementation Approach
1. Add menu item to Tools menu for manual backup
2. Use Anki hooks to trigger automatic backups
3. Export collection data to organized files
4. Use subprocess to run git commands
5. Store configuration in Anki's config system

## Implementation Details

### Key APIs Found
- `mw.col` - Access to the collection
- `mw.col.decks` - Access to decks
- `mw.col.cards` - Access to cards
- `mw.col.notes` - Access to notes
- `QAction` - Create menu items
- `qconnect` - Connect signals to slots
- `addHook` - Register hooks (e.g., "profileLoaded")
- `QTimer` - For periodic automatic backups

### Export Strategy
1. Export deck structure as JSON
2. Export notes/cards in readable format
3. Organize by deck in subdirectories
4. Include metadata (timestamps, stats)

### Git Operations
- Use subprocess to run git commands
- Check if directory is a git repo
- Stage all changes
- Commit with timestamp
- Push to remote

### Configuration Options
- Git repository path
- Enable/disable auto-backup
- Auto-backup interval (minutes)
- Commit message template
- Enable/disable auto-push

## Implementation Complete

### Files Created
1. **manifest.json** - Plugin metadata and version info
2. **config.json** - Default configuration with sensible defaults
3. **config.md** - User-friendly configuration documentation
4. **__init__.py** - Main plugin implementation (~250 lines)
5. **README.md** - Comprehensive user and developer documentation

### Implementation Highlights

#### Plugin Architecture
- `AnkiGitBackup` class encapsulates all functionality
- Uses Qt signals/slots for menu integration
- `QTimer` for automatic backup scheduling
- Hooks into Anki's `profile_did_open` and `profile_will_close` events

#### Key Features Implemented
1. **Menu Integration**: Added "Backup to Git" to Tools menu
2. **Manual Backup**: User can trigger backup anytime
3. **Automatic Backup**: Configurable timer-based backups
4. **Collection Export**:
   - Exports all decks with full card/note data
   - Includes scheduling information (due dates, intervals, etc.)
   - Creates human-readable summary
   - Metadata with collection statistics
5. **Git Operations**:
   - Initializes repo if needed
   - Stages all changes
   - Creates commits with custom messages
   - Optionally pushes to remote
   - Handles errors gracefully

#### Export Format
The plugin creates three files in `anki-backup/` subdirectory:
- `decks.json` - Complete structured export of all decks
- `metadata.json` - Collection statistics and metadata
- `summary.txt` - Human-readable backup summary

#### Error Handling
- Validates configuration before backup
- Checks for git repo existence
- Handles subprocess errors
- User-friendly error messages via showWarning
- Silent error logging for auto-backups (doesn't interrupt user)

### Technical Decisions

1. **JSON Export Format**: Chose JSON for readability and potential future import functionality
2. **Subprocess for Git**: Using subprocess.run() for git commands - simple and reliable
3. **Timer-based Backups**: QTimer provides reliable scheduling within Qt event loop
4. **Profile Hooks**: Using modern `gui_hooks` API instead of legacy `addHook`
5. **No Media Backup**: Decided to focus on text content for v0.1 (noted as future enhancement)

### Testing Considerations

To test this plugin properly:
1. Create a test Anki profile
2. Set up a test Git repository
3. Configure the plugin with test repo path
4. Trigger manual backup and verify files
5. Check git commits are created
6. Test automatic backup timer
7. Test with various deck configurations
8. Test error cases (invalid paths, no git, etc.)

### Lessons Learned

1. **Anki API**:
   - Modern Anki uses `mw.col.get_card()` and `mw.col.get_note()` instead of direct DB access
   - `col.decks.all_names_and_ids()` returns `DeckNameId` objects with `.name` and `.id` attributes (not tuples!)
   - Card scheduling data stored in card objects (queue, due, ivl, etc.)

2. **Qt Integration**:
   - `qconnect` is the modern way to connect signals
   - `gui_hooks` provides cleaner hook system than legacy `addHook`
   - `tooltip()` for non-intrusive notifications vs `showInfo()` for modal dialogs

3. **Plugin Best Practices**:
   - Use config.json for defaults
   - Use config.md for user documentation
   - Handle profile open/close for resource management
   - Graceful degradation when features aren't available

### Future Improvements

If continuing development:
1. Add media file backup (copy from Anki media folder)
2. Implement selective deck backup
3. Add restore/import functionality
4. Create visual diff viewer within Anki
5. Add git pull on startup option
6. Backup on specific events (e.g., after sync)
7. Add .gitignore template for optimal repo structure
8. Support SSH keys for authentication
9. Add backup encryption option
10. Create Anki package (.ankiaddon) for easy distribution

## Bug Fixes

### Fix 1: DeckNameId Unpacking Error
**Error**: `cannot unpack non-iterable DeckNameId object`

**Cause**: The code was trying to unpack `DeckNameId` objects as tuples:
```python
for deck_name, deck_id in deck_ids:  # WRONG!
```

**Fix**: Access attributes directly:
```python
for deck_name_id in deck_name_ids:
    deck_name = deck_name_id.name
    deck_id = deck_name_id.id
```

**Location**: `__init__.py:114-117`

This was discovered during initial user testing when triggering a manual backup.

### Fix 2: Deterministic Sorting for Git Diffs
**Issue**: Without sorting, the JSON export order changes between backups, making Git diffs noisy and unhelpful.

**Improvements**:
1. **Sort decks by ID**: Decks appear in consistent order
2. **Sort cards by ID**: Cards processed in ID order
3. **Sort notes by ID**: Notes within each deck in ID order
4. **Sort cards within notes by ID**: Multiple cards per note sorted
5. **Sort tags**: Tags within each note sorted alphabetically
6. **Sort JSON keys**: Added `sort_keys=True` to json.dump() calls
7. **Deduplicate notes**: Fixed bug where notes with multiple cards were exported multiple times

**Benefits**:
- Git diffs only show actual changes to card content
- Changes appear in predictable locations
- Much easier to review what changed in each commit
- Reduced file size (no duplicate notes)

**Location**: `__init__.py:114-169, 174, 187`
