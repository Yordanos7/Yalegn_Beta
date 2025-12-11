"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Sidebar from "@/components/sidebar";
import {
  Users,
  Briefcase,
  Shield,
  Heart,
  TrendingUp,
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

        {/* About Yalegn - Clean Typography Section */}
        <section className="py-20 px-4 md:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="space-y-12">
              {/* Main Description */}
              <div className="text-center space-y-6">
                <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
                  About <span className="text-yellow-500">Yalegn</span>
                </h2>
                <div className="w-24 h-1 bg-yellow-500 mx-auto rounded-full"></div>
              </div>

              {/* Story Content */}
              <div className="prose prose-lg max-w-none text-center space-y-8">
                <p className="text-xl md:text-2xl leading-relaxed text-foreground font-light">
                  Yalegn is a revolutionary freelancing platform designed
                  specifically for the Ethiopian community, bridging the gap
                  between local talent and global opportunities.
                </p>

                <div className="grid md:grid-cols-2 gap-12 text-left mt-16">
                  <div className="space-y-6">
                    <h3 className="text-2xl font-semibold text-yellow-500 mb-4">
                      Our Mission
                    </h3>
                    <p className="text-lg leading-relaxed text-muted-foreground">
                      To empower Ethiopian freelancers by providing them with a
                      secure, culturally-aware platform that understands their
                      unique needs and challenges. We believe in creating
                      economic opportunities that keep talent connected to their
                      roots while reaching global markets.
                    </p>
                  </div>

                  <div className="space-y-6">
                    <h3 className="text-2xl font-semibold text-yellow-500 mb-4">
                      Our Vision
                    </h3>
                    <p className="text-lg leading-relaxed text-muted-foreground">
                      To become the leading platform where Ethiopian talent
                      thrives, fostering a community where freelancers can build
                      sustainable careers while contributing to the growth of
                      Ethiopia's digital economy and maintaining strong cultural
                      connections.
                    </p>
                  </div>
                </div>

                <div className="mt-16 p-8 bg-muted/50 rounded-2xl">
                  <h3 className="text-2xl font-semibold mb-6 text-center">
                    Why Yalegn Matters
                  </h3>
                  <div className="grid md:grid-cols-3 gap-8 text-center">
                    <div className="space-y-3">
                      <div className="w-12 h-12 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto">
                        <Heart className="h-6 w-6 text-yellow-500" />
                      </div>
                      <h4 className="font-semibold">Built with Love</h4>
                      <p className="text-sm text-muted-foreground">
                        Created by Ethiopians, for Ethiopians, with deep
                        understanding of our culture and needs.
                      </p>
                    </div>

                    <div className="space-y-3">
                      <div className="w-12 h-12 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto">
                        <Shield className="h-6 w-6 text-yellow-500" />
                      </div>
                      <h4 className="font-semibold">Trust & Security</h4>
                      <p className="text-sm text-muted-foreground">
                        Comprehensive verification and secure payment systems
                        designed for the Ethiopian market.
                      </p>
                    </div>

                    <div className="space-y-3">
                      <div className="w-12 h-12 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto">
                        <TrendingUp className="h-6 w-6 text-yellow-500" />
                      </div>
                      <h4 className="font-semibold">Economic Growth</h4>
                      <p className="text-sm text-muted-foreground">
                        Supporting Ethiopia's digital transformation and
                        creating sustainable income opportunities.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-16 text-center">
                  <p className="text-xl italic text-muted-foreground">
                    "Connecting Ethiopian talent with the world, one project at
                    a time."
                  </p>
                </div>
              </div>
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
