'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import ParticleBackground from '@/components/ui/ParticleBackground';
import Script from 'next/script';

export default function Contact() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log('Form submitted:', formData);
        // Reset form
        setFormData({ name: '', email: '', subject: '', message: '' });
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    return (
        <MainLayout>
            <ParticleBackground />
            <div className="relative z-10 min-h-screen py-20 px-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="max-w-7xl mx-auto"
                >
                    <h1 className="text-4xl md:text-6xl font-bold mb-6 text-center bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
                        Contact Us
                    </h1>
                    <p className="text-xl text-gray-300 mb-12 text-center max-w-3xl mx-auto">
                        Get in touch with us or schedule a consultation to begin your wellness journey
                    </p>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                        {/* Contact Information */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                            className="space-y-8"
                        >
                            <div className="p-6 rounded-xl bg-purple-900/30 backdrop-blur-sm border border-purple-500/20">
                                <h2 className="text-2xl font-semibold text-purple-300 mb-6">Contact Information</h2>
                                <div className="space-y-4">
                                    <div className="flex items-center space-x-4">
                                        <span className="text-2xl">📍</span>
                                        <div>
                                            <h3 className="text-purple-300">Location</h3>
                                            <p className="text-gray-400">123 Wellness Way, Serenity City, SC 12345</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-4">
                                        <span className="text-2xl">📞</span>
                                        <div>
                                            <h3 className="text-purple-300">Phone</h3>
                                            <p className="text-gray-400">(555) 123-4567</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-4">
                                        <span className="text-2xl">✉️</span>
                                        <div>
                                            <h3 className="text-purple-300">Email</h3>
                                            <p className="text-gray-400">info@alchemysticwellness.com</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 rounded-xl bg-purple-900/30 backdrop-blur-sm border border-purple-500/20">
                                <h2 className="text-2xl font-semibold text-purple-300 mb-6">Business Hours</h2>
                                <div className="space-y-2 text-gray-400">
                                    <p>Monday - Friday: 9:00 AM - 6:00 PM</p>
                                    <p>Saturday: 10:00 AM - 4:00 PM</p>
                                    <p>Sunday: Closed</p>
                                </div>
                            </div>

                            {/* Contact Form */}
                            <motion.form
                                onSubmit={handleSubmit}
                                className="p-6 rounded-xl bg-purple-900/30 backdrop-blur-sm border border-purple-500/20"
                            >
                                <h2 className="text-2xl font-semibold text-purple-300 mb-6">Send us a Message</h2>
                                <div className="space-y-4">
                                    <div>
                                        <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">
                                            Name
                                        </label>
                                        <input
                                            type="text"
                                            id="name"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2 rounded-lg bg-black/50 border border-purple-500/20 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
                                            Email
                                        </label>
                                        <input
                                            type="email"
                                            id="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2 rounded-lg bg-black/50 border border-purple-500/20 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="subject" className="block text-sm font-medium text-gray-300 mb-1">
                                            Subject
                                        </label>
                                        <input
                                            type="text"
                                            id="subject"
                                            name="subject"
                                            value={formData.subject}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2 rounded-lg bg-black/50 border border-purple-500/20 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="message" className="block text-sm font-medium text-gray-300 mb-1">
                                            Message
                                        </label>
                                        <textarea
                                            id="message"
                                            name="message"
                                            value={formData.message}
                                            onChange={handleChange}
                                            rows={4}
                                            className="w-full px-4 py-2 rounded-lg bg-black/50 border border-purple-500/20 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                                            required
                                        />
                                    </div>
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        type="submit"
                                        className="w-full px-6 py-3 rounded-lg bg-purple-600 text-white font-semibold hover:bg-purple-700 transition-colors"
                                    >
                                        Send Message
                                    </motion.button>
                                </div>
                            </motion.form>
                        </motion.div>

                        {/* Calendly Section */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.4 }}
                            className="p-6 rounded-xl bg-purple-900/30 backdrop-blur-sm border border-purple-500/20"
                        >
                            <h2 className="text-2xl font-semibold text-purple-300 mb-6">Schedule a Consultation</h2>
                            <p className="text-gray-400 mb-6">
                                Book a free 15-minute consultation to discuss your wellness goals and how we can help you achieve them.
                            </p>
                            <div className="calendly-inline-widget" data-url="https://calendly.com/YOUR_CALENDLY_USERNAME/15min" style={{ minWidth: '320px', height: '700px' }}></div>
                            <Script src="https://assets.calendly.com/assets/external/widget.js" strategy="lazyOnload" />
                        </motion.div>
                    </div>
                </motion.div>
            </div>
        </MainLayout>
    );
} 