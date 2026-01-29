import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { toast } from 'sonner';
import axios from 'axios';
import { CheckCircle2, X, Mail, Users } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function Connections() {
  const [user, setUser] = useState(null);
  const [acceptedConnections, setAcceptedConnections] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const config = {
        withCredentials: true,
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      };

      const [userRes, allConnectionsRes] = await Promise.all([
        axios.get(`${API}/profile/me`, config),
        axios.get(`${API}/connections`, config)
      ]);

      const currentUser = userRes.data;
      setUser(currentUser);

      const accepted = allConnectionsRes.data.filter(c => c.connection.status === 'accepted');
      const pending = allConnectionsRes.data.filter(
        c => c.connection.status === 'pending' && c.connection.user_id_2 === currentUser.user_id
      );
      const sent = allConnectionsRes.data.filter(
        c => c.connection.status === 'pending' && c.connection.user_id_1 === currentUser.user_id
      );

      setAcceptedConnections(accepted);
      setPendingRequests(pending);
      setSentRequests(sent);
    } catch (error) {
      console.error('Failed to fetch connections:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (connectionId) => {
    try {
      const token = localStorage.getItem('auth_token');
      const config = {
        withCredentials: true,
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      };

      await axios.post(`${API}/connections/accept/${connectionId}`, {}, config);
      toast.success('Connection accepted!');
      fetchData();
    } catch (error) {
      toast.error('Failed to accept connection');
    }
  };

  const handleReject = async (connectionId) => {
    try {
      const token = localStorage.getItem('auth_token');
      const config = {
        withCredentials: true,
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      };

      await axios.delete(`${API}/connections/reject/${connectionId}`, config);
      toast.success('Connection rejected');
      fetchData();
    } catch (error) {
      toast.error('Failed to reject connection');
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
      <div className="container mx-auto px-4 pt-24 pb-12">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">Your Connections</h1>
            <p className="text-muted-foreground">Manage your network and connection requests</p>
          </div>

          <Tabs defaultValue="accepted" className="w-full" data-testid="connections-tabs">
            <TabsList className="grid w-full md:w-auto md:inline-grid grid-cols-3">
              <TabsTrigger value="accepted" data-testid="accepted-tab">
                <Users className="w-4 h-4 mr-2" />
                Connected ({acceptedConnections.length})
              </TabsTrigger>
              <TabsTrigger value="pending" data-testid="pending-tab">
                Requests ({pendingRequests.length})
              </TabsTrigger>
              <TabsTrigger value="sent" data-testid="sent-tab">
                Sent ({sentRequests.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="accepted" className="space-y-4 mt-6">
              {acceptedConnections.length === 0 ? (
                <Card className="p-12 text-center">
                  <p className="text-muted-foreground">No connections yet. Start by discovering members!</p>
                  <Link to="/discover" className="mt-4 inline-block">
                    <Button>Discover Members</Button>
                  </Link>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {acceptedConnections.map(({ user: connUser, connection }, idx) => (
                    <Card key={idx} className="hover:shadow-lg transition-all" data-testid={`connection-card-${idx}`}>
                      <CardContent className="p-6 space-y-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="w-12 h-12">
                            <AvatarImage src={connUser.picture} />
                            <AvatarFallback>{connUser.name[0]}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <p className="font-semibold">{connUser.name}</p>
                            {connUser.verified && (
                              <Badge variant="secondary" className="text-xs mt-1">Verified</Badge>
                            )}
                          </div>
                        </div>

                        {connUser.clubs?.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {connUser.clubs.map((club, i) => (
                              <Badge key={i} variant="outline" className="text-xs">{club}</Badge>
                            ))}
                          </div>
                        )}

                        <div className="flex gap-2">
                          <Link to={`/profile/${connUser.user_id}`} className="flex-1">
                            <Button variant="outline" size="sm" className="w-full">View Profile</Button>
                          </Link>
                          <Link to={`/messages/${connUser.user_id}`}>
                            <Button size="sm" data-testid={`message-${idx}`}>
                              <Mail className="w-4 h-4" />
                            </Button>
                          </Link>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="pending" className="space-y-4 mt-6">
              {pendingRequests.length === 0 ? (
                <Card className="p-12 text-center">
                  <p className="text-muted-foreground">No pending requests</p>
                </Card>
              ) : (
                <div className="space-y-4">
                  {pendingRequests.map(({ user: connUser, connection }, idx) => (
                    <Card key={idx} data-testid={`pending-request-${idx}`}>
                      <CardContent className="p-6">
                        <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                          <div className="flex items-center gap-3 flex-1">
                            <Avatar className="w-12 h-12">
                              <AvatarImage src={connUser.picture} />
                              <AvatarFallback>{connUser.name[0]}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-semibold">{connUser.name}</p>
                              <p className="text-sm text-muted-foreground">{connUser.clubs?.join(', ')}</p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Link to={`/profile/${connUser.user_id}`}>
                              <Button variant="outline" size="sm">View Profile</Button>
                            </Link>
                            <Button
                              size="sm"
                              onClick={() => handleAccept(connection.connection_id)}
                              data-testid={`accept-${idx}`}
                            >
                              <CheckCircle2 className="w-4 h-4 mr-2" />
                              Accept
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleReject(connection.connection_id)}
                              data-testid={`reject-${idx}`}
                            >
                              <X className="w-4 h-4 mr-2" />
                              Reject
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="sent" className="space-y-4 mt-6">
              {sentRequests.length === 0 ? (
                <Card className="p-12 text-center">
                  <p className="text-muted-foreground">No sent requests</p>
                </Card>
              ) : (
                <div className="space-y-4">
                  {sentRequests.map(({ user: connUser, connection }, idx) => (
                    <Card key={idx} data-testid={`sent-request-${idx}`}>
                      <CardContent className="p-6">
                        <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                          <div className="flex items-center gap-3 flex-1">
                            <Avatar className="w-12 h-12">
                              <AvatarImage src={connUser.picture} />
                              <AvatarFallback>{connUser.name[0]}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-semibold">{connUser.name}</p>
                              <p className="text-sm text-muted-foreground">{connUser.clubs?.join(', ')}</p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Badge variant="secondary">Pending</Badge>
                            <Link to={`/profile/${connUser.user_id}`}>
                              <Button variant="outline" size="sm">View Profile</Button>
                            </Link>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
