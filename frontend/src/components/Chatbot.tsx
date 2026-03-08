import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot, User } from 'lucide-react';

interface Message {
    id: string;
    text: string;
    sender: 'user' | 'bot';
    timestamp: Date;
}

const Chatbot: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            text: "Hello! I'm PharmaTrace AI. How can I help you manage the supply chain today?",
            sender: 'bot',
            timestamp: new Date()
        }
    ]);
    const [inputValue, setInputValue] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = () => {
        if (!inputValue.trim()) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            text: inputValue,
            sender: 'user',
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        setInputValue('');

        // Mock bot response
        setTimeout(() => {
            const botMessage: Message = {
                id: (Date.now() + 1).toString(),
                text: "I'm processing your request. As a mock AI, I can help you with tracking batches, verifying authenticity, and monitoring logistics.",
                sender: 'bot',
                timestamp: new Date()
            };
            setMessages(prev => [...prev, botMessage]);
        }, 1000);
    };

    return (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
            {/* Chatbot Toggle Button */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="bg-brand-green text-black p-4 rounded-full shadow-lg hover:scale-110 transition-transform active:scale-95 flex items-center gap-2 font-bold group"
                >
                    <MessageSquare className="w-6 h-6" />
                    <span className="max-w-0 overflow-hidden group-hover:max-w-[100px] transition-all duration-300">Chat with AI</span>
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-[#0a0a0a]"></div>
                </button>
            )}

            {/* Chat Window */}
            {isOpen && (
                <div className="bg-[#111] border border-[rgba(34,197,94,0.3)] rounded-2xl w-[350px] sm:w-[400px] h-[500px] flex flex-col shadow-2xl overflow-hidden animation-fadeInUp">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-brand-green to-brand-blue p-4 flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-black/20 rounded-full flex items-center justify-center">
                                <Bot className="w-6 h-6 text-black" />
                            </div>
                            <div>
                                <h3 className="text-black font-bold">PharmaTrace Assistant</h3>
                                <p className="text-black/60 text-xs flex items-center gap-1">
                                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                                    Online
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="text-black/60 hover:text-black transition-colors"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    {/* Messages Area */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#0a0a0a]">
                        {messages.map((msg) => (
                            <div
                                key={msg.id}
                                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div className={`flex gap-2 max-w-[80%] ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.sender === 'user' ? 'bg-brand-blue/20' : 'bg-brand-green/20'
                                        }`}>
                                        {msg.sender === 'user' ? <User className="w-4 h-4 text-brand-blue" /> : <Bot className="w-4 h-4 text-brand-green" />}
                                    </div>
                                    <div className={`p-3 rounded-2xl text-sm ${msg.sender === 'user'
                                            ? 'bg-brand-blue/10 text-white rounded-tr-none border border-brand-blue/20'
                                            : 'bg-brand-green/10 text-white rounded-tl-none border border-brand-green/20'
                                        }`}>
                                        {msg.text}
                                        <div className="text-[10px] opacity-40 mt-1">
                                            {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <div className="p-4 bg-[#111] border-t border-white/5 flex gap-2">
                        <input
                            type="text"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                            placeholder="Type your message..."
                            className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-brand-green transition-colors"
                        />
                        <button
                            onClick={handleSend}
                            className="bg-brand-green text-black p-2 rounded-xl hover:brightness-110 transition-all active:scale-95"
                        >
                            <Send className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Chatbot;
