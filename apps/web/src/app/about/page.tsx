"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Sidebar from "@/components/sidebar";
import {
  Users,
  Briefcase,
  Shield,
  Zap,
  Globe,
  Heart,
  TrendingUp,
  CheckCircle,
  ArrowRight,
  Star,
  MessageSquare,
  Wallet,
} from "lucide-react";
import { useSidebar } from "@/hooks/use-sidebar";
import { useSession } from "@/hooks/use-session";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";

const HowItWorksPage = () => {
  const { isSidebarOpen, toggleSidebar } = useSidebar();
  const { session } = useSession();

  const steps = [
    {
      icon: Users,
      title: "Join the Community",
      description:
        "Sign up and create your profile to connect with Ethiopian freelancers and clients worldwide.",
      color: "from-blue-500 to-cyan-500",
    },
    {
      icon: Briefcase,
      title: "Find or Post Work",
      description:
        "Browse available services or post your project needs. Our platform connects talent with opportunity.",
      color: "from-green-500 to-emerald-500",
    },
    {
      icon: MessageSquare,
      title: "Communicate Safely",
      description:
        "Use our built-in messaging system to discuss project details and requirements securely.",
      color: "from-purple-500 to-pink-500",
    },
    {
      icon: Wallet,
      title: "Secure Payments",
      description:
        "Complete transactions safely with our escrow system and Ethiopian Birr support.",
      color: "from-yellow-500 to-orange-500",
    },
  ];

  const problems = [
    {
      icon: Globe,
      title: "Limited Global Access",
      description:
        "Ethiopian freelancers struggle to access international platforms due to payment barriers and geographic restrictions.",
    },
    {
      icon: Shield,
      title: "Trust & Security Issues",
      description:
        "Lack of secure payment systems and verification processes creates uncertainty for both clients and freelancers.",
    },
    {
      icon: TrendingUp,
      title: "Economic Opportunities",
      description:
        "Limited platforms that understand the Ethiopian market and support local currency transactions.",
    },
  ];

  const solutions = [
    {
      icon: Heart,
      title: "Built for Ethiopia",
      description:
        "Designed specifically for the Ethiopian community with local currency support and cultural understanding.",
    },
    {
      icon: Zap,
      title: "Fast & Reliable",
      description:
        "Quick project matching, instant messaging, and efficient payment processing tailored for local needs.",
    },
    {
      icon: CheckCircle,
      title: "Verified Community",
      description:
        "Comprehensive verification system ensures trust and quality in every transaction.",
    },
  ];

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar
        currentPage="about"
        isSidebarOpen={isSidebarOpen}
        toggleSidebar={toggleSidebar}
      />

      <main
        className={`flex-1 transition-all duration-300 ${
          isSidebarOpen ? "md:ml-[200px]" : "md:ml-[60px]"
        }`}
      >
        {/* Hero Section */}
        <section className="relative py-20 px-4 md:px-8 bg-gradient-to-br from-yellow-500/10 via-orange-500/5 to-red-500/10">
          <div className="max-w-6xl mx-auto text-center space-y-6">
            <Badge className="bg-yellow-500 text-black hover:bg-yellow-600 mb-4">
              How Yalegn Works
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-yellow-500 to-orange-500 bg-clip-text text-transparent">
              Empowering Ethiopian Talent
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Yalegn is more than a freelancing platform - it's a bridge
              connecting Ethiopian talent with global opportunities, solving
              real problems faced by our community.
            </p>
            {session?.user && (
              <Link href="/profile">
                <Avatar className="h-12 w-12 mx-auto cursor-pointer border-2 border-yellow-500 hover:border-yellow-600 transition-colors">
                  <AvatarImage src={session.user.image || undefined} />
                  <AvatarFallback className="bg-yellow-500 text-black">
                    {session.user.name?.charAt(0).toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
              </Link>
            )}
          </div>
        </section>

        {/* Problems We Solve */}
        <section className="py-16 px-4 md:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Problems We Solve
              </h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Understanding the unique challenges faced by Ethiopian
                freelancers and businesses
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {problems.map((problem, index) => (
                <Card
                  key={index}
                  className="p-6 border border-red-500/20 bg-red-500/5 hover:bg-red-500/10 transition-colors"
                >
                  <CardContent className="p-0 space-y-4">
                    <div className="p-3 rounded-lg bg-red-500/20 w-fit">
                      <problem.icon className="h-6 w-6 text-red-500" />
                    </div>
                    <h3 className="text-xl font-semibold">{problem.title}</h3>
                    <p className="text-muted-foreground">
                      {problem.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works Steps */}
        <section className="py-16 px-4 md:px-8 bg-muted/30">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                How Yalegn Works
              </h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Simple steps to connect, collaborate, and succeed
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {steps.map((step, index) => (
                <div key={index} className="relative">
                  <Card className="p-6 h-full hover:shadow-lg transition-shadow">
                    <CardContent className="p-0 space-y-4">
                      <div
                        className={`p-3 rounded-lg bg-gradient-to-br ${step.color} bg-opacity-20 w-fit`}
                      >
                        <step.icon className="h-6 w-6 text-white" />
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            Step {index + 1}
                          </Badge>
                        </div>
                        <h3 className="text-xl font-semibold">{step.title}</h3>
                        <p className="text-muted-foreground">
                          {step.description}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                  {index < steps.length - 1 && (
                    <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                      <ArrowRight className="h-6 w-6 text-muted-foreground" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Our Solutions */}
        <section className="py-16 px-4 md:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Our Solutions
              </h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                How Yalegn addresses the unique needs of the Ethiopian community
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {solutions.map((solution, index) => (
                <Card
                  key={index}
                  className="p-6 border border-green-500/20 bg-green-500/5 hover:bg-green-500/10 transition-colors"
                >
                  <CardContent className="p-0 space-y-4">
                    <div className="p-3 rounded-lg bg-green-500/20 w-fit">
                      <solution.icon className="h-6 w-6 text-green-500" />
                    </div>
                    <h3 className="text-xl font-semibold">{solution.title}</h3>
                    <p className="text-muted-foreground">
                      {solution.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Impact Stats */}
        <section className="py-16 px-4 md:px-8 bg-gradient-to-br from-yellow-500/10 to-orange-500/10">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Making a Real Impact
              </h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Building bridges between Ethiopian talent and global
                opportunities
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <Card className="p-6 text-center bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/20">
                <CardContent className="p-0 space-y-2">
                  <div className="p-3 rounded-lg bg-blue-500/20 w-fit mx-auto">
                    <Users className="h-6 w-6 text-blue-500" />
                  </div>
                  <p className="text-3xl font-bold">1000+</p>
                  <p className="text-sm text-muted-foreground">Active Users</p>
                </CardContent>
              </Card>

              <Card className="p-6 text-center bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/20">
                <CardContent className="p-0 space-y-2">
                  <div className="p-3 rounded-lg bg-green-500/20 w-fit mx-auto">
                    <Briefcase className="h-6 w-6 text-green-500" />
                  </div>
                  <p className="text-3xl font-bold">500+</p>
                  <p className="text-sm text-muted-foreground">
                    Projects Completed
                  </p>
                </CardContent>
              </Card>

              <Card className="p-6 text-center bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border-yellow-500/20">
                <CardContent className="p-0 space-y-2">
                  <div className="p-3 rounded-lg bg-yellow-500/20 w-fit mx-auto">
                    <Star className="h-6 w-6 text-yellow-500" />
                  </div>
                  <p className="text-3xl font-bold">4.8</p>
                  <p className="text-sm text-muted-foreground">
                    Average Rating
                  </p>
                </CardContent>
              </Card>

              <Card className="p-6 text-center bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/20">
                <CardContent className="p-0 space-y-2">
                  <div className="p-3 rounded-lg bg-purple-500/20 w-fit mx-auto">
                    <Globe className="h-6 w-6 text-purple-500" />
                  </div>
                  <p className="text-3xl font-bold">15+</p>
                  <p className="text-sm text-muted-foreground">
                    Countries Served
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="py-16 px-4 md:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <Card className="p-8 bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border-yellow-500/20">
              <CardContent className="p-0 space-y-6">
                <h2 className="text-3xl md:text-4xl font-bold">
                  Ready to Join Yalegn?
                </h2>
                <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                  Whether you're a talented freelancer or looking for quality
                  services, Yalegn is here to connect you with the Ethiopian
                  community worldwide.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link
                    href="/signup"
                    className="inline-flex items-center justify-center px-6 py-3 bg-yellow-500 text-black font-semibold rounded-lg hover:bg-yellow-600 transition-colors"
                  >
                    Get Started Today
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                  <Link
                    href="/marketplace"
                    className="inline-flex items-center justify-center px-6 py-3 border border-border rounded-lg hover:bg-muted transition-colors"
                  >
                    Explore Marketplace
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>
    </div>
  );
};

export default HowItWorksPage;
