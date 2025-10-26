import OpenAI from 'openai';

export class ChatService {
  private openai: OpenAI | null = null;

  constructor() {
    console.log('🤖 Initializing Chat Service...');
    
    try {
      // Initialize OpenAI with environment variables
      const apiKey = process.env.OPENAI_API_KEY || process.env.CHATBOT_TUBE_URL;
      const baseURL = process.env.OPENAI_BASE_URL || process.env.CHATBOT_TUBE_BASE_URL;
      
      if (apiKey && baseURL) {
        this.openai = new OpenAI({
          apiKey: apiKey,
          baseURL: baseURL
        });
        console.log('✅ OpenAI service initialized successfully');
      } else {
        console.log('⚠️ OpenAI credentials not found, using fallback responses');
      }
    } catch (error) {
      console.error('❌ Failed to initialize OpenAI service:', error);
      this.openai = null;
    }
  }

  /**
   * Generate AI response from conversation history using GPT-4
   */
  async generateResponse(history: Array<{role: string, content: string}>): Promise<string> {
    try {
      if (!this.openai) {
        console.log('🔄 OpenAI service not available, using enhanced fallback');
        
        // Extract the transcript from system message to use in fallback
        const systemMessage = history.find(msg => msg.role === 'system');
        const userQuestion = history.find(msg => msg.role === 'user' && 
                                             history.indexOf(msg) === history.length - 1)?.content || '';
        
        // If we have a transcript and user question, try to provide a more specific response
        if (systemMessage && systemMessage.content.includes('ringkasan konten')) {
          console.log('📝 Using transcript information for enhanced fallback response');
          return this.getEnhancedFallbackResponse(systemMessage.content, userQuestion);
        }
        
        return this.getFallbackResponse();
      }

      console.log('🤖 Generating AI response using GPT-4...');

      // Use GPT-4 for better responses
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: `Kamu adalah Siti Khadijah, AI assistant yang sangat membantu dan ramah dalam bahasa Indonesia. 
            Kamu ahli dalam menganalisis konten video YouTube dan membantu pengguna memahami isi video.
            Selalu jawab dengan jelas, informatif, dan dalam bahasa Indonesia yang mudah dipahami.
            Jika ada timestamp dalam transcript, gunakan untuk memberikan referensi yang tepat.`
          },
          ...history.map(msg => ({
            role: msg.role as 'user' | 'assistant' | 'system',
            content: msg.content
          }))
        ],
        max_tokens: 1000,
        temperature: 0.7,
        presence_penalty: 0.1,
        frequency_penalty: 0.1
      });

      const response = completion.choices[0]?.message?.content || 'Maaf, saya tidak dapat memproses permintaan Anda saat ini.';
      
      console.log('✅ AI response generated successfully');
      return response;

    } catch (error: any) {
      console.error('❌ Error generating AI response:', error.message);
      
      // Enhanced error handling
      if (error.code === 'insufficient_quota') {
        return 'Maaf, kuota AI sedang habis. Tim sedang menangani masalah ini. Silakan coba lagi nanti.';
      } else if (error.code === 'rate_limit_exceeded') {
        return 'Terlalu banyak permintaan. Silakan tunggu sebentar dan coba lagi.';
      } else {
        return 'Maaf Siti Khadijah sedang mengalami gangguan teknis. Silakan coba lagi dalam beberapa saat.';
      }
    }
  }

  /**
   * Enhanced fallback response that tries to use transcript content
   */
  private getEnhancedFallbackResponse(systemContent: string, userQuestion: string): string {
    console.log('🔍 Creating enhanced fallback response using transcript context');
    
    // Extract transcript snippet
    const transcriptMatch = systemContent.match(/Transkrip lengkap video:\n(.*)/s);
    const transcript = transcriptMatch ? transcriptMatch[1].substring(0, 300) : '';
    
    // Get video title
    const titleMatch = systemContent.match(/Judul: ([^\n]+)/);
    const title = titleMatch ? titleMatch[1] : 'video ini';
    
    // Handle common question types
    if (userQuestion.toLowerCase().includes('tentang apa')) {
      return `${title} membahas beberapa konsep penting. Berdasarkan transkrip: ${transcript}...`;
    }
    
    if (userQuestion.toLowerCase().includes('poin penting') || userQuestion.toLowerCase().includes('poin utama')) {
      return `Poin-poin penting dari ${title} meliputi topik-topik yang dibahas dalam video. ${transcript ? `Dari transkrip: ${transcript}...` : ''}`;
    }
    
    if (userQuestion.toLowerCase().includes('rangkum') || userQuestion.toLowerCase().includes('ringkas')) {
      return `Rangkuman dari ${title}: ${transcript}...`;
    }
    
    // Default enhanced response
    return `Berdasarkan analisis ${title}, video ini membahas topik yang relevan dengan pertanyaan Anda. ${transcript ? `${transcript}...` : ''} Apakah ada aspek khusus yang ingin Anda ketahui lebih dalam?`;
  }

  /**
   * Fallback response when AI is not available
   */
  private getFallbackResponse(): string {
    const responses = [
      "Halo! Saya Siti Khadijah, asisten AI Anda. Saat ini sistem sedang dalam mode terbatas, namun saya tetap bisa membantu Anda memahami konten video. Silakan tanyakan hal spesifik tentang video yang sudah dianalisis.",
      
      "Berdasarkan analisis yang telah dilakukan, video ini mengandung informasi yang bermanfaat. Meskipun saat ini saya dalam mode fallback, saya tetap bisa membantu menjawab pertanyaan Anda tentang konten video.",
      
      "Siti Khadijah di sini! Meskipun sedang ada keterbatasan sistem, saya masih bisa membantu Anda memahami isi video. Coba tanyakan hal spesifik yang ingin Anda ketahui.",
      
      "Video yang Anda analisis mengandung informasi penting. Silakan tanyakan aspek tertentu yang ingin Anda pahami lebih dalam, dan saya akan berusaha membantu sebaik mungkin.",
      
      "Terima kasih telah menggunakan layanan analisis video. Meskipun sistem AI utama sedang terbatas, saya tetap siap membantu menjawab pertanyaan Anda tentang konten video."
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
  }
}

// Export singleton instance
export const chatService = new ChatService();
