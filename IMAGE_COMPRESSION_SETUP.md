# Image Compression Setup

## Install Sharp Package

```bash
cd NIAD-XCT-BE
npm install sharp@^0.33.5
```

## Features Added

### 🎯 **Automatic Image Compression**
- **Target Size**: 8MB per image  
- **Max Resolution**: 1920x1080
- **Format**: Auto-convert to JPEG
- **Quality**: Dynamic (70% → 30% based on size)

### 🔧 **Smart Compression Logic**
1. **Check Size**: If ≤ 8MB → No compression needed
2. **Quality Reduction**: Try 70%, 60%, 50%, 40%, 30%
3. **Resolution Reduction**: 1440p → 1280p → 1024p
4. **Fallback**: Minimum quality/size if still too large

### 📊 **Before/After Logs**
```
Original file size: 15.25MB
Compressed file size: 7.83MB
Reduction: 48.7%
```

## Usage

Images uploaded through admin panel will automatically be compressed before saving to public folder.

## Benefits for Deployment

- ✅ **Faster Loading**: Smaller file sizes
- ✅ **Storage Efficient**: Less disk space usage  
- ✅ **Network Friendly**: Reduced bandwidth
- ✅ **Deploy Safe**: Files under size limits
