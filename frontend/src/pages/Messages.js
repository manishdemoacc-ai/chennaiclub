import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import Header from '../components/Header';
import { Card, CardContent } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { ScrollArea } from '../components/ui/scroll-area';
import { toast } from 'sonner';
import axios from 'axios';
import { Send, MessageSquare } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function Messages() {
  const { userId: selectedUserId } = useParams();
  const [user, setUser] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (selectedUserId && conversations.length > 0) {
      const conv = conversations.find(c => c.user.user_id === selectedUserId);
      if (conv) {
        handleSelectConversation(conv.user);
      }
    }
  }, [selectedUserId, conversations]);

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation.user_id);
      const interval = setInterval(() => {
        fetchMessages(selectedConversation.user_id);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [selectedConversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const config = {
        withCredentials: true,
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      };

      const [userRes, conversationsRes] = await Promise.all([
        axios.get(`${API}/profile/me`, config),
        axios.get(`${API}/messages/conversations`, config)
      ]);

      setUser(userRes.data);
      setConversations(conversationsRes.data);
    } catch (error) {
      console.error('Failed to fetch conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (otherUserId) => {
    try {
      const token = localStorage.getItem('auth_token');
      const config = {
        withCredentials: true,
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      };

      const response = await axios.get(`${API}/messages/${otherUserId}`, config);
      setMessages(response.data);
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    }
  };

  const handleSelectConversation = (conversationUser) => {
    setSelectedConversation(conversationUser);
    fetchMessages(conversationUser.user_id);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageText.trim() || !selectedConversation) return;

    setSending(true);
    try {
      const token = localStorage.getItem('auth_token');
      const config = {
        withCredentials: true,
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      };

      await axios.post(
        `${API}/messages/send`,
        { to_user_id: selectedConversation.user_id, content: messageText },
        config
      );

      setMessageText('');
      fetchMessages(selectedConversation.user_id);
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="container mx-auto px-4 pt-24 pb-12">
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header user={user} />
      <div className="container mx-auto px-4 pt-20 pb-4">
        <div className="h-[calc(100vh-6rem)] flex gap-4">
          {/* Conversations List */}
          <Card className="w-full md:w-80 flex-shrink-0" data-testid="conversations-list">
            <CardContent className="p-0 h-full flex flex-col">
              <div className="p-4 border-b">
                <h2 className="text-lg font-semibold">Messages</h2>
              </div>
              <ScrollArea className="flex-1">
                {conversations.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground">
                    <MessageSquare className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>No conversations yet</p>
                    <Link to="/connections" className="mt-4 inline-block">
                      <Button size="sm">View Connections</Button>
                    </Link>
                  </div>
                ) : (
                  <div className="p-2 space-y-1">
                    {conversations.map((conv, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSelectConversation(conv.user)}
                        className={`w-full p-3 rounded-lg hover:bg-accent transition-colors text-left ${
                          selectedConversation?.user_id === conv.user.user_id ? 'bg-accent' : ''
                        }`}
                        data-testid={`conversation-${idx}`}
                      >
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src={conv.user.picture} />
                            <AvatarFallback>{conv.user.name[0]}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold truncate">{conv.user.name}</p>
                            <p className="text-sm text-muted-foreground truncate">
                              {conv.lastMessage?.content || 'No messages yet'}
                            </p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Messages Area */}
          <Card className="flex-1" data-testid="messages-area">
            {selectedConversation ? (
              <CardContent className="p-0 h-full flex flex-col">
                {/* Chat Header */}
                <div className="p-4 border-b flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={selectedConversation.picture} />
                    <AvatarFallback>{selectedConversation.name[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <Link to={`/profile/${selectedConversation.user_id}`} className="font-semibold hover:underline">
                      {selectedConversation.name}
                    </Link>
                    <p className="text-sm text-muted-foreground">{selectedConversation.clubs?.join(', ')}</p>
                  </div>
                </div>

                {/* Messages */}
                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-4">
                    {messages.length === 0 ? (
                      <div className="text-center text-muted-foreground py-8">
                        <p>No messages yet. Start the conversation!</p>
                      </div>
                    ) : (
                      messages.map((msg, idx) => {
                        const isMe = msg.from_user_id === user?.user_id;
                        return (
                          <div key={idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`} data-testid={`message-${idx}`}>
                            <div
                              className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                                isMe
                                  ? 'bg-primary text-primary-foreground'
                                  : 'bg-secondary text-secondary-foreground'
                              }`}
                            >
                              <p className="text-sm">{msg.content}</p>
                              <p className="text-xs opacity-70 mt-1">
                                {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </p>
                            </div>
                          </div>
                        );
                      })
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>

                {/* Message Input */}
                <form onSubmit={handleSendMessage} className="p-4 border-t">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Type a message..."
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      className="flex-1"
                      data-testid="message-input"
                    />
                    <Button type="submit" disabled={sending || !messageText.trim()} data-testid="send-button">
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </form>
              </CardContent>
            ) : (
              <CardContent className="h-full flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <MessageSquare className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>Select a conversation to start messaging</p>
                </div>
              </CardContent>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
