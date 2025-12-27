import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Send } from 'lucide-react';
import Sidebar from '../Sidebar';
import { useAuth } from '../AuthProvider'; // Import useAuth to get device info
import API_BASE_URL from '../config';   // Import your API base URL

const KisanChatbot = () => {
    const [messages, setMessages] = useState([
        { from: 'ai', text: 'Hello! I am your Grid Sphere Farm Assistant. How can I help you today?' }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [thinkingText, setThinkingText] = useState("Scanning orchard... 🌳");
    const [conversationId, setConversationId] = useState(null); // For session tracking
    const messagesEndRef = useRef(null);

    // --- State for device context ---
    const { devices, devicesLoading } = useAuth();
    const [selectedDevice, setSelectedDevice] = useState(null);
    const [isContextLoading, setIsContextLoading] = useState(true);

    // --- Automatically select the first device ---
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
            // --- UPDATED to use the correct API endpoint and payload from your FastAPI app ---
            const API_URL = 'https://kesan.onrender.com/ap/chat';
            
            const response = await axios.post(API_URL, {
                message: question,
                device_id: selectedDevice.d_id,
                conversation_id: conversationId
            });

            // --- UPDATED to use the correct response field from your FastAPI app ---
            const { response: responseData, conversation_id } = response.data;
            setConversationId(conversation_id); 

            setMessages(prev => [...prev, { from: 'ai', text: responseData }]);

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
                {['What is the best time for watering my apple plants?', 'Are there any disease risks I should be worried about? ', 'Can you recommend organic fertilizers for apple trees? ', 'Where should I sell my Apples in Himachal Pardesh?', 'मेरे खेत में अभी मौसम कैसा है?', 'क्या आज मुझे अपने बगीचे में पानी देना चाहिए?', 'क्या मुझे किसी बीमारी की चिंता करनी चाहिए ?', 'कौन सा कीटनाशक सेब के बगीचे के लिए सुरक्षित है?'].map((q, i) => (
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
                <div className="flex-1 pt-6 p-6 overflow-y-auto">
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
                                    <span className="transition-opacity duration-500 animate-pulse">{thinkingText}</span>
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
                                placeholder={isContextLoading ? "Initializing Kisan AI..." : "Ask about your farm..."}
                                className="flex-1 px-4 bg-transparent focus:outline-none"
                                disabled={isLoading || isContextLoading}
                            />
                            <button
                                type="submit"
                                className="bg-green-600 text-white p-3 rounded-full hover:bg-green-700 disabled:bg-gray-400 transition-colors"
                                disabled={isLoading || isContextLoading || !input.trim()}
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
