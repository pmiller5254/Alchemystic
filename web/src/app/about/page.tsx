'use client';

import { motion } from 'framer-motion';
import MainLayout from '@/components/layout/MainLayout';
import ParticleBackground from '@/components/ui/ParticleBackground/ParticleBackground';

const teamMembers = [
    {
        name: 'Sarah Chen',
        role: 'Founder & Lead Practitioner',
        bio: 'With over 15 years of experience in holistic healing, Sarah combines ancient wisdom with modern wellness practices.',
        image: '👩‍🦰',
    },
    {
        name: 'Michael Rodriguez',
        role: 'Mindfulness Director',
        bio: 'Michael brings 10+ years of meditation and mindfulness expertise, specializing in stress reduction and mental wellness.',
        image: '👨‍🦱',
    },
    {
        name: 'Priya Patel',
        role: 'Energy Healing Specialist',
        bio: 'Priya is certified in multiple energy healing modalities and has helped hundreds of clients achieve balance and harmony.',
        image: '👩‍🦳',
    },
    {
        name: 'David Kim',
        role: 'Wellness Program Coordinator',
        bio: 'David designs and coordinates our wellness programs, ensuring each client receives personalized attention.',
        image: '👨‍🦲',
    },
];

export default function About() {
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
                        About Alchemystic Wellness
                    </h1>
                    <p className="text-xl text-gray-300 mb-12 text-center max-w-3xl mx-auto">
                        We are dedicated to transforming lives through holistic wellness practices that nurture mind, body, and spirit
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-20">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                            className="space-y-6"
                        >
                            <h2 className="text-3xl font-semibold text-purple-300">Our Mission</h2>
                            <p className="text-gray-300">
                                At Alchemystic Wellness, we believe in the power of holistic healing to transform lives. Our mission is to provide accessible,
                                personalized wellness solutions that combine ancient wisdom with modern practices, helping our clients achieve optimal health
                                and well-being.
                            </p>
                            <p className="text-gray-300">
                                We are committed to creating a nurturing environment where individuals can explore their wellness journey,
                                discover their inner strength, and cultivate lasting positive change in their lives.
                            </p>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.4 }}
                            className="space-y-6"
                        >
                            <h2 className="text-3xl font-semibold text-purple-300">Our Approach</h2>
                            <p className="text-gray-300">
                                Our approach to wellness is rooted in the understanding that true health encompasses physical, mental,
                                emotional, and spiritual well-being. We integrate various healing modalities to create comprehensive
                                wellness programs tailored to each individual's needs.
                            </p>
                            <p className="text-gray-300">
                                Through a combination of traditional practices and modern techniques, we help our clients develop
                                sustainable habits that promote long-term wellness and vitality.
                            </p>
                        </motion.div>
                    </div>

                    <h2 className="text-3xl font-semibold text-purple-300 mb-12 text-center">Our Team</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {teamMembers.map((member, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                whileHover={{ y: -5 }}
                                className="p-6 rounded-xl bg-purple-900/30 backdrop-blur-sm border border-purple-500/20 text-center"
                            >
                                <div className="text-6xl mb-4">{member.image}</div>
                                <h3 className="text-xl font-semibold mb-2 text-purple-300">{member.name}</h3>
                                <p className="text-purple-400 mb-3">{member.role}</p>
                                <p className="text-gray-400">{member.bio}</p>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            </div>
        </MainLayout>
    );
} 