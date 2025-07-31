import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowRight, 
  Sparkles, 
  BarChart3, 
  Users, 
  Database, 
  Zap,
  CheckCircle,
  Star,
  Mail,
  Phone,
  MapPin,
  Github,
  Twitter,
  Linkedin,
  Youtube,
  ChevronDown,
  Play,
  Shield,
  Globe,
  Target,
  TrendingUp,
  Layers,
  Cpu,
  Brain,
  Rocket
} from 'lucide-react';
import { Header } from '../components/layout/Header';

const Landing: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState(0);

  const heroFeatures = [
    { icon: Brain, title: "AI-Powered", desc: "Intelligent insights" },
    { icon: Shield, title: "Enterprise", desc: "Bank-grade security" },
    { icon: Globe, title: "Global", desc: "Worldwide access" }
  ];

  const coreFeatures = [
    {
      icon: Cpu,
      title: "Neural Processing",
      description: "Advanced AI algorithms process your data with human-like intelligence",
      gradient: "from-[#4f46e5] to-[#3b82f6]",
      delay: 0.1
    },
    {
      icon: Layers,
      title: "Multi-Layer Analytics",
      description: "Deep dive into data with multiple analysis layers and perspectives",
      gradient: "from-[#3b82f6] to-[#22c55e]",
      delay: 0.2
    },
    {
      icon: Target,
      title: "Precision Targeting",
      description: "Pinpoint exact insights with surgical precision and accuracy",
      gradient: "from-[#22c55e] to-[#4f46e5]",
      delay: 0.3
    }
  ];

  const workflowSteps = [
    {
      step: "01",
      title: "Data Ingestion",
      description: "Seamlessly import data from any source with intelligent parsing",
      icon: Database,
      color: "#4f46e5"
    },
    {
      step: "02", 
      title: "AI Analysis",
      description: "Advanced algorithms analyze patterns and generate insights",
      icon: Brain,
      color: "#3b82f6"
    },
    {
      step: "03",
      title: "Visualization",
      description: "Beautiful, interactive charts and dashboards",
      icon: BarChart3,
      color: "#22c55e"
    },
    {
      step: "04",
      title: "Action",
      description: "Export insights and take action with one click",
      icon: Rocket,
      color: "#4f46e5"
    }
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Data Scientist",
      company: "TechCorp",
      content: "DataWhiz transformed our analytics workflow. The AI insights are incredible!",
      rating: 5,
      avatar: "SJ"
    },
    {
      name: "Mike Chen",
      role: "Business Analyst", 
      company: "DataFlow Inc",
      content: "The role-specific features make data analysis accessible to everyone.",
      rating: 5,
      avatar: "MC"
    },
    {
      name: "Alex Rodriguez",
      role: "CTO",
      company: "InnovateTech",
      content: "Finally, a platform that scales with our enterprise needs.",
      rating: 5,
      avatar: "AR"
    }
  ];

  const pricingPlans = [
    {
      name: "Starter",
      price: "$29",
      period: "/month",
      features: ["Up to 10GB data", "Basic analytics", "Email support", "5 team members"],
      popular: false,
      gradient: "from-[#4f46e5] to-[#3b82f6]"
    },
    {
      name: "Professional",
      price: "$99",
      period: "/month",
      features: ["Up to 100GB data", "Advanced analytics", "Priority support", "Unlimited team members", "Custom integrations"],
      popular: true,
      gradient: "from-[#4f46e5] via-[#3b82f6] to-[#22c55e]"
    },
    {
      name: "Enterprise",
      price: "Custom",
      period: "",
      features: ["Unlimited data", "Custom AI models", "Dedicated support", "On-premise deployment", "SLA guarantee"],
      popular: false,
      gradient: "from-[#22c55e] to-[#4f46e5]"
    }
  ];

  return (
    <div className="min-h-screen main-bg relative overflow-hidden">
      {/* Dynamic Background */}
      <div className="professional-background"></div>
      
      {/* Animated Grid Pattern */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(rgba(79, 70, 229, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(79, 70, 229, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px'
        }}></div>
      </div>

      <Header 
        isMenuOpen={isMenuOpen} 
        onMenuToggle={() => setIsMenuOpen(!isMenuOpen)}
      />

      {/* Hero Section - Split Layout */}
      <section className="relative min-h-screen flex items-center">
        <div className="max-w-7xl mx-auto px-6 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Left Side - Content */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-8"
            >
              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[rgba(79,70,229,0.1)] border border-[rgba(79,70,229,0.3)]"
              >
                <Sparkles className="w-4 h-4 text-[#4f46e5] animate-pulse" />
                <span className="text-sm font-medium text-[#4f46e5]">Next-Gen Analytics Platform</span>
              </motion.div>

              {/* Main Heading */}
              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="text-6xl md:text-7xl font-bold leading-tight"
              >
                <span className="text-white">Unlock the</span>
                <br />
                <span className="bg-gradient-to-r from-[#4f46e5] via-[#3b82f6] to-[#22c55e] bg-clip-text text-transparent">
                  Power of Data
                </span>
              </motion.h1>

              {/* Description */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
                className="text-xl text-[#d1d5db] leading-relaxed"
              >
                Experience the future of data analytics with our cutting-edge AI platform. 
                Transform raw data into actionable insights with unprecedented speed and accuracy.
              </motion.p>

              {/* CTA Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.8 }}
                className="flex flex-col sm:flex-row gap-4"
              >
                <motion.button
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="btn-primary group px-8 py-4 text-lg font-semibold"
                >
                  <span className="flex items-center gap-3">
                    Start Free Trial
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </span>
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="btn-secondary px-8 py-4 text-lg font-semibold group"
                >
                  <span className="flex items-center gap-3">
                    <Play className="w-5 h-5" />
                    Watch Demo
                  </span>
                </motion.button>
              </motion.div>

              {/* Quick Features */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 1.0 }}
                className="flex gap-6 pt-8"
              >
                {heroFeatures.map((feature, index) => (
                  <div key={feature.title} className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-r from-[#4f46e5] to-[#3b82f6] rounded-lg flex items-center justify-center">
                      <feature.icon className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-white">{feature.title}</div>
                      <div className="text-xs text-[#d1d5db]">{feature.desc}</div>
                    </div>
                  </div>
                ))}
              </motion.div>
            </motion.div>

            {/* Right Side - Interactive Demo */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="relative"
            >
              <div className="card-bg rounded-2xl p-8 relative overflow-hidden">
                {/* Floating Elements */}
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="absolute top-4 right-4 w-16 h-16 bg-gradient-to-r from-[#4f46e5] to-[#3b82f6] rounded-xl flex items-center justify-center"
                >
                  <BarChart3 className="w-8 h-8 text-white" />
                </motion.div>
                
                <motion.div
                  animate={{ y: [0, 10, 0] }}
                  transition={{ duration: 4, repeat: Infinity, delay: 1 }}
                  className="absolute bottom-4 left-4 w-12 h-12 bg-gradient-to-r from-[#22c55e] to-[#4f46e5] rounded-lg flex items-center justify-center"
                >
                  <Brain className="w-6 h-6 text-white" />
                </motion.div>

                {/* Main Demo Content */}
                <div className="text-center space-y-6">
                  <div className="w-24 h-24 bg-gradient-to-r from-[#4f46e5] via-[#3b82f6] to-[#22c55e] rounded-2xl flex items-center justify-center mx-auto">
                    <Database className="w-12 h-12 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-white">Live Analytics Demo</h3>
                  <p className="text-[#d1d5db]">See real-time data processing in action</p>
                  
                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 gap-4 mt-8">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-[#4f46e5]">2.5M+</div>
                      <div className="text-sm text-[#d1d5db]">Data Points</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-[#22c55e]">99.9%</div>
                      <div className="text-sm text-[#d1d5db]">Accuracy</div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1.5 }}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="flex flex-col items-center gap-2 text-[#d1d5db]"
          >
            <span className="text-sm">Scroll to explore</span>
            <ChevronDown className="w-5 h-5" />
          </motion.div>
        </motion.div>
      </section>

      {/* Core Features - Hexagonal Grid */}
      <section className="py-32 px-6 relative">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="text-5xl md:text-6xl font-bold mb-6">
              <span className="text-white">Why</span>
              <span className="bg-gradient-to-r from-[#4f46e5] to-[#22c55e] bg-clip-text text-transparent"> DataWhiz</span>
              <span className="text-white">?</span>
            </h2>
            <p className="text-xl text-[#d1d5db] max-w-3xl mx-auto">
              Built with cutting-edge technology to deliver insights that matter
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {coreFeatures.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: feature.delay }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.05, y: -10 }}
                className="card-bg rounded-2xl p-8 group cursor-pointer relative overflow-hidden"
              >
                {/* Background Gradient */}
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}></div>
                
                <div className="relative z-10">
                  <div className={`w-16 h-16 bg-gradient-to-r ${feature.gradient} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <feature.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4">{feature.title}</h3>
                  <p className="text-[#d1d5db] leading-relaxed">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Workflow Section - Timeline Layout */}
      <section className="py-32 px-6 relative">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="text-5xl md:text-6xl font-bold mb-6">
              <span className="text-white">How It</span>
              <span className="bg-gradient-to-r from-[#4f46e5] to-[#22c55e] bg-clip-text text-transparent"> Works</span>
            </h2>
            <p className="text-xl text-[#d1d5db] max-w-3xl mx-auto">
              Simple 4-step process to transform your data into insights
            </p>
          </motion.div>

          <div className="relative">
            {/* Connection Line */}
            <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-[#4f46e5] via-[#3b82f6] to-[#22c55e] transform -translate-y-1/2 hidden lg:block"></div>
            
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              {workflowSteps.map((step, index) => (
                <motion.div
                  key={step.step}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.2 }}
                  viewport={{ once: true }}
                  className="relative text-center"
                >
                  <div className="card-bg rounded-2xl p-6 relative z-10">
                    <div className="w-16 h-16 bg-gradient-to-r from-[#4f46e5] to-[#3b82f6] rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <step.icon className="w-8 h-8 text-white" />
                    </div>
                    <div className="text-3xl font-bold text-[#4f46e5] mb-2">{step.step}</div>
                    <h3 className="text-xl font-bold text-white mb-3">{step.title}</h3>
                    <p className="text-[#d1d5db] text-sm leading-relaxed">{step.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials - Carousel Style */}
      <section className="py-32 px-6 relative">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="text-5xl md:text-6xl font-bold mb-6">
              <span className="text-white">What Our</span>
              <span className="bg-gradient-to-r from-[#4f46e5] to-[#22c55e] bg-clip-text text-transparent"> Users</span>
              <span className="text-white"> Say</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.02, y: -5 }}
                className="card-bg rounded-2xl p-8 relative"
              >
                <div className="flex items-center gap-1 mb-6">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-[#d1d5db] mb-6 leading-relaxed italic">"{testimonial.content}"</p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-[#4f46e5] to-[#3b82f6] rounded-xl flex items-center justify-center">
                    <span className="text-white font-semibold">{testimonial.avatar}</span>
                  </div>
                  <div>
                    <div className="font-semibold text-white">{testimonial.name}</div>
                    <div className="text-sm text-[#d1d5db]">{testimonial.role} at {testimonial.company}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing - Floating Cards */}
      <section className="py-32 px-6 relative">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="text-5xl md:text-6xl font-bold mb-6">
              <span className="text-white">Choose Your</span>
              <span className="bg-gradient-to-r from-[#4f46e5] to-[#22c55e] bg-clip-text text-transparent"> Plan</span>
            </h2>
            <p className="text-xl text-[#d1d5db] max-w-3xl mx-auto">
              Flexible pricing designed to scale with your business
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {pricingPlans.map((plan, index) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.05, y: -10 }}
                className={`card-bg rounded-2xl p-8 relative ${plan.popular ? 'ring-2 ring-[#4f46e5]' : ''}`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-gradient-to-r from-[#4f46e5] to-[#3b82f6] text-white px-4 py-2 rounded-full text-sm font-semibold">
                      Most Popular
                    </span>
                  </div>
                )}
                
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-white mb-4">{plan.name}</h3>
                  <div className="mb-6">
                    <span className="text-4xl font-bold text-white">{plan.price}</span>
                    <span className="text-[#d1d5db]">{plan.period}</span>
                  </div>
                  
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-3 text-[#d1d5db]">
                        <CheckCircle className="w-5 h-5 text-[#22c55e] flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`w-full py-3 px-6 rounded-xl font-semibold transition-all duration-300 ${
                      plan.popular 
                        ? 'bg-gradient-to-r from-[#4f46e5] to-[#3b82f6] text-white hover:shadow-lg hover:shadow-[#4f46e5]/25' 
                        : 'bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] text-[#d1d5db] hover:border-[#4f46e5] hover:text-[#4f46e5]'
                    }`}
                  >
                    Get Started
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section - Split with Video */}
      <section className="py-32 px-6 relative">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="space-y-8"
            >
              <h2 className="text-5xl md:text-6xl font-bold">
                <span className="text-white">Ready to</span>
                <br />
                <span className="bg-gradient-to-r from-[#4f46e5] to-[#22c55e] bg-clip-text text-transparent">
                  Get Started?
                </span>
              </h2>
              <p className="text-xl text-[#d1d5db] leading-relaxed">
                Join thousands of companies already using DataWhiz to unlock the power of their data. 
                Start your free trial today and see the difference.
              </p>
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="btn-primary px-8 py-4 text-lg font-semibold group"
              >
                <span className="flex items-center gap-3">
                  Start Your Free Trial
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
              </motion.button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="card-bg rounded-2xl p-8 aspect-video flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-[#4f46e5]/20 to-[#22c55e]/20"></div>
                <div className="relative z-10 text-center">
                  <div className="w-20 h-20 bg-gradient-to-r from-[#4f46e5] to-[#3b82f6] rounded-full flex items-center justify-center mx-auto mb-4">
                    <Play className="w-8 h-8 text-white ml-1" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">Watch Demo</h3>
                  <p className="text-[#d1d5db]">See DataWhiz in action</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 px-6 border-t border-[rgba(255,255,255,0.1)]">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <img src="/logo.svg" alt="DataWhiz Logo" className="w-10 h-10 object-contain" style={{ backgroundColor: 'transparent', mixBlendMode: 'normal' }} />
              <span className="text-xl font-bold bg-gradient-to-r from-[#4f46e5] to-[#22c55e] bg-clip-text text-transparent">
                DataWhiz
              </span>
            </div>
            <div className="text-[#d1d5db] text-sm">
              © 2024 DataWhiz Analytics. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;