# Mission Control for Arkeus - Setup Guide

## What This Does

**Mission Control** is your visual dashboard for managing the Arkeus system. It replaces the command-line interface with a real-time web UI.

### Without Mission Control:
```bash
# Check brain status
tail -f ~/.arkeus/brain_body.log

# View tasks
cat ~/.arkeus/brain_body_actions.jsonl | jq

# Check metrics
cat ~/.arkeus/brain_metrics.json
```

### With Mission Control:
- **Visual dashboard** at http://127.0.0.1:3000
- **Real-time updates** (WebSocket)
- **Task queue** with progress bars
- **Agent status** (Brain MCP, Body, Watchers)
- **Click to interact** instead of terminal commands

---

## Security Setup

### 🔑 Keychain Authentication

**What it does:** Loads your Arkeus API key securely from macOS Keychain instead of storing it in files.

**Why it matters:**
- ❌ **Without:** API key in `.env.local` file (plaintext, can be leaked)
- ✅ **With:** API key in encrypted macOS Keychain (secure, system-protected)

**How it works:**
1. Launch script runs: `./start-mission-control.sh`
2. Script loads key from keychain: `security find-generic-password ...`
3. Key is set as environment variable (temporary, only while running)
4. Dashboard uses key to authenticate with Arkeus gateway
5. When dashboard stops, key disappears from memory

**Your keychain entry:**
```
Service: com.arkeus.arkeus-api-keys
Account: arkeus
Password: [your cryptographic API key]
```

### 🚀 Launch Script

**What it does:** `./start-mission-control.sh` automates the startup process

**What it includes:**
1. **Keychain loader** - Gets API key securely
2. **Health checks** - Verifies Arkeus gateway is running
3. **Port checker** - Ensures port 3000 is available
4. **Logger** - Saves output to `~/.arkeus/logs/mission-control.log`
5. **Error handling** - Graceful failures with clear messages

**Manual vs Launch Script:**
```bash
# Manual (insecure):
export ARKEUS_API_KEY="plain-text-key-here"  # Bad!
npm run dev

# Launch script (secure):
./start-mission-control.sh  # Loads from keychain
```

---

## Installation Status

✅ **Cloned:** ~/arkeus-mesh/mission-control
✅ **Dependencies installed:** npm packages
⚠️ **Security vulnerabilities:** 4 found (3 high, 1 critical in Next.js)
✅ **Configuration:** .env.local created for Arkeus (not OpenClaw)
✅ **Workspace:** ~/.arkeus/mission-control/
✅ **Launch script:** start-mission-control.sh (executable)

---

## Quick Start

### 1. First-time setup (run once):
```bash
cd ~/arkeus-mesh/mission-control

# Build the production version
npm run build
```

### 2. Start Mission Control:
```bash
./start-mission-control.sh
```

### 3. Open dashboard:
```
http://127.0.0.1:3000
```

### 4. Stop Mission Control:
Press `Ctrl+C` in the terminal

---

## Configuration

### .env.local (Arkeus-specific)

```bash
# Gateway connection (your existing gateway, not OpenClaw)
ARKEUS_GATEWAY_URL=http://127.0.0.1:8787

# API key (loaded from keychain by launch script)
ARKEUS_API_KEY=

# Workspace
WORKSPACE_BASE_PATH=~/.arkeus/mission-control
PROJECTS_PATH=~/.arkeus/mission-control/projects

# Security
HOSTNAME=127.0.0.1  # Localhost only, not 0.0.0.0
PORT=3000
NODE_ENV=production
```

**Key differences from original:**
- Uses Arkeus gateway (8787) instead of OpenClaw (18789)
- HTTP connection instead of WebSocket
- Arkeus workspace instead of ~/Documents/Shared
- Localhost-only binding for security

---

## Security Warnings

### ⚠️ Vulnerabilities Found

```
4 vulnerabilities (3 high, 1 critical)
- Next.js: Multiple security issues
- glob: Command injection risk
```

**Impact:**
- **Development mode:** Low risk (localhost only)
- **Production mode:** Need to update Next.js before network exposure

**Fix options:**

1. **Use as-is (localhost only):**
   - Safe if only accessed from your computer
   - Dashboard bound to 127.0.0.1 (not network-accessible)

2. **Update dependencies (breaking changes):**
   ```bash
   npm audit fix --force
   # May break the dashboard, requires testing
   ```

3. **Proxy through Nginx (recommended for production):**
   - Add authentication layer
   - Update Next.js in controlled way
   - Rate limiting
   - SSL/TLS

**Current status:** Safe for local testing, do NOT expose to network yet.

---

## Architecture

