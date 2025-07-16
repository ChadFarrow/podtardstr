# Podtardstr Deployment Guide

## 🎯 **Deployment Strategy**

### **Single Branch Deployment**
- **URL**: https://podtardstr.vercel.app/ (Preview)
- **URL**: https://app.podtards.com/ (Production)
- **Branch**: `main`
- **Purpose**: Unified deployment to both preview and production
- **Deployment**: Auto-deploy on every push to main
- **Status**: Same version on both sites

## 🚀 **Workflow**

### **Development Process**
1. **Work on `main` branch** → Auto-deploys to both sites
2. **Test features** on https://podtardstr.vercel.app/
3. **Production automatically updates** at https://app.podtards.com/

### **Quick Commands**
```bash
# Make changes and deploy to both sites
git add .
git commit -m "Your commit message"
git push origin main

# Create new feature branch
git checkout -b feature/new-feature
git push origin feature/new-feature
```

## ⚙️ **Vercel Configuration**

### **Current Setup**
- **Main Branch**: Deploys to both `podtardstr.vercel.app` and `app.podtards.com`
- **Single Source**: All deployments come from `main` branch

### **Required Vercel Settings**
1. **Project Settings** → **Domains**
2. **Primary Domain**: `app.podtards.com` (production)
3. **Preview Domain**: `podtardstr.vercel.app` (preview)
4. **Production Branch**: Set to `main`
5. **Preview Branch**: Set to `main`

## 🎯 **Benefits**
- ✅ **Simplified Workflow**: One branch, one deployment process
- ✅ **Consistent Experience**: Same version on both sites
- ✅ **Faster Updates**: No need to merge between branches
- ✅ **Reduced Complexity**: Single source of truth
- ✅ **Automatic Deployment**: Push to main deploys everywhere

## 📝 **Version Management**
- **Version**: Auto-increments on commits (1.66, 1.67, etc.)
- **Deployment**: Both sites get the same version simultaneously
- **Version Format**: 1.66, 1.67, etc. (auto-bumped on commits)

## 🔄 **Emergency Rollback**
If issues arise:
```bash
git revert HEAD  # Revert the last commit
git push origin main
```

## 📊 **Status Tracking**
- **Preview Status**: Check https://podtardstr.vercel.app/
- **Production Status**: Check https://app.podtards.com/
- **Build Log**: See `Build_log.md` for detailed status
- **Both sites should show identical versions** 