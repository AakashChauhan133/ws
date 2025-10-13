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
    const [thinkingText, setThinkingText] = useState("Assessing foliage 🌿");
    const messagesEndRef = useRef(null);

    const { devices, devicesLoading } = useAuth();
    const [selectedDevice, setSelectedDevice] = useState(null);
    const [weeklyData, setWeeklyData] = useState(null);
    const [isContextLoading, setIsContextLoading] = useState(true); // NEW state for initial data load

    // Automatically select the first device
    useEffect(() => {
        if (!devicesLoading && devices.length > 0) {
            setSelectedDevice(devices[0]);
        }
    }, [devicesLoading, devices]);

    // Fetch weekly data when the device changes
    useEffect(() => {
        if (!selectedDevice) return;

        const fetchWeeklyData = async () => {
            setIsContextLoading(true); // Start loading context
            try {
                const response = await axios.get(`${API_BASE_URL}/devices/${selectedDevice.d_id}/history?range=daily`, {
                    withCredentials: true,
                });
                if (response.data.status && response.data.data.length > 0) {
                    setWeeklyData(JSON.stringify(response.data.data));
                }
            } catch (error) {
                console.error("Failed to fetch weekly data for chatbot context:", error);
            } finally {
                setIsContextLoading(false); // Finish loading context
            }
        };

        fetchWeeklyData();
    }, [selectedDevice]);


    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [messages]);

    // This effect manages the animated "thinking" text
    useEffect(() => {
        if (isLoading) {
            const phrases = [
                "Scanning orchard 🌳","Gauging climate 🌡️","Reading the soil 🌱", "Checking the leaves 🍃","Consulting records 📈", "Assessing foliage 🌿"
            ];
            let index = 0;
            const interval = setInterval(() => {
                index = (index + 1) % phrases.length;
                setThinkingText(phrases[index]);
            }, 1500);
            return () => clearInterval(interval);
        }
    }, [isLoading]);

    const handleSend = async (question) => {
        if (!question.trim() || isContextLoading) return;

        const userMessage = { from: 'user', text: question };
        setMessages(prev => [...prev, userMessage]);
        setIsLoading(true);

        try {
            const response = await axios.post('https://kesanai.onrender.com/ask', {
                question: (question + `Device ID: ${selectedDevice}`)
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
                                <div className={`p-4 rounded-2xl shadow-md max-w-[75%] ${msg.from === 'ai' ? 'bg-white text-gray-800' : 'bg-green-600 text-white'}`}>
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

