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

interface ChatMessage {
  id: string;
  type: 'user' | 'ai';
  message: string;
  timestamp: Date;
  sources?: string[];
  relevanceScores?: number[];
}

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
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      type: 'ai',
      message: `Hi! I'm your AI learning assistant for the "${moduleName}" module. I can help you understand concepts, clarify doubts, and provide insights based on your learning materials. What would you like to know?`,
      timestamp: new Date(),
      sources: []
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

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

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      message: inputMessage.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      // TODO: Replace with actual API call
      // const response = await learningPathAPI.chatWithResources({
      //   moduleId,
      //   query: inputMessage.trim(),
      //   chatHistory: messages.slice(-6) // Last 6 messages for context
      // });

      // Simulate AI response
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        message: `This is a simulated AI response to your question: "${inputMessage.trim()}". In the actual implementation, this would be powered by RAG technology using your uploaded learning materials and module content.`,
        timestamp: new Date(),
        sources: ['Chapter 3: Advanced Concepts', 'Your uploaded notes.pdf', 'Module Resources'],
        relevanceScores: [0.95, 0.87, 0.76]
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        message: 'Sorry, I encountered an error while processing your request. Please try again.',
        timestamp: new Date()
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

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
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

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {message.type === 'ai' && (
                <div className="p-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex-shrink-0">
                  <Bot className="h-4 w-4 text-white" />
                </div>
              )}
              
              <div className={`max-w-md ${message.type === 'user' ? 'order-1' : ''}`}>
                <div
                  className={`p-3 rounded-lg ${
                    message.type === 'user'
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                      : 'bg-slate-50 border border-slate-200'
                  }`}
                >
                  <p className="text-sm">{message.message}</p>
                </div>
                
                {message.sources && message.sources.length > 0 && (
                  <div className="mt-2 space-y-1">
                    <p className="text-xs text-slate-500 font-medium">Sources:</p>
                    {message.sources.map((source, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-xs text-slate-600 bg-slate-50 p-2 rounded border">
                        <FileText className="h-3 w-3" />
                        <span className="flex-1">{source}</span>
                        {message.relevanceScores?.[idx] && (
                          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                            {(message.relevanceScores[idx] * 100).toFixed(0)}%
                          </span>
                        )}
                        <ExternalLink className="h-3 w-3 hover:text-blue-600 cursor-pointer" />
                      </div>
                    ))}
                  </div>
                )}
                
                <p className="text-xs text-slate-400 mt-1">
                  {formatTime(message.timestamp)}
                </p>
              </div>

              {message.type === 'user' && (
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

          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Questions */}
        {messages.length <= 1 && (
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
          <div className="flex gap-2">
            <input
              ref={inputRef}
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me anything about this module..."
              className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              disabled={isLoading}
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isLoading}
              className={`px-4 py-2 rounded-lg transition-colors ${
                !inputMessage.trim() || isLoading
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
        </div>
      </div>
    </div>
  );
};

export default LearningChat; 