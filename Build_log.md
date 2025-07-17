# Podtardstr Project Status Board

---

## 🔖 Quick Reference for Future Sessions (as of July 16, 2025)

### **Current Status**
- **Version:** 1.108 (auto-increments on commits)
- **Status:** 🟢 Production Ready - All core features complete + Mobile Bitcoin Connect Disabled
- **Production URL:** https://app.podtards.com (main branch - production)
- **Preview URL:** https://podtardstr.vercel.app (main branch - preview)
- **Repo:** https://github.com/ChadFarrow/podtardstr

### **Key Architecture & Tech Stack**
- **Frontend:** React 18.3.1 + TypeScript + Vite + TailwindCSS + shadcn/ui
- **Nostr:** @nostrify/react for social features, login, profile management
- **Lightning:** Bitcoin Connect for wallet integration, supports both LUD16/06 and keysend
- **Audio:** HTML5 audio with Zustand state management for player
- **Deployment:** Vercel with service worker for PWA functionality
- **Mobile:** PWA installable on iOS/Android, fixed bottom player positioning

### **Core Features Complete**
✅ **Top 100 V4V Music Chart** - Podcast Index API with caching  
✅ **Music Discovery** - Search and browse with V4V payments  
✅ **Podcast Player** - Queue management, working autoplay, sequential track ordering  
✅ **Value4Value Payments** - Lightning splits with TLV metadata (Podcast Index 2.0 spec)  
✅ **Platform Integration** - Wavlake & LNBeats direct album linking  
✅ **Message Support** - Optional messages in Lightning payment TLV records  
✅ **User Customization** - Custom sender names, dark mode enforced  
✅ **Mobile Optimized** - Fixed viewport, single-click play, loading states  

### **Recent Critical Changes (Reference for Context)**
- **Mobile Bitcoin Connect Disabled:** Temporary workaround to prevent refresh loops on mobile (July 17, 2025)
- **Service Worker Refresh Fix:** Removed aggressive activation and auto-refresh causing mobile issues (July 17, 2025)
- **Mobile Payment UX:** Clear messaging about Lightning payments being desktop-only temporarily (July 17, 2025)
- **Payment Progress Tracking:** Real-time visual progress for boost payments with status indicators (July 17, 2025)
- **Autoplay Functionality:** Complete fix for autoplay with browser policy workarounds (July 16, 2025)
- **Queue Ordering Fix:** Fixed "Play All" to maintain sequential 1→2→3 order instead of skipping tracks (July 16, 2025)
- **Vercel Environment Configuration:** Production environment updated to track main branch (January 2025)
- **Single Branch Deployment:** Simplified to main branch only, both sites deploy from same source (January 2025)
- **Amber Integration Removal:** Removed all Amber-related code and components (January 2025)
- **Album Play Button Fix:** Complete fix for non-working play buttons on album art (July 15, 2025)
- **Audio Fetch Abort Fix:** Eliminated "fetching process was aborted" errors with simplified loading approach  
- **Event Handler Fix:** Changed from onClick to onMouseDown for reliable button interaction
- **Z-Index Fix:** Resolved play buttons showing through bottom audio player bar
- **Track Switching Fix:** Podcast ID comparison for reliable track switching between albums
- **TLV Metadata:** Now matches Podcast Index 2.0 spec exactly (podcast, feedID, itemID, episode, etc.)
- **Bottom Player:** Changed from sticky to fixed positioning, always visible
- **Platform Detection:** Wavlake & LNBeats integration with UUID extraction from feed URLs
- **Boost Flow:** Modal-based with message input, enhanced UX
- **Version Auto-increment:** Commits automatically bump version number

### **Important Implementation Details**
- **Payment Flow:** BoostModal component handles all V4V interactions
- **Audio State:** usePodcastPlayer hook with Zustand for global state
- **Platform URLs:** Extract UUIDs from feed URLs to generate proper album links
- **TLV Records:** Use 7629169 for Podcast Index 2.0 compliance with all required fields
- **Loading Prevention:** Track loading states to prevent rapid-click conflicts
- **Mobile PWA:** Service worker, manifest, proper viewport settings prevent zoom issues

