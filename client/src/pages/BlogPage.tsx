import React, { useState } from "react";
import { Link, useLocation } from "wouter";
import {
  BookOpen,
  ArrowRight,
  Clock,
  Calculator,
  Handshake,
  Tag,
  Share2,
  X,
  User,
  Calendar,
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

export default function BlogPage() {
  const [, navigate] = useLocation();
  const supportPhone = "9512365582";
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);

  const blogsQuery = trpc.blogs.list.useQuery();
  const blogPosts: BlogPost[] = blogsQuery.data ?? [];

  const [email, setEmail] = useState("");
  const subscribeMutation = trpc.newsletter.subscribe.useMutation({
    onSuccess: (data) => {
      setEmail("");
      toast.success("You're on the list!", {
        description: `We'll email you at ${data.email} as soon as new articles and price circulars are published.`,
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

        {/* Content Section */}
        <section className="market-container max-w-6xl py-12 sm:py-16">
          {blogPosts.length === 0 ? (
            <div className="bg-white rounded-3xl p-8 sm:p-14 border border-[#ebd7c7] shadow-xs text-center space-y-8 max-w-4xl mx-auto">
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
                <h2 className="text-2xl sm:text-3xl font-bold text-[#4d1217]">
                  New Articles Coming Soon
                </h2>
                <p className="text-xs sm:text-sm text-[#5d4a4b] leading-relaxed">
                  Our technical editorial desk is curating the first edition of project case studies, cable engineering notes, and industry insights.
                </p>
              </div>

              <div className="max-w-md mx-auto pt-2 space-y-3">
                <strong className="text-xs font-bold text-[#4d1217] block">
                  Get notified when articles are published:
                </strong>
                <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-2">
                  <Input
                    required
                    type="email"
                    placeholder="Enter your work email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="text-xs h-10 border-[#ebd7c7] bg-[#fdfbf9]"
                  />
                  <Button
                    type="submit"
                    disabled={subscribeMutation.isPending}
                    className="bg-[#c56718] hover:bg-[#b45309] text-white text-xs font-bold h-10 px-5 shrink-0"
                  >
                    {subscribeMutation.isPending ? "Subscribing..." : "Notify Me"}
                  </Button>
                </form>
              </div>
            </div>
          ) : (
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {blogPosts.map((post) => (
                  <article
                    key={post.id}
                    id={post.slug}
                    onClick={() => setSelectedPost(post)}
                    className="group bg-white rounded-2xl border border-[#ebd7c7] overflow-hidden shadow-xs hover:shadow-xl transition-all flex flex-col justify-between cursor-pointer hover:border-[#c56718]"
                  >
                    <div>
                      {/* Image Thumbnail */}
                      <div className="relative h-48 w-full overflow-hidden bg-slate-100">
                        <img
                          src={post.imageUrl || "/products/cables.jpg"}
                          alt={post.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <span className="absolute top-3 left-3 px-2.5 py-1 rounded-md bg-[#4d1217]/90 text-white text-[10px] font-bold uppercase tracking-wider backdrop-blur-xs">
                          {post.category}
                        </span>
                      </div>

                      {/* Content */}
                      <div className="p-5 space-y-2.5">
                        <div className="flex items-center gap-3 text-[11px] text-[#5d4a4b]">
                          <span className="flex items-center gap-1">
                            <Calendar className="size-3 text-[#c56718]" />
                            {post.date}
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Clock className="size-3 text-[#c56718]" />
                            {post.readTime}
                          </span>
                        </div>

                        <h3 className="text-base font-bold text-[#4d1217] group-hover:text-[#c56718] transition-colors leading-snug line-clamp-2">
                          {post.title}
                        </h3>

                        <p className="text-xs text-[#5d4a4b] line-clamp-3 leading-relaxed">
                          {post.excerpt}
                        </p>
                      </div>
                    </div>

                    <div className="p-5 pt-0 border-t border-[#ebd7c7]/50 mt-4 flex items-center justify-between">
                      <span className="text-[11px] text-slate-500 font-medium">By {post.author}</span>
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-[#c56718] group-hover:translate-x-0.5 transition-transform">
                        Read Guide <ArrowRight className="size-3.5" />
                      </span>
                    </div>
                  </article>
                ))}
              </div>

              {/* Newsletter Strip beneath articles */}
              <div className="rounded-2xl p-6 sm:p-8 bg-[#f7ede6] border border-[#ebd4c2] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h4 className="text-base font-bold text-[#4d1217]">Subscribe to Volamp Industrial Pulse</h4>
                  <p className="text-xs text-[#5d4a4b] mt-0.5">Receive new technical publications, cable sizing advisories, and price list circulars.</p>
                </div>
                <form onSubmit={handleSubscribe} className="flex gap-2 shrink-0">
                  <Input
                    required
                    type="email"
                    placeholder="Enter your work email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="text-xs h-10 border-[#ebd7c7] bg-white min-w-[220px]"
                  />
                  <Button
                    type="submit"
                    disabled={subscribeMutation.isPending}
                    className="bg-[#c56718] hover:bg-[#b45309] text-white text-xs font-bold h-10 px-4"
                  >
                    Subscribe
                  </Button>
                </form>
              </div>
            </div>
          )}
        </section>
      </main>

      {/* Article Reader Modal */}
      {selectedPost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#c56718]">
                {selectedPost.category} · {selectedPost.readTime}
              </span>
              <button
                onClick={() => setSelectedPost(null)}
                className="p-1 rounded-full hover:bg-slate-100 cursor-pointer"
              >
                <X className="size-5 text-slate-500" />
              </button>
            </div>

            <div className="p-6 sm:p-8 overflow-y-auto space-y-6 flex-1 text-slate-800">
              <div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-[#4d1217] leading-tight">
                  {selectedPost.title}
                </h2>
                <div className="flex items-center gap-4 text-xs text-slate-500 mt-2">
                  <span>Author: <strong>{selectedPost.author}</strong></span>
                  <span>•</span>
                  <span>Published: {selectedPost.date}</span>
                </div>
              </div>

              {selectedPost.tags && selectedPost.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {selectedPost.tags.map((t) => (
                    <span key={t} className="px-2.5 py-0.5 rounded-full bg-[#f7ede6] text-[#c56718] text-[11px] font-bold">
                      #{t}
                    </span>
                  ))}
                </div>
              )}

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 text-xs sm:text-sm italic text-slate-600 leading-relaxed">
                "{selectedPost.excerpt}"
              </div>

              <div className="prose prose-slate max-w-none text-xs sm:text-sm leading-relaxed whitespace-pre-line space-y-4">
                {selectedPost.content}
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-500">Volamp Elektrikals Official Publication</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedPost(null)}
                className="text-xs"
              >
                Close Article
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Universal Footer */}
      <UniversalFooter />
    </div>
  );
}
