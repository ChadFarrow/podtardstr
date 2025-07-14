# Podtardstr

A Nostr-based music discovery application with Value4Value (V4V) Lightning payments.

## 🚀 Live App

**Production**: https://podtardstr.vercel.app

## 📱 Features

- **Music Discovery**: Browse Top 100 V4V music tracks
- **Lightning Payments**: Support artists with keysend and Lightning address payments
- **PWA Support**: Install as native app on iOS/Android
- **Nostr Integration**: Social features and profile management
- **Offline Support**: Service worker caching for offline music discovery

## 🛠️ Tech Stack

- React 18 + TypeScript
- Vite + TailwindCSS
- Nostrify (Nostr protocol)
- Bitcoin Connect (Lightning payments)
- PWA with Service Worker
- Vercel hosting

## 🔧 Development

```bash
# Install dependencies and start development server
npm run dev

# Build for production
npm run build

# Run tests
npm run test
```

## Development Server

This project is also running on a remote Ubuntu server at `192.168.0.243` for development purposes.

### Server Setup

To run the development server on the remote machine:

1. SSH into the server: `ssh server@192.168.0.243`
2. Navigate to project: `cd /home/server/podtardstr`
3. Start development server: `npm run dev -- --host 0.0.0.0 --port 8082`
4. Access from local machine: `http://192.168.0.243:8082/`

**Note**: Port 8082 has been configured in the server's UFW firewall to allow external connections.

## 📖 Documentation

- **Project Status**: See [PROJECT_STATUS.md](./PROJECT_STATUS.md) for detailed progress
- **APK Build**: See [APK_BUILD.md](./APK_BUILD.md) for Android app generation

## 🌐 Hosting

This project is hosted on **Vercel** (not GitHub Pages).

- Production: https://podtardstr.vercel.app
- Automatic deployments from main branch
- Server-side RSS proxy for CORS-free V4V data

## 📄 License

MIT License - see LICENSE file for details.

## Versioning

Before each push, run:

    npm run bump-version

This will automatically increment the version number in `src/components/VersionDisplay.tsx` by 0.01 (e.g., 1.01 → 1.02).