### **File Structure Notes**
- **Components:** Modular design with V4V payment buttons in each component
- **Payment Utils:** `src/lib/payment-utils.ts` handles all Lightning payment logic
- **Player State:** `src/hooks/usePodcastPlayer.ts` for global audio management
- **Platform Detection:** In NowPlayingModal.tsx for Wavlake/LNBeats linking

### **Testing & Build Status**
- **Tests:** 15 passing ✅ (use `npm test` or similar)
- **Build:** Successful production build ✅
- **Deployment:** Auto-deploy on push to main ✅
- **PWA:** Installable with proper manifest and service worker ✅

### **Common Issues & Solutions (Quick Reference)**
- **Album play buttons not working:** FIXED - Use onMouseDown instead of onClick, ensure z-index < 50
- **Audio fetch abort errors:** FIXED - Simplified audio loading, let browser handle timing naturally  
- **Track switching not working:** FIXED - Use podcast ID comparison instead of URL comparison
- **Play buttons showing through bottom player:** FIXED - Reduced z-index from 999 to 10
- **Double-click required:** Check loadingTrackId state in TrendingMusic.tsx
- **Bottom player not visible:** Ensure fixed positioning with z-50 in PodcastPlayer.tsx
- **Mobile zoom issues:** Check viewport meta tag has minimum-scale=1.0
- **Platform links not working:** Verify UUID extraction regex patterns in NowPlayingModal.tsx
- **V4V payments failing:** Check TLV metadata format matches Podcast Index 2.0 spec
- **Loading states stuck:** Ensure setTimeout clears loadingTrackId after 1000ms
- **Production not updating:** Ensure changes are pushed to stable branch, not just main

### **Key Commands**
- **Development:** `npm run dev`
- **Build:** `npm run build` 
- **Test:** `npm test`
- **Push & Deploy:** `git add . && git commit -m "message" && git push`

---

## 🎯 Project Overview
**Podtardstr** - A Nostr-based music discovery application with Value4Value (V4V) Lightning payments integrated.

**Last Updated**: January 2025  
**Version**: 1.81  
**Status**: 🟢 Production Ready + Single Branch Deployment

---

## 🚀 Core Features Status

### ✅ **Completed & Stable**
| Feature | Status | Notes |
|---------|--------|-------|
| **Top 100 V4V Music Chart** | ✅ Complete | Fetches from Podcast Index API with aggressive caching |
| **Music Discovery** | ✅ Complete | Browse and search podcast music |
| **Podcast Player** | ✅ Complete | Built-in audio player with playlist support |
| **Nostr Integration** | ✅ Complete | Social features, profile management, event publishing |
| **Value4Value Payments** | ✅ Complete | Lightning payments via Bitcoin Connect |
| **RSS Feed Parsing** | ✅ Complete | Enhanced V4V data extraction with CORS-safe requests |
| **Theme System** | ✅ Complete | Dark mode enforced, light mode removed |
| **Responsive Design** | ✅ Complete | Mobile-first design with Tailwind CSS |
| **PWA Support** | ✅ Complete | Full iOS/Android PWA with service worker, offline caching |
| **Android APK Build** | ✅ Complete | Capacitor setup ready for APK generation |
| **Keysend Payments** | ✅ Complete | Support for both Lightning addresses and node pubkeys |
| **Server-side RSS Proxy** | ✅ Complete | CORS-free V4V data fetching via Vercel functions |
| **Track Queue Management** | ✅ Complete | Fixed ordering issues in Play All queue |
| **Wavlake Integration** | ✅ Complete | Direct album links from feed URLs |
| **Mobile Viewport** | ✅ Complete | Fixed zoom and horizontal scrolling issues |
| **Dark Mode Default** | ✅ Complete | App now defaults to dark theme |
| **Configurable User Names** | ✅ Complete | Users can set custom names for Lightning payments |
| **Boost Flow Refactor** | ✅ Complete | Modal appears after clicking Boost, not before |
| **LNBeats Integration** | ✅ Complete | Direct album links from feed URLs |
| **Message Support** | ✅ Complete | Optional messages in Lightning payment TLV metadata |
| **Audio Loading Fixes** | ✅ Complete | Prevents conflicts and loading errors |
| **Bottom Player Fixed** | ✅ Complete | Fixed positioning and always visible |
| **Album-Art-Focused UI** | ✅ Complete | Card redesign with 80px album art as focal point |
| **Split Count Display** | ✅ Complete | Recipient count visible on all boost buttons |
| **LNBeats URL Fix** | ✅ Complete | Working album links using podcast GUID format |
| **Enhanced Visual Hierarchy** | ✅ Complete | Proportional spacing and responsive grid layout |

