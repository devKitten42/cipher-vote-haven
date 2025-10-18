#!/bin/bash

# Video compression script for Cipher Vote Haven demo
# Compresses video to under 10MB while maintaining high quality

INPUT_VIDEO="$1"
OUTPUT_VIDEO="cipher-vote-haven-demo-compressed.mp4"

if [ -z "$INPUT_VIDEO" ]; then
    echo "Usage: ./compress-video.sh <input_video_file>"
    echo "Example: ./compress-video.sh demo.mp4"
    exit 1
fi

if [ ! -f "$INPUT_VIDEO" ]; then
    echo "Error: Input video file '$INPUT_VIDEO' not found"
    exit 1
fi

echo "🎥 Compressing video: $INPUT_VIDEO"
echo "📊 Target: Under 10MB with high quality"
echo ""

# Get original file size
ORIGINAL_SIZE=$(du -h "$INPUT_VIDEO" | cut -f1)
echo "📁 Original size: $ORIGINAL_SIZE"

# Compress with FFmpeg
# -crf 23: High quality (18-28 range, lower = better quality)
# -preset slow: Better compression efficiency
# -profile:v high: H.264 high profile
# -level 4.0: Compatibility
# -pix_fmt yuv420p: Standard pixel format for web
# -movflags +faststart: Web optimization
# -maxrate 2M: Maximum bitrate
# -bufsize 4M: Buffer size

ffmpeg -i "$INPUT_VIDEO" \
    -c:v libx264 \
    -crf 23 \
    -preset slow \
    -profile:v high \
    -level 4.0 \
    -pix_fmt yuv420p \
    -movflags +faststart \
    -maxrate 2M \
    -bufsize 4M \
    -c:a aac \
    -b:a 128k \
    -ac 2 \
    -ar 44100 \
    "$OUTPUT_VIDEO"

# Check if compression was successful
if [ $? -eq 0 ]; then
    NEW_SIZE=$(du -h "$OUTPUT_VIDEO" | cut -f1)
    NEW_SIZE_BYTES=$(du -b "$OUTPUT_VIDEO" | cut -f1)
    NEW_SIZE_MB=$((NEW_SIZE_BYTES / 1024 / 1024))
    
    echo ""
    echo "✅ Compression completed successfully!"
    echo "📁 New size: $NEW_SIZE ($NEW_SIZE_MB MB)"
    
    if [ $NEW_SIZE_MB -lt 10 ]; then
        echo "🎉 Success: Video is under 10MB!"
    else
        echo "⚠️  Warning: Video is still over 10MB"
        echo "💡 Try increasing CRF value (e.g., -crf 25) for more compression"
    fi
    
    echo ""
    echo "📋 Output file: $OUTPUT_VIDEO"
    echo "🔗 Ready for upload to YouTube/GitHub"
    
else
    echo "❌ Compression failed"
    exit 1
fi
