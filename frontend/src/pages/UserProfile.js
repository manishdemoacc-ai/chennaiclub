import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Header from '../components/Header';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { toast } from 'sonner';
import axios from 'axios';
import { Mail, CheckCircle2, Clock, X } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function UserProfile() {
  const { userId } = useParams();
  const [currentUser, setCurrentUser] = useState(null);
  const [profileUser, setProfileUser] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [userId]);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const config = {
        withCredentials: true,
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      };

      const [currentUserRes, profileRes, connectionsRes] = await Promise.all([
        axios.get(`${API}/profile/me`, config),
        axios.get(`${API}/profile/${userId}`, config),
        axios.get(`${API}/connections`, config)
      ]);

      setCurrentUser(currentUserRes.data);
      setProfileUser(profileRes.data);

      const connection = connectionsRes.data.find(c => 
        (c.connection.user_id_1 === userId || c.connection.user_id_2 === userId)
      );

      if (connection) {
        setConnectionStatus({
          status: connection.connection.status,
          connectionId: connection.connection.connection_id,
          initiatedByMe: connection.connection.user_id_1 === currentUserRes.data.user_id
        });
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error);
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const config = {
        withCredentials: true,
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      };

      await axios.post(`${API}/connections/request`, { target_user_id: userId }, config);
      toast.success('Connection request sent!');
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to send connection request');
    }
  };

  const handleAccept = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const config = {
        withCredentials: true,
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      };

      await axios.post(`${API}/connections/accept/${connectionStatus.connectionId}`, {}, config);
      toast.success('Connection accepted!');
      fetchData();
    } catch (error) {
      toast.error('Failed to accept connection');
    }
  };

  const handleReject = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const config = {
        withCredentials: true,
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      };

      await axios.delete(`${API}/connections/reject/${connectionStatus.connectionId}`, config);
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
              <p className="text-muted-foreground">Loading profile...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const isOwnProfile = currentUser?.user_id === userId;

  return (
    <div className="min-h-screen bg-background">
      <Header user={currentUser} />
      <div className="container mx-auto px-4 pt-24 pb-12">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Profile Header */}
          <Card data-testid="profile-header">
            <CardContent className="p-8">
              <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
                <Avatar className="w-24 h-24">
                  <AvatarImage src={profileUser?.picture} />
                  <AvatarFallback className="text-2xl">{profileUser?.name[0]}</AvatarFallback>
                </Avatar>
                
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h1 className="text-2xl md:text-3xl font-bold">{profileUser?.name}</h1>
                    {profileUser?.verified && (
                      <Badge variant="secondary" data-testid="verified-badge">
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        Verified
                      </Badge>
                    )}
                  </div>
                  <p className="text-muted-foreground">{profileUser?.email}</p>
                </div>

                {!isOwnProfile && (
                  <div className="flex gap-2">
                    {!connectionStatus && (
                      <Button onClick={handleConnect} className="rounded-full" data-testid="connect-button">
                        Connect
                      </Button>
                    )}
                    
                    {connectionStatus?.status === 'pending' && !connectionStatus.initiatedByMe && (
                      <>
                        <Button onClick={handleAccept} className="rounded-full" data-testid="accept-button">
                          <CheckCircle2 className="w-4 h-4 mr-2" />
                          Accept
                        </Button>
                        <Button onClick={handleReject} variant="outline" className="rounded-full" data-testid="reject-button">
                          <X className="w-4 h-4 mr-2" />
                          Reject
                        </Button>
                      </>
                    )}
                    
                    {connectionStatus?.status === 'pending' && connectionStatus.initiatedByMe && (
                      <Button variant="outline" disabled className="rounded-full" data-testid="pending-button">
                        <Clock className="w-4 h-4 mr-2" />
                        Request Sent
                      </Button>
                    )}
                    
                    {connectionStatus?.status === 'accepted' && (
                      <>
                        <Badge variant="default" className="px-4 py-2">
                          <CheckCircle2 className="w-4 h-4 mr-2" />
                          Connected
                        </Badge>
                        <Link to={`/messages/${userId}`}>
                          <Button variant="outline" className="rounded-full" data-testid="message-button">
                            <Mail className="w-4 h-4 mr-2" />
                            Message
                          </Button>
                        </Link>
                      </>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Clubs */}
          {profileUser?.clubs?.length > 0 && (
            <Card data-testid="clubs-section">
              <CardContent className="p-6 space-y-3">
                <h2 className="text-lg font-semibold">Clubs</h2>
                <div className="flex flex-wrap gap-2">
                  {profileUser.clubs.map((club, idx) => (
                    <Badge key={idx} variant="secondary" className="text-sm">{club}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Skills */}
          {profileUser?.skills?.length > 0 && (
            <Card data-testid="skills-section">
              <CardContent className="p-6 space-y-3">
                <h2 className="text-lg font-semibold">Skills</h2>
                <div className="flex flex-wrap gap-2">
                  {profileUser.skills.map((skill, idx) => (
                    <Badge key={idx} variant="default" className="text-sm">{skill}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* What They Need */}
          {profileUser?.needs?.length > 0 && (
            <Card data-testid="needs-section">
              <CardContent className="p-6 space-y-3">
                <h2 className="text-lg font-semibold">Looking For</h2>
                <div className="flex flex-wrap gap-2">
                  {profileUser.needs.map((need, idx) => (
                    <Badge key={idx} variant="outline" className="text-sm">{need}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* What They Offer */}
          {profileUser?.offers?.length > 0 && (
            <Card data-testid="offers-section">
              <CardContent className="p-6 space-y-3">
                <h2 className="text-lg font-semibold">Can Help With</h2>
                <div className="flex flex-wrap gap-2">
                  {profileUser.offers.map((offer, idx) => (
                    <Badge key={idx} className="text-sm">{offer}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Bio */}
          {profileUser?.bio && (
            <Card data-testid="bio-section">
              <CardContent className="p-6 space-y-3">
                <h2 className="text-lg font-semibold">About</h2>
                <p className="text-muted-foreground leading-relaxed">{profileUser.bio}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
