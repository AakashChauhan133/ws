import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Send } from 'lucide-react';
import Sidebar from '../Sidebar';
import { useAuth } from '../AuthProvider'; // Import useAuth to get device info

const KisanChatbot = () => {
    const [messages, setMessages] = useState([
        { from: 'ai', text: 'Hello! I am your Grid Sphere Farm Assistant. How can I help you today?' }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [thinkingText, setThinkingText] = useState("Scanning orchard... 🌳");
    const messagesEndRef = useRef(null);

    // --- NEW: State for device context ---
    const { devices, devicesLoading } = useAuth();
    const [selectedDevice, setSelectedDevice] = useState(null);
    const [isContextLoading, setIsContextLoading] = useState(true);

    // --- NEW: Automatically select the first device ---
    useEffect(() => {
        if (!devicesLoading && devices.length > 0) {
            setSelectedDevice(devices[0]);
            setIsContextLoading(false); // Context is loaded
        } else if (!devicesLoading && devices.length === 0) {
            setIsContextLoading(false); // No devices, but context is "loaded"
        }
    }, [devicesLoading, devices]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [messages]);

    // This effect manages the animated "thinking" text
    useEffect(() => {
        if (isLoading) {
            const phrases = [
                "Gauging climate... 🌡️",
                "Reading the soil... 🌱",
                "Checking the leaves... 🍃",
                "Consulting records... 📈",
                "Assessing foliage... 🌿",
                "Scanning orchard... 🌳"
            ];
            let index = 0;
            const interval = setInterval(() => {
                index = (index + 1) % phrases.length;
                setThinkingText(phrases[index]);
            }, 1500); // Change text every 1.5 seconds

            return () => clearInterval(interval); // Cleanup when isLoading becomes false
        }
    }, [isLoading]);

    const handleSend = async (question) => {
        if (!question.trim() || isContextLoading) return;
        
        if (!selectedDevice) {
             setMessages(prev => [...prev, { from: 'ai', text: 'Please select a device first to get farm data.' }]);
             return;
        }

        const userMessage = { from: 'user', text: question };
        setMessages(prev => [...prev, userMessage]);
        setIsLoading(true);

        try {
            // --- MODIFIED: Send both the question and the deviceId ---
            const response = await axios.post('https://kesanai.onrender.com/ask', {
                question: question,
                deviceId: selectedDevice.d_id // Pass the selected device ID
            });
            const aiMessage = { from: 'ai', text: response.data.answer };
            setMessages(prev => [...prev, aiMessage]);
        } catch (error) {
            console.error("Error fetching response from chatbot API:", error);
            const errorMessage = { from: 'ai', text: 'Sorry, I am having trouble connecting to my brain. Please try again later.' };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleFormSubmit = (e) => {
        e.preventDefault();
        handleSend(input);
        setInput('');
    };
    
    const QuickQuestions = () => (
        <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-500 mb-3 text-center">Quick Questions</h3>
            <div className="flex flex-wrap justify-center gap-3">
                {['What is the current temperature?', 'Is it raining?', 'Give me a full weather report.'].map((q, i) => (
                    <button 
                        key={i}
                        onClick={() => handleSend(q)}
                        className="bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-full text-sm hover:bg-gray-50 transition-colors"
                    >
                        {q}
                    </button>
                ))}
            </div>
        </div>
    );

    return (
        <div className="flex h-screen w-full bg-gradient-to-br from-gray-50 to-green-50">
            {/* Desktop Sidebar */}
            <div className="hidden md:block w-64 flex-shrink-0 bg-white border-r shadow">
                <Sidebar />
            </div>

            {/* Main Chat Panel */}
            <div className="flex-1 flex flex-col overflow-hidden">
                <div className=" md:hidden">
                    <Sidebar />
                </div>
                {/* Chat History */}
                <div className="flex-1 pt-0 p-6 overflow-y-auto">
                    <div className="max-w-4xl mx-auto">
                        {messages.map((msg, index) => (
                            <div key={index} className={`flex items-start my-6 gap-3 ${msg.from === 'user' ? 'flex-row-reverse' : ''}`}>
                                <div className={`p-4 rounded-2xl shadow-md whitespace-pre-wrap max-w-[75%] ${msg.from === 'ai' ? 'bg-white text-gray-800' : 'bg-green-600 text-white'}`}>
                                    {msg.text}
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex items-start my-6 gap-3">
                                <div className="bg-white text-gray-500 p-4 rounded-2xl shadow-md">
                                    <span>{thinkingText}</span>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>
                </div>
                
                {/* Input Area */}
                <div className="p-4 bg-transparent">
                    <div className="max-w-4xl mx-auto">
                         {messages.length <= 1 && !isLoading && <QuickQuestions />}
                        <form onSubmit={handleFormSubmit} className="flex items-center bg-white rounded-full shadow-md p-2">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Ask about your farm..."
                                className="flex-1 px-4 bg-transparent focus:outline-none"
                                disabled={isLoading}
                            />
                            <button
                                type="submit"
                                className="bg-green-600 text-white p-3 rounded-full hover:bg-green-700 disabled:bg-gray-400 transition-colors"
                                disabled={isLoading || !input.trim()}
                            >
                                <Send className="h-5 w-5" />
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default KisanChatbot;

