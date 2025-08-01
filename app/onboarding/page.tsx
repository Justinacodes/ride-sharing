// "use client";
// import { useState, useEffect } from "react";
// import { motion, useScroll, useTransform } from "framer-motion";
// import { Users, Leaf, MapPin, Shield, Star, ArrowRight, Play, Check, Globe, Clock, Heart, Menu, X, ChevronDown } from "lucide-react";

// const features = [
//   {
//     icon: Users,
//     title: "Ride with Neighbors",
//     description: "Connect with trusted community members you know and trust. Build lasting connections while getting where you need to go.",
//     color: "from-purple-500 to-purple-700",
//     stats: "10k+ verified neighbors",
//     highlight: "Most Popular"
//   },
//   {
//     icon: Shield,
//     title: "Safe & Secure",
//     description: "All riders and drivers are verified community members. Every trip is tracked and secure for your peace of mind.",
//     color: "from-purple-600 to-indigo-600",
//     stats: "100% verified profiles",
//     highlight: "Premium Safety"
//   },
//   {
//     icon: Leaf,
//     title: "Eco-Friendly Travel",
//     description: "Reduce your carbon footprint and travel costs by up to 70%. One shared ride makes a difference for your wallet and the world.",
//     color: "from-green-500 to-purple-500",
//     stats: "70% cost savings",
//     highlight: "Green Choice"
//   },
//   {
//     icon: MapPin,
//     title: "Smart Matching",
//     description: "Our intelligent algorithm matches you with the best drivers and riders on your route. Fast, reliable, and perfectly timed.",
//     color: "from-purple-500 to-pink-500",
//     stats: "< 2 min matching",
//     highlight: "AI Powered"
//   }
// ];

// const testimonials = [
//   {
//     name: "John Idowu",
//     role: "Daily Commuter",
//     content: "I've saved over 50k this month and made great friends through Ride-Geng. It's changed how I think about commuting!",
//     avatar: "JI",
//     rating: 5,
//     location: "Lagos, Nigeria"
//   },
//   {
//     name: "Mike Thoman",
//     role: "Weekend Driver",
//     content: "As a driver, I love meeting my neighbors and earning extra income. The app makes it so easy to connect with people.",
//     avatar: "MT",
//     rating: 5,
//     location: "Elizade University, Nigeria"
//   },
//   {
//     name: "Emma Wilson",
//     role: "Student",
//     content: "Perfect for getting to campus! I always ride with people from my area, and it's so much cheaper than other options.",
//     avatar: "EW",
//     rating: 5,
//     location: "Futa, Nigeria"
//   }
// ];

// const OnboardingPage = () => {
//   const [currentSlide, setCurrentSlide] = useState(0);
//   const [isMenuOpen, setIsMenuOpen] = useState(false);
//   const [isScrolled, setIsScrolled] = useState(false);
//   const { scrollY } = useScroll();
//   const y = useTransform(scrollY, [0, 500], [0, 150]);

//   const heroSlides = [
//     {
//       title: "Your Community on Wheels",
//       subtitle: "Connect with trusted neighbors for smarter, safer, and more social travel.",
//       image: "/assets/onboarding.jpg",
//       gradient: "from-purple-600 via-purple-700 to-indigo-800"
//     },
//     {
//       title: "Travel with Familiar Faces",
//       subtitle: "Share rides with verified community members you know and trust.",
//       image: "/assets/onboarding2.jpg",
//       gradient: "from-indigo-600 via-purple-700 to-purple-800"
//     },
//     {
//       title: "Save Money, Save the Planet",
//       subtitle: "Reduce costs and carbon footprint with every shared journey.",
//       image: "/assets/money.jpg",
//       gradient: "from-purple-700 via-indigo-700 to-blue-800"
//     }
//   ];

//   useEffect(() => {
//     const interval = setInterval(() => {
//       setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
//     }, 4000);
//     return () => clearInterval(interval);
//   }, );

//   useEffect(() => {
//     const handleScroll = () => {
//       setIsScrolled(window.scrollY > 50);
//     };
//     window.addEventListener('scroll', handleScroll);
//     return () => window.removeEventListener('scroll', handleScroll);
//   }, []);

