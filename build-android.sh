#!/bin/bash

# Increment version code automatically?
# For now, we just run the build command.

echo "Setting up Android Environment..."
export ANDROID_HOME=/opt/homebrew/share/android-commandlinetools
export ANDROID_SDK_ROOT=$ANDROID_HOME

echo "Using Android SDK: $ANDROID_HOME"

echo "Running EAS Local Build..."
eas build --platform android --profile production --local

echo "Build complete."
echo "If successful, the AAB file is in the root directory (renamed manually) or in android/app/build/outputs/bundle/release/"
