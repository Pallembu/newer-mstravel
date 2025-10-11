'use client'

import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { urlForHero } from '@/sanity/lib/image'

// TypeScript interfaces
interface SliderImage {
  image: {
    asset: {
      _id: string
      url: string
      metadata?: {
        dimensions: {
          width: number
          height: number
        }
      }
    }
    alt?: string
  }
  alt: string
  title?: string
  subtitle?: string
  caption?: string
}

interface SliderSettings {
  autoplay?: boolean
  interval?: number
  autoPlay?: boolean // Alternative CMS naming
  autoPlayInterval?: number // Alternative CMS naming
  showNavigation?: boolean
  showDots?: boolean
  pauseOnHover?: boolean
}

interface HeroSliderProps {
  title: string
  subtitle: string
  ctaText: string
  ctaLink: string
  sliderImages: SliderImage[]
  sliderSettings?: SliderSettings
  backgroundImage?: {
    asset: {
      _id: string
      url: string
      metadata?: {
        dimensions: {
          width: number
          height: number
        }
      }
    }
    alt?: string
  }
}

// Function to clean corrupted Unicode characters
function cleanText(text: string | undefined | null): string {
  if (!text || typeof text !== 'string') return ''
  
  // Remove Unicode corruption patterns and zero-width characters
  return text
    .replace(/[\u200B-\u200D\uFEFF]/g, '') // Zero-width characters
    .replace(/[\u2060-\u206F]/g, '') // Word joiner and other invisible characters
    .replace(/[\u00AD]/g, '') // Soft hyphen
    .replace(/[\u202A-\u202E]/g, '') // Directional marks
    .replace(/[\u2066-\u2069]/g, '') // Directional isolates
    .replace(/[\u061C]/g, '') // Arabic letter mark
    .replace(/[\u180E]/g, '') // Mongolian vowel separator
    .replace(/[\uFFF9-\uFFFB]/g, '') // Interlinear annotation characters
    .replace(/[\u034F]/g, '') // Combining grapheme joiner
    .replace(/[\u17B4-\u17B5]/g, '') // Khmer vowel inherent
    .replace(/[\u0001-\u001F\u007F-\u009F]/g, '') // Control characters
    .replace(/\uFFFD/g, '') // Replacement character
    .trim()
}

export default function HeroSlider({
  title,
  subtitle,
  ctaText,
  ctaLink,
  sliderImages,
  sliderSettings,
  backgroundImage
}: HeroSliderProps) {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isPlaying, setIsPlaying] = useState(true)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  // Clean and prepare slider settings
  const settings = useMemo(() => ({
    autoplay: sliderSettings?.autoplay ?? sliderSettings?.autoPlay ?? true,
    interval: (sliderSettings?.interval ?? sliderSettings?.autoPlayInterval ?? 5) * 1000,
    showNavigation: sliderSettings?.showNavigation ?? true,
    showDots: sliderSettings?.showDots ?? true,
    pauseOnHover: sliderSettings?.pauseOnHover ?? true
  }), [sliderSettings])

  // Clean text data
  const cleanTitle = cleanText(title) || "Mahabbatussholihin Tour & Travel"
  const cleanSubtitle = cleanText(subtitle) || "Mendampingi Jamaah Haji dan Umrah"
  const cleanCtaText = cleanText(ctaText) || "Info lebih lanjut"

  // Process slider images with cleaned text
  const processedImages = useMemo(() => {
    if (!sliderImages || sliderImages.length === 0) return []
    
    return sliderImages.map(img => ({
      ...img,
      alt: cleanText(img.alt) || 'Hero image',
      title: cleanText(img.title),
      subtitle: cleanText(img.subtitle),
      caption: cleanText(img.caption)
    }))
  }, [sliderImages])

  const hasMultipleSlides = processedImages.length > 1

  // Auto-play functionality
  const startAutoplay = useCallback(() => {
    if (!settings.autoplay || !hasMultipleSlides) return
    
    intervalRef.current = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % processedImages.length)
    }, settings.interval)
  }, [settings.autoplay, settings.interval, hasMultipleSlides, processedImages.length])

  const stopAutoplay = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [])

  // Initialize autoplay
  useEffect(() => {
    if (isPlaying) {
      startAutoplay()
    } else {
      stopAutoplay()
    }

    return () => stopAutoplay()
  }, [isPlaying, startAutoplay, stopAutoplay])

  // Navigation functions
  const goToSlide = (index: number) => {
    setCurrentSlide(index)
  }

  const nextSlide = () => {
    setCurrentSlide(prev => (prev + 1) % processedImages.length)
  }

  const prevSlide = () => {
    setCurrentSlide(prev => (prev - 1 + processedImages.length) % processedImages.length)
  }

  // Mouse event handlers
  const handleMouseEnter = () => {
    if (settings.pauseOnHover) {
      setIsPlaying(false)
    }
  }

  const handleMouseLeave = () => {
    if (settings.pauseOnHover) {
      setIsPlaying(true)
    }
  }

  // Get current slide data
  const currentSlideData = processedImages[currentSlide]
  const displayTitle = currentSlideData?.title || cleanTitle
  const displaySubtitle = currentSlideData?.subtitle || cleanSubtitle

  return (
    <section 
      className="relative h-screen flex items-center justify-center overflow-hidden"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Background Images */}
      {hasMultipleSlides ? (
        processedImages.map((slide, index) => (
          <div
            key={slide.image.asset._id}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentSlide ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <Image
              src={urlForHero(slide.image).width(1920).height(1080).url()}
              alt={slide.alt}
              fill
              className="object-cover"
              priority={index === 0}
              sizes="100vw"
            />
          </div>
        ))
      ) : backgroundImage ? (
        <Image
          src={urlForHero(backgroundImage).width(1920).height(1080).url()}
          alt={cleanText(backgroundImage.alt) || 'Hero background'}
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-700" />
      )}

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/40" />

      {/* Content */}
      <div className="relative z-10 text-center text-white px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
          {displayTitle}
        </h1>
        <p className="text-lg sm:text-xl lg:text-2xl mb-8 leading-relaxed max-w-3xl mx-auto">
          {displaySubtitle}
        </p>
        {currentSlideData?.caption && (
          <p className="text-base sm:text-lg mb-8 text-gray-200">
            {currentSlideData.caption}
          </p>
        )}
        <Link
          href={ctaLink}
          className="inline-block bg-primary hover:bg-primary-dark text-white font-semibold py-4 px-8 rounded-lg transition-colors duration-300 text-lg"
        >
          {cleanCtaText}
        </Link>
      </div>

      {/* Navigation Arrows */}
      {hasMultipleSlides && settings.showNavigation && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 z-20 bg-white/20 hover:bg-white/30 text-white p-3 rounded-full transition-colors duration-300"
            aria-label="Previous slide"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 z-20 bg-white/20 hover:bg-white/30 text-white p-3 rounded-full transition-colors duration-300"
            aria-label="Next slide"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </>
      )}

      {/* Dot Indicators */}
      {hasMultipleSlides && settings.showDots && (
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20 flex space-x-3">
          {processedImages.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-3 h-3 rounded-full transition-colors duration-300 ${
                index === currentSlide ? 'bg-white' : 'bg-white/50 hover:bg-white/75'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </section>
  )
}