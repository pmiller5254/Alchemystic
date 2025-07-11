'use client';

import AlchemysticBanner from '@/components/ui/AlchemysticBanner/AlchemysticBanner';

export default function NourishPage() {
    return (
        <div className="min-h-screen">
            {/* ALCHEMYSTIC Banner that transforms to navbar */}
            <AlchemysticBanner page="nourish" />

            {/* Content sections to demonstrate scroll effect */}
            <section className="min-h-screen bg-gradient-to-br from-orange-50 to-yellow-50 flex items-center justify-center">
                <div className="max-w-4xl mx-auto text-center px-6">
                    <h2 className="text-5xl font-bold text-orange-900 mb-8">
                        Nourish Your Soul
                    </h2>
                    <p className="text-xl text-orange-800 leading-relaxed mb-12">
                        Discover the transformative power of alchemical nourishment.
                        Our carefully curated experiences blend ancient wisdom with modern wellness,
                        creating a symphony of healing for body, mind, and spirit.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
                        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg">
                            <div className="text-4xl mb-4">🌿</div>
                            <h3 className="text-2xl font-bold text-orange-900 mb-4">Plant Medicine</h3>
                            <p className="text-orange-700">
                                Sacred plant allies that guide you on a journey of inner discovery and healing.
                            </p>
                        </div>
                        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg">
                            <div className="text-4xl mb-4">🔮</div>
                            <h3 className="text-2xl font-bold text-orange-900 mb-4">Energy Work</h3>
                            <p className="text-orange-700">
                                Harmonize your energetic field through ancient practices and modern techniques.
                            </p>
                        </div>
                        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg">
                            <div className="text-4xl mb-4">✨</div>
                            <h3 className="text-2xl font-bold text-orange-900 mb-4">Transformation</h3>
                            <p className="text-orange-700">
                                Embrace profound change through guided alchemical processes.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            <section className="min-h-screen bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center">
                <div className="max-w-6xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-5xl font-bold text-orange-900 mb-8">
                            The Alchemical Journey
                        </h2>
                        <p className="text-xl text-orange-800 max-w-3xl mx-auto">
                            Experience the three stages of transformation that have guided seekers for millennia.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                        <div className="text-center">
                            <div className="w-32 h-32 mx-auto mb-8 rounded-full bg-gradient-to-br from-gray-800 to-black flex items-center justify-center">
                                <span className="text-4xl text-white">🖤</span>
                            </div>
                            <h3 className="text-3xl font-bold text-orange-900 mb-6">Nigredo</h3>
                            <p className="text-orange-700 text-lg leading-relaxed">
                                The dark night of the soul. A time of dissolution,
                                where old patterns are broken down to make space for new growth.
                            </p>
                        </div>

                        <div className="text-center">
                            <div className="w-32 h-32 mx-auto mb-8 rounded-full bg-gradient-to-br from-white to-gray-200 flex items-center justify-center border-4 border-orange-300">
                                <span className="text-4xl text-orange-900">🤍</span>
                            </div>
                            <h3 className="text-3xl font-bold text-orange-900 mb-6">Albedo</h3>
                            <p className="text-orange-700 text-lg leading-relaxed">
                                The washing and purification. Clarity emerges from chaos,
                                and the true self begins to shine through the cleansed spirit.
                            </p>
                        </div>

                        <div className="text-center">
                            <div className="w-32 h-32 mx-auto mb-8 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center">
                                <span className="text-4xl text-white">💛</span>
                            </div>
                            <h3 className="text-3xl font-bold text-orange-900 mb-6">Rubedo</h3>
                            <p className="text-orange-700 text-lg leading-relaxed">
                                The great work is complete. Integration and manifestation
                                of your highest self in perfect harmony with the universe.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            <section className="min-h-screen bg-gradient-to-br from-orange-200 to-yellow-200 flex items-center justify-center">
                <div className="max-w-4xl mx-auto text-center px-6">
                    <h2 className="text-5xl font-bold text-orange-900 mb-8">
                        Begin Your Transformation
                    </h2>
                    <p className="text-xl text-orange-800 leading-relaxed mb-12">
                        Every great journey begins with a single step.
                        Take yours today and discover the alchemist within.
                    </p>
                    <div className="space-y-8">
                        <button className="bg-gradient-to-r from-orange-600 to-yellow-600 hover:from-orange-700 hover:to-yellow-700 text-white font-bold py-4 px-12 rounded-full text-xl transition-all duration-300 transform hover:scale-105 shadow-lg">
                            Schedule Consultation
                        </button>
                        <div className="flex justify-center space-x-8 text-orange-700">
                            <span className="flex items-center">
                                <span className="text-2xl mr-2">📞</span>
                                (555) 123-MAGIC
                            </span>
                            <span className="flex items-center">
                                <span className="text-2xl mr-2">✉️</span>
                                hello@alchemystic.com
                            </span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Additional sections for testing scroll behavior */}
            <section className="min-h-screen bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
                <div className="max-w-4xl mx-auto text-center px-6">
                    <h2 className="text-5xl font-bold text-purple-900 mb-8">
                        Sacred Rituals & Ceremonies
                    </h2>
                    <p className="text-xl text-purple-800 leading-relaxed mb-12">
                        Connect with ancient wisdom through time-honored practices that awaken your inner knowing.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-16">
                        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg">
                            <div className="text-4xl mb-4">🌙</div>
                            <h3 className="text-2xl font-bold text-purple-900 mb-4">Moon Ceremonies</h3>
                            <p className="text-purple-700">
                                Align with lunar cycles for manifestation and release work.
                            </p>
                        </div>
                        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg">
                            <div className="text-4xl mb-4">🔥</div>
                            <h3 className="text-2xl font-bold text-purple-900 mb-4">Fire Rituals</h3>
                            <p className="text-purple-700">
                                Transform through the purifying power of sacred flame.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            <section className="min-h-screen bg-gradient-to-br from-teal-100 to-blue-100 flex items-center justify-center">
                <div className="max-w-6xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-5xl font-bold text-teal-900 mb-8">
                            Elemental Healing
                        </h2>
                        <p className="text-xl text-teal-800 max-w-3xl mx-auto">
                            Work with the four elements to restore balance and harmony within.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                        <div className="text-center">
                            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center">
                                <span className="text-3xl text-white">🔥</span>
                            </div>
                            <h3 className="text-2xl font-bold text-teal-900 mb-4">Fire</h3>
                            <p className="text-teal-700">Passion, transformation, courage</p>
                        </div>

                        <div className="text-center">
                            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-blue-500 to-teal-500 flex items-center justify-center">
                                <span className="text-3xl text-white">💧</span>
                            </div>
                            <h3 className="text-2xl font-bold text-teal-900 mb-4">Water</h3>
                            <p className="text-teal-700">Emotion, intuition, flow</p>
                        </div>

                        <div className="text-center">
                            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-yellow-400 to-green-400 flex items-center justify-center">
                                <span className="text-3xl text-white">💨</span>
                            </div>
                            <h3 className="text-2xl font-bold text-teal-900 mb-4">Air</h3>
                            <p className="text-teal-700">Mind, communication, clarity</p>
                        </div>

                        <div className="text-center">
                            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-green-600 to-brown-500 flex items-center justify-center">
                                <span className="text-3xl text-white">🌍</span>
                            </div>
                            <h3 className="text-2xl font-bold text-teal-900 mb-4">Earth</h3>
                            <p className="text-teal-700">Grounding, stability, abundance</p>
                        </div>
                    </div>
                </div>
            </section>

            <section className="min-h-screen bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center">
                <div className="max-w-4xl mx-auto text-center px-6">
                    <h2 className="text-5xl font-bold text-indigo-900 mb-8">
                        The Seven Chakras
                    </h2>
                    <p className="text-xl text-indigo-800 leading-relaxed mb-12">
                        Balance your energy centers for optimal health and spiritual growth.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
                        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
                            <div className="text-3xl mb-3">🔴</div>
                            <h4 className="text-lg font-bold text-indigo-900">Root Chakra</h4>
                            <p className="text-sm text-indigo-700">Grounding & Survival</p>
                        </div>
                        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
                            <div className="text-3xl mb-3">🟠</div>
                            <h4 className="text-lg font-bold text-indigo-900">Sacral Chakra</h4>
                            <p className="text-sm text-indigo-700">Creativity & Sexuality</p>
                        </div>
                        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
                            <div className="text-3xl mb-3">🟡</div>
                            <h4 className="text-lg font-bold text-indigo-900">Solar Plexus</h4>
                            <p className="text-sm text-indigo-700">Personal Power</p>
                        </div>
                        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
                            <div className="text-3xl mb-3">🟢</div>
                            <h4 className="text-lg font-bold text-indigo-900">Heart Chakra</h4>
                            <p className="text-sm text-indigo-700">Love & Connection</p>
                        </div>
                        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
                            <div className="text-3xl mb-3">🔵</div>
                            <h4 className="text-lg font-bold text-indigo-900">Throat Chakra</h4>
                            <p className="text-sm text-indigo-700">Communication</p>
                        </div>
                        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
                            <div className="text-3xl mb-3">🟣</div>
                            <h4 className="text-lg font-bold text-indigo-900">Third Eye</h4>
                            <p className="text-sm text-indigo-700">Intuition & Insight</p>
                        </div>
                        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg col-span-1 md:col-span-3 md:w-1/3 md:mx-auto">
                            <div className="text-3xl mb-3">⚪</div>
                            <h4 className="text-lg font-bold text-indigo-900">Crown Chakra</h4>
                            <p className="text-sm text-indigo-700">Spiritual Connection</p>
                        </div>
                    </div>
                </div>
            </section>

            <section className="min-h-screen bg-gradient-to-br from-rose-100 to-orange-100 flex items-center justify-center">
                <div className="max-w-4xl mx-auto text-center px-6">
                    <h2 className="text-5xl font-bold text-rose-900 mb-8">
                        Your Journey Awaits
                    </h2>
                    <p className="text-xl text-rose-800 leading-relaxed mb-12">
                        Ready to step into your power and embrace the magic within?
                        The path of transformation is calling you home.
                    </p>
                    <div className="space-y-8">
                        <button className="bg-gradient-to-r from-rose-600 to-orange-600 hover:from-rose-700 hover:to-orange-700 text-white font-bold py-6 px-16 rounded-full text-2xl transition-all duration-300 transform hover:scale-105 shadow-xl">
                            Start Your Alchemical Journey
                        </button>
                        <p className="text-rose-700 text-lg">
                            Book a free 30-minute discovery call to explore how we can support your transformation.
                        </p>
                    </div>
                </div>
            </section>
        </div>
    );
} 