"use client";
import React, { useState, useEffect } from "react";
import ApplyModal, { LoginModal } from "@/components/ApplyModal";
import { Mic, Shield, Lock, Zap, Twitter, Linkedin, Github, Mail, Activity, Star, Globe, ChevronRight } from "lucide-react";
import { Footer } from "@/components/ui/modem-animated-footer";
import DownloadButton from "@/components/DownloadButton";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

export default function Home() {
  const [showApply, setShowApply] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [appStars, setAppStars] = useState<number | null>(null);
  const [webStars, setWebStars] = useState<number | null>(null);
  const { user, isLoading } = useAuth();
  const router = useRouter();

  // Auto-redirect logged-in users to dashboard
  useEffect(() => {
    if (!isLoading && user) {
      router.replace("/dashboard");
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    const fetchAppStars = async () => {
      try {
        const res = await fetch("https://api.github.com/repos/Sahnik0/callu", {
          headers: { Accept: "application/vnd.github.v3+json" },
          next: { revalidate: 60 },
        } as RequestInit);
        if (res.ok) {
          const data = await res.json();
          setAppStars(data.stargazers_count);
        }
      } catch (e) {
        console.error("Failed to fetch App GitHub stars", e);
      }
    };
    
    const fetchWebStars = async () => {
      try {
        const res = await fetch("https://api.github.com/repos/sanks011/callu", {
          headers: { Accept: "application/vnd.github.v3+json" },
          next: { revalidate: 60 },
        } as RequestInit);
        if (res.ok) {
          const data = await res.json();
          setWebStars(data.stargazers_count);
        }
      } catch (e) {
        console.error("Failed to fetch Web GitHub stars", e);
      }
    };

    fetchAppStars();
    fetchWebStars();
    const interval = setInterval(() => {
      fetchAppStars();
      fetchWebStars();
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <main className="min-h-screen bg-black text-white relative overflow-hidden flex flex-col items-center selection:bg-emerald-500/30">
      
      {/* Premium Background Ambience */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        {/* Subtle grid mesh */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
        
        {/* Glowing orbs */}
        <div className="absolute top-[-10%] right-[10%] w-[600px] h-[600px] bg-emerald-900/20 rounded-full blur-[120px] animate-pulse-slow" />
        <div className="absolute top-[20%] left-[-10%] w-[500px] h-[500px] bg-zinc-800/30 rounded-full blur-[150px]" />
        
        {/* Vignette */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/0 via-black/0 to-black pointer-events-none" />
      </div>

      <nav className="relative z-50 flex justify-between items-center px-6 md:px-12 py-8 w-full max-w-[90rem]">
        <div className="flex items-center gap-1.5 group cursor-pointer">
           <h1 className="text-2xl font-bold tracking-tight text-white flex items-center">
             CALLU
             <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full ml-1 mb-0.5 transition-all duration-500 group-hover:scale-150 group-hover:shadow-[0_0_12px_rgba(16,185,129,0.8)]"></span>
           </h1>
        </div>
        
        <div className="flex items-center gap-6 md:gap-8">
          <div className="hidden md:flex items-center gap-6">
            <a
              href="https://github.com/Sahnik0/callu"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-2 text-zinc-400 hover:text-white transition-colors text-sm font-medium"
            >
              <Github size={16} />
              <span>App</span>
              <div className="flex items-center gap-1 text-zinc-500 group-hover:text-emerald-400 bg-white/5 px-2 py-0.5 rounded-full border border-white/5 transition-all">
                <Star size={12} className="fill-current" />
                <span className="tabular-nums text-xs">{appStars !== null ? appStars : '-'}</span>
              </div>
            </a>
            
            <a
              href="https://github.com/sanks011/callu"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-2 text-zinc-400 hover:text-white transition-colors text-sm font-medium"
            >
              <Globe size={16} />
              <span>Web</span>
              <div className="flex items-center gap-1 text-zinc-500 group-hover:text-emerald-400 bg-white/5 px-2 py-0.5 rounded-full border border-white/5 transition-all">
                <Star size={12} className="fill-current" />
                <span className="tabular-nums text-xs">{webStars !== null ? webStars : '-'}</span>
              </div>
            </a>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowLogin(true)}
              className="px-6 py-2.5 text-sm font-semibold text-zinc-300 hover:text-white border border-white/10 hover:border-white/20 hover:bg-white/5 rounded-full transition-all duration-300 hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(255,255,255,0.05)]"
            >
              Sign In
            </button>
          </div>
        </div>
      </nav>

      <div className="relative z-10 flex flex-col items-center justify-center px-4 text-center w-full max-w-6xl pt-20 md:pt-32 pb-24 flex-1">

        {/* Social Proof Removed */}

        <h2 className="hero-fade-1 text-5xl md:text-6xl font-medium tracking-tighter mb-6 max-w-4xl text-pretty leading-[0.95] select-none text-center">
          The curated community <br className="hidden md:block" /> for <span className="font-playfair bg-gradient-to-b from-emerald-300 via-emerald-100 to-white bg-clip-text text-transparent italic px-2 py-1 box-decoration-clone leading-tight">meaningful connections.</span>
        </h2>

        <p className="hero-fade-2 font-dm text-lg md:text-xl text-zinc-400/90 max-w-2xl mb-12 font-light leading-relaxed text-center">
            A private space for professionals, creators, and visionaries. 
            Connect through voice, video, and serendipity.
        </p>

        {/* CTA: Primary */}
        <div className="hero-fade-4 flex items-center justify-center mb-10 w-full">
          <button
            onClick={() => setShowApply(true)}
            className="group relative flex items-center gap-2 px-8 py-4 rounded-full bg-emerald-600/90 hover:bg-emerald-500 text-white font-medium text-sm md:text-base transition-all duration-300 hover:scale-[1.03] hover:shadow-[0_0_28px_rgba(16,185,129,0.4)] active:scale-[0.97] shadow-[0_0_20px_rgba(16,185,129,0.2)] overflow-hidden"
          >
            {/* Shimmer sweep effect on hover */}
            <span className="absolute inset-0 w-full h-full rounded-full overflow-hidden pointer-events-none">
               <span className="absolute top-0 -left-[100%] w-1/2 h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 group-hover:animate-sweep" />
            </span>
            {/* Live dot */}
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-60" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
            </span>
            Get Started
            {/* Arrow */}
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:translate-x-1 transition-all duration-300">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-3 mb-6">
          <div className="h-px w-10 bg-zinc-800" />
          <span className="text-zinc-500 text-[10px] uppercase tracking-[0.15em] font-medium">or get the desktop app</span>
          <div className="h-px w-10 bg-zinc-800" />
        </div>

        {/* Download buttons */}
        <div className="hero-fade-5 flex items-center justify-center gap-3 mb-16 md:mb-20">
          <DownloadButton href="/Callu-Setup-2.0.0.exe" os="windows" />
          <DownloadButton href="/callu-desktop_2.0.0_amd64.deb" os="linux" />
        </div>

      </div>

      {/* Aesthetic Bento Grid */}
      <div className="relative z-10 w-full max-w-6xl px-6 grid grid-cols-1 md:grid-cols-12 gap-6 mt-10 mb-40 text-left">
          
          {/* Card 1: Large (Spans 7 cols) */}
          <div className="md:col-span-7 group relative p-8 md:p-10 rounded-[2rem] bg-zinc-900/20 border border-white/5 hover:border-emerald-500/30 overflow-hidden transition-all duration-500 hover:bg-zinc-900/40 backdrop-blur-md shadow-2xl hover:shadow-[0_0_40px_rgba(16,185,129,0.1)]">
            <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-[100px] -mr-20 -mt-20 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
            
            {/* Background Art */}
            <div className="absolute -right-6 -bottom-10 md:right-4 md:-bottom-12 select-none pointer-events-none opacity-[0.03] group-hover:opacity-[0.08] transition-opacity duration-700">
              <span className="text-[12rem] font-black tracking-tighter">1%</span>
            </div>

            <div className="relative z-10 flex flex-col h-full justify-between min-h-[220px]">
              <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-8 border border-white/10 group-hover:bg-emerald-500/10 group-hover:border-emerald-500/30 transition-all duration-300 shadow-lg">
                <Lock className="text-zinc-400 group-hover:text-emerald-400 transition-colors" size={20} />
              </div>
              <div>
                <h3 className="text-2xl md:text-3xl font-bold text-white mb-3 tracking-tight">Exclusive Access</h3>
                <p className="text-zinc-400 font-light leading-relaxed max-w-sm text-base md:text-lg">
                  Manual curation ensures a high-trust environment. We accept less than 1% of applicants, preserving the quality of every interaction.
                </p>
              </div>
            </div>
          </div>

          {/* Card 2: Small (Spans 5 cols) */}
          <div className="md:col-span-5 group relative p-8 md:p-10 rounded-[2rem] bg-zinc-900/20 border border-white/5 hover:border-emerald-500/30 overflow-hidden transition-all duration-500 hover:bg-zinc-900/40 backdrop-blur-md shadow-2xl hover:shadow-[0_0_40px_rgba(16,185,129,0.1)]">
            <div className="absolute bottom-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-[80px] -mr-20 -mb-20 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
            
            {/* Radar Animation Art */}
            <div className="absolute top-1/2 right-10 -translate-y-1/2 w-32 h-32 opacity-10 group-hover:opacity-40 transition-opacity duration-700 pointer-events-none">
               <div className="absolute inset-0 rounded-full border border-emerald-500/30 animate-[ping_3s_ease-out_infinite]" />
               <div className="absolute inset-4 rounded-full border border-emerald-500/40 animate-[ping_3s_ease-out_infinite_1s]" />
               <div className="absolute inset-8 rounded-full border border-emerald-500/50 animate-[ping_3s_ease-out_infinite_2s]" />
               <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.8)]" />
            </div>

            <div className="relative z-10 flex flex-col h-full justify-between min-h-[220px]">
              <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-8 border border-white/10 group-hover:bg-emerald-500/10 group-hover:border-emerald-500/30 transition-all duration-300 shadow-lg">
                <Zap className="text-zinc-400 group-hover:text-emerald-400 transition-colors" size={20} />
              </div>
              <div className="max-w-[12rem]">
                <h3 className="text-2xl font-bold text-white mb-3 tracking-tight">Instant Connect</h3>
                <p className="text-zinc-400 font-light leading-relaxed text-sm">
                  See who's online and jump right into serendipitous conversations effortlessly.
                </p>
              </div>
            </div>
          </div>

          {/* Card 3: Small (Spans 5 cols) */}
          <div className="md:col-span-5 group relative p-8 md:p-10 rounded-[2rem] bg-zinc-900/20 border border-white/5 hover:border-emerald-500/30 overflow-hidden transition-all duration-500 hover:bg-zinc-900/40 backdrop-blur-md shadow-2xl hover:shadow-[0_0_40px_rgba(16,185,129,0.1)]">
            <div className="absolute top-0 left-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-[80px] -ml-20 -mt-20 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
            
            {/* Encryption Art */}
            <div className="absolute inset-y-0 right-0 w-2/3 overflow-hidden opacity-0 group-hover:opacity-100 transition-all duration-700 pointer-events-none [mask-image:linear-gradient(to_left,black,transparent)]">
              <div className="absolute top-10 right-10 flex items-center gap-2 text-emerald-500/40 font-mono text-[10px] translate-x-4 group-hover:-translate-x-0 transition-transform duration-1000">
                <span>0x8F92</span> <div className="w-12 h-px bg-emerald-500/20" /> <Shield size={10} />
              </div>
              <div className="absolute top-24 right-4 flex items-center gap-2 text-emerald-500/40 font-mono text-[10px] translate-x-4 group-hover:-translate-x-0 transition-transform duration-1000 delay-150">
                <span>0x2A1C</span> <div className="w-8 h-px bg-emerald-500/20" /> <Shield size={10} />
              </div>
              <div className="absolute bottom-16 right-12 flex items-center gap-2 text-emerald-500/40 font-mono text-[10px] translate-x-4 group-hover:-translate-x-0 transition-transform duration-1000 delay-300">
                <span>0x9B4E</span> <div className="w-16 h-px bg-emerald-500/20" /> <Shield size={10} />
              </div>
            </div>

            <div className="relative z-10 flex flex-col h-full justify-between min-h-[220px]">
              <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-8 border border-white/10 group-hover:bg-emerald-500/10 group-hover:border-emerald-500/30 transition-all duration-300 shadow-lg">
                <Shield className="text-zinc-400 group-hover:text-emerald-400 transition-colors" size={20} />
              </div>
              <div className="max-w-[12rem]">
                <h3 className="text-2xl font-bold text-white mb-3 tracking-tight">Private by Design</h3>
                <p className="text-zinc-400 font-light leading-relaxed text-sm">
                  Your data is yours. Experience end-to-end encrypted signals and complete privacy.
                </p>
              </div>
            </div>
          </div>

          {/* Card 4: Large (Spans 7 cols) */}
          <div className="md:col-span-7 group relative p-8 md:p-10 rounded-[2rem] bg-zinc-900/20 border border-white/5 hover:border-emerald-500/30 overflow-hidden transition-all duration-500 hover:bg-zinc-900/40 backdrop-blur-md shadow-2xl hover:shadow-[0_0_40px_rgba(16,185,129,0.1)]">
             <div className="absolute bottom-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-[100px] -mr-20 -mb-20 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
            
            {/* Audio Waveform Art */}
            <div className="absolute right-12 top-1/2 -translate-y-1/2 flex items-center gap-[3px] opacity-10 group-hover:opacity-50 transition-opacity duration-500 pointer-events-none">
              {[4, 8, 12, 16, 10, 6, 14, 18, 12, 8].map((h, i) => (
                <div key={i} className={`w-1.5 bg-emerald-400 rounded-full transition-all duration-300 group-hover:animate-[pulse_1s_ease-in-out_infinite]`} style={{ height: `${h * 4}px`, animationDelay: `${i * 0.1}s` }} />
              ))}
            </div>

            <div className="relative z-10 flex flex-col h-full justify-between min-h-[220px]">
              <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-8 border border-white/10 group-hover:bg-emerald-500/10 group-hover:border-emerald-500/30 transition-all duration-300 shadow-lg">
                <Mic className="text-zinc-400 group-hover:text-emerald-400 transition-colors" size={20} />
              </div>
              <div>
                <h3 className="text-2xl md:text-3xl font-bold text-white mb-3 tracking-tight">Crystal Clear Audio</h3>
                <p className="text-zinc-400 font-light leading-relaxed max-w-sm text-base md:text-lg">
                  Experience high-fidelity, lag-free voice conversations that feel natural. Like you're in the same room.
                </p>
              </div>
            </div>
          </div>
          
      </div>

      <div className="w-full relative z-10">
        <Footer
          brandName="CALLU"
          brandDescription="The curated community for meaningful connections."
          socialLinks={[
            { icon: <Twitter className="w-5 h-5" />, href: "#", label: "Twitter" },
            { icon: <Linkedin className="w-5 h-5" />, href: "#", label: "LinkedIn" },
            { icon: <Github className="w-5 h-5" />, href: "#", label: "GitHub" },
            { icon: <Mail className="w-5 h-5" />, href: "#", label: "Email" },
          ]}
          navLinks={[
            { label: "Manifesto", href: "#" },
            { label: "Community", href: "#" },
            { label: "Privacy", href: "#" },
            { label: "Terms", href: "#" },
          ]}
          brandIcon={<Activity className="w-8 h-8 text-emerald-500" />}
        />
      </div>

      {showApply && <ApplyModal onClose={() => setShowApply(false)} />}
      {showLogin && <LoginModal onClose={() => setShowLogin(false)} />}
    </main>
  );
}