### 🔄 **In Progress**
| Feature | Status | Progress | Notes |
|---------|--------|----------|-------|
| None currently | - | - | All core features complete |

### 📋 **Planned**
| Feature | Status | Priority | Notes |
|---------|--------|----------|-------|
| **iOS App** | 📋 Planned | Medium | Capacitor can generate iOS app |
| **Offline Mode** | 📋 Planned | Low | PWA already supports basic offline |
| **Social Features** | 📋 Planned | Medium | Nostr integration ready for expansion |
| **Analytics** | 📋 Planned | Low | User engagement tracking |

---

## 🐛 Known Issues & Solutions

### 🔴 **Critical Issues**
| Issue | Status | Impact | Solution |
|-------|--------|--------|----------|
| None currently | ✅ | - | - |

### 🟡 **Medium Priority**
| Issue | Status | Impact | Solution |
|-------|--------|--------|----------|
| **CORS Audio Loading** | 🟡 Monitored | Some podcast audio blocked | Graceful error handling implemented |
| **Large Bundle Size** | 🟡 Monitored | Slow initial load | Code splitting planned |
| **Service Worker Caching** | ✅ Resolved | Required hard refresh | Network-first for bundles implemented |

### 🟢 **Low Priority**
| Issue | Status | Impact | Solution |
|-------|--------|--------|----------|
| **Mixed Content Images** | 🟢 Resolved | HTTP images on HTTPS | SecureImage component implemented |
| **React Hook Warnings** | 🟢 Resolved | Development warnings | useCallback dependencies fixed |
| **Manifest Icon Warnings** | ✅ Resolved | PWA installation issues | Fixed invalid icon purposes |
| **404 JavaScript Errors** | ✅ Resolved | Deployment loading issues | Vercel headers and caching fixed |

---

## 🛠️ Technical Stack Status

### ✅ **Core Technologies**
| Technology | Version | Status | Notes |
|------------|---------|--------|-------|
| **React** | 18.3.1 | ✅ Stable | Latest stable version |
| **TypeScript** | 5.5.3 | ✅ Stable | Full type safety |
| **Vite** | 6.3.5 | ✅ Stable | Fast build tool |
| **TailwindCSS** | 3.4.11 | ✅ Stable | Utility-first styling |
| **shadcn/ui** | Latest | ✅ Stable | 48+ UI components |

### ✅ **Nostr Integration**
| Component | Status | Notes |
|-----------|--------|-------|
| **Nostrify** | ✅ Stable | Core Nostr protocol |
| **Nostrify React** | ✅ Stable | React hooks for Nostr |
| **Event Publishing** | ✅ Stable | Custom hooks implemented |
| **Profile Management** | ✅ Stable | Edit profile form |

### ✅ **Payment Integration**
| Component | Status | Notes |
|-----------|--------|-------|
| **Bitcoin Connect** | ✅ Stable | Lightning wallet integration |
| **V4V Data Parsing** | ✅ Stable | RSS feed + API fallback |
| **Payment Processing** | ✅ Stable | Multi-recipient support |
| **User Name Management** | ✅ Stable | Configurable sender names in TLV metadata |

### ✅ **Audio & Media**
| Component | Status | Notes |
|-----------|--------|-------|
| **Podcast Player** | ✅ Stable | Queue management, auto-play |
| **Audio Streaming** | ✅ Stable | CORS-safe implementation |
| **Playlist Support** | ✅ Stable | Top 100 "Play All" feature |

---

## 📊 Development Metrics

### **Code Quality**
- **Test Coverage**: 15 tests passing ✅
- **TypeScript**: No type errors ✅
- **ESLint**: No linting errors ✅
- **Build Status**: Successful ✅

