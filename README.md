# Base64 Viewer & Converter

A modern, web-based tool to visualize Base64 strings (images and PDFs) and convert images to Base64 format. Built with vanilla HTML, CSS, and JavaScript, designed for immediate utility and ease of use.

![Project Screenshot](https://via.placeholder.com/800x400?text=Base64+Viewer+Screenshot)

## Features

- **Base64 Viewer**: Paste Base64 strings (with or without a data URI prefix) to instantly preview images and PDFs.
- **Smart Detection**: Automatically detects missing data URI prefixes and infers common image/PDF MIME types.
- **Reliable PDF Preview**: Uses `pdf.js` (CDN) to render PDF content from Base64 directly in the browser.
- **Image to Base64**: Drag & drop or upload an image to generate its Base64 string.
- **Download**: Download the rendered file with an inferred extension.
- **Copy to Clipboard**: One-click copying for both Image URLs and generated Base64 strings.
- **Privacy Focused**: All processing happens locally in your browser. No data is sent to any server.
- **Responsive Design**: Works seamlessly on desktop and mobile devices.

## Usage

### Viewing Base64 Files

1.  Navigate to the "Base64 to File" tab.
2.  Paste your Base64 string into the input area.
3.  The file will render instantly in the preview pane (image or PDF).
4.  Use the "Download" or "Copy Data URL" buttons as needed.

### Converting Images to Base64

1.  Switch to the "Image to Base64" tab.
2.  Drag and drop an image file onto the upload zone, or click to select a file.
3.  The Base64 string will appear in the output text area.
4.  Click "Copy Base64" to copy the string to your clipboard.

## Deployment

This project is ready for GitHub Pages.

1.  Push the code to a GitHub repository.
2.  Go to Settings > Pages.
3.  Select the `main` branch as the source.
4.  Your site will be live!

## Tech Stack

- HTML5
- CSS3 (Glassmorphism, CSS Variables, Flexbox/Grid)
- Vanilla JavaScript
- PDF.js (CDN)

## License

MIT
