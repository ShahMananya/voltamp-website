import React, { useState } from "react";
import { Link, useLocation } from "wouter";
import {
  BookOpen,
  ArrowRight,
  ArrowLeft,
  Mail,
  Sparkles,
  PhoneCall,
  Clock,
  Layers,
  Calculator,
  Handshake,
  CheckCircle2,
} from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  category: string;
  author: string;
  date: string;
  readTime: string;
  excerpt: string;
  content: string;
  tags?: string[];
  imageUrl?: string;
}

// Ready for you to provide blog posts:
export const BLOG_POSTS: BlogPost[] = [];

export default function BlogPage() {
  const [, navigate] = useLocation();
  const supportPhone = "9512365582";

  const [email, setEmail] = useState("");
  const subscribeMutation = trpc.newsletter.subscribe.useMutation({
    onSuccess: (data) => {
      setEmail("");
      toast.success("You're on the list!", {
        description: `We'll email you at ${data.email} as soon as our first article is published.`,
      });
    },
    onError: (err) => {
      toast.error("Subscription failed", {
        description: err.message || "Please enter a valid email address.",
      });
    },
  });

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = email.trim();
    if (!clean || !clean.includes("@")) {
      toast.error("Please enter a valid email address.");
      return;
    }
    subscribeMutation.mutate({ email: clean });
  };

  return (
    <div className="min-h-screen bg-[#fcfaf7] text-[#102a40] font-['Inter',sans-serif] flex flex-col">
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#ebd8ca]">
        <div className="market-container flex items-center justify-between h-16 sm:h-20">
          <div className="flex items-center gap-3 sm:gap-5">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-stone-600 hover:text-[#c46b19] transition-colors py-1.5 px-2.5 rounded-lg hover:bg-stone-100"
            >
              <ArrowLeft className="size-4" />
              <span>Back to Marketplace</span>
            </Link>

            <div className="h-5 w-px bg-stone-200 hidden sm:block" />

            <Link href="/" className="flex items-center gap-2">
              <img
                src="/volamp-logo.png"
                alt="VOLAMP Elektrikals"
                className="h-8 sm:h-9 w-auto object-contain"
              />
            </Link>
          </div>

          <div className="flex items-center gap-2.5 sm:gap-3">
            <Link
              href="/calculator"
              className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-stone-700 hover:text-[#c46b19] hover:bg-stone-100 transition-colors"
            >
              <Calculator className="size-3.5 text-[#c46b19]" />
              <span>Cable Calculator</span>
            </Link>

            <Link
              href="/collaborate"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-stone-700 hover:text-[#c46b19] hover:bg-stone-100 transition-colors"
            >
              <Handshake className="size-3.5 text-[#c46b19]" />
              <span>Collaborate</span>
            </Link>

            <a
              href={`tel:+91${supportPhone}`}
              className="hidden md:inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-[#c46b19] text-xs font-bold hover:bg-amber-100 transition-colors"
            >
              <PhoneCall className="size-3.5" />
              <span>Supply Desk: +91 {supportPhone}</span>
            </a>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-b from-[#fbf4ee] via-[#faf6f2] to-[#fcfaf7] border-b border-[#ebd7c7] py-12 sm:py-16">
          <div className="market-container max-w-4xl text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-[#e5d2c2] shadow-sm text-xs font-bold text-[#c46b19] uppercase tracking-wider">
              <BookOpen className="size-3.5 text-[#c46b19]" />
              <span>VOLAMP JOURNAL & EDITORIAL DESK</span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-[#102a40] font-['Space_Grotesk'] leading-tight">
              Volamp <span className="text-[#c46b19]">Journal</span>
            </h1>

            <p className="text-sm sm:text-base text-[#4a5f6e] max-w-2xl mx-auto leading-relaxed">
              Official publications, technical cable sizing guides, electrical compliance breakdowns, and project dispatch dispatches from Volamp Elektrikals.
            </p>
          </div>
        </section>

        {/* Content Section: Empty State Ready for User Blogs */}
        <section className="market-container max-w-4xl py-12 sm:py-16">
          {BLOG_POSTS.length === 0 ? (
            <div className="bg-white rounded-3xl p-8 sm:p-14 border border-[#dfd4c7] shadow-xl text-center space-y-8">
              {/* Glowing Icon */}
              <div className="relative mx-auto size-20">
                <div className="absolute inset-0 rounded-2xl bg-amber-500/15 animate-ping opacity-75" />
                <div className="relative size-20 rounded-2xl bg-gradient-to-br from-amber-500 to-[#c46b19] text-white flex items-center justify-center shadow-lg shadow-amber-500/20">
                  <BookOpen className="size-10" />
                </div>
              </div>

              <div className="space-y-3 max-w-lg mx-auto">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold uppercase tracking-wider">
                  <Clock className="size-3.5 text-[#c46b19]" />
                  <span>Articles In Preparation</span>
                </span>

                <h2 className="text-2xl sm:text-3xl font-bold text-[#102a40] font-['Space_Grotesk']">
                  New Articles Coming Soon
                </h2>

                <p className="text-xs sm:text-sm text-[#5a6e7c] leading-relaxed">
                  Our technical editorial desk is curating the first edition of project case studies, cable engineering notes, and industry insights.
                </p>
              </div>

              {/* Upcoming Topic Categories */}
              <div className="p-6 rounded-2xl bg-[#faf7f3] border border-[#e5dcd1] max-w-xl mx-auto text-left space-y-3">
                <span className="text-[11px] font-bold text-[#788a97] uppercase tracking-wider block">
                  UPCOMING TOPICS & SERIES:
                </span>
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1.5 rounded-lg bg-white border border-[#e0d6cb] text-xs font-medium text-[#2d4353]">
                    ⚡ Cable Sizing & Ampacity Engineering
                  </span>
                  <span className="px-3 py-1.5 rounded-lg bg-white border border-[#e0d6cb] text-xs font-medium text-[#2d4353]">
                    📜 Bureau of Indian Standards (IS 694 / 1554 / 7098)
                  </span>
                  <span className="px-3 py-1.5 rounded-lg bg-white border border-[#e0d6cb] text-xs font-medium text-[#2d4353]">
                    ☀️ Solar DC 1500V Evacuation Systems
                  </span>
                  <span className="px-3 py-1.5 rounded-lg bg-white border border-[#e0d6cb] text-xs font-medium text-[#2d4353]">
                    🏢 Zero-Halogen Flame Retardant (ZHFR) Life Safety
                  </span>
                  <span className="px-3 py-1.5 rounded-lg bg-white border border-[#e0d6cb] text-xs font-medium text-[#2d4353]">
                    🏗️ Industrial Project Dispatch Case Studies
                  </span>
                </div>
              </div>

              {/* Newsletter Notification Signup */}
              <div className="max-w-md mx-auto pt-2 space-y-3">
                <strong className="text-xs font-bold text-[#102a40] block">
                  Get notified when the first article is published:
                </strong>

                <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-2">
                  <Input
                    required
                    type="email"
                    placeholder="Enter your work email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-[#fbf9f6] border-[#dcd0c4] rounded-xl text-xs sm:text-sm focus:bg-white"
                  />
                  <Button
                    type="submit"
                    disabled={subscribeMutation.isPending}
                    className="bg-[#c46b19] hover:bg-[#b05d12] text-white font-bold text-xs py-2.5 px-5 rounded-xl shrink-0 cursor-pointer shadow-md shadow-amber-600/10"
                  >
                    {subscribeMutation.isPending ? "Subscribing..." : "Notify Me"}
                  </Button>
                </form>

                <span className="text-[11px] text-[#788a97] block">
                  Zero spam. Technical engineering dispatches only.
                </span>
              </div>

              {/* Quick Actions */}
              <div className="pt-4 border-t border-[#eee3d7] flex flex-wrap items-center justify-center gap-3">
                <Link
                  href="/"
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#102a40] hover:bg-[#1a3d5a] text-white text-xs font-bold transition-colors"
                >
                  <span>Explore Product Catalog</span>
                  <ArrowRight className="size-3.5" />
                </Link>

                <Link
                  href="/calculator"
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white border border-[#dcd0c4] hover:bg-stone-50 text-stone-700 text-xs font-semibold transition-colors"
                >
                  <Calculator className="size-3.5 text-[#c46b19]" />
                  <span>Cable Size Estimator</span>
                </Link>

                <Link
                  href="/collaborate"
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white border border-[#dcd0c4] hover:bg-stone-50 text-stone-700 text-xs font-semibold transition-colors"
                >
                  <Handshake className="size-3.5 text-[#c46b19]" />
                  <span>Collaborate With Us</span>
                </Link>
              </div>
            </div>
          ) : (
            /* Render published posts when populated */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {BLOG_POSTS.map((post) => (
                <article
                  key={post.id}
                  className="bg-white rounded-2xl p-6 border border-[#e5dcd1] shadow-sm hover:shadow-lg transition-all"
                >
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#c46b19] bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                    {post.category}
                  </span>
                  <h3 className="text-lg font-bold text-[#102a40] mt-2 mb-1">
                    {post.title}
                  </h3>
                  <p className="text-xs text-[#5a6e7c] line-clamp-3 mb-4">
                    {post.excerpt}
                  </p>
                  <div className="flex items-center justify-between text-xs text-[#788a97] pt-3 border-t border-[#eee5dc]">
                    <span>{post.author}</span>
                    <span>{post.readTime}</span>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Footer */}
      <footer className="site-footer bg-[#0d2233] text-white">
        <div className="market-container py-10 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-800 text-xs text-slate-400">
          <div className="flex items-center gap-3">
            <img
              src="/volamp-logo.png"
              alt="VOLAMP Elektrikals"
              className="h-6 w-auto brightness-200"
            />
            <span>Volamp Elektrikals © 2026. All rights reserved.</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/" className="hover:text-amber-400 transition-colors">
              Marketplace
            </Link>
            <Link href="/about-volamp" className="hover:text-amber-400 transition-colors">
              About Us
            </Link>
            <Link href="/business-segments" className="hover:text-amber-400 transition-colors">
              Business Segments
            </Link>
            <Link href="/collaborate" className="hover:text-amber-400 transition-colors">
              Collaborate
            </Link>
            <a href={`tel:+91${supportPhone}`} className="hover:text-amber-400 transition-colors">
              Support: {supportPhone}
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