//   const handleGetStarted = () => {
//     window.location.href = "/login";
//   };

//   const handleLogin = () => {
//     window.location.href = "/login";
//   };

//   const handleSignUp = () => {
//     window.location.href = "/register";
//   };

//   const scrollToSection = (sectionId: string) => {
//     document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
//     setIsMenuOpen(false);
//   };

//   return (
//     <div className="min-h-screen bg-white">
//       {/* Header */}
//       <motion.header
//         initial={{ opacity: 0, y: -50 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ duration: 0.8 }}
//         className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
//           isScrolled ? 'bg-white/95 backdrop-blur-lg shadow-lg' : 'bg-transparent'
//         }`}
//       >
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="flex items-center justify-between h-16">
//             {/* Logo */}
//             <div className="flex items-center gap-3">
//               <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-full flex items-center justify-center">
//                 <span className="text-white font-bold text-lg">RG</span>
//               </div>
//               <span className={`text-xl font-bold transition-colors ${
//                 isScrolled ? 'text-gray-900' : 'text-white'
//               }`}>
//                 Ride-<span className="text-purple-600">geng</span>
//               </span>
//             </div>

//             {/* Desktop Navigation */}
//             <nav className="hidden md:flex items-center space-x-8">
//               <button
//                 onClick={() => scrollToSection('features')}
//                 className={`font-medium transition-colors hover:text-purple-600 ${
//                   isScrolled ? 'text-gray-700' : 'text-white/90'
//                 }`}
//               >
//                 Features
//               </button>
//               <button
//                 onClick={() => scrollToSection('testimonials')}
//                 className={`font-medium transition-colors hover:text-purple-600 ${
//                   isScrolled ? 'text-gray-700' : 'text-white/90'
//                 }`}
//               >
//                 Reviews
//               </button>
//               <button
//                 onClick={() => scrollToSection('about')}
//                 className={`font-medium transition-colors hover:text-purple-600 ${
//                   isScrolled ? 'text-gray-700' : 'text-white/90'
//                 }`}
//               >
//                 About
//               </button>
//             </nav>

//             {/* Desktop Auth Buttons */}
//             <div className="hidden md:flex items-center space-x-4">
//               <button
//                 onClick={handleLogin}
//                 className={`font-medium transition-colors hover:text-purple-600 ${
//                   isScrolled ? 'text-gray-700' : 'text-white/90'
//                 }`}
//               >
//                 Login
//               </button>
//               <button
//                 onClick={handleSignUp}
//                 className="bg-gradient-to-r from-purple-600 to-purple-700 text-white px-6 py-2 rounded-full font-medium shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
//               >
//                 Sign Up
//               </button>
//             </div>

//             {/* Mobile Menu Button */}
//             <button
//               onClick={() => setIsMenuOpen(!isMenuOpen)}
//               className={`md:hidden transition-colors ${
//                 isScrolled ? 'text-gray-700' : 'text-white'
//               }`}
//             >
//               {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
//             </button>
//           </div>
//         </div>

//         {/* Mobile Menu */}
//         {isMenuOpen && (
//           <motion.div
//             initial={{ opacity: 0, y: -20 }}
//             animate={{ opacity: 1, y: 0 }}
//             exit={{ opacity: 0, y: -20 }}
//             className="md:hidden bg-white/95 backdrop-blur-lg border-t border-gray-200"
//           >
//             <div className="px-4 py-4 space-y-4">
//               <button
//                 onClick={() => scrollToSection('features')}
//                 className="block w-full text-left font-medium text-gray-700 hover:text-purple-600 transition-colors"
//               >
//                 Features
//               </button>
//               <button
//                 onClick={() => scrollToSection('testimonials')}
//                 className="block w-full text-left font-medium text-gray-700 hover:text-purple-600 transition-colors"
//               >
//                 Reviews
//               </button>
//               <button
//                 onClick={() => scrollToSection('about')}
//                 className="block w-full text-left font-medium text-gray-700 hover:text-purple-600 transition-colors"
//               >
//                 About
//               </button>
//               <hr className="border-gray-200" />
//               <button
//                 onClick={handleLogin}
//                 className="block w-full text-left font-medium text-gray-700 hover:text-purple-600 transition-colors"
//               >
//                 Login
//               </button>
//               <button
//                 onClick={handleSignUp}
//                 className="w-full bg-gradient-to-r from-purple-600 to-purple-700 text-white px-6 py-2 rounded-full font-medium shadow-lg"
//               >
//                 Sign Up
//               </button>
//             </div>
//           </motion.div>
//         )}
//       </motion.header>

