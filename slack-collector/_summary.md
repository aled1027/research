Slack Message Collector is a Python-based tool for archiving Slack messages from public channels, private channels, DMs, and group DMs into a local SQLite database, with robust support for threads and user/channel metadata. It uses incremental syncing to efficiently fetch only new messages and features a command-line interface for sending direct messages using a user OAuth token. The system is optimized for ease of deployment via [PEP 723 inline script metadata](https://peps.python.org/pep-0723/) and [uvx](https://github.com/vene/uvx), minimizing installation friction. Security is maintained by requiring appropriate Slack OAuth scopes and making the limitations of user impersonation explicit, while privacy is emphasized by advising responsible usage of sensitive data. The database schema is designed to support analytics and auditing by storing detailed message, user, and channel data.

**Key points:**
- Collects all message types (channels, DMs, threads) with efficient, incremental updates.
- Stores messages and metadata in a structured SQLite database for querying and analysis.
- Provides a secure CLI for sending DMs, with strict user-token requirements.
- Handles Slack rate limits and offers troubleshooting for common permission issues.
- Setup and operation are streamlined with uvx and clear environment variable configuration.
