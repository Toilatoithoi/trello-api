# trello-api Memory Bank

I am Cursor, an expert software engineer. My memory resets between sessions. I rely on the **Memory Bank** to understand the project. I MUST read ALL memory bank files at the start of EVERY task.

## Memory Bank Structure

```
memory-bank/
├── projectbrief.md    # Overview, core features, target users
├── productContext.md  # Why, problems solved, API goals
├── techContext.md     # Stack, MongoDB, key paths
├── systemPatterns.md  # Conventions, architecture, naming
├── activeContext.md   # Current focus, recent changes, next steps
└── progress.md        # What works, what's left, known issues
```

## trello-api Project Context

**trello-api** là Backend API cho ứng dụng quản lý công việc kiểu Trello:
- Stack: Node.js, Express.js, MongoDB (native driver)
- API versioning: `/v1` (boards, columns, cards, users, invitations)
- Auth: JWT (HttpOnly cookies), Socket.IO real-time
- Chi tiết: xem `memory-bank/*.md` và `documentations/PROJECT_ANALYSIS.md`

## Core Workflows

### Plan Mode
1. Read Memory Bank
2. If incomplete → Create Plan
3. If complete → Verify context → Develop strategy → Present approach

### Act Mode
1. Check Memory Bank
2. Update documentation
3. Update .cursor/rules if needed
4. Execute task
5. Document changes

## Documentation Updates

Update Memory Bank when:
1. Discovering new patterns
2. After significant changes
3. When user says **"update memory bank"** (MUST review ALL files)
4. When context needs clarification

REMEMBER: The Memory Bank is my only link to previous work. Maintain it with precision.
