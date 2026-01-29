import Header from '../components/Header';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Link } from 'react-router-dom';
import { ArrowRight, Users, Search, Shield, Zap, MessageSquare, CheckCircle2, Building2 } from 'lucide-react';

export default function Landing() {
  return (
    <div className="min-h-screen">
      <Header />
      
      {/* Hero Section */}
      <section className="pt-32 pb-20 md:py-40 px-4 relative overflow-hidden">
        <div className="absolute inset-0 gradient-hero opacity-10 dark:opacity-20"></div>
        <div className="container mx-auto relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            <div className="md:col-span-7 space-y-6">
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-tight">
                Connecting Clubs.
                <span className="block text-primary mt-2">Empowering Collaboration.</span>
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground max-w-2xl">
                A unified networking platform for club communities in Chennai. Connect with members across Rotaract, Entrepreneurship, Tech, Social, and Cultural clubs.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Link to="/register" data-testid="hero-join-button">
                  <Button size="lg" className="rounded-full shadow-lg shadow-primary/20 hover:scale-105 transition-transform">
                    Join the Network
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
                <Link to="/discover">
                  <Button size="lg" variant="outline" className="rounded-full hover:scale-105 transition-transform">
                    Explore Connections
                  </Button>
                </Link>
              </div>
            </div>
            <div className="md:col-span-5">
              <img
                src="https://images.unsplash.com/photo-1758270705518-b61b40527e76?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzR8MHwxfHNlYXJjaHwxfHxkaXZlcnNlJTIwY29sbGVnZSUyMHN0dWRlbnRzJTIwY29sbGFib3JhdGluZyUyMGxhcHRvcHxlbnwwfHx8fDE3Njk2NjAwNzN8MA&ixlib=rb-4.1.0&q=85"
                alt="Diverse students collaborating"
                className="rounded-2xl shadow-2xl w-full hover:scale-105 transition-transform duration-500"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Problem Statement Section */}
      <section className="py-20 px-4 bg-secondary/30">
        <div className="container mx-auto">
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-12">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight">The Challenge We're Solving</h2>
            <p className="text-lg text-muted-foreground">Current barriers preventing effective collaboration</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { title: 'Isolated Clubs', desc: 'Clubs work in silos without cross-collaboration opportunities' },
              { title: 'Untapped Skills', desc: 'Valuable skills and opportunities remain underutilized' },
              { title: 'No Platform', desc: 'No centralized system for cross-club networking' }
            ].map((item, idx) => (
              <Card key={idx} className="border-2 hover:border-primary/50 transition-all hover:-translate-y-1 duration-300" data-testid={`problem-card-${idx}`}>
                <CardContent className="p-6 md:p-8 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mx-auto">
                    <span className="text-2xl">⚠️</span>
                  </div>
                  <h3 className="text-xl font-bold">{item.title}</h3>
                  <p className="text-muted-foreground">{item.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Solution Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <img
                src="https://images.unsplash.com/photo-1758270705172-07b53627dfcb?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzR8MHwxfHNlYXJjaHwyfHxkaXZlcnNlJTIwY29sbGVnZSUyMHN0dWRlbnRzJTIwY29sbGFib3JhdGluZyUyMGxhcHRvcHxlbnwwfHx8fDE3Njk2NjAwNzN8MA&ixlib=rb-4.1.0&q=85"
                alt="Community collaboration"
                className="rounded-2xl shadow-xl"
              />
            </div>
            <div className="space-y-6">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight">Our Solution</h2>
              <div className="space-y-4">
                {[
                  { icon: Building2, title: 'City-Level Platform', desc: 'Connect with club members across Chennai' },
                  { icon: Search, title: 'Smart Matching', desc: 'Skill-based and need-based connections' },
                  { icon: Zap, title: 'Direct Connections', desc: 'Smart filtering and instant messaging' }
                ].map((item, idx) => (
                  <div key={idx} className="flex gap-4" data-testid={`solution-item-${idx}`}>
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <item.icon className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-1">{item.title}</h3>
                      <p className="text-muted-foreground">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 px-4 bg-secondary/30">
        <div className="container mx-auto">
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight">How It Works</h2>
            <p className="text-lg text-muted-foreground">Get started in four simple steps</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { num: '1', title: 'Create Profile', desc: 'Sign up and build your profile' },
              { num: '2', title: 'Select Clubs & Skills', desc: 'Choose your clubs and add skills' },
              { num: '3', title: 'Add Needs or Offers', desc: 'Share what you need or offer' },
              { num: '4', title: 'Discover & Connect', desc: 'Find members and collaborate' }
            ].map((step, idx) => (
              <div key={idx} className="relative" data-testid={`step-${idx}`}>
                <Card className="hover:shadow-lg transition-all hover:-translate-y-1 duration-300">
                  <CardContent className="p-6 text-center space-y-3">
                    <div className="w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-2xl font-bold mx-auto">
                      {step.num}
                    </div>
                    <h3 className="text-lg font-bold">{step.title}</h3>
                    <p className="text-sm text-muted-foreground">{step.desc}</p>
                  </CardContent>
                </Card>
                {idx < 3 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                    <ArrowRight className="w-6 h-6 text-muted-foreground" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-12">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight">Platform Features</h2>
            <p className="text-lg text-muted-foreground">Everything you need for effective collaboration</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Search, title: 'Smart Search', desc: 'Find members by club, skills, or needs' },
              { icon: Users, title: 'Cross-Club', desc: 'Collaborate across all clubs' },
              { icon: Shield, title: 'Verified Members', desc: 'All members are verified' },
              { icon: MessageSquare, title: 'Direct Messaging', desc: 'Chat with your connections' }
            ].map((feature, idx) => (
              <Card key={idx} className="text-center hover:shadow-lg transition-all hover:-translate-y-1 duration-300" data-testid={`feature-card-${idx}`}>
                <CardContent className="p-6 space-y-3">
                  <div className="w-14 h-14 rounded-xl bg-accent/20 flex items-center justify-center mx-auto">
                    <feature.icon className="w-7 h-7 text-accent" />
                  </div>
                  <h3 className="text-lg font-bold">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="py-20 px-4 bg-secondary/30">
        <div className="container mx-auto">
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-12">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight">Real-World Use Cases</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { title: 'Event Organizers', desc: 'Find volunteers and collaborators for events', icon: '🎯' },
              { title: 'Entrepreneurs', desc: 'Discover co-founders and team members', icon: '🚀' },
              { title: 'Social Impact', desc: 'Clubs collaborate for community projects', icon: '🌍' }
            ].map((use, idx) => (
              <Card key={idx} className="hover:border-primary/50 transition-all hover:-translate-y-1 duration-300" data-testid={`usecase-card-${idx}`}>
                <CardContent className="p-8 space-y-3">
                  <div className="text-4xl mb-2">{use.icon}</div>
                  <h3 className="text-xl font-bold">{use.title}</h3>
                  <p className="text-muted-foreground">{use.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Smart City Impact */}
      <section className="py-20 px-4 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <img
            src="https://images.unsplash.com/photo-1644329770639-1a20809b82a3?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjAzNTl8MHwxfHNlYXJjaHwxfHxhYnN0cmFjdCUyMGJsdWUlMjBzbWFydCUyMGNpdHklMjBkaWdpdGFsJTIwY29ubmVjdGlvbnxlbnwwfHx8fDE3Njk2NjAwNzd8MA&ixlib=rb-4.1.0&q=85"
            alt="Smart city background"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="container mx-auto relative z-10">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight">Building Chennai's Smart City Ecosystem</h2>
            <p className="text-lg text-muted-foreground">
              Forgeit is more than a platform - it's digital social infrastructure for stronger collaboration, community building, and future disaster response coordination.
            </p>
            <div className="flex flex-wrap justify-center gap-4 pt-4">
              {['Digital Infrastructure', 'Stronger Ecosystem', 'Future Ready'].map((tag, idx) => (
                <div key={idx} className="px-4 py-2 rounded-full bg-primary/10 text-primary font-medium">
                  <CheckCircle2 className="w-4 h-4 inline mr-2" />
                  {tag}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 gradient-hero text-white">
        <div className="container mx-auto text-center space-y-6">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight">Be Part of Chennai's Connected Club Ecosystem</h2>
          <p className="text-lg md:text-xl opacity-90 max-w-2xl mx-auto">
            Join thousands of club members collaborating across Chennai
          </p>
          <Link to="/register" data-testid="cta-get-started">
            <Button size="lg" className="rounded-full bg-white text-primary hover:bg-white/90 shadow-xl hover:scale-105 transition-transform">
              Get Started
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t">
        <div className="container mx-auto text-center text-sm text-muted-foreground">
          <p>&copy; 2025 Forgeit. Connecting clubs, empowering collaboration.</p>
        </div>
      </footer>
    </div>
  );
}
