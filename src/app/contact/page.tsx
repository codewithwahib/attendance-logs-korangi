"use client";

import { useState } from 'react'
import { Mail, Phone, MapPin, Send, User, MessageSquare, CheckCircle } from 'lucide-react'
import Navbar from '../Components/navbar';
import Footer from '../Components/footer';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [submitError, setSubmitError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitError('')
    
    try {
      const response = await fetch('https://formsubmit.co/ajax/info@pengoffsec.com', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          message: formData.message,
          _subject: 'New Contact Form Submission',
          _template: 'table'
        })
      })

      const result = await response.json()

      if (response.ok) {
        setIsSubmitted(true)
        setFormData({ name: '', email: '', message: '' })
        setTimeout(() => setIsSubmitted(false), 3000)
      } else {
        setSubmitError(result.message || 'Something went wrong. Please try again.')
      }
    } catch (error) {
      setSubmitError('Network error. Please check your connection and try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  return (
    <>
    <div className="min-h-screen bg-gradient-to-br bg-gray-50">
      <Navbar />
      
      <main className="max-w-4xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Contact Us
          </h1>
          <p className="text-gray-600">
            Get in touch with our team for support, sales, or questions.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Contact Info */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Get in Touch</h2>
              
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Mail className="text-gray-500" size={18} />
                  <div>
                    <p className="font-medium text-gray-900">Email</p>
                    <p className="text-gray-600 text-sm">info@pengoffsec.com</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Phone className="text-gray-500" size={18} />
                  <div>
                    <p className="font-medium text-gray-900">Phone</p>
                    <p className="text-gray-600 text-sm">+92 (325) 3024092</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <MapPin className="text-gray-500" size={18} />
                  <div>
                    <p className="font-medium text-gray-900">Location</p>
                    <p className="text-gray-600 text-sm">Gulshan e Iqbal, Block 6, Karachi, Sindh, Pakistan.</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="font-bold text-gray-900 mb-2">Business Hours</h3>
              <p className="text-gray-600 text-sm">Mon-Fri : 9am - 6 Pm PST</p>
              <p className="text-gray-600 text-sm">Weekends : Emergency support only</p>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Send a Message</h2>
            
            {isSubmitted ? (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
                <p className="text-gray-700">Message sent! We&apos;ll respond soon.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                  {submitError && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-600">
                      {submitError}
                    </div>
                  )}
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        placeholder="Your name"
                        className="w-full pl-10 pr-4 py-2 border text-black border-gray-300 rounded-lg focus:ring-1 focus:ring-black focus:border-black text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        placeholder="your@email.com"
                        className="w-full pl-10 pr-4 py-2 border text-black border-gray-300 rounded-lg focus:ring-1 focus:ring-black focus:border-black text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Message
                    </label>
                    <div className="relative">
                      <MessageSquare className="absolute left-3 top-3 text-gray-400" size={16} />
                      <textarea
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        required
                        rows={4}
                        placeholder="How can we help?"
                        className="w-full pl-10 pr-4 py-2 border text-black border-gray-300 rounded-lg focus:ring-1 focus:ring-black focus:border-black text-sm"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-black text-white py-2 rounded-lg font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Sending...</span>
                      </>
                    ) : (
                      <>
                        <Send size={16} />
                        <span>Send Message</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Simple CTA */}
        <div className="text-center">
          <div className="bg-black text-white rounded-xl p-8">
            <h3 className="text-xl font-bold mb-2">Need immediate assistance?</h3>
            <p className="text-gray-300 mb-4">Call our support line 24/7 for urgent matters</p>
            <a 
              href="tel:+92 342 3415018"
              className="inline-block bg-white text-black px-6 py-2 rounded-lg font-medium hover:bg-gray-100"
            >
              +92 (342) 3415018
            </a>
          </div>
        </div>
      </main>
    </div>
    <Footer/>
    </>
  )
}