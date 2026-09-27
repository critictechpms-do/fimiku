'use client';

import React, { useState } from 'react';
import { Phone, Mail, MapPin, Send, CheckCircle2, MessageSquare } from 'lucide-react';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="max-w-6xl 2xl:max-w-7xl mx-auto px-4 sm:px-6 2xl:px-10 py-10 space-y-10 bg-fimiku-softLavender pb-20">
      
      {/* 1. Header Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-fimiku-lightBorder shadow-card space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl sm:text-4xl font-bold text-fimiku-darkText flex items-center gap-2">
            <Phone className="w-8 h-8 text-fimiku-cta" /> Get in Touch
          </h1>
          <p className="text-xs sm:text-sm text-fimiku-secondaryText leading-relaxed">
            Have a question about a toy, an order, or just want to say hi? We&apos;re here to help! Fill out the form or reach us via our contact details below.
          </p>
        </div>

        {/* Contact Info Cards */}
        <div className="grid sm:grid-cols-3 gap-4 pt-4 border-t border-fimiku-lightBorder">
          {/* Store Location */}
          <div className="p-4 rounded-2xl bg-fimiku-softLavender border border-fimiku-lightBorder space-y-1 text-center sm:text-left">
            <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-red-500 mx-auto sm:mx-0">
              <MapPin className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-xs text-fimiku-darkText pt-1">Our Store</h3>
            <p className="text-[11px] text-fimiku-secondaryText leading-relaxed">
              123 Playland Avenue, Chennai, Tamil Nadu, 600001
            </p>
          </div>

          {/* Email Us */}
          <div className="p-4 rounded-2xl bg-fimiku-softLavender border border-fimiku-lightBorder space-y-1 text-center sm:text-left">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-500 mx-auto sm:mx-0">
              <Mail className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-xs text-fimiku-darkText pt-1">Email Us</h3>
            <p className="text-[11px] text-fimiku-secondaryText">
              support@fimiku.in
            </p>
          </div>

          {/* Call Us */}
          <div className="p-4 rounded-2xl bg-fimiku-softLavender border border-fimiku-lightBorder space-y-1 text-center sm:text-left">
            <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-fimiku-cta mx-auto sm:mx-0">
              <Phone className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-xs text-fimiku-darkText pt-1">Call Us</h3>
            <p className="text-[11px] text-fimiku-secondaryText">
              +91 98765 43210
            </p>
            <p className="text-[10px] text-fimiku-grayText">
              (Mon - Sat, 9 AM - 6 PM)
            </p>
          </div>
        </div>
      </div>

      {/* 2. Message Form Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-fimiku-lightBorder shadow-card space-y-6">
        <h2 className="text-xl sm:text-2xl font-bold text-fimiku-darkText flex items-center gap-2">
          <MessageSquare className="w-6 h-6 text-fimiku-cta" /> Send a Message
        </h2>

        {submitted ? (
          <div className="p-6 rounded-2xl bg-fimiku-softGreen border border-emerald-300 text-center space-y-2">
            <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
            <h3 className="font-bold text-emerald-900 text-base">Message Sent Successfully!</h3>
            <p className="text-xs text-emerald-800">
              Thank you for contacting Fimiku. Our gentle care support team will get back to you within 24 hours.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="font-semibold text-fimiku-darkText">Your Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="John Doe"
                  className="w-full px-4 py-3 rounded-2xl bg-fimiku-softLavender border border-fimiku-lightBorder focus:outline-none focus:border-fimiku-primary text-fimiku-darkText"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-fimiku-darkText">Email Address</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="john@example.com"
                  className="w-full px-4 py-3 rounded-2xl bg-fimiku-softLavender border border-fimiku-lightBorder focus:outline-none focus:border-fimiku-primary text-fimiku-darkText"
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="font-semibold text-fimiku-darkText">Phone Number</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="9876543210"
                  className="w-full px-4 py-3 rounded-2xl bg-fimiku-softLavender border border-fimiku-lightBorder focus:outline-none focus:border-fimiku-primary text-fimiku-darkText"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-fimiku-darkText">Subject</label>
                <input
                  type="text"
                  required
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  placeholder="Order Inquiry / Product Question"
                  className="w-full px-4 py-3 rounded-2xl bg-fimiku-softLavender border border-fimiku-lightBorder focus:outline-none focus:border-fimiku-primary text-fimiku-darkText"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-fimiku-darkText">Message</label>
              <textarea
                rows={4}
                required
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder="How can we help you and your little one today?"
                className="w-full px-4 py-3 rounded-2xl bg-fimiku-softLavender border border-fimiku-lightBorder focus:outline-none focus:border-fimiku-primary text-fimiku-darkText resize-none"
              ></textarea>
            </div>

            <button
              type="submit"
              className="w-full sm:w-auto px-8 py-3.5 bg-fimiku-cta hover:bg-fimiku-primary text-white font-semibold rounded-full transition shadow-md flex items-center justify-center gap-2"
            >
              Send Message <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        )}
      </div>

    </div>
  );
}