### **Performance**
- **Bundle Size**: ~1.1MB (with optimization warnings)
- **Build Time**: ~2 seconds
- **Cache Strategy**: Aggressive (6h stale, 24h cache)

### **Dependencies**
- **Total Packages**: 835
- **Vulnerabilities**: 4 (2 moderate, 2 high) - monitored
- **Funding Requests**: 141 packages

---

## 🎯 Recent Achievements

### **July 17, 2025 - Version 1.108 - Mobile Refresh Loop Fix**
- ✅ **Mobile Bitcoin Connect Disabled**: Temporary workaround to prevent refresh loops on mobile devices
- ✅ **Service Worker Refresh Fix**: Removed aggressive skipWaiting() and clients.claim() causing mobile issues
- ✅ **Mobile Payment UX**: Clear messaging about Lightning payments being desktop-only temporarily
- ✅ **Payment Progress Tracking**: Real-time visual progress for boost payments with status indicators
- ✅ **Failed Payment Status**: Fixed green checkmarks showing for failed payments, now shows red X
- ✅ **API Key Security**: Removed console logs exposing Podcast Index API key in browser
- ✅ **Modal Scroll Lock**: Fixed page zoom/movement when boost modal opens
- ✅ **Mobile Modal UX**: Added cancel and skip options for Bitcoin Connect modal on mobile

### **July 17, 2025 - Version 1.86 - Wallet Disconnect & Payment Fixes**
- ✅ **Wallet Disconnect Button**: Added wallet status display and disconnect functionality in sidebar
- ✅ **Payment Error Fix**: Fixed "sendPayment is not a function" error for keysend payments
- ✅ **Better Error Handling**: Added proper type checking for wallet provider methods
- ✅ **Enhanced Debugging**: Added provider object logging to diagnose payment issues
- ✅ **Wallet Status Display**: Shows connected wallet type (Bitcoin Connect or GetAlby) with email for GetAlby
- ✅ **Graceful Keysend Fallback**: Skip keysend payments if wallet doesn't support them instead of throwing errors

### **July 16, 2025 - Version 1.85 - Autoplay Functionality Complete**
- ✅ **Autoplay Fixed**: Complete resolution of autoplay functionality with browser policy workarounds
- ✅ **Queue Ordering Fixed**: "Play All" now maintains proper sequential order (1→2→3) instead of skipping tracks
- ✅ **Browser Policy Handling**: Graceful handling of NotAllowedError with user interaction tracking
- ✅ **Enhanced Debugging**: Added comprehensive 🎵 emoji logging for autoplay behavior tracking
- ✅ **Fallback Mechanisms**: Direct audio.play() attempts with setTimeout for blocked autoplay
- ✅ **Visual Indicators**: Autoplay toggle shows ✓/✗ status for easy debugging
- ✅ **User Interaction Tracking**: Manual play enables future autoplay capability
- ✅ **Sequential Playback**: Fixed queue building to preserve Top 100 ranking order

### **July 15, 2025 - Version 1.65 - Album Play Button Complete Fix**
- ✅ **Album Play Button Fix**: COMPLETELY RESOLVED - Play buttons on album art now work perfectly
- ✅ **Event Handler Fix**: Changed from onClick to onMouseDown for reliable button interaction
- ✅ **Audio Fetch Abort Fix**: Eliminated "fetching process was aborted" errors with simplified loading approach
- ✅ **Track Switching Fix**: Fixed subsequent tracks not playing after first track using podcast ID comparison
- ✅ **Z-Index Fix**: Resolved play buttons showing through bottom audio player bar (z-index: 10 vs 50)
- ✅ **TypeScript Error Fix**: Fixed GetAlby SDK v5.x compatibility and LightningWallet interface
- ✅ **Production Deployment**: Successfully deployed all fixes to stable branch and production
- ✅ **Audio Loading Simplification**: Removed complex loading management, let browser handle timing naturally

