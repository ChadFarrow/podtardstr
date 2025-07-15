# Podtardstr Deployment Guide

## 🎯 **Deployment Strategy**

### **Beta Version** (Fast Development)
- **URL**: https://podtardstr.vercel.app/
- **Branch**: `main`
- **Purpose**: Rapid development, testing new features
- **Deployment**: Auto-deploy on every push to main
- **Status**: Always latest development version

### **Stable Version** (Production)
- **URL**: https://app.podtards.com/
- **Branch**: `stable`
- **Purpose**: User-facing, stable features only
- **Deployment**: Manual deployment from stable branch
- **Status**: Tested and verified features only

## 🚀 **Workflow**

### **Development Process**
1. **Work on `main` branch** → Auto-deploys to beta
2. **Test features** on https://podtardstr.vercel.app/
3. **When ready for production**:
   ```bash
   git checkout stable
   git merge main
   git push origin stable
   ```
4. **Stable deploys** to https://app.podtards.com/

### **Quick Commands**
```bash
# Switch to development (beta)
git checkout main

# Switch to production (stable)
git checkout stable

# Deploy to production
git checkout stable
git merge main
git push origin stable

# Create new feature branch
git checkout main
git checkout -b feature/new-feature
```

## ⚙️ **Vercel Configuration**

### **Current Setup**
- **Main Branch**: Deploys to `podtardstr.vercel.app` (beta)
- **Stable Branch**: Should deploy to `app.podtards.com` (production)

### **Required Vercel Settings**
1. **Project Settings** → **Domains**
2. **Add Domain**: `app.podtards.com`
3. **Production Branch**: Set to `stable`
4. **Preview Branch**: Set to `main`

## 🎯 **Benefits**
- ✅ **Fast Development**: No waiting for production deployment
- ✅ **User Stability**: Production users get tested features only
- ✅ **Easy Rollback**: Can quickly revert stable if issues arise
- ✅ **Testing Environment**: Beta for feature validation
- ✅ **Clear Separation**: Development vs production environments

## 📝 **Version Management**
- **Beta**: Always latest version (auto-increments)
- **Stable**: Manually controlled releases
- **Version Format**: 1.03, 1.04, etc. (auto-bumped on commits)

## 🔄 **Emergency Rollback**
If stable has issues:
```bash
git checkout stable
git reset --hard HEAD~1  # Go back one commit
git push origin stable --force
```

## 📊 **Status Tracking**
- **Beta Status**: Check https://podtardstr.vercel.app/
- **Stable Status**: Check https://app.podtards.com/
- **Build Log**: See `Build_log.md` for detailed status 