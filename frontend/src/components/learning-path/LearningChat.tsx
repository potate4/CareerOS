import React, { useState, useRef, useEffect } from 'react';
import { 
  MessageCircle, 
  Send, 
  FileText, 
  Bot, 
  User,
  Loader2,
  Lightbulb,
  BookOpen,
  ExternalLink
} from 'lucide-react';
import { learningPathAPI } from '../../services/learningPathAPI';
import { ChatMessage, LearningChatRequest } from '../../types/learningPath';
import { useAuthStore } from '../../stores/authStore';

interface LearningChatProps {
  moduleId: number;
  moduleName: string;
  isOpen: boolean;
  onClose: () => void;
}

const LearningChat: React.FC<LearningChatProps> = ({ 
  moduleId, 
  moduleName, 
  isOpen, 
  onClose 
}) => {
  const { user } = useAuthStore();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Get user ID from auth store
  const getUserId = (): number => {
    if (user?.id) {
      return user.id;
    }
    // Fallback for testing if no user is logged in
    console.warn('No user logged in, using default user ID for testing');
    return 1;
  };

  // Check if user is authenticated
  const isAuthenticated = (): boolean => {
    return !!user?.id;
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Load chat history when component opens
  useEffect(() => {
    if (isOpen && moduleId) {
      loadChatHistory();
    }
  }, [isOpen, moduleId]);

  const loadChatHistory = async () => {
    try {
      const userId = getUserId();
      const history = await learningPathAPI.getChatHistory(userId, moduleId);
      
      if (history && history.length > 0) {
        // Convert backend format to frontend format
        const formattedHistory: ChatMessage[] = history.map((msg: any) => ({
          speaker: msg.speaker,
          message: msg.message,
          timestamp: msg.createdAt
        }));
        
        console.log('📚 Loaded chat history:', formattedHistory);
        
        // Replace all messages with the actual history
        setMessages(formattedHistory);
      } else {
        console.log('📚 No chat history found, adding welcome message');
        // Add welcome message if no history exists
        const welcomeMessage: ChatMessage = {
          speaker: 'ai',
          message: `Hi! I'm your AI learning assistant for the "${moduleName}" module. I can help you understand concepts, clarify doubts, and provide insights based on your learning materials. What would you like to know?`,
          timestamp: new Date().toISOString()
        };
        setMessages([welcomeMessage]);
      }
      setIsInitialized(true);
    } catch (error) {
      console.error('Failed to load chat history:', error);
      // Add welcome message on error
      const welcomeMessage: ChatMessage = {
        speaker: 'ai',
        message: `Hi! I'm your AI learning assistant for the "${moduleName}" module. I can help you understand concepts, clarify doubts, and provide insights based on your learning materials. What would you like to know?`,
        timestamp: new Date().toISOString()
      };
      setMessages([welcomeMessage]);
      setIsInitialized(true);
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    // Check authentication before sending message
    if (!isAuthenticated()) {
      setError('Please log in to use the chat feature.');
      return;
    }

    const userMessage: ChatMessage = {
      speaker: 'user',
      message: inputMessage.trim(),
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);
    setError(null);

    try {
      const userId = getUserId();
      
      // Prepare chat history for context (last 6 messages, excluding the initial welcome message)
      // Filter out the initial AI welcome message and only include actual conversation
      const actualConversation = messages.filter(msg => 
        !(msg.speaker === 'ai' && msg.message.includes("Hi! I'm your AI learning assistant"))
      );
      
      // Only send chat history if there are actual conversation messages
      let chatHistory: any[] = [];
      if (actualConversation.length > 0) {
        chatHistory = actualConversation.slice(-6).map(msg => ({
          speaker: msg.speaker,
          message: msg.message,
          timestamp: msg.timestamp
        }));
      }

      const request: LearningChatRequest = {
        userId,
        moduleId,
        userQuery: userMessage.message,
        chatHistory: chatHistory.length > 0 ? chatHistory : undefined
      };

      console.log('💬 Sending chat request:', request);
      console.log('💬 Chat history being sent:', chatHistory);

      const response = await learningPathAPI.chatWithLearningAssistant(request);

      if (response.success) {
        const aiMessage: ChatMessage = {
          speaker: 'ai',
          message: response.reply,
          timestamp: response.timestamp || new Date().toISOString()
        };

        setMessages(prev => [...prev, aiMessage]);
      } else {
        throw new Error(response.message || 'Failed to get AI response');
      }
    } catch (error: any) {
      console.error('Chat error:', error);
      setError(error.message || 'Failed to get AI response');
      
      const errorMessage: ChatMessage = {
        speaker: 'ai',
        message: 'Sorry, I encountered an error while processing your request. Please try again.',
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const suggestedQuestions = [
    "What are the key concepts in this module?",
    "Can you explain this with an example?",
    "What are the practical applications?",
    "How does this relate to my uploaded materials?"
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-gradient-to-r from-blue-50 to-purple-50 rounded-t-xl">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600">
              <MessageCircle className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-800">AI Learning Assistant</h3>
              <p className="text-sm text-slate-600">{moduleName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white transition-colors"
          >
            <span className="text-xl text-slate-500">×</span>
          </button>
        </div>

        {/* Error Display */}
        {error && (
          <div className="p-3 mx-4 mt-2 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {!isInitialized ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-slate-600">Loading chat...</span>
            </div>
          ) : (
            <>
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex gap-3 ${message.speaker === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {message.speaker === 'ai' && (
                    <div className="p-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex-shrink-0">
                      <Bot className="h-4 w-4 text-white" />
                    </div>
                  )}
                  
                  <div className={`max-w-md ${message.speaker === 'user' ? 'order-1' : ''}`}>
                    <div
                      className={`p-3 rounded-lg ${
                        message.speaker === 'user'
                          ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                          : 'bg-slate-50 border border-slate-200'
                      }`}
                    >
                      <p className="text-sm">{message.message}</p>
                    </div>
                    
                    <p className="text-xs text-slate-400 mt-1">
                      {formatTime(message.timestamp)}
                    </p>
                  </div>

                  {message.speaker === 'user' && (
                    <div className="p-2 rounded-full bg-slate-200 flex-shrink-0">
                      <User className="h-4 w-4 text-slate-600" />
                    </div>
                  )}
                </div>
              ))}

              {isLoading && (
                <div className="flex gap-3 justify-start">
                  <div className="p-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex-shrink-0">
                    <Bot className="h-4 w-4 text-white" />
                  </div>
                  <div className="bg-slate-50 border border-slate-200 p-3 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                      <span className="text-sm text-slate-600">AI is thinking...</span>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Questions */}
        {isInitialized && messages.length <= 1 && (
          <div className="p-4 border-t border-slate-200 bg-slate-50">
            <div className="flex items-center gap-2 mb-3">
              <Lightbulb className="h-4 w-4 text-yellow-600" />
              <span className="text-sm font-medium text-slate-700">Suggested Questions:</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {suggestedQuestions.map((question, idx) => (
                <button
                  key={idx}
                  onClick={() => setInputMessage(question)}
                  className="text-left p-2 text-sm text-slate-600 bg-white border border-slate-200 rounded-lg hover:border-blue-300 hover:text-blue-600 transition-colors"
                >
                  {question}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div className="p-4 border-t border-slate-200">
          {!isAuthenticated() && (
            <div className="mb-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-700">
                ⚠️ Please log in to use the chat feature. You can still view the conversation history.
              </p>
            </div>
          )}
          
          {!isInitialized ? (
            <div className="flex items-center justify-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-slate-600">Initializing chat...</span>
            </div>
          ) : (
            <>
              <div className="flex gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={isAuthenticated() ? "Ask me anything about this module..." : "Please log in to chat..."}
                  className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  disabled={isLoading || !isAuthenticated()}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim() || isLoading || !isAuthenticated()}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    !inputMessage.trim() || isLoading || !isAuthenticated()
                      ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                      : 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700'
                  }`}
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </button>
              </div>
              
              <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                <div className="flex items-center gap-1">
                  <BookOpen className="h-3 w-3" />
                  <span>Powered by your learning materials</span>
                </div>
                <div className="flex items-center gap-1">
                  <Bot className="h-3 w-3" />
                  <span>RAG-enhanced AI responses</span>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default LearningChat; 