//       {/* Hero Section */}
//       <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
//         <motion.div
//           style={{ y }}
//           className={`absolute inset-0 bg-gradient-to-br ${heroSlides[currentSlide].gradient} transition-all duration-1000`}
//         />
        
//         {/* Animated Background Elements */}
//         <div className="absolute inset-0 overflow-hidden">
//           <motion.div
//             animate={{
//               rotate: 360,
//               scale: [1, 1.1, 1],
//             }}
//             transition={{
//               rotate: { duration: 20, repeat: Infinity, ease: "linear" },
//               scale: { duration: 4, repeat: Infinity, ease: "easeInOut" }
//             }}
//             className="absolute -top-32 -right-32 w-96 h-96 bg-white/5 rounded-full"
//           />
//           <motion.div
//             animate={{
//               rotate: -360,
//               scale: [1, 1.2, 1],
//             }}
//             transition={{
//               rotate: { duration: 25, repeat: Infinity, ease: "linear" },
//               scale: { duration: 6, repeat: Infinity, ease: "easeInOut" }
//             }}
//             className="absolute -bottom-32 -left-32 w-96 h-96 bg-white/5 rounded-full"
//           />
//         </div>

//         <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16">
//           <div className="text-center text-white">
//             {/* Logo */}
//             <motion.div
//               initial={{ opacity: 0, scale: 0.8 }}
//               animate={{ opacity: 1, scale: 1 }}
//               transition={{ duration: 0.8 }}
//               className="mb-8"
//             >
//               {/* <motion.div
//                 animate={{ y: [-5, 5, -5] }}
//                 transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
//                 className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full mb-4"
//               >
//                 <span className="text-3xl font-bold text-white">RG</span>
//               </motion.div> */}
//               {/* <h1 className="text-3xl md:text-7xl font-bold mb-4 bg-gradient-to-r from-white via-purple-100 to-white bg-clip-text text-transparent">
//                 Ride-Geng
//               </h1> */}
//             </motion.div>

//             {/* Hero Content */}
//             <motion.div
//               key={currentSlide}
//               initial={{ opacity: 0, y: 30 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ duration: 0.8 }}
//               className="max-w-4xl mx-auto"
//             >
//               <h2 className="text-3xl md:text-5xl font-bold mb-6 leading-tight">
//                 {heroSlides[currentSlide].title}
//               </h2>
//               <p className="text-xl md:text-2xl text-purple-100 mb-8 leading-relaxed">
//                 {heroSlides[currentSlide].subtitle}
//               </p>
//             </motion.div>

//             {/* CTA Buttons */}
//             <motion.div
//               initial={{ opacity: 0, y: 30 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ duration: 0.8, delay: 0.3 }}
//               className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12"
//             >
//               <motion.button
//                 whileHover={{ scale: 1.05, y: -2 }}
//                 whileTap={{ scale: 0.95 }}
//                 onClick={handleGetStarted}
//                 className="group bg-white text-purple-700 px-8 py-4 rounded-full font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2"
//               >
//                 Get Started
//                 <motion.div
//                   animate={{ x: [0, 5, 0] }}
//                   transition={{ duration: 1.5, repeat: Infinity }}
//                 >
//                   <ArrowRight className="w-5 h-5" />
//                 </motion.div>
//               </motion.button>
//               <motion.button
//                 whileHover={{ scale: 1.05 }}
//                 whileTap={{ scale: 0.95 }}
//                 className="flex items-center gap-2 text-white/90 hover:text-white transition-colors group"
//               >
//                 <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center group-hover:bg-white/30 transition-colors">
//                   <Play className="w-5 h-5 ml-1" />
//                 </div>
//                 Watch Demo
//               </motion.button>
//             </motion.div>

