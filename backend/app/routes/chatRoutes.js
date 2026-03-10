const express = require('express');
const router = express.Router();
const { ChatGroq } = require('@langchain/groq');
const { ChatPromptTemplate } = require('@langchain/core/prompts');
const SupplierLog = require('../models/SupplierLog');
const ManufacturerLog = require('../models/ManufacturerLog');
const DistributorLog = require('../models/DistributorLog');
const TransporterLog = require('../models/TransporterLog');
const RetailerLog = require('../models/RetailerLog');

router.post('/', async (req, res) => {
    try {
        const { message, history } = req.body;

        if (!message) {
            return res.status(400).json({ error: 'Message is required' });
        }

        // 1. Fetch recent data from all participants to build context
        const [
            recentSuppliers,
            recentManufacturers,
            recentDistributors,
            recentTransporters,
            recentRetailers
        ] = await Promise.all([
            SupplierLog.find().sort({ timestamp: -1 }).limit(5).lean(),
            ManufacturerLog.find().sort({ timestamp: -1 }).limit(5).lean(),
            DistributorLog.find().sort({ timestamp: -1 }).limit(5).lean(),
            TransporterLog.find().sort({ timestamp: -1 }).limit(5).lean(),
            RetailerLog.find().sort({ timestamp: -1 }).limit(5).lean()
        ]);

        const contextData = {
            recentSuppliers,
            recentManufacturers,
            recentDistributors,
            recentTransporters,
            recentRetailers
        };

        const contextString = JSON.stringify(contextData, null, 2);

        // 2. Initialize Langchain Groq Model
        const model = new ChatGroq({
            apiKey: process.env.GROQ_API_KEY,
            model: 'llama-3.3-70b-versatile', // Changed from modelName to model
            temperature: 0.2,
        });

        // 3. Create Prompt
        const prompt = ChatPromptTemplate.fromMessages([
            [
                "system",
                `You are PharmaTrace AI, an intelligent business assistant for a pharmaceutical supply chain tracking application.
                You have access to the latest supply chain data. Answer the user's questions based on the following context.
                If the user asks something not in the context, use your general knowledge but clarify it's not from the immediate recent data if applicable.
                
                Recent Supply Chain Data:
                {context}`
            ],
            // Append history correctly (We'll assume basic string concatenation for simplicity in standard cases)
            ["human", "{input}"]
        ]);

        // 4. Format Prompt and Invoke
        const chain = prompt.pipe(model);
        const response = await chain.invoke({
            context: contextString,
            input: message
        });

        res.json({ reply: response.content });

    } catch (error) {
        console.error('Chatbot error:', error);
        res.status(500).json({ error: 'Failed to process chat message', details: error.message, stack: error.stack });
    }
});

module.exports = router;
