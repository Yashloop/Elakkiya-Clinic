import React from 'react';
import { motion } from 'framer-motion';
import AppointmentForm from '../components/AppointmentForm';
import { Calendar, Clock, CheckCircle } from 'lucide-react';
import AnimatedSection from '../components/AnimatedSection';

const Appointment = () => {
  const steps = [
    {
      icon: Calendar,
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600',
      title: 'Choose Your Date',
      description: 'Select a convenient date for your consultation',
    },
    {
      icon: Clock,
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
      title: 'Pick Time Slot',
      description: 'Choose from available time slots that work for you',
    },
    {
      icon: CheckCircle,
      iconBg: 'bg-purple-100',
      iconColor: 'text-purple-600',
      title: 'Instant Confirmation',
      description: 'Get immediate booking confirmation via email',
    },
  ];

  const expectations = [
    { icon: '📋', title: 'Initial Consultation', desc: 'Comprehensive health assessment and case taking' },
    { icon: '💊', title: 'Personalized Treatment', desc: 'Customized homeopathic remedies for your condition' },
    { icon: '📞', title: 'Follow-up Support', desc: 'Regular monitoring and adjustment of treatment' },
    { icon: '🌟', title: 'Holistic Care', desc: 'Address root causes for lasting wellness' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-white overflow-x-hidden">
      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="pt-24 sm:pt-32 pb-10 sm:pb-12 px-4"
      >
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-block bg-green-100 text-green-700 px-4 py-2 rounded-full text-xs sm:text-sm font-semibold mb-4">
            📅 Online Booking
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-800 mb-4">
            Schedule Your{' '}
            <span className="bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
              Appointment
            </span>
          </h1>
          <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto px-4">
            Take the first step towards natural healing. Book your consultation with our experienced homeopathic practitioners.
          </p>
        </div>
      </motion.div>

      {/* Information Cards */}
      <div className="max-w-6xl mx-auto px-4 pb-10 sm:pb-12">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
          {steps.map((step, index) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.15, duration: 0.5 }}
              className="bg-white rounded-xl p-5 sm:p-6 shadow-md hover:shadow-xl transition-shadow text-center"
            >
              <div className={`w-14 h-14 ${step.iconBg} rounded-full flex items-center justify-center mx-auto mb-4`}>
                <step.icon className={step.iconColor} size={28} />
              </div>
              <h3 className="font-bold text-gray-800 mb-2 text-base sm:text-lg">{step.title}</h3>
              <p className="text-gray-600 text-sm">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Appointment Form */}
      <div className="max-w-6xl mx-auto px-4 pb-16 sm:pb-20">
        <AnimatedSection>
          <AppointmentForm />
        </AnimatedSection>
      </div>

      {/* Additional Info */}
      <div className="bg-gradient-to-r from-green-500 to-blue-600 py-12 sm:py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 sm:p-8 text-white"
          >
            <h3 className="text-xl sm:text-2xl font-bold mb-6 text-center">What to Expect</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
              {expectations.map((item, i) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.5 }}
                  className="flex items-start space-x-3"
                >
                  <span className="text-2xl flex-shrink-0">{item.icon}</span>
                  <div>
                    <h4 className="font-semibold mb-1 text-sm sm:text-base">{item.title}</h4>
                    <p className="text-sm text-white/90">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Appointment;

