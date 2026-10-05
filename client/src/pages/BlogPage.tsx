import React, { useState } from "react";
import { Link, useLocation } from "wouter";
import {
  BookOpen,
  ArrowRight,
  Clock,
  Calculator,
  Handshake,
} from "lucide-react";
import UniversalHeader from "@/components/layout/UniversalHeader";
import UniversalFooter from "@/components/layout/UniversalFooter";
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
    <div className="min-h-screen bg-[#fdfbf9] text-[#0b1f33] font-['Plus_Jakarta_Sans',sans-serif] flex flex-col">
      {/* Universal Header */}
      <UniversalHeader currentPage="blog" />

      <main className="flex-1 bg-[#fdfbf9]">
        {/* Warm Cream Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-b from-[#fbf8f5] to-[#fdfbf9] border-b border-[#ebd7c7] py-14 sm:py-18">
          <div className="market-container max-w-4xl text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#f7ede6] border border-[#ebd4c2] text-xs font-bold text-[#c56718] uppercase tracking-wider backdrop-blur-sm">
              <BookOpen className="size-3.5 text-[#c56718]" />
              <span>VOLAMP JOURNAL & EDITORIAL DESK</span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-[#4d1217] font-['Plus_Jakarta_Sans',sans-serif] leading-tight">
              Volamp <span className="text-[#c56718]">Journal</span>
            </h1>

            <p className="text-sm sm:text-base text-[#5d4a4b] max-w-2xl mx-auto leading-relaxed">
              Official publications, technical cable sizing guides, electrical compliance breakdowns, and project dispatch dispatches from Volamp Elektrikals.
            </p>
          </div>
        </section>

        {/* Content Section: Empty State Ready for User Blogs */}
        <section className="market-container max-w-4xl py-12 sm:py-16">
          {BLOG_POSTS.length === 0 ? (
            <div className="bg-white rounded-3xl p-8 sm:p-14 border border-[#ebd7c7] shadow-xs text-center space-y-8">
              {/* Glowing Icon */}
              <div className="relative mx-auto size-20">
                <div className="absolute inset-0 rounded-2xl bg-amber-500/15 animate-ping opacity-75" />
                <div className="relative size-20 rounded-2xl bg-gradient-to-br from-[#c56718] to-[#d97706] text-white flex items-center justify-center shadow-md shadow-amber-500/20">
                  <BookOpen className="size-10" />
                </div>
              </div>

              <div className="space-y-3 max-w-lg mx-auto">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#f7ede6] border border-[#ebd4c2] text-[#c56718] text-xs font-bold uppercase tracking-wider">
                  <Clock className="size-3.5 text-[#c56718]" />
                  <span>Articles In Preparation</span>
                </span>

                <h2 className="text-2xl sm:text-3xl font-bold text-[#4d1217] font-['Plus_Jakarta_Sans',sans-serif]">
                  New Articles Coming Soon
                </h2>

                <p className="text-xs sm:text-sm text-[#5d4a4b] leading-relaxed">
                  Our technical editorial desk is curating the first edition of project case studies, cable engineering notes, and industry insights.
                </p>
              </div>

              {/* Upcoming Topic Categories */}
              <div className="p-6 rounded-2xl bg-[#fdfbf9] border border-[#ebd7c7] max-w-xl mx-auto text-left space-y-3">
                <span className="text-[11px] font-bold text-[#5d4a4b] uppercase tracking-wider block">
                  UPCOMING TOPICS & SERIES:
                </span>
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1.5 rounded-lg bg-white border border-[#ebd7c7] text-xs font-medium text-[#4d1217]">
                    ⚡ Cable Sizing & Ampacity Engineering
                  </span>
                  <span className="px-3 py-1.5 rounded-lg bg-white border border-[#ebd7c7] text-xs font-medium text-[#4d1217]">
                    📜 Bureau of Indian Standards (IS 694 / 1554 / 7098)
                  </span>
                  <span className="px-3 py-1.5 rounded-lg bg-white border border-[#ebd7c7] text-xs font-medium text-[#4d1217]">
                    ☀️ Solar DC 1500V Evacuation Systems
                  </span>
                  <span className="px-3 py-1.5 rounded-lg bg-white border border-[#ebd7c7] text-xs font-medium text-[#4d1217]">
                    🏢 Zero-Halogen Flame Retardant (ZHFR) Life Safety
                  </span>
                  <span className="px-3 py-1.5 rounded-lg bg-white border border-[#ebd7c7] text-xs font-medium text-[#4d1217]">
                    🏗️ Industrial Project Dispatch Case Studies
                  </span>
                </div>
              </div>

              {/* Newsletter Notification Signup */}
              <div className="max-w-md mx-auto pt-2 space-y-3">
                <strong className="text-xs font-bold text-[#4d1217] block">
                  Get notified when the first article is published:
                </strong>

                <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-2">
                  <Input
                    required
                    type="email"
                    placeholder="Enter your work email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-[#fdfbf9] border-[#ebd7c7] rounded-xl text-xs sm:text-sm text-[#0b1f33]"
                  />
                  <Button
                    type="submit"
                    disabled={subscribeMutation.isPending}
                    className="bg-[#c56718] hover:bg-[#b45309] text-white font-bold text-xs py-2.5 px-5 rounded-xl shrink-0 cursor-pointer shadow-md shadow-amber-900/20"
                  >
                    {subscribeMutation.isPending ? "Subscribing..." : "Notify Me"}
                  </Button>
                </form>

                <span className="text-[11px] text-[#5d4a4b] block">
                  Zero spam. Technical engineering dispatches only.
                </span>
              </div>

              {/* Quick Actions */}
              <div className="pt-4 border-t border-[#ebd7c7] flex flex-wrap items-center justify-center gap-3">
                <Link
                  href="/"
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#c56718] hover:bg-[#b45309] text-white text-xs font-bold transition-colors shadow-xs"
                >
                  <span>Explore Product Catalog</span>
                  <ArrowRight className="size-3.5" />
                </Link>

                <Link
                  href="/calculator"
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white border border-[#ebd7c7] hover:bg-[#f7ede6] text-[#4d1217] text-xs font-semibold transition-colors shadow-xs"
                >
                  <Calculator className="size-3.5 text-[#c56718]" />
                  <span>Cable Size Estimator</span>
                </Link>

                <Link
                  href="/collaborate"
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white border border-[#ebd7c7] hover:bg-[#f7ede6] text-[#4d1217] text-xs font-semibold transition-colors shadow-xs"
                >
                  <Handshake className="size-3.5 text-[#c56718]" />
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

      {/* Universal Footer */}
      <UniversalFooter />
    </div>
  );
}
