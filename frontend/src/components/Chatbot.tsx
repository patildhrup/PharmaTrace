import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, Mic, Bot, User } from "lucide-react";

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
        if (isOpen) {
            scrollToBottom();
        }
    }, [messages, isOpen]);

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

        setTimeout(() => {
            const botMessage: Message = {
                id: (Date.now() + 1).toString(),
                text: "",
                sender: 'bot',
                timestamp: new Date()
            };
            setMessages(prev => [...prev, botMessage]);
        }, 1000);
    };

    // Keep the "Enter" key handler responsive
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center">
            <AnimatePresence mode="wait">
                {isOpen ? (
                    <motion.div
                        key="expanded"
                        initial={{ opacity: 0, y: 20, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.9 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className="w-[90vw] max-w-md bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden relative group flex flex-col h-[600px] max-h-[80vh]"
                    >
                        {/* Gradient Border for Expanded State - Optional but keeps consistency */}
                        <div className="absolute -inset-1 bg-gradient-to-r from-red-600 to-violet-600 rounded-2xl blur opacity-20 pointer-events-none w-full h-full"></div>

                        <div className="relative bg-white dark:bg-[#111] rounded-2xl flex flex-col h-full w-full">
                            {/* Header */}
                            <div className="p-6 pb-2 text-center relative shrink-0">
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="absolute top-4 right-4 p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors"
                                >
                                    <X className="w-5 h-5 text-zinc-500" />
                                </button>

                                <div className="w-20 h-20 mx-auto mb-4 rounded-full p-1 bg-gradient-to-tr from-yellow-400 to-purple-600">
                                    <div className="w-full h-full rounded-full bg-[#111] overflow-hidden flex items-center justify-center">
                                        <img
                                            src="/profile-pic.png"
                                            alt="Dhrup Patil"
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                (e.target as HTMLImageElement).style.display = 'none';
                                                (e.target as HTMLImageElement).parentElement!.innerHTML = '<span class="text-3xl">👨‍💻</span>';
                                            }}
                                        />
                                    </div>
                                </div>

                                <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-1">
                                    Hi, I am pharmmy
                                </h2>
                                <h3 className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 mb-2">
                                    what can i help you today
                                </h3>

                                <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-xs mx-auto mb-2">
                                    Let's chat
                                </p>
                            </div>

                            {/* Messages Area - Added to user's code to make it functional */}
                            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-zinc-50 dark:bg-[#0a0a0a] border-y border-zinc-100 dark:border-white/5">
                                {messages.map((msg) => (
                                    <div
                                        key={msg.id}
                                        className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                                    >
                                        <div className={`flex gap-2 max-w-[85%] ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.sender === 'user' ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white' : 'bg-gradient-to-tr from-yellow-400 to-purple-600 p-[2px]'}`}>
                                                {msg.sender === 'user' ? (
                                                    <User className="w-4 h-4" />
                                                ) : (
                                                    <div className="w-full h-full rounded-full bg-[#111] overflow-hidden flex items-center justify-center">
                                                        <img src="/profile-pic.png" alt="Avatar" className="w-full h-full object-cover" onError={(e) => {
                                                            (e.target as HTMLImageElement).style.display = 'none';
                                                            (e.target as HTMLImageElement).parentElement!.innerHTML = '<span class="text-sm">🤖</span>';
                                                        }} />
                                                    </div>
                                                )}
                                            </div>
                                            <div className={`p-3 rounded-2xl text-sm ${msg.sender === 'user'
                                                ? 'bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-tr-none shadow-md'
                                                : 'bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 rounded-tl-none border border-zinc-200 dark:border-zinc-700 shadow-sm'
                                                }`}>
                                                {msg.text}
                                                <div className={`text-[10px] mt-1 ${msg.sender === 'user' ? 'text-white/70' : 'text-zinc-500 dark:text-zinc-400'}`}>
                                                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Input Area */}
                            <div className="p-4 pt-4 shrink-0">
                                <div className="relative">
                                    {/* Gradient Border Wrapper */}
                                    <div className="p-[2px] rounded-full bg-gradient-to-r from-yellow-400 via-orange-500 to-red-600">
                                        <input
                                            type="text"
                                            value={inputValue}
                                            onChange={(e) => setInputValue(e.target.value)}
                                            onKeyDown={handleKeyDown}
                                            placeholder="Ask me anything..."
                                            className="w-full pl-12 pr-24 py-3 bg-white dark:bg-[#111] border-none rounded-full outline-none text-zinc-700 dark:text-zinc-200 placeholder-zinc-400 transition-all focus:ring-0"
                                            autoFocus
                                        />
                                    </div>
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400">
                                        <MessageCircle className="w-5 h-5 pointer-events-none" />
                                    </div>
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                                        <button className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full text-zinc-400 transition-colors">
                                            <Mic className="w-5 h-5" />
                                        </button>
                                        <button
                                            onClick={handleSend}
                                            className="p-2 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-full text-zinc-600 dark:text-zinc-300 transition-colors"
                                        >
                                            <Send className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                                <div className="text-center mt-3">
                                    <p className="text-[10px] text-zinc-400">
                                        AI can make mistakes. Please double-check responses.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        key="pill"
                        layoutId="ama-pill"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        whileHover={{ scale: 1.05 }}
                        onClick={() => setIsOpen(true)}
                        className="cursor-pointer group relative shadow-lg rounded-full"
                    >
                        {/* Glowing Gradient Border Effect - Exact implementation requested */}
                        <div className="absolute -inset-1 bg-gradient-to-r from-red-600 to-violet-600 rounded-full blur opacity-25 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>

                        <div className="relative flex items-center gap-3 pl-2 pr-6 py-2 bg-white dark:text-white dark:bg-[#111] rounded-full ring-1 ring-gray-900/5 leading-none">
                            <div className="relative w-10 h-10 rounded-full p-[2px] bg-gradient-to-tr from-yellow-400 to-purple-600">
                                <div className="w-full h-full rounded-full bg-[#111] overflow-hidden flex items-center justify-center">
                                    <img
                                        src="/profile-pic.png"
                                        alt="Avatar"
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).style.display = 'none';
                                            (e.target as HTMLImageElement).parentElement!.innerHTML = '<span class="text-xl">👨‍💻</span>';
                                        }}
                                    />
                                </div>
                            </div>
                            <span className="relative text-sm sm:text-lg font-medium text-slate-800 dark:text-zinc-200">
                                Ask me anything
                            </span>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Chatbot;
