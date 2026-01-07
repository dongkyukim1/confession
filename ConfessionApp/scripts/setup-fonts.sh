#!/bin/bash

# Font Setup Script for Confession Diary App
# This script helps download and setup fonts from Google Fonts

set -e

FONTS_DIR="assets/fonts"
TEMP_DIR="temp_fonts"

echo "🎨 Font Setup Script for Confession Diary App"
echo "=============================================="
echo ""

# Create directories
mkdir -p "$FONTS_DIR"
mkdir -p "$TEMP_DIR"

echo "📁 Directories created"
echo ""

# Font download links (Google Fonts API)
declare -A FONTS=(
  ["DancingScript"]="https://fonts.google.com/download?family=Dancing%20Script"
  ["Caveat"]="https://fonts.google.com/download?family=Caveat"
  ["Pacifico"]="https://fonts.google.com/download?family=Pacifico"
  ["IndieFlower"]="https://fonts.google.com/download?family=Indie%20Flower"
  ["ShadowsIntoLight"]="https://fonts.google.com/download?family=Shadows%20Into%20Light"
  ["Merriweather"]="https://fonts.google.com/download?family=Merriweather"
  ["PlayfairDisplay"]="https://fonts.google.com/download?family=Playfair%20Display"
  ["Lora"]="https://fonts.google.com/download?family=Lora"
  ["Nunito"]="https://fonts.google.com/download?family=Nunito"
  ["Poppins"]="https://fonts.google.com/download?family=Poppins"
)

echo "📝 Fonts to download:"
echo "  - Dancing Script (handwriting)"
echo "  - Caveat (handwriting)"
echo "  - Pacifico (handwriting)"
echo "  - Indie Flower (handwriting)"
echo "  - Shadows Into Light (handwriting)"
echo "  - Merriweather (serif)"
echo "  - Playfair Display (serif)"
echo "  - Lora (serif)"
echo "  - Nunito (sans-serif)"
echo "  - Poppins (sans-serif)"
echo ""

echo "⚠️  Manual Download Required"
echo "=========================="
echo ""
echo "Google Fonts requires manual download. Please:"
echo ""
echo "1. Visit https://fonts.google.com"
echo "2. Search for and download each font:"
for font in "${!FONTS[@]}"; do
  echo "   - $font"
done
echo ""
echo "3. Extract .ttf files from downloaded .zip files"
echo "4. Copy these files to: $FONTS_DIR/"
echo ""
echo "   Required files:"
echo "   - DancingScript-Regular.ttf"
echo "   - DancingScript-Bold.ttf"
echo "   - Caveat-Regular.ttf"
echo "   - Caveat-Bold.ttf"
echo "   - Pacifico-Regular.ttf"
echo "   - IndieFlower-Regular.ttf"
echo "   - ShadowsIntoLight-Regular.ttf"
echo "   - Merriweather-Regular.ttf"
echo "   - Merriweather-Bold.ttf"
echo "   - PlayfairDisplay-Regular.ttf"
echo "   - PlayfairDisplay-Bold.ttf"
echo "   - Lora-Regular.ttf"
echo "   - Lora-Bold.ttf"
echo "   - Nunito-Regular.ttf"
echo "   - Nunito-Bold.ttf"
echo "   - Poppins-Regular.ttf"
echo "   - Poppins-Bold.ttf"
echo ""

read -p "Have you downloaded and placed the fonts? (y/n) " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
  echo "❌ Setup cancelled. Download fonts first!"
  exit 1
fi

# Check if fonts exist
echo "🔍 Checking for font files..."
FONTS_FOUND=0
FONTS_MISSING=0

REQUIRED_FONTS=(
  "DancingScript-Regular.ttf"
  "Caveat-Regular.ttf"
  "Pacifico-Regular.ttf"
  "IndieFlower-Regular.ttf"
  "ShadowsIntoLight-Regular.ttf"
  "Merriweather-Regular.ttf"
  "PlayfairDisplay-Regular.ttf"
  "Lora-Regular.ttf"
  "Nunito-Regular.ttf"
  "Poppins-Regular.ttf"
)

for font in "${REQUIRED_FONTS[@]}"; do
  if [ -f "$FONTS_DIR/$font" ]; then
    echo "   ✅ Found: $font"
    ((FONTS_FOUND++))
  else
    echo "   ❌ Missing: $font"
    ((FONTS_MISSING++))
  fi
done

echo ""
echo "📊 Summary: $FONTS_FOUND found, $FONTS_MISSING missing"
echo ""

if [ $FONTS_MISSING -gt 0 ]; then
  echo "⚠️  Some fonts are missing. The app will use fallback fonts for missing ones."
  echo ""
  read -p "Continue anyway? (y/n) " -n 1 -r
  echo ""
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Setup cancelled"
    exit 1
  fi
fi

# Link fonts with React Native
echo "🔗 Linking fonts to React Native..."
npx react-native-asset

if [ $? -eq 0 ]; then
  echo "✅ Fonts linked successfully!"
else
  echo "❌ Font linking failed. Please run manually: npx react-native-asset"
  exit 1
fi

echo ""
echo "🎉 Font setup complete!"
echo ""
echo "Next steps:"
echo "1. Clean build: cd android && ./gradlew clean && cd .."
echo "2. Rebuild app: npx react-native run-android (or run-ios)"
echo "3. Open app and go to Profile > 폰트 to select fonts!"
echo ""
echo "Enjoy beautiful typography! ✨"

# Cleanup
rm -rf "$TEMP_DIR"