```
┌──────────────────────────────────────────────┐
│  Browser (http://127.0.0.1:3000)            │
└────────────────┬─────────────────────────────┘
                 │
                 ▼
┌──────────────────────────────────────────────┐
│  Mission Control (Next.js)                   │
│  - Task queue UI                             │
│  - Agent status display                      │
│  - Real-time updates                         │
│  - Auth: Keychain-based API key              │
└────────────────┬─────────────────────────────┘
                 │ HTTP + API Key
                 ▼
┌──────────────────────────────────────────────┐
│  Arkeus Gateway (port 8787)                  │
│  - /brain/status                             │
│  - /brain/body                               │
│  - /memory/*                                 │
│  - /tasks/*                                  │
└──────────────────────────────────────────────┘
```

**Data flow:**
1. User opens dashboard in browser
2. Dashboard loads API key from environment (set by launch script)
3. Dashboard queries Arkeus gateway with API key
4. Gateway returns brain status, tasks, metrics
5. Dashboard displays in real-time UI

---

## Integration with Existing Arkeus

### What Mission Control Can Show:

| Data Source | Current Access | Mission Control Display |
|-------------|----------------|------------------------|
| Brain Body status | `tail -f brain_body.log` | Live status indicator |
| Brain metrics | `cat brain_metrics.json` | Charts & counters |
| Task queue | `cat brain_body_actions.jsonl` | Visual queue with progress |
| Learning outcomes | `sqlite3 learning.db` | Success/failure stats |
| Agent roster | Code files | Named agents (Strategist, Executor, Sentinel) |
| Memory tree | File system | Searchable interface |

### What Needs to Be Added:

To fully integrate Mission Control with Arkeus, you'll need to add API endpoints to your gateway:

```python
# In arkeus_gateway.py

@app.get("/mission-control/status")
async def mission_control_status():
    """Dashboard overview"""
    return {
        "brain_mcp": check_brain_mcp_status(),
        "brain_body": get_brain_body_status(),
        "watchers": get_watcher_status(),
        "queue": get_task_queue(),
        "metrics": load_brain_metrics()
    }

@app.get("/mission-control/tasks")
async def mission_control_tasks():
    """Task queue for dashboard"""
    actions = load_brain_body_actions()
    return {
        "queued": [a for a in actions if a["status"] == "pending"],
        "active": [a for a in actions if a["status"] == "running"],
        "completed": [a for a in actions if a["status"] == "completed"]
    }
```

Then modify Mission Control to call these endpoints instead of OpenClaw Gateway.

---

## Troubleshooting

### "API key not found in keychain"
```bash
# Check if key exists
cd ~/arkeus-mesh/gateway
python3 keychain.py get arkeus-api-keys

# If missing, set it
python3 keychain.py set arkeus-api-keys
```

### "Port 3000 already in use"
```bash
# Find what's using it
lsof -i :3000

# Kill the process
kill -9 [PID]

# Or use different port
export PORT=3001
./start-mission-control.sh
```

### "Gateway not responding at port 8787"
```bash
# Start Arkeus gateway
cd ~/arkeus-mesh/gateway
python3 arkeus_gateway.py

# Check if running
curl http://127.0.0.1:8787/health
```

### Security vulnerabilities warning
This is expected. The dashboard is safe for localhost-only use. Update Next.js before network exposure.

---

## Next Steps

1. **Test the dashboard:**
   ```bash
   ./start-mission-control.sh
   # Open http://127.0.0.1:3000
   ```

2. **Add Arkeus gateway endpoints** (see Integration section above)

3. **Customize the UI:**
   - Edit `src/app/page.tsx` for main dashboard
   - Modify `src/components/` for widgets
   - Update `src/app/api/` for Arkeus integration

4. **Security hardening** (before network access):
   - Update Next.js dependencies
   - Add authentication middleware
   - Enable rate limiting
   - Set up SSL/TLS

5. **Auto-start on boot** (optional):
   - Create launchd plist like other Arkeus services
   - Copy pattern from com.arkeus.gateway.plist

---

## Comparison: OpenClaw vs Arkeus Mode

| Aspect | OpenClaw Mode | Arkeus Mode (Current) |
|--------|---------------|----------------------|
| **Purpose** | Testing on laptop | Production dashboard |
| **Gateway** | Port 18789 | Port 8787 |
| **Connection** | WebSocket | HTTP |
| **Auth** | OpenClaw token | Keychain API key |
| **Workspace** | ~/Documents/Shared | ~/.arkeus/mission-control |
| **Network** | Can be exposed | Localhost only |
| **Status** | Not used | Active setup |

---

**Created:** Feb 7, 2026
**For:** Arkeus Executive System
**Security:** Localhost-only, keychain-based auth
**Status:** Ready for local testing
