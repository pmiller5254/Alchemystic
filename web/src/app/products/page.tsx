'use client';

import { motion } from 'framer-motion';
import MainLayout from '@/components/layout/MainLayout';
import ParticleBackground from '@/components/ui/ParticleBackground';

const products = [
    {
        name: 'Meditation Cushion Set',
        description: 'Handcrafted meditation cushions made from organic materials for optimal comfort during practice.',
        price: '$89.99',
        category: 'Meditation',
        image: '🧘‍♀️',
    },
    {
        name: 'Essential Oil Collection',
        description: 'Pure essential oils for aromatherapy, stress relief, and energy balancing.',
        price: '$129.99',
        category: 'Aromatherapy',
        image: '🌸',
    },
    {
        name: 'Yoga Mat Premium',
        description: 'Eco-friendly, non-slip yoga mat with alignment lines and carrying strap.',
        price: '$79.99',
        category: 'Yoga',
        image: '🧘',
    },
    {
        name: 'Crystal Healing Set',
        description: 'Curated collection of healing crystals for energy work and meditation.',
        price: '$149.99',
        category: 'Energy Work',
        image: '💎',
    },
    {
        name: 'Wellness Journal',
        description: 'Guided journal for tracking your wellness journey and personal growth.',
        price: '$24.99',
        category: 'Mindfulness',
        image: '📔',
    },
    {
        name: 'Herbal Tea Collection',
        description: 'Organic herbal tea blends for relaxation, energy, and overall wellness.',
        price: '$49.99',
        category: 'Herbal',
        image: '🍵',
    },
    {
        name: 'Sound Healing Bowl',
        description: 'Hand-hammered Tibetan singing bowl for meditation and sound therapy.',
        price: '$199.99',
        category: 'Sound Healing',
        image: '🔔',
    },
    {
        name: 'Wellness Retreat Kit',
        description: 'Complete kit for creating your own wellness retreat experience at home.',
        price: '$299.99',
        category: 'Wellness',
        image: '🎁',
    },
];

const categories = ['All', 'Meditation', 'Yoga', 'Aromatherapy', 'Energy Work', 'Mindfulness', 'Herbal', 'Sound Healing', 'Wellness'];

export default function Products() {
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
                        Wellness Products
                    </h1>
                    <p className="text-xl text-gray-300 mb-12 text-center max-w-3xl mx-auto">
                        Discover our curated collection of high-quality wellness products to support your journey
                    </p>

                    <div className="flex flex-wrap justify-center gap-4 mb-12">
                        {categories.map((category, index) => (
                            <motion.button
                                key={category}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="px-6 py-2 rounded-full bg-purple-900/30 border border-purple-500/20 text-purple-300 hover:bg-purple-600 hover:text-white transition-colors"
                            >
                                {category}
                            </motion.button>
                        ))}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                        {products.map((product, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                whileHover={{ y: -5 }}
                                className="p-6 rounded-xl bg-purple-900/30 backdrop-blur-sm border border-purple-500/20"
                            >
                                <div className="text-6xl mb-4 text-center">{product.image}</div>
                                <h3 className="text-xl font-semibold mb-2 text-purple-300 text-center">
                                    {product.name}
                                </h3>
                                <p className="text-gray-400 mb-4 text-center">{product.description}</p>
                                <div className="flex justify-between items-center">
                                    <span className="text-purple-400">{product.category}</span>
                                    <span className="text-white font-semibold">{product.price}</span>
                                </div>
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="w-full mt-4 px-4 py-2 rounded-full bg-purple-600 text-white font-semibold hover:bg-purple-700 transition-colors"
                                >
                                    Add to Cart
                                </motion.button>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            </div>
        </MainLayout>
    );
} 