### **July 15, 2025 - Version 1.34**
- ✅ **Album-Art-Focused Card Redesign**: Complete UI overhaul with album art as primary focal point
- ✅ **Split Count Display**: Added recipient count visibility on all boost buttons throughout app
- ✅ **LNBeats URL Generation Fix**: Corrected link format using podcast GUID for working album links
- ✅ **Enhanced Visual Hierarchy**: 80px album art, centered layout, proportional spacing
- ✅ **Improved Interaction**: Fixed single-click play functionality, removed backdrop blur
- ✅ **Grid Layout Enhancement**: Responsive 1-4 column grid with optimized card proportions
- ✅ **TLV Metadata Debugging**: Added timestamp logging for boost payment troubleshooting

### **July 14, 2025 - Version 1.10**
- ✅ **Logo Integration**: Replaced generic music icon with Podtardstr favicon logo in sidebar header
- ✅ **Theme Cleanup**: Removed light/dark theme toggle since app is dark mode only
- ✅ **Consistent Branding**: Favicon logo now appears in both browser tab and app header

### **July 14, 2025 - Version 1.08**
- ✅ **Confetti Celebration**: Added confetti animation on successful boost payments for enhanced user feedback
- ✅ **New Favicon**: Updated to Podtardstr logo with microphone + lightning bolt design
- ✅ **Cache-Busting**: Added version parameters to favicon URLs to ensure updates are visible

### **July 14, 2025 - Version 1.03**
- ✅ **Beta/Stable Deployment**: Set up separate deployment structure with main→beta and stable→production
- ✅ **TLV Record Standardization**: Updated TLV metadata structure to match real-world Podcast Index 2.0 examples
- ✅ **Enhanced TLV Fields**: Added missing fields: uuid, speed, url, episode_guid, app_version, amount
- ✅ **Metadata Consistency**: All payment components now pass complete metadata including feedId and itemId
- ✅ **Universal LNBeats Links**: All tracks now show "Find on LNBeats" buttons since every track is available on LNBeats.com
- ✅ **Logout User Name Clearing**: User's boost name is automatically cleared when they log out of Nostr

### **July 14, 2025 - Version 1.02**
- ✅ **LNBeats Integration**: Added detection and direct album linking for LNBeats platform
- ✅ **Message Support**: Optional message input boxes for all V4V payment buttons
- ✅ **Enhanced TLV Metadata**: Messages and sender names included in Lightning payment records
- ✅ **Audio Loading Fixes**: Prevented "fetching process aborted" errors with proper loading state management
- ✅ **Bottom Player Improvements**: Fixed positioning to be always visible at screen bottom
- ✅ **Loading States**: Added loading spinners and disabled states during track switching
- ✅ **Single-Click Play**: Fixed double-click requirement after page refresh
- ✅ **Boost Modal Refactor**: Changed to modal-based boost flow with better UX

### **January 13, 2025**
- ✅ **Version 1.01 Released**: Updated versioning format (1.0, 1.01, 1.02, 1.03...)
- ✅ **Configurable User Names**: Users can set custom names for Lightning payments with localStorage persistence
- ✅ **Boost Flow Refactor**: Modal appears after clicking Boost button, not before
- ✅ **Dark Mode Enforcement**: Removed light mode support, app is dark-only
- ✅ **Version Display Enhancement**: Shows version number and build hash in sidebar
- ✅ **TLV Metadata Enhancement**: User names included in Lightning payment metadata with "random podtardstr" fallback

### **July 13, 2025**
- ✅ **Wavlake Integration Enhanced**: Extract album IDs from feed URLs for direct album links
- ✅ **Mobile Viewport Fixed**: Prevented horizontal scrolling and unwanted zoom on mobile
- ✅ **Dark Mode Default**: App now defaults to dark theme for better user experience
- ✅ **Album Art Play Button**: Made play button always visible on album covers
- ✅ **Progress Bar Fixed**: Timeupdate events working in popup and bottom player
- ✅ **TLV Metadata Enhanced**: Improved boost info with proper Podcast Index 2.0 compliance
- ✅ **Payment Split Fairness**: Recipients now get minimum 1 sat if they have valid splits

