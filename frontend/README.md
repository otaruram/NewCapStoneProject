# VibelyTube Essential Frontend

Frontend React untuk sistem VibelyTube Essential - "Intinya aja dongs!"

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 🎯 Features

### YouTube Analysis
- Input URL YouTube untuk analisis video
- Ekstraksi metadata dan transcript
- Integrasi dengan backend untuk processing

### File Upload
- Support audio, video, PDF, text files
- Drag & drop interface
- File size limit 100MB
- Auto-processing setelah upload

### AI Chat Interface
- Real-time chat dengan AI tentang konten
- Context-aware conversations
- Message history
- Auto-scroll ke pesan terbaru

### Modern UI/UX
- Responsive design untuk mobile & desktop
- Beautiful gradients dan animations
- Error handling dengan notifikasi
- Loading states untuk semua operations

## 🏗️ Architecture

```
src/
├── App.tsx          # Main application component
├── main.tsx         # Entry point
└── index.css        # Global styles
```

## 🎨 Design System

### Colors
- Primary: #667eea (Blue gradient)
- Secondary: #764ba2 (Purple gradient)
- Success: #27ae60 (Green)
- Error: #d63031 (Red)
- Warning: #f39c12 (Orange)

### Components
- Modern card-based layout
- Gradient buttons with hover effects
- Clean form inputs with focus states
- Chat bubbles untuk user/assistant messages

## 🔧 Configuration

### Environment
Frontend otomatis connect ke backend melalui Vite proxy:
- Development: `http://localhost:3000` → `http://localhost:3001/api`
- Production: Sesuaikan di `vite.config.ts`

### API Integration
Menggunakan Axios untuk HTTP requests:
- `POST /api/vibelytube/analyze` - YouTube analysis
- `POST /api/vibelytube/upload` - File upload
- `POST /api/vibelytube/chat` - AI chat
- `GET /api/vibelytube/session/:id` - Session info

## 📱 Responsive Design

- Mobile-first approach
- Breakpoint di 768px untuk tablet/desktop
- Stack layout untuk mobile
- Optimized touch targets

## 🎭 User Experience

### Error Handling
- Network errors dengan retry suggestions
- Validation errors untuk inputs
- Auto-dismiss notifications

### Loading States
- Skeleton loaders untuk content
- Button loading dengan spinner
- Chat typing indicators

### Accessibility
- Semantic HTML structure
- Keyboard navigation support
- Screen reader friendly
- High contrast colors

## 🔄 Session Management

- Auto-generated session IDs
- Persistent chat history
- Context preservation
- Session cleanup di backend

## 📦 Dependencies

### Core
- `react` - UI framework
- `axios` - HTTP client
- `lucide-react` - Icons

### Development
- `vite` - Build tool
- `typescript` - Type checking
- `@vitejs/plugin-react` - React support

## 🎪 Demo Flow

1. **Choose Mode**: YouTube atau Upload
2. **Input Content**: URL atau file
3. **Analyze**: Click "Analisis & Mulai Chat"
4. **Chat**: Tanyakan apapun tentang content
5. **Repeat**: Chat berkelanjutan dengan context

## 💡 Tips

- Pastikan backend running di port 3001
- Use valid YouTube URLs (youtube.com atau youtu.be)
- File upload max 100MB
- Chat history persistent selama session
- Refresh page untuk reset session

## 🐛 Troubleshooting

### Common Issues
1. **CORS Error**: Pastikan backend CORS setup correct
2. **File Upload Fail**: Check file size < 100MB
3. **YouTube Error**: Verify URL format
4. **Chat Not Working**: Ensure analysis completed first

### Debug Mode
```bash
# Enable detailed logging
npm run dev -- --debug
```