//             {/* Hero Stats */}
//             <motion.div
//               initial={{ opacity: 0, y: 30 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ duration: 0.8, delay: 0.6 }}
//               className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-2xl mx-auto"
//             >
//               {[
//                 { number: "10k+", label: "Active Users" },
//                 { number: "50k+", label: "Rides Completed" },
//                 { number: "4.9", label: "App Rating" }
//               ].map((stat, index) => (
//                 <motion.div
//                   key={index}
//                   initial={{ opacity: 0, y: 20 }}
//                   animate={{ opacity: 1, y: 0 }}
//                   transition={{ duration: 0.6, delay: 0.8 + index * 0.1 }}
//                   className="text-center"
//                 >
//                   <div className="text-3xl font-bold text-white mb-1">{stat.number}</div>
//                   <div className="text-purple-200 text-sm">{stat.label}</div>
//                 </motion.div>
//               ))}
//             </motion.div>
//           </div>
//         </div>

//         {/* Scroll Indicator
//         <motion.div
//           animate={{ y: [0, 10, 0] }}
//           transition={{ duration: 2, repeat: Infinity }}
//           className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white/70"
//         >
//           <ChevronDown className="w-6 h-12" />
//         </motion.div> */}

//         {/* Slide Indicators */}
//         {/* <div className="absolute bottom-40 left-1/2 transform -translate-x-1/2 flex space-x-2">
//           {heroSlides.map((_, index) => (
//             <button
//               key={index}
//               onClick={() => setCurrentSlide(index)}
//               className={`w-3 h-3 rounded-full transition-all duration-300 ${
//                 index === currentSlide ? 'bg-white w-8' : 'bg-white/50'
//               }`}
//             />
//           ))}
//         </div> */}
//       </section>

//       {/* Features Section */}
//       <section id="features" className="py-20 bg-gray-50">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           <motion.div
//             initial={{ opacity: 0, y: 50 }}
//             whileInView={{ opacity: 1, y: 0 }}
//             transition={{ duration: 0.8 }}
//             viewport={{ once: true }}
//             className="text-center mb-16"
//           >
//             <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
//               Why Choose Ride-Geng?
//             </h2>
//             <p className="text-xl text-gray-600 max-w-3xl mx-auto">
//               Experience the future of community-based transportation with features designed for safety, savings, and social connection.
//             </p>
//           </motion.div>

//           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
//             {features.map((feature, index) => {
//               const IconComponent = feature.icon;
//               return (
//                 <motion.div
//                   key={index}
//                   initial={{ opacity: 0, y: 50 }}
//                   whileInView={{ opacity: 1, y: 0 }}
//                   transition={{ duration: 0.6, delay: index * 0.1 }}
//                   viewport={{ once: true }}
//                   whileHover={{ y: -5, scale: 1.02 }}
//                   className="relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group"
//                 >
//                   {/* Highlight Badge */}
//                   <div className="absolute top-4 right-4 bg-gradient-to-r from-purple-500 to-purple-600 text-white text-xs px-3 py-1 rounded-full">
//                     {feature.highlight}
//                   </div>
                  
//                   {/* Background Gradient */}
//                   <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
                  
//                   <div className="relative flex items-start gap-6">
//                     <motion.div
//                       whileHover={{ rotate: 360 }}
//                       transition={{ duration: 0.6 }}
//                       className={`w-16 h-16 bg-gradient-to-br ${feature.color} rounded-full flex items-center justify-center flex-shrink-0`}
//                     >
//                       <IconComponent className="w-8 h-8 text-white" />
//                     </motion.div>
//                     <div className="flex-1">
//                       <div className="flex items-center justify-between mb-3">
//                         <h3 className="text-xl font-bold text-gray-900">{feature.title}</h3>
//                         <span className="text-sm text-purple-600 font-semibold">{feature.stats}</span>
//                       </div>
//                       <p className="text-gray-600 leading-relaxed">{feature.description}</p>
//                     </div>
//                   </div>
//                 </motion.div>
//               );
//             })}
//           </div>
//         </div>
//       </section>