### **Previous Milestones**
- ✅ **Complete PWA Implementation**: Full iOS/Android support with service worker
- ✅ **Keysend Payment Support**: Both Lightning addresses and node pubkeys
- ✅ **Server-side RSS Proxy**: CORS-free V4V data via Vercel functions
- ✅ **Fixed Track Ordering**: Proper queue management in Play All feature
- ✅ **Deployment Optimization**: Fixed caching and 404 issues
- ✅ **Manifest Fixes**: Proper PWA installation support
- ✅ **TLV App Name Always Set**: Podtardstr is now always included as the app name in the TLV metadata for all Lightning payments, ensuring Podcast Index 2.0 compatibility

---

## 🚀 Next Steps

### **Immediate (This Week)**
1. **Test Autoplay**: Verify autoplay works consistently across different browsers and devices
2. **Test Queue Ordering**: Confirm "Play All" maintains proper 1→2→3→4 sequential order
3. **User Testing**: Gather feedback on improved autoplay and queue experience

### **Short Term (Next 2 Weeks)**
1. **Performance Optimization**: Implement code splitting
2. **Offline Mode**: Enhance PWA offline capabilities
3. **User Testing**: Gather feedback on APK experience

### **Medium Term (Next Month)**
1. **iOS App**: Generate iOS app using Capacitor
2. **Social Features**: Expand Nostr integration
3. **Analytics**: Add user engagement tracking

---

## 📈 Success Metrics

### **Technical Goals**
- [x] Zero critical bugs in production
- [x] All tests passing
- [x] Mobile-responsive design
- [x] PWA installable
- [x] APK buildable
- [x] TLV app name always set for all Lightning payments
- [x] Mobile viewport optimized (no zoom/scroll issues)
- [x] Wavlake direct album linking
- [x] LNBeats direct album linking
- [x] Configurable user names for payments
- [x] Dark mode enforced throughout app
- [x] Message support in Lightning payments
- [x] Single-click play functionality
- [x] Fixed bottom player positioning

### **Feature Goals**
- [x] Top 100 V4V music discovery
- [x] Lightning payment integration
- [x] Nostr social features
- [x] Podcast player with queue
- [x] Cross-platform compatibility
- [x] User name customization
- [x] Music platform integration (Wavlake, LNBeats)
- [x] Message support for payments

### **User Experience Goals**
- [x] Fast loading times
- [x] Intuitive navigation
- [x] Reliable audio playback
- [x] Seamless payment flow
- [x] Mobile-optimized interface
- [x] Personalized payment experience
- [x] Single-click play functionality
- [x] Fixed player positioning
- [x] Enhanced message support

---

## 🔗 Quick Links

- **Preview App**: https://podtardstr.vercel.app (main branch - preview)
- **Production App**: https://app.podtards.com (main branch - production)
- **Repository**: https://github.com/ChadFarrow/podtardstr
- **Documentation**: `README.md`, `APK_BUILD.md`, `DEPLOYMENT.md`
- **Known Issues**: `.cursorrules` (Known Issues section)
- **Build Scripts**: `scripts/build-apk.sh`

---

## 📝 Notes

- **Last Test Run**: All 15 tests passing ✅
- **Last Build**: Successful production build ✅
- **Last Deployment**: Version 1.85 deployed to production ✅
- **APK Status**: Ready for generation (requires Java JDK) ✅
- **Version**: 1.108 (auto-increments on commits) ✅
- **Mobile Refresh Loop**: ✅ FIXED - Bitcoin Connect disabled on mobile, service worker less aggressive
- **Payment Progress**: ✅ ADDED - Real-time visual progress tracking for boost payments
- **API Key Security**: ✅ FIXED - Removed console logs exposing Podcast Index API key
- **Mobile UX**: ✅ IMPROVED - Clear messaging about desktop-only Lightning payments
- **Autoplay**: ✅ COMPLETELY FIXED - Working with sequential queue ordering
- **Queue Ordering**: ✅ FIXED - "Play All" maintains proper 1→2→3 sequence

**Project Health**: 🟢 **Excellent** - Production ready! All core features complete, mobile refresh loop fixed, payment progress tracking added, API key security resolved, Lightning payments working on desktop, Bitcoin Connect temporarily disabled on mobile as workaround, autoplay working perfectly, sequential queue ordering fixed, PWA fully functional, LNBeats & Wavlake integration, message support, user name customization implemented. Ready for user testing and broader deployment. 