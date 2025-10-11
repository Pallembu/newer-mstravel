'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { PortableText } from '@portabletext/react'
import { urlForProduct } from '@/sanity/lib/image'
import { X, Check, Star, MapPin, Clock, Users } from 'lucide-react'
import AnimatedSection, { StaggerContainer, StaggerItem } from './AnimatedSection'

// Types
interface ServicePrice {
  amount: number
  currency: string
  unit: string
}

interface ServicePackage {
  _id: string
  title: string
  slug: { current: string }
  description: any // Changed from string to any to support portable text
  icon?: {
    asset: {
      _id: string
      url: string
    }
    alt?: string
  }
  features: any // Changed from string[] to any to support portable text
  price?: ServicePrice
  category: string
  isPopular: boolean
  link?: string
  order?: number
}

interface ServiceModalProps {
  service: ServicePackage | null
  isOpen: boolean
  onClose: () => void
}

export default function ServiceModal({ service, isOpen, onClose }: ServiceModalProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true)
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
      const timer = setTimeout(() => setIsVisible(false), 300)
      return () => clearTimeout(timer)
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  // Format price function
  const formatPrice = (price: ServicePrice) => {
    const formatter = new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: price.currency || 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })
    
    const unitText = price.unit === 'person' ? 'orang' :
                     price.unit === 'group' ? 'grup' :
                     price.unit === 'day' ? 'hari' :
                     price.unit === 'package' ? 'paket' :
                     price.unit || 'orang'
    
    return `${formatter.format(price.amount)}/${unitText}`
  }

  // Handle backdrop click
  const handleBackdropClick = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault()
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      return () => document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen, onClose])

  if (!isVisible || !service) return null

  // Portable Text components
  const portableTextComponents = {
    block: {
      normal: ({ children }: any) => (
        <p className="text-base text-gray-600 leading-relaxed mb-4">
          {children}
        </p>
      ),
      h1: ({ children }: any) => (
        <h1 className="text-2xl font-bold text-gray-900 mb-4">{children}</h1>
      ),
      h2: ({ children }: any) => (
        <h2 className="text-xl font-semibold text-gray-900 mb-3">{children}</h2>
      ),
      h3: ({ children }: any) => (
        <h3 className="text-lg font-medium text-gray-900 mb-2">{children}</h3>
      ),
    },
    marks: {
      strong: ({ children }: any) => (
        <strong className="font-semibold text-gray-900">{children}</strong>
      ),
      em: ({ children }: any) => (
        <em className="italic">{children}</em>
      ),
      link: ({ children, value }: any) => (
        <a
          href={value.href}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:text-primary-dark underline"
        >
          {children}
        </a>
      ),
    },
    list: {
      bullet: ({ children }: any) => (
        <ul className="list-disc list-inside space-y-2 mb-4 text-gray-600">
          {children}
        </ul>
      ),
      number: ({ children }: any) => (
        <ol className="list-decimal list-inside space-y-2 mb-4 text-gray-600">
          {children}
        </ol>
      ),
    },
    listItem: {
      bullet: ({ children }: any) => (
        <li className="text-base leading-relaxed">{children}</li>
      ),
      number: ({ children }: any) => (
        <li className="text-base leading-relaxed">{children}</li>
      ),
    },
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[9999] flex items-start justify-center p-0 lg:p-8 backdrop-blur-sm overflow-y-auto"
          onClick={handleBackdropClick}
        >
          <motion.div 
            initial={{ scale: 0.9, opacity: 0, x: 0, y: 0 }}
            animate={{ scale: 1, opacity: 1, x: 0, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, x: 0, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="relative bg-white rounded-2xl shadow-2xl w-full lg:max-w-md lg:min-h-0 min-h-screen mx-auto"
            onClick={(e) => e.stopPropagation()}
          >
        {/* Close Button */}
        <motion.button
          onClick={onClose}
          whileHover={{ scale: 1.1, rotate: 90 }}
          whileTap={{ scale: 0.9 }}
          transition={{ duration: 0.2 }}
          className="absolute top-4 right-4 z-20 p-3 bg-white bg-opacity-95 rounded-full shadow-lg hover:bg-opacity-100 transition-all duration-300 ease-in-out touch-manipulation"
        >
          <X className="w-5 h-5 text-gray-600 hover:text-gray-800 transition-colors duration-200" />
        </motion.button>

        {/* Modal Content */}
        <div className="flex flex-col min-h-screen">
          {/* Image Section - Mobile style for all screen sizes */}
          <div className="relative w-full aspect-[1080/1350] overflow-hidden bg-gray-100 flex-shrink-0 rounded-t-2xl">
            {service.icon?.asset ? (
              <Image
                src={urlForProduct(service.icon).url()}
                alt={service.icon.alt || service.title}
                fill
                className="object-cover object-center transition-opacity duration-300"
                sizes="100vw"
                priority

              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center pt-4">
                <span className="text-white text-6xl font-bold opacity-20">
                  {service.title[0]}</span>
              </div>
            )}
            
            
           </div>

          {/* Content */}
          <div className="p-6 flex-1 overflow-y-auto">
            <div className="space-y-6">
              {/* Header */}
              <div>
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-3">
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 mb-4 leading-tight">
                    {service.title}
                  </h2>
                  <div className="prose prose-sm max-w-none">
                    {service.description && Array.isArray(service.description) && service.description.length > 0 ? (
                      <PortableText 
                        value={service.description} 
                        components={portableTextComponents}
                      />
                    ) : (
                      <p className="text-base text-gray-600 leading-relaxed mb-4">
                        {typeof service.description === 'string' ? service.description : 'No description available.'}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Price */}
              {service.price && (
                <div>
                  <div className="mb-6 p-4 bg-gray-50 rounded-xl">
                    <div className="flex flex-col justify-between">
                      <span className="text-sm text-gray-600 mb-1">Harga Mulai Dari:</span>
                      <span className="text-xl font-bold text-primary">
                        {formatPrice(service.price)}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Features */}
              {service.features && (
                <div>
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Yang Termasuk:
                    </h3>
                    <div className="prose prose-sm max-w-none">
                      {Array.isArray(service.features) && service.features.length > 0 ? (
                        // Handle PortableText array
                        <PortableText 
                          value={service.features} 
                          components={{
                            block: {
                              normal: ({ children }: any) => (
                                <div className="flex items-start gap-3 mb-3">
                                  <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                                  <span className="text-base text-gray-700 leading-relaxed">{children}</span>
                                </div>
                              ),
                            },
                            list: {
                              bullet: ({ children }: any) => (
                                <div className="space-y-3">
                                  {children}
                                </div>
                              ),
                              number: ({ children }: any) => (
                                <div className="space-y-3">
                                  {children}
                                </div>
                              ),
                            },
                            listItem: {
                              bullet: ({ children }: any) => (
                                <div className="flex items-start gap-3">
                                  <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                                  <span className="text-base text-gray-700 leading-relaxed">{children}</span>
                                </div>
                              ),
                              number: ({ children }: any) => (
                                <div className="flex items-start gap-3">
                                  <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                                  <span className="text-base text-gray-700 leading-relaxed">{children}</span>
                                </div>
                              ),
                            },
                          }}
                        />
                      ) : (
                        // Fallback for simple text
                        <div className="space-y-3">
                          <div className="flex items-start gap-3">
                            <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                            <span className="text-base text-gray-700 leading-relaxed">
                              {typeof service.features === 'string' ? service.features : 'No features available.'}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Service Information */}
              <div>
                <div className="mb-6 grid grid-cols-1 gap-3">
                  <div className="flex items-center gap-3 text-gray-600 py-2">
                    <MapPin className="w-5 h-5 text-primary" />
                    <span className="text-sm capitalize">
                      {service.category === 'packages' ? 'Paket Tour' :
                       service.category === 'custom' ? 'Tour Custom' :
                       service.category === 'group' ? 'Tour Grup' :
                       service.category === 'private' ? 'Tour Pribadi' :
                       service.category === 'adventure' ? 'Tour Petualangan' :
                       service.category === 'cultural' ? 'Tour Budaya' :
                       service.category}
                    </span>
                  </div>
                  {service.price && (
                    <div className="flex items-center gap-3 text-gray-600 py-2">
                      <Clock className="w-5 h-5 text-primary" />
                      <span className="text-sm">
                        {service.price.unit === 'person' ? 'Per Orang' :
                         service.price.unit === 'group' ? 'Per Grup' :
                         service.price.unit === 'day' ? 'Per Hari' :
                         service.price.unit === 'package' ? 'Per Paket' :
                         service.price.unit}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center gap-3 text-gray-600 py-2">
                    <Users className="w-5 h-5 text-primary" />
                    <span className="text-sm">
                      {service.isPopular ? 'Populer' : 'Tersedia'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div>
                <div className="flex flex-col gap-3 pt-2">
                  <a 
                    href="https://wa.me/6287770005801"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 border-2 border-primary bg-primary text-white py-4 px-6 rounded-xl text-base font-semibold text-center inline-block hover:bg-primary-dark transition-colors hover:border-primary-dark"
                  >
                    Konsultasi Gratis
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
        </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}