import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import axios from 'axios';
import { Users, MessageSquare, CheckCircle2, ArrowRight, AlertCircle } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [connections, setConnections] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
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

      const [userRes, connectionsRes, pendingRes] = await Promise.all([
        axios.get(`${API}/profile/me`, config),
        axios.get(`${API}/connections?status=accepted`, config),
        axios.get(`${API}/connections?status=pending`, config)
      ]);

      setUser(userRes.data);
      setConnections(connectionsRes.data);
      setPendingRequests(pendingRes.data.filter(c => c.connection.user_id_2 === userRes.data.user_id));
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
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
        <div className="space-y-8">
          {/* Profile Completion Alert */}
          {!user?.profile_completed && (
            <Card className="border-primary/50 bg-primary/5" data-testid="profile-incomplete-alert">
              <CardContent className="p-6 flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-3">
                  <AlertCircle className="w-6 h-6 text-primary" />
                  <div>
                    <p className="font-semibold">Complete your profile to get discovered</p>
                    <p className="text-sm text-muted-foreground">Add your clubs, skills, and interests</p>
                  </div>
                </div>
                <Link to="/profile/setup">
                  <Button data-testid="complete-profile-button">
                    Complete Profile
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}

          {/* Welcome Section */}
          <div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">Welcome back, {user?.name}!</h1>
            <p className="text-muted-foreground">Here's what's happening in your network</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="hover:shadow-lg transition-all" data-testid="stat-connections">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Connections</p>
                    <p className="text-3xl font-bold mt-1">{connections.length}</p>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Users className="w-6 h-6 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-all" data-testid="stat-pending">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Pending Requests</p>
                    <p className="text-3xl font-bold mt-1">{pendingRequests.length}</p>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center">
                    <AlertCircle className="w-6 h-6 text-accent" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-all" data-testid="stat-clubs">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Your Clubs</p>
                    <p className="text-3xl font-bold mt-1">{user?.clubs?.length || 0}</p>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center">
                    <CheckCircle2 className="w-6 h-6 text-foreground" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-all" data-testid="stat-skills">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Skills</p>
                    <p className="text-3xl font-bold mt-1">{user?.skills?.length || 0}</p>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center">
                    <MessageSquare className="w-6 h-6 text-accent" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Profile Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2" data-testid="profile-overview">
              <CardHeader>
                <CardTitle>Your Profile</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground mb-2">Clubs</h3>
                  <div className="flex flex-wrap gap-2">
                    {user?.clubs?.length > 0 ? (
                      user.clubs.map((club, idx) => (
                        <Badge key={idx} variant="secondary">{club}</Badge>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">No clubs added yet</p>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground mb-2">Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {user?.skills?.length > 0 ? (
                      user.skills.map((skill, idx) => (
                        <Badge key={idx} variant="default">{skill}</Badge>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">No skills added yet</p>
                    )}
                  </div>
                </div>

                {user?.bio && (
                  <div>
                    <h3 className="text-sm font-semibold text-muted-foreground mb-2">Bio</h3>
                    <p className="text-sm">{user.bio}</p>
                  </div>
                )}

                <Link to="/profile/setup">
                  <Button variant="outline" size="sm" className="mt-2" data-testid="edit-profile-button">
                    Edit Profile
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card data-testid="quick-actions">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link to="/discover" className="block">
                  <Button variant="outline" className="w-full justify-start" data-testid="discover-members-button">
                    <Users className="w-4 h-4 mr-2" />
                    Discover Members
                  </Button>
                </Link>
                <Link to="/connections" className="block">
                  <Button variant="outline" className="w-full justify-start" data-testid="view-connections-button">
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    View Connections
                  </Button>
                </Link>
                <Link to="/messages" className="block">
                  <Button variant="outline" className="w-full justify-start" data-testid="messages-button">
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Messages
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>

          {/* Recent Connections */}
          {connections.length > 0 && (
            <Card data-testid="recent-connections">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Recent Connections</CardTitle>
                  <Link to="/connections">
                    <Button variant="ghost" size="sm">View All</Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {connections.slice(0, 3).map(({ user: connUser }, idx) => (
                    <Link key={idx} to={`/profile/${connUser.user_id}`} className="flex items-center gap-4 p-3 rounded-lg hover:bg-accent/50 transition-colors">
                      <Avatar>
                        <AvatarImage src={connUser.picture} />
                        <AvatarFallback>{connUser.name[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="font-semibold">{connUser.name}</p>
                        <p className="text-sm text-muted-foreground">{connUser.clubs?.join(', ')}</p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-muted-foreground" />
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
