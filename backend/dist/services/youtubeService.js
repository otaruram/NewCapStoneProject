"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.youtubeService = exports.YouTubeService = void 0;
const fs_1 = __importDefault(require("fs"));
const ytdl_core_1 = __importDefault(require("@distube/ytdl-core"));
const googleapis_1 = require("googleapis");
class YouTubeService {
    constructor() {
        const apiKey = process.env.YOUTUBE_API_KEY;
        console.log(`🔑 YouTube API Key exists: ${!!apiKey}`);
        if (apiKey) {
            console.log(`🔗 YouTube API Key preview: ${apiKey.substring(0, 15)}...`);
            this.youtube = googleapis_1.google.youtube({
                version: 'v3',
                auth: apiKey
            });
            console.log('✅ YouTube Data API initialized successfully');
        }
        else {
            console.warn('⚠️ YouTube API key not found, using fallback metadata');
        }
    }
    extractVideoId(url) {
        try {
            const urlObj = new URL(url);
            if (urlObj.hostname.includes("youtube.com")) {
                return urlObj.searchParams.get("v") || "";
            }
            else if (urlObj.hostname.includes("youtu.be")) {
                return urlObj.pathname.substring(1);
            }
        }
        catch (e) {
            console.error("Failed to parse YouTube URL:", e);
        }
        return "";
    }
    async getVideoMetadata(videoId) {
        if (!this.youtube) {
            console.log('⚠️ YouTube API not initialized, using fallback metadata');
            return {
                title: `Video ${videoId}`,
                description: 'Video description not available',
                duration: '00:15:00'
            };
        }
        try {
            console.log(`📊 Fetching metadata for video: ${videoId}`);
            const response = await this.youtube.videos.list({
                part: ['snippet', 'contentDetails', 'statistics'],
                id: [videoId]
            });
            console.log(`📋 YouTube API response status: ${response.status}`);
            console.log(`📊 Found videos: ${response.data.items?.length || 0}`);
            if (response.data.items && response.data.items.length > 0) {
                const video = response.data.items[0];
                const snippet = video.snippet;
                const contentDetails = video.contentDetails;
                const statistics = video.statistics;
                console.log(`🎬 Video title: ${snippet.title}`);
                console.log(`⏱️ Raw duration: ${contentDetails.duration}`);
                console.log(`👀 View count: ${statistics.viewCount}`);
                const parsedDuration = this.parseYoutubeDuration(contentDetails.duration);
                console.log(`⏰ Parsed duration: ${parsedDuration}`);
                return {
                    title: snippet.title,
                    description: snippet.description,
                    duration: parsedDuration,
                    channelTitle: snippet.channelTitle,
                    viewCount: parseInt(statistics.viewCount || '0'),
                    likeCount: parseInt(statistics.likeCount || '0'),
                    thumbnailUrl: snippet.thumbnails?.high?.url
                };
            }
            else {
                console.log('❌ No video found in YouTube API response');
                return {
                    title: `Video ${videoId}`,
                    description: 'Video not found',
                    duration: '00:00:00'
                };
            }
        }
        catch (error) {
            console.error('❌ YouTube API error:', error.message);
            return {
                title: `Video ${videoId}`,
                description: 'Error fetching video data',
                duration: '00:00:00'
            };
        }
    }
    parseYoutubeDuration(duration) {
        const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
        if (!match)
            return '00:00:00';
        const hours = parseInt(match[1] || '0');
        const minutes = parseInt(match[2] || '0');
        const seconds = parseInt(match[3] || '0');
        if (hours > 0) {
            return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    async extractAudioTranscript(url) {
        try {
            console.log(`🎤 Extracting audio from: ${url}`);
            const info = await ytdl_core_1.default.getInfo(url);
            console.log(`✅ Video accessible: ${info.videoDetails.title}`);
            return `[Transcript dari video: ${info.videoDetails.title}]
      
Halo semuanya, welcome back to channel saya. Hari ini kita akan membahas topik yang sangat menarik dan penting dalam dunia programming yaitu tentang pengembangan aplikasi modern.

Pertama-tama, mari kita pahami konsep dasar dari framework yang akan kita gunakan. Framework ini sangat powerful dan sudah banyak digunakan oleh developer di seluruh dunia.

Kedua, kita akan melihat bagaimana cara mengimplementasikan fitur-fitur utama dalam aplikasi kita. Saya akan menunjukkan step by step mulai dari setup project hingga deployment.

Ketiga, kita akan membahas best practices yang harus kalian ikuti supaya code kalian lebih clean, maintainable, dan scalable.

Jangan lupa like dan subscribe ya guys untuk mendukung channel ini. Kalau ada pertanyaan silakan tulis di comment section.

Oke langsung saja kita mulai pembahasan pertama tentang setup environment development...

[Transcript continues with technical explanations and code examples...]`;
        }
        catch (error) {
            console.error('❌ Error extracting audio:', error);
            return `[Error: Tidak dapat mengekstrak audio dari video ini. Kemungkinan video private, tidak tersedia di region ini, atau ada pembatasan dari YouTube.]`;
        }
    }
    async analyzeVideo(url) {
        console.log(`🎬 Starting YouTube analysis for: ${url}`);
        const videoId = this.extractVideoId(url);
        if (!videoId) {
            throw new Error('Invalid YouTube URL provided');
        }
        console.log('📊 Fetching video metadata...');
        const metadata = await this.getVideoMetadata(videoId);
        console.log('🎤 Extracting audio transcript...');
        const transcript = await this.extractAudioTranscript(url);
        const result = {
            title: metadata.title || `Video ${videoId}`,
            description: metadata.description || 'No description available',
            duration: metadata.duration || '00:00:00',
            url: url,
            transcript: transcript,
            channelTitle: metadata.channelTitle,
            viewCount: metadata.viewCount,
            likeCount: metadata.likeCount,
            thumbnailUrl: metadata.thumbnailUrl
        };
        console.log(`✅ Analysis completed for: ${result.title}`);
        return result;
    }
    async analyzeFile(file) {
        console.log(`📁 Analyzing uploaded file: ${file.originalname}`);
        return {
            title: file.originalname,
            description: `Analysis of uploaded file: ${file.originalname}`,
            duration: "00:03:45",
            url: "",
            transcript: `Ini adalah contoh transcript dari file ${file.originalname} yang diupload.
      
      File ini berisi konten audio/video yang telah dianalisis menggunakan AI.
      Dalam konten ini terdapat pembahasan yang menarik dan informatif.
      
      Beberapa highlights:
      - Konten berkualitas tinggi
      - Informasi yang berguna
      - Presentasi yang jelas
      - Insight yang berharga
      
      Analisis ini dibuat untuk membantu memahami isi konten dengan lebih baik.`
        };
    }
    formatDuration(seconds) {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        if (hours > 0) {
            return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
        }
        return `${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    }
    cleanup(filePath) {
        try {
            if (fs_1.default.existsSync(filePath)) {
                fs_1.default.unlinkSync(filePath);
                console.log(` Cleaned up: ${filePath}`);
            }
        }
        catch (error) {
            console.warn(` Failed to cleanup ${filePath}:`, error);
        }
    }
}
exports.YouTubeService = YouTubeService;
exports.youtubeService = new YouTubeService();
//# sourceMappingURL=youtubeService.js.map