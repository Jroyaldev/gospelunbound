#!/bin/bash

# Create placeholder images
convert -size 800x450 canvas:lightblue -font Arial -pointsize 40 -fill navy -gravity center -annotate 0 "Course Preview" course-preview.jpg
convert -size 800x450 canvas:lightgreen -font Arial -pointsize 40 -fill darkgreen -gravity center -annotate 0 "Genesis Course" genesis-course.jpg
convert -size 800x450 canvas:lightyellow -font Arial -pointsize 40 -fill brown -gravity center -annotate 0 "Article Preview" article-preview.jpg
convert -size 800x450 canvas:lightpink -font Arial -pointsize 40 -fill darkred -gravity center -annotate 0 "Community Preview" community-preview.jpg
convert -size 400x400 canvas:lightgray -font Arial -pointsize 30 -fill black -gravity center -annotate 0 "Newsletter\nIllustration" newsletter-illustration.png

echo "Placeholder images created successfully!"
