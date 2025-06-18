'use client';

export default function TestimonialsSection() {
  const testimonials = [
    {
      content: "InvoiceGen has completely transformed how I handle billing. What used to take hours now takes minutes. The automated calculations are a game-changer!",
      author: "Sarah Johnson",
      role: "Freelance Designer",
      avatar: "SJ"
    },
    {
      content: "As a small business owner, I needed something simple yet professional. InvoiceGen delivers exactly that. My clients love the clean, professional invoices.",
      author: "Michael Chen",
      role: "Marketing Consultant",
      avatar: "MC"
    },
    {
      content: "The client management features are fantastic. I can track everything in one place - invoices, payments, and client history. Highly recommended!",
      author: "Emily Rodriguez",
      role: "Web Developer",
      avatar: "ER"
    }
  ];

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
            Loved by thousands of businesses
          </h2>
          <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
            See what our customers have to say about their experience with InvoiceGen
          </p>
        </div>

        <div className="mt-16">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white rounded-xl shadow-lg p-8">
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                
                <blockquote className="text-gray-600 mb-6">
                  &quot;{testimonial.content}&quot;
                </blockquote>
                
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-medium">
                      {testimonial.avatar}
                    </div>
                  </div>
                  <div className="ml-4">
                    <div className="text-base font-medium text-gray-900">{testimonial.author}</div>
                    <div className="text-sm text-gray-600">{testimonial.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="mt-16">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-3 text-center">
              <div>
                <div className="text-3xl font-bold text-blue-600">10,000+</div>
                <div className="text-gray-600 mt-2">Happy Customers</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-blue-600">500K+</div>
                <div className="text-gray-600 mt-2">Invoices Generated</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-blue-600">99.9%</div>
                <div className="text-gray-600 mt-2">Uptime Guarantee</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
} 