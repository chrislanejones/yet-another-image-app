# Yet Another Image App

A browser-based image annotation and editing tool built with React and TypeScript.

## Features

### Image Management
- **Multiple upload methods**: Drag & drop, file browser, or paste from clipboard (Ctrl+V)
- **Gallery view**: Manage and switch between multiple images
- **Supported formats**: PNG, JPG, GIF, WebP

### Annotation Tools
- **Compress & Resize**: Adjust quality (10-100%), resize with optional aspect ratio lock
- **Brush**: Freehand drawing with customizable size, opacity, and color
- **Text**: Add text annotations with adjustable font size, weight, and color
- **Arrow**: Click and drag to draw arrows (like MS Paint) - single or double-headed with configurable thickness and color

### Canvas
- Zoomable canvas (25% - 200%)
- Real-time brush and arrow drawing
- Undo/redo support for all drawing operations
- Right-click context menu for quick actions

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Alt + U` | Toggle upload panel |
| `Alt + I` | Toggle image gallery |
| `Alt + S` | Toggle tools sidebar |
| `Alt + /` | Toggle keyboard hints |
| `Alt + Z` | Undo |
| `Alt + X` | Redo |
| `Escape` | Close all panels |

On macOS, use `Cmd` instead of `Alt`.

## Tech Stack

- **React 19** - UI framework
- **TypeScript** - Type safety
- **Vite 7** - Build tool
- **Tailwind CSS 4** - Styling
- **Framer Motion** - Animations
- **TanStack Router** - Routing

## Getting Started

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build

# Run tests
pnpm test
```

The development server runs on `http://localhost:3000`.

## Project Structure

```
src/
├── components/
│   ├── AnnotationCanvas.tsx  # Canvas for drawing/editing
│   ├── ImageGalleryBar.tsx   # Image thumbnail gallery
│   ├── ToolsSidebar.tsx      # Tool settings panel
│   ├── UploadPanel.tsx       # Image upload drawer
│   ├── icons/                # Icon components
│   └── ui/                   # Reusable UI components
├── lib/
│   ├── types.ts              # TypeScript type definitions
│   ├── theme.ts              # Theme configuration
│   └── animations.ts         # Framer Motion variants
├── App.tsx                   # Main application component
├── main.tsx                  # Entry point
└── styles.css                # Global styles & theme
```

## License

MIT
