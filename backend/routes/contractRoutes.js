const express = require('express');
const multer = require('multer');
const pdf = require('pdf-parse');
const Tesseract = require('tesseract.js');
const { analyzeContract, askChatbot } = require('../utils/groq');
const router = express.Router();

const upload = multer({ storage: multer.memoryStorage() });

// @desc    Analyze a contract (PDF or Image)
// @route   POST /api/contracts/analyze
router.post('/analyze', upload.single('file'), async (req, res) => {
    try {
        let text = '';
        if (req.file) {
            if (req.file.mimetype === 'application/pdf') {
                const data = await pdf(req.file.buffer);
                text = data.text;
            } else if (req.file.mimetype.startsWith('image/')) {
                const { data: { text: ocrText } } = await Tesseract.recognize(req.file.buffer, 'eng');
                text = ocrText;
            } else {
                return res.status(400).json({ message: 'Unsupported file type' });
            }
        } else if (req.body.text) {
            text = req.body.text;
        }

        if (!text || text.trim().length < 50) {
            return res.status(400).json({ message: 'Contract text is too short or missing' });
        }

        const result = await analyzeContract(text.trim());
        res.json({ ...result, extractedText: text });
    } catch (error) {
        console.error('Analysis error:', error);
        let message = error.message;
        if (error.code === 'ECONNABORTED') message = 'The analysis took too long. Please try a shorter document.';
        if (error.message.includes('API key')) message = 'Invalid Groq API key. Please check your configuration.';
        res.status(500).json({ message: 'Analysis failed: ' + message });
    }
});

// @desc    Chat with AI about the contract
// @route   POST /api/contracts/chat
router.post('/chat', async (req, res) => {
    const { text, question, history } = req.body;
    try {
        const response = await askChatbot(text, question, history);
        res.json({ response });
    } catch (error) {
        console.error('Chat error:', error);
        res.status(500).json({ message: 'Chat failed' });
    }
});

module.exports = router;
