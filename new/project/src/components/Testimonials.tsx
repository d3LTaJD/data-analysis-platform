import React from 'react';
import { Star, Quote, ArrowRight, ArrowLeft } from 'lucide-react';

const Testimonials: React.FC = () => {
  const testimonials = [
    {
      name: 'Krish Panchal',
      role: 'Data Analyst',
      company: 'TechCorp',
      rating: 5,
      content: 'DataWhiz has revolutionized how we approach analytics. The AI insights are incredibly accurate and the real-time dashboards have transformed our decision-making process.',
      avatar: 'KP'
    },
    {
      name: 'Akhilesh Pathak',
      role: 'Marketing Manager',
      company: 'Synconic',
      rating: 5,
      content: 'The platform\'s ability to identify patterns and trends has directly contributed to a 40% increase in our marketing ROI. The outlier analysis is spot-on.',
      avatar: 'AP'
    },
    {
      name: 'Arun Kapadia',
      role: 'Wealth Manager',
      company: 'FinancePro',
      rating: 5,
      content: 'This tool has been a game-changer for my investment recommendations. The analysis is not only accurate but incredibly timely, helping my clients achieve better returns.',
      avatar: 'AK'
    }
  ];

  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 relative">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center space-x-2 bg-primary-600 text-white px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Star className="h-4 w-4" />
            <span>Customer Success</span>
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-8">
            <span className="text-white">
              Loved by Teams
            </span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto font-medium leading-relaxed">
            See how DataWhiz is transforming businesses across industries
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="group relative bg-gradient-to-br from-white/15 to-white/8 backdrop-blur-xl border border-white/25 rounded-2xl p-8 hover:border-white/35 transition-all duration-500 hover:transform hover:scale-105 hover:shadow-2xl"
            >
              {/* Quote Icon */}
              <div className="absolute top-6 right-6 text-white/20 group-hover:text-white/40 transition-colors duration-300">
                <Quote className="h-8 w-8" />
              </div>

              {/* Rating */}
              <div className="flex items-center mb-6">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                ))}
              </div>

              {/* Content */}
              <p className="text-gray-300 mb-8 leading-relaxed text-lg italic">
                "{testimonial.content}"
              </p>

              {/* Author */}
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                  {testimonial.avatar}
                </div>
                <div>
                  <div className="font-bold text-white text-lg">{testimonial.name}</div>
                  <div className="text-gray-400 text-sm">{testimonial.role} at {testimonial.company}</div>
                </div>
              </div>

              {/* Hover Effect */}
              <div className="absolute inset-0 bg-primary-600/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
            </div>
          ))}
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="text-center">
            <div className="text-4xl font-bold text-white mb-2">98%</div>
            <div className="text-gray-400 text-sm">Customer Satisfaction</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-white mb-2">500+</div>
            <div className="text-gray-400 text-sm">Companies Trust Us</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-white mb-2">10M+</div>
            <div className="text-gray-400 text-sm">Data Points Analyzed</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-white mb-2">24/7</div>
            <div className="text-gray-400 text-sm">Expert Support</div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center mt-16">
          <div className="inline-flex items-center space-x-6 bg-primary-600/20 backdrop-blur-sm border border-white/10 rounded-2xl p-8">
            <div>
              <h3 className="text-2xl font-bold text-white mb-2">Ready to join them?</h3>
              <p className="text-gray-300">Start your free trial today and see the difference</p>
            </div>
            <button className="bg-primary-600 hover:bg-primary-500 text-white px-8 py-4 rounded-xl font-bold transition-all duration-300 flex items-center space-x-2">
              <span>Get Started</span>
              <ArrowRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials; 