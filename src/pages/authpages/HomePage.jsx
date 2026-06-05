import React from 'react';
import { Shield, Camera, Bell, Brain, Eye, Users, Activity, TrendingUp, HardDrive, ArrowRight, Play, Menu, X, Clock } from 'lucide-react';

const HomePage = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const stats = [
    { value: '250+', label: 'Active Cameras', icon: Camera },
    { value: '1,250+', label: 'Threats Detected', icon: Bell },
    { value: '500+', label: 'Active Users', icon: Users },
    { value: '99.9%', label: 'System Uptime', icon: Activity }
  ];

  const features = [
    {
      icon: Eye,
      title: 'Real-time Monitoring',
      description: 'Stream live camera feeds with instant AI analysis and event detection.',
      color: 'bg-emerald-500/15 text-emerald-400'
    },
    {
      icon: Brain,
      title: 'AI Threat Detection',
      description: 'Detect suspicious behavior, unauthorized access, and security anomalies automatically.',
      color: 'bg-purple-500/15 text-purple-400'
    },
    {
      icon: Bell,
      title: 'Instant Alerts',
      description: 'Receive real-time notifications and alerts across channels for faster response.',
      color: 'bg-blue-500/15 text-blue-400'
    },
    {
      icon: Users,
      title: 'Face Recognition',
      description: 'Identify known personnel and flag unknown individuals in secure areas.',
      color: 'bg-sky-500/15 text-sky-400'
    },
    {
      icon: TrendingUp,
      title: 'Analytics & Reporting',
      description: 'Track performance, incident trends, and system health with intelligent reports.',
      color: 'bg-yellow-500/15 text-yellow-400'
    },
    {
      icon: HardDrive,
      title: 'Secure Storage',
      description: 'Store footage safely in the cloud with easy retrieval for investigations.',
      color: 'bg-emerald-500/15 text-emerald-400'
    }
  ];

  const howItWorks = [
    { icon: Camera, title: 'Deploy Cameras', description: 'Quickly connect cameras and sensors for instant protection.' },
    { icon: Brain, title: 'Analyze Activity', description: 'AI evaluates activity 24/7 to separate normal movement from risk.' },
    { icon: Bell, title: 'Send Alerts', description: 'Trigger alerts automatically to your team when threats are detected.' },
    { icon: HardDrive, title: 'Review Footage', description: 'Access recordings instantly with secure storage and fast playback.' }
  ];

  const plans = [
    { title: 'Starter', price: '$29', description: 'Ideal for small facilities and basic monitoring.', perks: ['5 Cameras', 'AI Alerts', '24/7 Email Support'] },
    { title: 'Business', price: '$79', description: 'Designed for growing operations with analytics and priority support.', perks: ['20 Cameras', 'Automated Reports', 'Priority Support'], popular: true },
    { title: 'Enterprise', price: '$149', description: 'Full enterprise-grade protection with custom security workflows.', perks: ['Unlimited Cameras', 'Custom Integrations', 'Dedicated Success Manager'] }
  ];

  return (
    <div className="min-h-screen bg-[#040b18] text-white">
      <nav className="sticky top-0 z-50 border-b border-white/10 bg-[#07111f]/95 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
              <Shield className="text-emerald-400" size={22} />
            </div>
            <div>
              <p className="text-base font-semibold text-white">AI Surveillance</p>
              <p className="text-xs uppercase tracking-[0.3em] text-gray-400">Smart Security System</p>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-300">
            <a href="#" className="text-emerald-400">Home</a>
            <a href="#features" className="hover:text-white transition">Features</a>
            <a href="#how-it-works" className="hover:text-white transition">How It Works</a>
            <a href="#about" className="hover:text-white transition">About Us</a>
            <a href="#pricing" className="hover:text-white transition">Pricing</a>
            <a href="#contact" className="hover:text-white transition">Contact</a>
          </div>

          <div className="hidden md:flex items-center gap-3">
            <a href="/admin/login" className="rounded-full border border-white/10 px-5 py-2 text-sm text-white transition hover:bg-white/5">Login</a>
            <a href="/user/login" className="rounded-full bg-emerald-500 px-5 py-2 text-sm font-semibold text-black transition hover:bg-emerald-400">Sign Up</a>
          </div>

          <button className="md:hidden text-gray-300" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="border-t border-white/10 bg-[#07111f] px-4 py-4 md:hidden">
            <div className="space-y-3 text-sm font-medium text-gray-300">
              <a href="#" className="block text-emerald-400">Home</a>
              <a href="#features" className="block hover:text-white">Features</a>
              <a href="#how-it-works" className="block hover:text-white">How It Works</a>
              <a href="#about" className="block hover:text-white">About Us</a>
              <a href="#pricing" className="block hover:text-white">Pricing</a>
              <a href="#contact" className="block hover:text-white">Contact</a>
            </div>
            <div className="mt-4 flex flex-col gap-3">
              <a href="/admin/login" className="rounded-full border border-white/10 px-5 py-3 text-center text-sm text-white hover:bg-white/5">Login</a>
              <a href="/user/login" className="rounded-full bg-emerald-500 px-5 py-3 text-center text-sm font-semibold text-black hover:bg-emerald-400">Sign Up</a>
            </div>
          </div>
        )}
      </nav>

      <main>
        <section
          className="relative overflow-hidden py-16 lg:py-24"
          style={{
            backgroundImage: "url('/images/home.jpg')",
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          <div className="absolute inset-0 bg-[#040714]/85" />
          <div className="absolute inset-x-0 top-0 h-72 bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.18),_transparent_35%)] pointer-events-none" />
          <div className="absolute inset-x-0 bottom-0 h-72 bg-[radial-gradient(circle_at_bottom_right,_rgba(59,130,246,0.12),_transparent_35%)] pointer-events-none" />
          <div className="relative mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-3 rounded-full border border-emerald-400/20 bg-emerald-500/10 px-4 py-2 text-xs uppercase tracking-[0.35em] text-emerald-300">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                AI POWERED SECURITY
              </div>
              <div>
                <h1 className="text-4xl font-bold leading-tight text-white sm:text-5xl lg:text-6xl">
                  AI-Powered <span className="text-emerald-400">Smart Surveillance</span> for a Safer Tomorrow
                </h1>
                <p className="mt-6 max-w-xl text-lg leading-8 text-gray-300">
                  Our intelligent surveillance platform combines advanced AI, live monitoring, and secure analytics to protect your spaces and keep teams informed.
                </p>
              </div>
              <div className="flex flex-col gap-4 sm:flex-row">
                <a href="#contact" className="inline-flex items-center justify-center gap-2 rounded-full bg-emerald-500 px-8 py-4 text-sm font-semibold text-black transition hover:bg-emerald-400">
                  Get Started <ArrowRight size={18} />
                </a>
                <button className="inline-flex items-center justify-center gap-2 rounded-full border border-white/15 bg-white/5 px-8 py-4 text-sm text-white transition hover:bg-white/10">
                  <Play size={18} /> View Live Demo
                </button>
              </div>
            </div>
            <div className="relative" />          </div>
        </section>

        <section className="bg-[#071327] py-10 lg:py-14">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {stats.map((stat, index) => (
                <div key={index} className="rounded-[1.5rem] border border-white/10 bg-white/5 p-6 shadow-xl shadow-black/10 transition hover:bg-[#0f2141]">
                  <div className="flex items-center gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-emerald-500/10 text-emerald-400">
                      <stat.icon size={22} />
                    </div>
                    <div>
                      <p className="text-3xl font-semibold text-white">{stat.value}</p>
                      <p className="text-sm text-gray-400">{stat.label}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="features" className="py-20 lg:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <p className="text-emerald-400 uppercase tracking-[0.4em] text-sm font-semibold mb-3">Powerful Features</p>
              <h2 className="text-3xl font-bold text-white sm:text-4xl">Everything you need for intelligent surveillance and threat detection</h2>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {features.map((feature, index) => (
                <div key={index} className="rounded-[2rem] border border-white/10 bg-[#081224]/80 p-8 transition hover:border-emerald-500/40 hover:shadow-[0_25px_75px_rgba(16,185,129,0.12)]">
                  <div className={`${feature.color} inline-flex h-16 w-16 items-center justify-center rounded-3xl`}>
                    <feature.icon size={26} />
                  </div>
                  <h3 className="mt-6 text-xl font-semibold text-white">{feature.title}</h3>
                  <p className="mt-3 text-gray-400 leading-relaxed">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="about" className="bg-[#06101f] py-20 lg:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
              <div>
                <p className="text-emerald-400 uppercase tracking-[0.35em] text-sm font-semibold mb-3">About Us</p>
                <h2 className="text-3xl font-bold text-white sm:text-4xl mb-4">A smarter security platform built for modern facilities.</h2>
                <p className="text-gray-400 leading-8">AI Surveillance delivers intelligent monitoring, automated threat detection, and secure incident management for businesses that need reliable protection. Our platform blends advanced computer vision with operational tools to keep teams confident.</p>
              </div>
              <div className="grid gap-6 sm:grid-cols-2">
                <div className="rounded-[2rem] border border-white/10 bg-[#081b2b]/90 p-8">
                  <p className="text-sm uppercase tracking-[0.35em] text-gray-400">Mission</p>
                  <p className="mt-4 text-white">Protect every corner with AI-enhanced monitoring that reduces risk and improves response.</p>
                </div>
                <div className="rounded-[2rem] border border-white/10 bg-[#081b2b]/90 p-8">
                  <p className="text-sm uppercase tracking-[0.35em] text-gray-400">Vision</p>
                  <p className="mt-4 text-white">Make security smarter, simpler, and more actionable for teams of any size.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="how-it-works" className="py-20 lg:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <p className="text-emerald-400 uppercase tracking-[0.35em] text-sm font-semibold mb-3">How It Works</p>
              <h2 className="text-3xl font-bold text-white sm:text-4xl">Fast. Intelligent. Secure.</h2>
              <p className="mt-4 text-gray-400 max-w-2xl mx-auto leading-8">A structured security workflow designed to capture, analyze, alert, and store evidence with minimal effort.</p>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {howItWorks.map((step, index) => (
                <div key={index} className="rounded-[2rem] border border-white/10 bg-[#081224]/90 p-8 hover:border-emerald-500/30 transition">
                  <div className="inline-flex h-14 w-14 items-center justify-center rounded-3xl bg-emerald-500/10 text-emerald-400">
                    <step.icon size={22} />
                  </div>
                  <h3 className="mt-5 text-lg font-semibold text-white">{step.title}</h3>
                  <p className="mt-3 text-gray-400 leading-relaxed">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="pricing" className="bg-[#071327] py-20 lg:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <p className="text-emerald-400 uppercase tracking-[0.35em] text-sm font-semibold mb-3">Pricing</p>
              <h2 className="text-3xl font-bold text-white sm:text-4xl">Flexible plans for every security programme</h2>
            </div>
            <div className="grid gap-6 xl:grid-cols-3">
              {plans.map((plan, index) => (
                <div key={index} className={`rounded-[2rem] border p-8 shadow-xl shadow-black/20 transition ${plan.popular ? 'border-emerald-500/40 bg-emerald-500/10' : 'border-white/10 bg-[#081423]/90'}`}>
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm uppercase tracking-[0.35em] text-gray-400">{plan.title}</p>
                    {plan.popular && <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-xs text-emerald-200">Most Popular</span>}
                  </div>
                  <div className="mt-8">
                    <p className="text-5xl font-bold text-white">{plan.price}</p>
                    <p className="mt-3 text-gray-400">{plan.description}</p>
                  </div>
                  <ul className="mt-8 space-y-3 text-sm text-gray-300">
                    {plan.perks.map((perk, perkIndex) => (
                      <li key={perkIndex} className="flex items-center gap-3">
                        <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                        {perk}
                      </li>
                    ))}
                  </ul>
                  <button className={`mt-10 w-full rounded-full px-6 py-4 text-sm font-semibold transition ${plan.popular ? 'bg-emerald-500 text-black hover:bg-emerald-400' : 'border border-white/10 bg-white/5 text-white hover:bg-white/10'}`}>
                    Select Plan
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="contact" className="py-16 lg:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="rounded-[2rem] border border-white/10 bg-[#071623]/95 p-10 shadow-2xl shadow-emerald-500/10 sm:p-14">
              <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="text-emerald-400 uppercase tracking-[0.35em] text-sm font-semibold mb-3">Contact</p>
                  <h2 className="text-3xl font-bold text-white sm:text-4xl">Start your AI surveillance deployment today.</h2>
                </div>
                <div className="flex flex-col gap-4 sm:flex-row">
                  <a href="/admin/login" className="inline-flex items-center justify-center rounded-full bg-emerald-500 px-8 py-4 text-sm font-semibold text-black transition hover:bg-emerald-400">Contact Sales</a>
                  <a href="/user/login" className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/5 px-8 py-4 text-sm text-white transition hover:bg-white/10">Request Demo</a>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/10 bg-[#050f1d] py-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-3xl bg-emerald-500/10 border border-emerald-500/20">
              <Shield className="text-emerald-400" size={24} />
            </div>
            <div>
              <p className="font-semibold text-white">AI Surveillance</p>
              <p className="text-sm text-gray-500">Smart Security System</p>
            </div>
          </div>
          <p className="text-sm text-gray-500">© 2026 AI Surveillance. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
