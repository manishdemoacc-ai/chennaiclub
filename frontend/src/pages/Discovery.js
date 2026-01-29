import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import { Card, CardContent } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import axios from 'axios';
import { Search, Filter } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const CLUBS = ['Rotaract', 'Entrepreneurship', 'Tech', 'Social', 'Cultural'];

export default function Discovery() {
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClub, setSelectedClub] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, searchQuery, selectedClub]);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const config = {
        withCredentials: true,
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      };

      const [userRes, usersRes] = await Promise.all([
        axios.get(`${API}/profile/me`, config),
        axios.get(`${API}/discover`, config)
      ]);

      setUser(userRes.data);
      setUsers(usersRes.data);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = users;

    if (selectedClub !== 'all') {
      filtered = filtered.filter(u => u.clubs?.includes(selectedClub));
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(u => 
        u.name.toLowerCase().includes(query) ||
        u.skills?.some(s => s.toLowerCase().includes(query)) ||
        u.bio?.toLowerCase().includes(query)
      );
    }

    setFilteredUsers(filtered);
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="container mx-auto px-4 pt-24 pb-12">
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading members...</p>
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
            <h1 className="text-3xl md:text-4xl font-bold mb-2">Discover Members</h1>
            <p className="text-muted-foreground">Find and connect with club members across Chennai</p>
          </div>

          {/* Filters */}
          <Card data-testid="discovery-filters">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name, skills, or interests..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                    data-testid="search-input"
                  />
                </div>
                <Select value={selectedClub} onValueChange={setSelectedClub}>
                  <SelectTrigger data-testid="club-filter">
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Filter by club" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Clubs</SelectItem>
                    {CLUBS.map(club => (
                      <SelectItem key={club} value={club}>{club}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Results */}
          <div>
            <p className="text-sm text-muted-foreground mb-4">
              {filteredUsers.length} {filteredUsers.length === 1 ? 'member' : 'members'} found
            </p>
            
            {filteredUsers.length === 0 ? (
              <Card className="p-12 text-center">
                <p className="text-muted-foreground">No members found matching your criteria</p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredUsers.map((member, idx) => (
                  <Card key={idx} className="hover:shadow-lg transition-all hover:-translate-y-1 duration-300" data-testid={`member-card-${idx}`}>
                    <CardContent className="p-6 space-y-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-12 h-12">
                          <AvatarImage src={member.picture} />
                          <AvatarFallback>{member.name[0]}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="font-semibold">{member.name}</p>
                          {member.verified && (
                            <Badge variant="secondary" className="text-xs">Verified</Badge>
                          )}
                        </div>
                      </div>

                      {member.clubs?.length > 0 && (
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Clubs</p>
                          <div className="flex flex-wrap gap-1">
                            {member.clubs.map((club, i) => (
                              <Badge key={i} variant="outline" className="text-xs">{club}</Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {member.skills?.length > 0 && (
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Skills</p>
                          <div className="flex flex-wrap gap-1">
                            {member.skills.slice(0, 3).map((skill, i) => (
                              <Badge key={i} variant="secondary" className="text-xs">{skill}</Badge>
                            ))}
                            {member.skills.length > 3 && (
                              <Badge variant="secondary" className="text-xs">+{member.skills.length - 3}</Badge>
                            )}
                          </div>
                        </div>
                      )}

                      {member.bio && (
                        <p className="text-sm text-muted-foreground line-clamp-2">{member.bio}</p>
                      )}

                      <Link to={`/profile/${member.user_id}`} className="block">
                        <Button className="w-full rounded-full" size="sm" data-testid={`view-profile-${idx}`}>
                          View Profile
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