//       {/* Testimonials Section */}
//       <section id="testimonials" className="py-20 bg-white">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           <motion.div
//             initial={{ opacity: 0, y: 50 }}
//             whileInView={{ opacity: 1, y: 0 }}
//             transition={{ duration: 0.8 }}
//             viewport={{ once: true }}
//             className="text-center mb-16"
//           >
//             <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
//               What Our Community Says
//             </h2>
//             <p className="text-xl text-gray-600 max-w-3xl mx-auto">
//               Join thousands of happy riders and drivers who have transformed their daily commute across Nigeria.
//             </p>
//           </motion.div>

//           <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
//             {testimonials.map((testimonial, index) => (
//               <motion.div
//                 key={index}
//                 initial={{ opacity: 0, y: 50 }}
//                 whileInView={{ opacity: 1, y: 0 }}
//                 transition={{ duration: 0.6, delay: index * 0.1 }}
//                 viewport={{ once: true }}
//                 whileHover={{ y: -5 }}
//                 className="bg-gray-50 rounded-2xl p-8 relative hover:shadow-lg transition-all duration-300"
//               >
//                 <div className="flex items-center mb-4">
//                   {[...Array(testimonial.rating)].map((_, i) => (
//                     <motion.div
//                       key={i}
//                       initial={{ opacity: 0, scale: 0 }}
//                       animate={{ opacity: 1, scale: 1 }}
//                       transition={{ delay: i * 0.1 }}
//                     >
//                       <Star className="w-5 h-5 text-yellow-400 fill-current" />
//                     </motion.div>
//                   ))}
//                 </div>
//                 <p className="text-gray-700 mb-6 italic leading-relaxed">{testimonial.content}</p>
//                 <div className="flex items-center gap-4">
//                   <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-purple-700 rounded-full flex items-center justify-center">
//                     <span className="text-white font-semibold">{testimonial.avatar}</span>
//                   </div>
//                   <div>
//                     <h4 className="font-semibold text-gray-900">{testimonial.name}</h4>
//                     <p className="text-gray-600 text-sm">{testimonial.role}</p>
//                     <p className="text-purple-600 text-xs">{testimonial.location}</p>
//                   </div>
//                 </div>
//               </motion.div>
//             ))}
//           </div>
//         </div>
//       </section>

//       {/* CTA Section */}
//       <section id="about" className="pt-20 bg-gradient-to-br from-purple-600 to-indigo-800 relative overflow-hidden">
//         <motion.div
//           animate={{ rotate: 360 }}
//           transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
//           className="absolute -top-32 -right-32 w-96 h-96 bg-white/5 rounded-full"
//         />
        
//         <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
//           <motion.div
//             initial={{ opacity: 0, y: 50 }}
//             whileInView={{ opacity: 1, y: 0 }}
//             transition={{ duration: 0.8 }}
//             viewport={{ once: true }}
//           >
//             <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
//               Ready to Transform Your Commute?
//             </h2>
//             <p className="text-xl text-purple-100 mb-8 max-w-2xl mx-auto">
//               Join the Ride-Geng community today. Connect with your neighbors, save money, and make every journey more meaningful.
//             </p>
//             <motion.button
//               whileHover={{ scale: 1.05, y: -2 }}
//               whileTap={{ scale: 0.95 }}
//               onClick={handleGetStarted}
//               className="group bg-white text-purple-700 px-12 py-4 rounded-full font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2 mx-auto"
//             >
//               Start Your Journey
//               <motion.div
//                 animate={{ x: [0, 5, 0] }}
//                 transition={{ duration: 1.5, repeat: Infinity }}
//               >
//                 <ArrowRight className="w-5 h-5" />
//               </motion.div>
//             </motion.button>
//           </motion.div>
//           <p className="text-right text-purple-200 text-sm mt-8">© 2025 Ride-Geng. All rights reserved.</p>
//         </div>

//       </section>
//     </div>
//   );
// };

// export default OnboardingPage;