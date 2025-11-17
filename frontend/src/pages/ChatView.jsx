// frontend/src/pages/ChatView.jsx
import React, { useState, useRef, useEffect, useContext } from "react";
import { FiSend } from "react-icons/fi";
import FormattedMessage from "../components/FormattedMessage";
import { AuthContext } from "../context/AuthProvider";
import { useSpeechRecognition } from "../hooks/useSpeechRecognition";
import { MicrophoneButton } from "../components/MicrophoneButton";

const CardShell = ({ children }) => <div className="p-6 bg-gradient-to-b from-white/3 to-white/2 rounded-2xl border border-white/6 shadow-2xl">{children}</div>;
const CHAT_CATEGORY = 'chat';

export default function ChatView() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const endRef = useRef(null);
  const { token } = useContext(AuthContext);

  const {
    isListening,
    transcript,
    setTranscript,
    startListening,
    stopListening,
    hasRecognitionSupport,
  } = useSpeechRecognition();

  useEffect(() => {
    if (transcript) {
      setInput(transcript);
    }
  }, [transcript]);

  useEffect(() => {
    const fetchHistory = async () => {
      if (!token) {
        setMessages([{ role: "assistant", content: "Hi — I'm MentorBot. Please log in to save and view your chat history." }]);
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const res = await fetch(`http://127.0.0.1:8000/api/users/conversation/${CHAT_CATEGORY}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setMessages(data.messages);
        } else {
          setMessages([{ role: "assistant", content: "Hi — I'm MentorBot. Tell me the role/company and we'll start mock questions." }]);
        }
      } catch (error) {
        console.error("Failed to fetch chat history", error);
        setMessages([{ role: "assistant", content: "Could not load history. Let's start a new chat." }]);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [token]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages]);

  const saveConversation = async (updatedMessages) => {
    if (!token) return;
    try {
      await fetch("http://127.0.0.1:8000/api/users/conversation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ category: CHAT_CATEGORY, messages: updatedMessages }),
      });
    } catch (error) {
      console.error("Failed to save conversation", error);
    }
  };

  const sendMessage = async (e) => {
    e?.preventDefault?.();
    if (!input.trim() || loading) return;

    if (isListening) {
      stopListening();
    }

    const userMsg = { role: "user", content: input.trim() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setTranscript(''); // Clear transcript after sending
    setLoading(true);

    const assistantMessageIndex = newMessages.length;
    setMessages(prev => [...prev, { role: 'assistant', content: "" }]);

    try {
      const res = await fetch("http://127.0.0.1:8000/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages }),
      });
      
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let accumulatedResponse = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        accumulatedResponse += decoder.decode(value, { stream: true });
        
        setMessages(prev => {
            const updated = [...prev];
            updated[assistantMessageIndex] = { role: 'assistant', content: accumulatedResponse };
            return updated;
        });
      }
      
      const finalMessages = [...newMessages, { role: 'assistant', content: accumulatedResponse }];
      saveConversation(finalMessages);

    } catch (err) {
      console.error(err);
      const finalMessages = [...newMessages, { role: 'assistant', content: "Sorry, an error occurred." }];
      setMessages(finalMessages);
      saveConversation(finalMessages);
    } finally {
      setLoading(false);
    }
  };

  return (
    <CardShell>
        {loading && messages.length === 0 ? (
            <div className="text-center text-white/70 h-[450px] flex items-center justify-center">Loading conversation...</div>
        ) : (
            <>
                <h3 className="text-2xl font-bold mb-2">Interview Coach</h3>
                <p className="text-sm text-white/70 mb-3">Answer each question as if in a live interview. Your conversation is saved automatically.</p>
                <div className="bg-black/30 rounded-xl p-4 h-[360px] overflow-auto border border-white/6">
                    <div className="space-y-3">
                    {messages.map((m, i) => (
                        <div key={i} className={`max-w-[85%] p-3 rounded-2xl ${m.role === "user" ? "ml-auto bg-gradient-to-tr from-[#6fa66f] to-[#03d5fa] text-black" : "bg-white/5 text-white"}`}>
                          {m.role === "assistant" ? <FormattedMessage content={m.content} /> : <div>{m.content}</div>}
                        </div>
                    ))}
                    <div ref={endRef} />
                    </div>
                </div>
                <form onSubmit={sendMessage} className="mt-4 flex gap-3 items-center">
                    <input value={input} onChange={(e) => setInput(e.target.value)} placeholder={loading ? "Waiting for assistant…" : 'Type or speak your answer...'} className="flex-1 p-3 rounded-full bg-transparent border border-white/6 outline-none" disabled={loading} />
                    
                    <MicrophoneButton
                        isListening={isListening}
                        startListening={startListening}
                        stopListening={stopListening}
                        hasSupport={hasRecognitionSupport}
                    />

                    <button type="submit" disabled={loading || !input.trim()} className="px-4 py-2 rounded-full bg-gradient-to-tr from-[#6fa66f] to-[#03d5fa] text-black disabled:opacity-50">
                        <FiSend />
                    </button>
                </form>
            </>
        )}
    </CardShell>
  );
}