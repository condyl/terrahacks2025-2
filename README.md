# 🤖 Baymax Lite

A healthcare-focused AI chatbot inspired by Baymax from Big Hero 6, built for TerraHacks 2025. Baymax Lite provides compassionate healthcare guidance using advanced AI technology.

## 🎯 Project Overview

Baymax Lite is an intelligent healthcare assistant that combines the caring personality of Disney's Baymax with cutting-edge AI capabilities. The application provides personalized health advice, symptom analysis, and medical guidance while maintaining a warm, approachable interface.

### 🌟 Key Features

- **🩺 AI-Powered Healthcare Guidance** - Get personalized medical advice and symptom analysis
- **📸 Image Analysis** - Upload photos for visual health concerns (rashes, injuries, etc.)
- **🎙️ Text-to-Speech** - Listen to Baymax's responses with high-quality voice synthesis
- **⚡ Real-time Streaming** - Fast typewriter effect for responsive conversations
- **📱 Responsive Design** - Works seamlessly on desktop and mobile devices
- **🎨 Beautiful UI** - Clean, medical-themed interface with Baymax branding

## 🚀 Technologies Used

### Frontend
- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **Radix UI** - Accessible component primitives
- **Lucide React** - Beautiful icons

### AI & APIs
- **Google Gemini AI** - Advanced language model for healthcare conversations
- **Google Cloud TTS** - High-quality text-to-speech with professional voices
- **Vision AI** - Image analysis for visual health concerns

### Development Tools
- **Turbopack** - Ultra-fast bundler for development
- **React Hook Form** - Efficient form handling
- **Zod** - Schema validation
- **Class Variance Authority** - Component variant management

## 🏥 Why Baymax Lite?

Healthcare information should be:
- **Accessible** - Available 24/7 without appointments
- **Compassionate** - Delivered with empathy and understanding
- **Reliable** - Backed by advanced AI trained on medical knowledge
- **Private** - Secure conversations about sensitive health topics

Baymax Lite bridges the gap between professional medical care and everyday health questions, providing immediate guidance while encouraging users to seek professional care when needed.

## 🛠️ Installation & Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd terrahacks2025-2
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file in the root directory:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🎮 Usage

1. **Start a Conversation** - Type your health concerns in the chat input
2. **Upload Images** - Click the image button to upload photos of health issues
3. **Listen to Responses** - Click the sound icon to hear Baymax speak
4. **Get Guidance** - Receive personalized healthcare advice and recommendations

## 🏗️ Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   │   ├── chat/          # Gemini AI chat endpoint
│   │   └── tts/           # Text-to-speech endpoint
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Main chat interface
├── components/            # React components
│   ├── chat-form.tsx      # Message input form
│   ├── chat-message.tsx   # Message display component
│   └── ui/                # Reusable UI components
├── hooks/                 # Custom React hooks
│   ├── use-enter-submit.ts # Form submission logic
│   ├── use-text-to-speech.ts # TTS functionality
│   └── use-typewriter.ts  # Typewriter effect
└── lib/                   # Utilities and types
    ├── types.ts           # TypeScript definitions
    └── utils.ts           # Helper functions
```

## 🤝 Contributing

This project was built for TerraHacks 2025. Contributions, suggestions, and feedback are welcome!

## ⚠️ Disclaimer

Baymax Lite provides healthcare information for educational purposes only and is not a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of qualified healthcare providers with questions about medical conditions.

---

*"Hello, I am Baymax, your personal healthcare companion."* 🤖❤️
