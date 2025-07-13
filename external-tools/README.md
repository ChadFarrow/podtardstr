# External Tools

This directory contains external tools and utilities that complement Podtardstr's functionality.

## RSS Blue Tools

**Location:** `./rss-blue-tools/`  
**Repository:** https://github.com/rssblue/tools  
**Purpose:** Comprehensive Podcast Namespace validator (the gold standard)

### What it does:
- Validates **all** Podcast Namespace tags and elements
- Ensures RSS feed compliance with podcast standards  
- Checks XML structure and schema validity
- Reports detailed validation errors and warnings

### How it complements Podtardstr:
- **RSS Blue**: Validates feed structure and compliance
- **Podtardstr Feed Parser**: Tests actual V4V payment functionality
- **Together**: Complete feed validation + payment testing workflow

### Running RSS Blue Tools:

#### Prerequisites:
```bash
# Install Rust (if not already installed)
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source ~/.cargo/env
```

#### Build and Run:
```bash
cd external-tools/rss-blue-tools

# Build the validator
cargo build --release

# Run the web interface (serves on localhost)
cargo run --release

# Or build for web deployment
trunk build --release
```

#### Alternative - Use their hosted version:
Visit: https://tools.rssblue.com

### Integration Options:

1. **Current Setup**: Link to their hosted version (already implemented)
2. **Self-hosted**: Run RSS Blue tools on your own server
3. **API Integration**: Call RSS Blue validator from Podtardstr backend
4. **Embedded**: Include validation results in our Feed Parser UI

### Updating RSS Blue Tools:

To get the latest version:
```bash
git submodule update --remote external-tools/rss-blue-tools
```

### Why it's included:

- **Backup**: Ensures we have the code if their service goes offline
- **Reference**: Gold standard implementation for Podcast Namespace validation
- **Potential Integration**: Could be integrated into Podtardstr in the future
- **Learning**: Understand how comprehensive podcast validation works

---

*RSS Blue Tools is maintained by the RSS Blue team and remains unmodified in this repository.*