"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.chatService = exports.ChatService = void 0;
const openai_1 = __importDefault(require("openai"));
class ChatService {
    constructor() {
        this.openai = null;
        console.log('🤖 Initializing Chat Service...');
        try {
            const apiKey = process.env.OPENAI_API_KEY;
            const baseURL = process.env.OPENAI_BASE_URL;
            console.log(`🔑 API Key exists: ${!!apiKey}`);
            console.log(`🌐 Base URL exists: ${!!baseURL}`);
            if (apiKey) {
                console.log(`🔗 API Key preview: ${apiKey.substring(0, 10)}...`);
            }
            if (baseURL) {
                console.log(`🔗 Base URL: ${baseURL}`);
            }
            if (apiKey && baseURL) {
                this.openai = new openai_1.default({
                    apiKey: apiKey,
                    baseURL: baseURL
                });
                console.log('✅ OpenAI service initialized successfully');
                console.log(`🔗 Using endpoint: ${baseURL}`);
                console.log('⏭️ Skipping connection test, service ready for use');
            }
            else {
                console.log('⚠️ OpenAI credentials not found, using fallback responses');
                console.log(`Missing: ${!apiKey ? 'API_KEY ' : ''}${!baseURL ? 'BASE_URL' : ''}`);
            }
        }
        catch (error) {
            console.error('❌ Failed to initialize OpenAI service:', error);
            this.openai = null;
        }
    }
    async testConnection() {
        if (!this.openai)
            return;
        try {
            console.log('🧪 Testing OpenAI connection...');
            const model = process.env.OPENAI_MODEL || 'gpt-4.1';
            console.log(`🤖 Testing with model: ${model}`);
            const testResponse = await this.openai.chat.completions.create({
                model: model,
                messages: [{ role: 'user', content: 'Test' }],
                max_tokens: 5
            });
            console.log('✅ OpenAI connection test successful');
        }
        catch (error) {
            console.error('❌ OpenAI connection test failed:', error.message);
            this.openai = null;
        }
    }
    async generateResponse(history) {
        try {
            console.log(`🤖 Generating AI response with ${history.length} messages in history`);
            if (!this.openai) {
                console.log('🔄 OpenAI service not available, using enhanced fallback');
                const systemMessage = history.find(msg => msg.role === 'system');
                const userQuestion = history.find(msg => msg.role === 'user' &&
                    history.indexOf(msg) === history.length - 1)?.content || '';
                console.log(`📝 System message exists: ${!!systemMessage}`);
                console.log(`❓ User question: ${userQuestion}`);
                if (systemMessage && systemMessage.content.includes('Transkrip lengkap video')) {
                    console.log('📝 Using transcript information for enhanced fallback response');
                    return this.getEnhancedFallbackResponse(systemMessage.content, userQuestion);
                }
                else if (systemMessage && systemMessage.content.includes('Judul:')) {
                    console.log('📝 Using video information for enhanced fallback response');
                    return this.getEnhancedFallbackResponse(systemMessage.content, userQuestion);
                }
                return this.getFallbackResponse();
            }
            console.log('🤖 Generating AI response using GPT...');
            console.log(`📊 Sending ${history.length} messages to OpenAI`);
            console.log(`🔑 Using API key: ${this.openai ? 'Available' : 'Not available'}`);
            console.log(`🌐 Endpoint: ${process.env.OPENAI_BASE_URL}`);
            const model = process.env.OPENAI_MODEL || 'gpt-4.1';
            console.log(`🤖 Using model: ${model}`);
            const completion = await this.openai.chat.completions.create({
                model: model,
                messages: history.map(msg => ({
                    role: msg.role,
                    content: msg.content
                })),
                max_tokens: 1000,
                temperature: 0.7,
                presence_penalty: 0.1,
                frequency_penalty: 0.1
            });
            const response = completion.choices[0]?.message?.content || 'Eh bro, gue lagi bingung nih. Coba tanya yang lain deh!';
            console.log('✅ AI response generated successfully');
            console.log(`📝 Response preview: ${response.substring(0, 100)}...`);
            return response;
        }
        catch (error) {
            console.error('❌ Error generating AI response:', error.message);
            if (error.code === 'insufficient_quota') {
                return 'Wah bro, kuota AI gue lagi habis nih. Tim lagi nangani masalah ini. Coba lagi nanti ya!';
            }
            else if (error.code === 'rate_limit_exceeded') {
                return 'Wkwk, terlalu banyak request nih bro. Tunggu sebentar ya, nanti gue jawab!';
            }
            else {
                return 'Eh bro, Cecep lagi ada gangguan teknis. Coba lagi sebentar lagi ya!';
            }
        }
    }
    getEnhancedFallbackResponse(systemContent, userQuestion) {
        console.log('🔍 Creating enhanced fallback response using transcript context');
        const titleMatch = systemContent.match(/Judul: ([^\n]+)/);
        const title = titleMatch ? titleMatch[1] : 'video ini';
        const channelMatch = systemContent.match(/Channel: ([^\n]+)/);
        const channel = channelMatch ? channelMatch[1] : '';
        const descMatch = systemContent.match(/Deskripsi: ([^\n]+)/);
        const description = descMatch ? descMatch[1] : '';
        const transcriptMatch = systemContent.match(/Transkrip lengkap video:\n(.*)/s);
        const transcript = transcriptMatch ? transcriptMatch[1].substring(0, 500) : '';
        console.log(`📹 Video info - Title: ${title}, Channel: ${channel}`);
        console.log(`📝 Transcript available: ${!!transcript}, Length: ${transcript.length}`);
        if (userQuestion.toLowerCase().includes('rangkum') || userQuestion.toLowerCase().includes('ringkas')) {
            if (transcript) {
                const content = transcript.toLowerCase();
                let summary = "Eh bro, gue udah liat videonya nih! ";
                if (content.includes('trent') || content.includes('liverpool') || content.includes('madrid')) {
                    summary += "Jadi ceritanya ini tentang drama sepakbola ya bro. Kayaknya ada cerita tentang Trent sama klub-klub besar kayak Liverpool dan Real Madrid. ";
                }
                if (content.includes('lucu') || content.includes('drama')) {
                    summary += "Video ini seru banget sih, ada drama yang lucu-lucu gitu. ";
                }
                summary += `Dari yang gue tangkep: "${transcript.substring(0, 200)}..." `;
                summary += "Mau gue jelasin lebih detail bagian mana nih bro?";
                return summary;
            }
            else {
                return `Wah bro, video "${title}" ini menarik banget sih! Meskipun gue lagi ada masalah akses ke detail lengkapnya, tapi dari judulnya aja udah keliatan seru. Coba tanya hal spesifik yang lo mau tau ya!`;
            }
        }
        if (userQuestion.toLowerCase().includes('tentang apa') || userQuestion.toLowerCase().includes('apa isi')) {
            if (transcript) {
                return `Jadi gini bro, video ini "${title}" isinya tentang ${transcript.substring(0, 300)}... Keren kan? Ada yang pengen lo tau lebih detail?`;
            }
            else {
                return `Video "${title}" ini${channel ? ` dari channel ${channel}` : ''} kayaknya seru banget! ${description || 'Judulnya aja udah bikin penasaran.'} Lo mau tau bagian yang mana nih?`;
            }
        }
        if (userQuestion.toLowerCase().includes('poin penting') || userQuestion.toLowerCase().includes('poin utama')) {
            if (transcript) {
                return `Oke bro, poin-poin penting dari video ini: ${transcript.substring(0, 400)}... Ini baru sebagian aja sih, mau gue lanjutin jelasin yang mana?`;
            }
            else {
                return `Poin utama video "${title}" ini kayaknya menarik banget! Coba lo tanya hal spesifik yang pengen lo tau bro.`;
            }
        }
        if (transcript) {
            return `Santai bro! Gue udah nonton video "${title}" yang lo kasih. Isinya: "${transcript.substring(0, 250)}..." Mau bahas bagian yang mana nih? Gue siap jelasin!`;
        }
        else {
            return `Hey bro! Video "${title}"${channel ? ` dari ${channel}` : ''} yang lo tunjukin ke gue kayaknya seru banget! ${description || 'Judulnya aja udah bikin penasaran.'} Ada yang pengen lo bahas khusus gak?`;
        }
    }
    getFallbackResponse() {
        const responses = [
            "Eh bro, gue Cecep nih! Sistem gue lagi ada gangguan dikit, tapi gue tetap bisa bantu lo. Coba tanya hal spesifik tentang video yang udah lo analisis ya!",
            "Wah bro, koneksi gue ke AI utama lagi bermasalah nih. Tapi santai, gue masih bisa ngobrol sama lo! Ada yang mau lo tanyain tentang video tadi?",
            "Hey! Gue Cecep, meskipun lagi ada trouble teknis dikit, gue masih siap bantu lo bahas video yang udah dianalisis. Tanya aja!",
            "Bro, sistem gue lagi loading nih, tapi gue tetap di sini buat lo! Video yang lo kasih tadi menarik banget, mau bahas apa?",
            "Cecep here! Ada masalah teknis sebentar, tapi gue gak mau ninggalin lo. Yuk lanjut ngobrol tentang video yang udah kita analisis!"
        ];
        return responses[Math.floor(Math.random() * responses.length)];
    }
}
exports.ChatService = ChatService;
exports.chatService = new ChatService();
//# sourceMappingURL=chatService.js.map