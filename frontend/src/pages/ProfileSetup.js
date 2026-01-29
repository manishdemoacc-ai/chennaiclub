import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Checkbox } from '../components/ui/checkbox';
import { Badge } from '../components/ui/badge';
import { toast } from 'sonner';
import axios from 'axios';
import { Plus, X } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const CLUBS = ['Rotaract', 'Entrepreneurship', 'Tech', 'Social', 'Cultural'];

export default function ProfileSetup() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [clubs, setClubs] = useState([]);
  const [skills, setSkills] = useState([]);
  const [needs, setNeeds] = useState([]);
  const [offers, setOffers] = useState([]);
  const [bio, setBio] = useState('');
  const [skillInput, setSkillInput] = useState('');
  const [needInput, setNeedInput] = useState('');
  const [offerInput, setOfferInput] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await axios.get(`${API}/profile/me`, {
        withCredentials: true,
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      const userData = response.data;
      setUser(userData);
      setClubs(userData.clubs || []);
      setSkills(userData.skills || []);
      setNeeds(userData.needs || []);
      setOffers(userData.offers || []);
      setBio(userData.bio || '');
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    }
  };

  const handleClubToggle = (club) => {
    setClubs(prev => 
      prev.includes(club) ? prev.filter(c => c !== club) : [...prev, club]
    );
  };

  const addItem = (value, setter, input, setInput) => {
    if (value.trim()) {
      setter(prev => [...prev, value.trim()]);
      setInput('');
    }
  };

  const removeItem = (index, setter) => {
    setter(prev => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (clubs.length === 0) {
      toast.error('Please select at least one club');
      return;
    }
    if (skills.length === 0) {
      toast.error('Please add at least one skill');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('auth_token');
      await axios.put(`${API}/profile/update`, 
        { clubs, skills, needs, offers, bio },
        {
          withCredentials: true,
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        }
      );
      toast.success('Profile updated successfully!');
      navigate('/dashboard');
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header user={user} />
      <div className="container mx-auto px-4 pt-24 pb-12">
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-3xl md:text-4xl font-bold">Complete Your Profile</h1>
            <p className="text-muted-foreground">Help others discover you by sharing your clubs, skills, and interests</p>
          </div>

          <Card data-testid="profile-setup-card">
            <CardHeader>
              <CardTitle>Select Your Clubs</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {CLUBS.map(club => (
                  <div key={club} className="flex items-center space-x-2">
                    <Checkbox
                      id={club}
                      checked={clubs.includes(club)}
                      onCheckedChange={() => handleClubToggle(club)}
                      data-testid={`club-${club.toLowerCase()}`}
                    />
                    <Label htmlFor={club} className="cursor-pointer">{club}</Label>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Your Skills</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Add a skill (e.g., Web Development)"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addItem(skillInput, setSkills, skillInput, setSkillInput))}
                  data-testid="skill-input"
                />
                <Button onClick={() => addItem(skillInput, setSkills, skillInput, setSkillInput)} data-testid="add-skill-button">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {skills.map((skill, idx) => (
                  <Badge key={idx} variant="secondary" className="pl-3 pr-1 py-1" data-testid={`skill-badge-${idx}`}>
                    {skill}
                    <button onClick={() => removeItem(idx, setSkills)} className="ml-2 hover:text-destructive">
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>What You Need</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="What are you looking for? (e.g., Co-founder)"
                  value={needInput}
                  onChange={(e) => setNeedInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addItem(needInput, setNeeds, needInput, setNeedInput))}
                  data-testid="need-input"
                />
                <Button onClick={() => addItem(needInput, setNeeds, needInput, setNeedInput)} data-testid="add-need-button">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {needs.map((need, idx) => (
                  <Badge key={idx} variant="outline" className="pl-3 pr-1 py-1" data-testid={`need-badge-${idx}`}>
                    {need}
                    <button onClick={() => removeItem(idx, setNeeds)} className="ml-2 hover:text-destructive">
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>What You Offer</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="What can you help with? (e.g., Mentorship)"
                  value={offerInput}
                  onChange={(e) => setOfferInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addItem(offerInput, setOffers, offerInput, setOfferInput))}
                  data-testid="offer-input"
                />
                <Button onClick={() => addItem(offerInput, setOffers, offerInput, setOfferInput)} data-testid="add-offer-button">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {offers.map((offer, idx) => (
                  <Badge key={idx} variant="default" className="pl-3 pr-1 py-1" data-testid={`offer-badge-${idx}`}>
                    {offer}
                    <button onClick={() => removeItem(idx, setOffers)} className="ml-2 hover:text-destructive-foreground">
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Bio</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Tell us about yourself..."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={4}
                data-testid="bio-textarea"
              />
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4">
            <Button variant="outline" onClick={() => navigate('/dashboard')} className="rounded-full">
              Skip for Now
            </Button>
            <Button onClick={handleSave} disabled={loading} className="rounded-full" data-testid="save-profile-button">
              {loading ? 'Saving...' : 'Save Profile'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
