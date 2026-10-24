import { useState, useRef, useEffect } from "react";
import {
    Bot,
    Plus,
    MessageSquare,
    Settings,
    Send,
    User,
    PanelLeft,
    Minus,
    X,
    Maximize2,
    Moon,
    Sun,
    Trash2,
    Keyboard,
    Check,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { api } from "../api";
import "./Chatbot.css";

export default function Chatbot() {
    const navigate = useNavigate();
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [minimized, setMinimized] = useState(false);
    const [settingsOpen, setSettingsOpen] = useState(false);
    const [darkMode, setDarkMode] = useState(() => localStorage.getItem("openfix-chat-dark-mode") === "true");
    const [enterToSend, setEnterToSend] = useState(() => localStorage.getItem("openfix-chat-enter-send") !== "false");
    const contentRef = useRef(null);
    const inputRef = useRef(null);

    useEffect(() => {
        if (contentRef.current) {
            contentRef.current.scrollTop = contentRef.current.scrollHeight;
        }
    }, [messages, loading]);

    useEffect(() => {
        localStorage.setItem("openfix-chat-dark-mode", String(darkMode));
    }, [darkMode]);

    useEffect(() => {
        localStorage.setItem("openfix-chat-enter-send", String(enterToSend));
    }, [enterToSend]);

    async function sendMessage(e) {
        e.preventDefault();
        const text = input.trim();
        if (!text || loading) return;

        const updatedMessages = [...messages, { role: "user", content: text }];
        setMessages(updatedMessages);
        setInput("");
        setLoading(true);
        setError("");

        try {
            const data = await api.chat({ messages: updatedMessages });
            if (typeof data?.reply !== "string" || !data.reply.trim()) {
                throw new Error("The backend returned an empty or invalid AI response.");
            }
            setMessages([...updatedMessages, { role: "assistant", content: data.reply }]);
        } catch (err) {
            setError(err?.message || "Could not connect to the OpenFix AI backend.");
        } finally {
            setLoading(false);
            inputRef.current?.focus();
        }
    }

    function newChat() {
        if (loading) return;
        setMessages([]);
        setInput("");
        setError("");
        inputRef.current?.focus();
    }

    if (minimized) {
        return (
            <button
                type="button"
                className="openfix-chatbot-floating"
                onClick={() => setMinimized(false)}
                aria-label="Reopen OpenFix AI chatbot"
                title="Reopen OpenFix AI"
            >
                <Bot size={21} />
                <span>OpenFix AI</span>
                <Maximize2 size={16} />
            </button>
        );
    }

    return (
        <div className={`openfix-chat-layout${darkMode ? " openfix-chat-dark" : ""}`}>
            <aside className="openfix-chat-sidebar">
                <div className="openfix-chat-brand">
                    <div className="openfix-brand-icon"><Bot size={23} /></div>
                    <div className="openfix-brand-copy">
                        <strong>OpenFix AI</strong>
                        <span>Your AI assistant</span>
                    </div>
                </div>

                <button type="button" className="openfix-new-chat" onClick={newChat} disabled={loading}>
                    <Plus size={18} /><span>New chat</span>
                </button>

                <div className="openfix-sidebar-label">Your workspace</div>
                <div className="openfix-chat-nav active"><MessageSquare size={18} /><span>AI Chatbot</span></div>

                <div className="openfix-chat-history">
                    <p>Recent chats</p>
                    {messages.length > 0 ? (
                        <button type="button" className="openfix-history-item" title="Current conversation">
                            <MessageSquare size={15} />
                            <span>{messages.find((message) => message.role === "user")?.content || "Current conversation"}</span>
                        </button>
                    ) : (
                        <span className="openfix-history-empty">Your conversations will appear here.</span>
                    )}
                </div>

                <div className="openfix-sidebar-bottom">
                    <button type="button" className="openfix-settings-button" onClick={() => setSettingsOpen(true)} aria-haspopup="dialog" aria-expanded={settingsOpen}>
                        <Settings size={18} /><span>Settings</span>
                    </button>
                    <div className="openfix-chat-user">
                        <div className="openfix-chat-user-avatar"><User size={18} /></div>
                        <div><strong>OpenFix AI</strong><span>Programming assistant</span></div>
                    </div>
                </div>
            </aside>

            <main className="openfix-chat-main">
                <header className="openfix-chat-topbar">
                    <div className="openfix-chat-title"><PanelLeft size={19} /><span>AI Assistant</span></div>
                    <div className="openfix-chat-header-actions">
                        <span className="openfix-status"><i />{loading ? "Thinking..." : "Ready to help"}</span>
                        <button type="button" className="openfix-chat-control" onClick={() => { setSettingsOpen(false); setMinimized(true); }} aria-label="Minimize chatbot" title="Minimize to floating button"><Minus size={19} /></button>
                        <button type="button" className="openfix-chat-control openfix-chat-close" onClick={() => navigate("/")} aria-label="Close chatbot and return to OpenFix AI homepage" title="Back to homepage"><X size={19} /></button>
                    </div>
                </header>

                <section className="openfix-chat-content" ref={contentRef} aria-live="polite">
                    {messages.length === 0 ? (
                        <div className="openfix-chat-welcome">
                            <div className="openfix-welcome-icon"><Bot size={34} /></div>
                            <h1>How can I help you today?</h1>
                            <p>Ask about programming, debugging, AI, DSA, or your OpenFix project.</p>
                            <div className="openfix-suggestions">
                                {[
                                    "Explain Python in simple words",
                                    "Help me debug my React application",
                                    "Explain machine learning",
                                ].map((suggestion) => (
                                    <button type="button" key={suggestion} onClick={() => { setInput(suggestion); inputRef.current?.focus(); }}>
                                        <span>{suggestion}</span><span aria-hidden="true">→</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="openfix-message-list">
                            {messages.map((message, index) => (
                                <article className={`openfix-message ${message.role}`} key={`${message.role}-${index}`}>
                                    <div className="openfix-message-icon">{message.role === "assistant" ? <Bot size={19} /> : <User size={19} />}</div>
                                    <div className="openfix-message-body">
                                        <strong>{message.role === "assistant" ? "OpenFix AI" : "You"}</strong>
                                        <p>{message.content}</p>
                                    </div>
                                </article>
                            ))}
                            {loading && <p className="openfix-thinking"><span />OpenFix AI is thinking...</p>}
                            {error && <p className="openfix-chat-error" role="alert">{error}</p>}
                        </div>
                    )}
                </section>

                {messages.length === 0 && error && <p className="openfix-chat-error openfix-welcome-error" role="alert">{error}</p>}
                <div className="openfix-chat-composer-wrap">
                    <form className="openfix-chat-composer" onSubmit={sendMessage}>
                        <textarea
                            ref={inputRef}
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Message OpenFix AI..."
                            aria-label="Message OpenFix AI"
                            rows={1}
                            disabled={loading}
                            onKeyDown={(e) => {
                                if (enterToSend && e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
                                    e.preventDefault();
                                    e.currentTarget.form.requestSubmit();
                                }
                            }}
                        />
                        <button type="submit" disabled={loading || !input.trim()} aria-label="Send message" title="Send message"><Send size={19} /></button>
                    </form>
                    <p className="openfix-chat-disclaimer">AI can make mistakes. Verify important information.</p>
                </div>
            </main>

            {settingsOpen && (
                <div className="openfix-settings-overlay" onMouseDown={(event) => { if (event.target === event.currentTarget) setSettingsOpen(false); }}>
                    <section className="openfix-settings-modal" role="dialog" aria-modal="true" aria-labelledby="openfix-settings-title">
                        <header className="openfix-settings-modal-header">
                            <div className="openfix-settings-modal-heading">
                                <div className="openfix-settings-modal-icon"><Settings size={20} /></div>
                                <div><h2 id="openfix-settings-title">Chat settings</h2><p>Personalize your OpenFix AI experience.</p></div>
                            </div>
                            <button type="button" className="openfix-chat-control" onClick={() => setSettingsOpen(false)} aria-label="Close settings" title="Close settings"><X size={18} /></button>
                        </header>

                        <div className="openfix-settings-section-label">APPEARANCE</div>
                        <div className="openfix-settings-row">
                            <div className="openfix-settings-row-icon">{darkMode ? <Moon size={18} /> : <Sun size={18} />}</div>
                            <div className="openfix-settings-row-copy"><strong>Dark mode</strong><span>Use a darker look for the chat window.</span></div>
                            <button type="button" className={`openfix-toggle${darkMode ? " is-on" : ""}`} role="switch" aria-checked={darkMode} aria-label="Toggle dark mode" onClick={() => setDarkMode((value) => !value)}><span /></button>
                        </div>

                        <div className="openfix-settings-section-label">MESSAGING</div>
                        <div className="openfix-settings-row">
                            <div className="openfix-settings-row-icon"><Keyboard size={18} /></div>
                            <div className="openfix-settings-row-copy"><strong>Enter to send</strong><span>{enterToSend ? "Enter sends; Shift + Enter adds a new line." : "Enter adds a new line; use the send button to send."}</span></div>
                            <button type="button" className={`openfix-toggle${enterToSend ? " is-on" : ""}`} role="switch" aria-checked={enterToSend} aria-label="Toggle Enter to send" onClick={() => setEnterToSend((value) => !value)}><span /></button>
                        </div>

                        <div className="openfix-settings-section-label">CONVERSATION</div>
                        <div className="openfix-settings-row">
                            <div className="openfix-settings-row-icon danger"><Trash2 size={18} /></div>
                            <div className="openfix-settings-row-copy"><strong>Clear current chat</strong><span>Remove the messages from this conversation.</span></div>
                            <button type="button" className="openfix-settings-clear" disabled={loading || messages.length === 0} onClick={() => { newChat(); setSettingsOpen(false); }}><Trash2 size={15} /> Clear</button>
                        </div>

                        <footer className="openfix-settings-modal-footer">
                            <span><Check size={15} /> Settings apply immediately.</span>
                            <button type="button" className="openfix-settings-done" onClick={() => setSettingsOpen(false)}>Done</button>
                        </footer>
                    </section>
                </div>
            )}
        </div>
    );
}