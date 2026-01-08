import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Send } from "lucide-react";
import { useAuth } from "../AuthProvider";
import API_BASE_URL from "../config";

const KisanChatbot = () => {
  const [messages, setMessages] = useState([
    {
      from: "ai",
      text: "Hello! I am your Grid Sphere Farm Assistant. How can I help you today?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [thinkingText, setThinkingText] = useState("Scanning orchard... 🌳");
  const [conversationId, setConversationId] = useState(null);

  const messagesEndRef = useRef(null);

  /* ---------- DEVICE CONTEXT ---------- */
  const { devices, devicesLoading } = useAuth();
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [isContextLoading, setIsContextLoading] = useState(true);

  useEffect(() => {
    if (!devicesLoading && devices.length > 0) {
      setSelectedDevice(devices[0]);
      setIsContextLoading(false);
    } else if (!devicesLoading) {
      setIsContextLoading(false);
    }
  }, [devicesLoading, devices]);

  /* ---------- SCROLL ---------- */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  /* ---------- THINKING TEXT ---------- */
  useEffect(() => {
    if (!isLoading) return;

    const phrases = [
      "Gauging climate... 🌡️",
      "Reading the soil... 🌱",
      "Checking the leaves... 🍃",
      "Consulting records... 📈",
      "Assessing foliage... 🌿",
      "Scanning orchard... 🌳",
    ];

    let index = 0;
    const interval = setInterval(() => {
      index = (index + 1) % phrases.length;
      setThinkingText(phrases[index]);
    }, 1500);

    return () => clearInterval(interval);
  }, [isLoading]);

  /* ---------- SEND MESSAGE ---------- */
  const handleSend = async (question) => {
    if (!question.trim() || isContextLoading) return;

    if (!selectedDevice) {
      setMessages((prev) => [
        ...prev,
        { from: "ai", text: "Please select a device first." },
      ]);
      return;
    }

    setMessages((prev) => [...prev, { from: "user", text: question }]);
    setIsLoading(true);

    try {
      const response = await axios.post(
        "https://kesan.onrender.com/api",
        {
          message: question,
          device_id: selectedDevice.d_id,
          conversation_id: conversationId,
        }
      );

      const { response: reply, conversation_id } = response.data;
      setConversationId(conversation_id);

      setMessages((prev) => [...prev, { from: "ai", text: reply }]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          from: "ai",
          text: "Sorry, I'm having trouble connecting. Please try again later.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleSend(input);
    setInput("");
  };

  /* ---------- QUICK QUESTIONS ---------- */
  const QuickQuestions = () => (
    <div className="mb-8">
      <h3 className="text-lg font-semibold text-gray-500 mb-3 text-center">
        Quick Questions
      </h3>
      <div className="flex flex-wrap justify-center gap-3">
        {[
          "What is the best time for watering my apple plants?",
          "Are there any disease risks I should worry about?",
          "Can you recommend organic fertilizers?",
          "Where should I sell my apples in Himachal Pradesh?",
          "मेरे खेत में अभी मौसम कैसा है?",
        ].map((q, i) => (
          <button
            key={i}
            onClick={() => handleSend(q)}
            className="bg-white border border-gray-200 px-4 py-2 rounded-full text-sm hover:bg-gray-50"
          >
            {q}
          </button>
        ))}
      </div>
    </div>
  );

  /* ---------- RENDER ---------- */
  return (
    <div className="h-full w-full bg-gradient-to-br from-gray-50 to-green-50">
      <div className="flex flex-col h-full overflow-hidden">
        {/* CHAT AREA */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-4xl mx-auto">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex my-6 ${
                  msg.from === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[75%] p-4 rounded-2xl shadow-md whitespace-pre-wrap ${
                    msg.from === "user"
                      ? "bg-green-600 text-white"
                      : "bg-white text-gray-800"
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex my-6">
                <div className="bg-white text-gray-500 p-4 rounded-2xl shadow-md animate-pulse">
                  {thinkingText}
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* INPUT */}
        <div className="p-4">
          <div className="max-w-4xl mx-auto">
            {messages.length === 1 && !isLoading && <QuickQuestions />}

            <form
              onSubmit={handleSubmit}
              className="flex items-center bg-white rounded-full shadow-md p-2"
            >
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={
                  isContextLoading
                    ? "Initializing Kisan AI..."
                    : "Ask about your farm..."
                }
                className="flex-1 px-4 bg-transparent focus:outline-none"
                disabled={isLoading || isContextLoading}
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="bg-green-600 text-white p-3 rounded-full hover:bg-green-700 disabled:bg-gray-400"
              >
                <Send className="w-5 h-5" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KisanChatbot;
