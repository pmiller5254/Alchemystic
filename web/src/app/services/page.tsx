'use client';

import { motion } from 'framer-motion';
import MainLayout from '@/components/layout/MainLayout';
import ParticleBackground from '@/components/ui/ParticleBackground';

const services = [
    {
        title: 'Holistic Healing Sessions',
        description: 'Personalized healing sessions combining traditional and modern wellness practices.',
        duration: '60-90 minutes',
        price: 'From $120',
        icon: '🌿',
    },
    {
        title: 'Mindfulness Workshops',
        description: 'Group sessions focused on meditation, breathing techniques, and mindful living.',
        duration: '2 hours',
        price: 'From $75',
        icon: '🧘',
    },
    {
        title: 'Energy Balancing',
        description: 'Restore harmony to your body\'s energy systems through guided practices.',
        duration: '45-60 minutes',
        price: 'From $95',
        icon: '✨',
    },
    {
        title: 'Wellness Retreats',
        description: 'Immersive multi-day experiences combining various healing modalities.',
        duration: '3-7 days',
        price: 'From $1,200',
        icon: '🌅',
    },
    {
        title: 'Private Consultations',
        description: 'One-on-one sessions to develop your personalized wellness journey.',
        duration: '45 minutes',
        price: 'From $85',
        icon: '🎯',
    },
    {
        title: 'Group Classes',
        description: 'Regular classes in yoga, meditation, and energy work.',
        duration: '60 minutes',
        price: 'From $25',
        icon: '👥',
    },
];

export default function Services() {
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
                        Our Services
                    </h1>
                    <p className="text-xl text-gray-300 mb-12 text-center max-w-3xl mx-auto">
                        Discover our range of holistic wellness services designed to nurture your mind, body, and spirit
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {services.map((service, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                whileHover={{ y: -5 }}
                                className="p-6 rounded-xl bg-purple-900/30 backdrop-blur-sm border border-purple-500/20"
                            >
                                <div className="text-4xl mb-4">{service.icon}</div>
                                <h3 className="text-xl font-semibold mb-2 text-purple-300">
                                    {service.title}
                                </h3>
                                <p className="text-gray-400 mb-4">{service.description}</p>
                                <div className="flex justify-between text-sm text-gray-500">
                                    <span>{service.duration}</span>
                                    <span>{service.price}</span>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            </div>
        </MainLayout>
    );
} 