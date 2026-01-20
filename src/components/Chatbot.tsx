import { useState, useEffect, useRef } from "react"
import { useAction, useMutation, useQuery } from "convex/react"
import { api } from "../../convex/_generated/api"
import { Button } from "./ui/button"

interface Message {
  role: "user" | "assistant"
  content: string
}

// Generate a unique session ID
function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`
}

// Get or create session ID from localStorage
function getSessionId(): string {
  const stored = localStorage.getItem("chatbot_session_id")
  if (stored) return stored

  const newId = generateSessionId()
  localStorage.setItem("chatbot_session_id", newId)
  return newId
}

export function Chatbot() {
  const [isOpen, setIsOpen] = useState(false)
  const [message, setMessage] = useState("")
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showEmailForm, setShowEmailForm] = useState(false)
  const [email, setEmail] = useState("")
  const [emailSubmitted, setEmailSubmitted] = useState(false)
  const [emailError, setEmailError] = useState("")
  const [sessionId] = useState(getSessionId)

  const messagesEndRef = useRef<HTMLDivElement>(null)

  const chat = useAction(api.chatbotAction.chat)
  const captureEmail = useMutation(api.chatbot.captureEmail)
  const session = useQuery(api.chatbot.getSession, { sessionId })
  const messageLimit = useQuery(api.chatbot.getMessageLimit)

  // Load existing messages from session
  useEffect(() => {
    if (session?.messages) {
      setMessages(
        session.messages.map((m) => ({
          role: m.role,
          content: m.content,
        }))
      )
      if (session.emailCaptured) {
        setEmailSubmitted(true)
      }
    }
  }, [session])

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSend = async () => {
    if (!message.trim() || isLoading) return

    const userMessage = message.trim()
    setMessage("")
    setIsLoading(true)

    // Add user message to UI immediately
    const newMessages: Message[] = [...messages, { role: "user", content: userMessage }]
    setMessages(newMessages)

    try {
      const result = await chat({
        sessionId,
        message: userMessage,
        conversationHistory: messages,
      })

      // Add assistant response
      setMessages((prev) => [...prev, { role: "assistant", content: result.response }])

      // Check if email is needed
      if (result.needsEmail && !emailSubmitted) {
        setShowEmailForm(true)
      }
    } catch (error) {
      console.error("Chat error:", error)
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Sorry, I'm having trouble responding. Please try again." },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setEmailError("")

    if (!email.trim()) {
      setEmailError("Please enter your email")
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setEmailError("Please enter a valid email")
      return
    }

    try {
      await captureEmail({ sessionId, email: email.trim() })
      setEmailSubmitted(true)
      setShowEmailForm(false)
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Thanks! You can now continue chatting. Feel free to ask me anything about POSTAIFY!",
        },
      ])
    } catch (error) {
      console.error("Email capture error:", error)
      setEmailError("Failed to submit email. Please try again.")
    }
  }

  const currentMessageCount = session?.messageCount || 0
  const limit = messageLimit || 5
  const remainingMessages = Math.max(0, limit - currentMessageCount)

  return (
    <>
      {/* Chat toggle button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-primary text-primary-foreground rounded-full shadow-lg hover:bg-primary/90 transition-all flex items-center justify-center"
        aria-label={isOpen ? "Close chat" : "Open chat"}
      >
        {isOpen ? (
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
          </svg>
        )}
      </button>

      {/* Chat window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-[350px] sm:w-[400px] h-[500px] bg-background border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
          {/* Header */}
          <div className="p-4 border-b border-white/10 bg-card">
            <h3 className="font-semibold text-foreground">POSTAIFY Assistant</h3>
            <p className="text-xs text-muted-foreground">
              {emailSubmitted
                ? "Ask me anything about POSTAIFY!"
                : `${remainingMessages} free messages remaining`}
            </p>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 && (
              <div className="text-center text-muted-foreground text-sm py-8">
                <p className="mb-2">Hi! I'm the POSTAIFY assistant.</p>
                <p>Ask me about features, pricing, or how to get started!</p>
              </div>
            )}

            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-card border border-white/10 text-foreground"
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-card border border-white/10 rounded-2xl px-4 py-2">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Email capture form */}
          {showEmailForm && !emailSubmitted && (
            <div className="p-4 border-t border-white/10 bg-card">
              <p className="text-sm text-muted-foreground mb-3">
                To continue chatting, please share your email:
              </p>
              <form onSubmit={handleEmailSubmit} className="space-y-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full px-4 py-2 bg-background border border-white/10 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
                {emailError && (
                  <p className="text-xs text-red-500">{emailError}</p>
                )}
                <Button type="submit" className="w-full" size="sm">
                  Continue Chatting
                </Button>
              </form>
            </div>
          )}

          {/* Input area */}
          {(!showEmailForm || emailSubmitted) && (
            <div className="p-4 border-t border-white/10">
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  handleSend()
                }}
                className="flex gap-2"
              >
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type a message..."
                  disabled={isLoading}
                  className="flex-1 px-4 py-2 bg-card border border-white/10 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
                />
                <Button
                  type="submit"
                  size="sm"
                  disabled={isLoading || !message.trim()}
                  className="px-4"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="22" y1="2" x2="11" y2="13"></line>
                    <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                  </svg>
                </Button>
              </form>
            </div>
          )}
        </div>
      )}
    </>
  )
}
