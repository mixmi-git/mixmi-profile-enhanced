'use client'

import Image from "next/image"
import Link from "next/link"
import { useState, useCallback, useEffect, memo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Youtube, Music2, CloudRain, Twitter, Edit2, Plus, Trash2, Upload, User, Linkedin, Instagram, ShoppingBag, Store, Gift } from "lucide-react"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Checkbox } from "@/components/ui/checkbox"
import { debounce } from "lodash"
import ReactCrop, { Crop as CropType } from 'react-image-crop'
import 'react-image-crop/dist/ReactCrop.css'
import { parseGIF, decompressFrames } from 'gifuct-js'
import { useAuth } from "@/lib/auth"

// Add custom TikTok icon component
const TikTokIcon = () => (
  <svg 
    viewBox="0 0 24 24" 
    className="h-5 w-5 sm:h-6 sm:w-6" 
    fill="currentColor"
    aria-hidden="true"
  >
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
  </svg>
)

interface NavbarProps {
  isAuthenticated: boolean;
  onLoginToggle: () => void;
}

interface SocialLink {
  platform: string;
  url: string;
}

export interface Project {
  id: number;
  title: string;
  description: string;
  image: string;
  link: string;
}

export interface MediaItem {
  id: string;
  title?: string;
  type: 'youtube' | 'soundcloud' | 'soundcloud-playlist' | 'spotify' | 'spotify-playlist' | 'apple-music-playlist' | 'apple-music-album';
  embedUrl?: string;
  rawUrl?: string;
}

export interface Profile {
  name: string;
  title: string;
  bio: string;
  image: string;
  socialLinks: SocialLink[];
  sectionVisibility: {
    projects: boolean;
    media: boolean;
    shop: boolean;
  };
}

// Add interface for form errors
interface FormErrors {
  name: string;
  title: string;
  bio: string;
  socialLinks: string[];
}

interface Sticker {
  enabled: boolean;
  image: string;
}

// Add these interfaces
interface CropState {
  crop: CropType;
  aspect: number;
  imageRef: HTMLImageElement | null;
  completedCrop: CropType | null;
}

// Add this component before the main Component
const MediaEmbed = memo(({ item }: { item: MediaItem }) => {
  // Adjust aspect ratios for different media types
  const getAspectRatio = () => {
    switch (item.type) {
      case 'youtube':
        return 'pb-[56.25%]' // 16:9 ratio
      case 'soundcloud':
        return 'pb-[300px]'  // Fixed height for tracks
      case 'soundcloud-playlist':
        return 'pb-[400px]'  // Taller height for playlists
      case 'spotify':
        return 'pb-[152px]'  // Single track
      case 'spotify-playlist':
        return 'pb-[380px]'  // Playlist height
      case 'apple-music-album':
        return 'pb-[175px]'  // Height for album
      case 'apple-music-playlist':
        return 'pb-[450px]'  // Height for playlist
      default:
        return 'pb-[56.25%]'
    }
  }

  switch (item.type) {
    case 'youtube':
      return (
        <div className="relative pb-[56.25%] h-0">
          <iframe
            className="absolute top-0 left-0 w-full h-full"
            src={`https://www.youtube.com/embed/${item.id}`}
            allow="autoplay; encrypted-media"
            allowFullScreen
            loading="lazy"
          />
        </div>
      )
    case 'soundcloud':
    case 'soundcloud-playlist':
      return (
        <div className={`relative ${getAspectRatio()} h-0`}>
          <iframe
            className="absolute top-0 left-0 w-full h-full"
            scrolling="no"
            frameBorder="no"
            allow="autoplay"
            src={item.id}
            style={{ background: 'transparent' }}  // Add this to fix black background
          />
        </div>
      )
    case 'spotify':
      return (
        <div className="relative pb-[152px] h-0">
          <iframe
            className="absolute top-0 left-0 w-full h-full"
            src={`https://open.spotify.com/embed/track/${item.id}`}
            allow="encrypted-media"
          />
        </div>
      )
    case 'spotify-playlist':
      return (
        <div className={`relative ${getAspectRatio()} h-0`}>
          <iframe
            className="absolute top-0 left-0 w-full h-full"
            src={`https://open.spotify.com/embed/playlist/${item.id}`}
            allow="encrypted-media"
            loading="lazy"
            style={{ background: 'transparent' }}
          />
        </div>
      )
    case 'apple-music-album':
    case 'apple-music-playlist':
      return (
        <div className={`relative ${getAspectRatio()} h-0`}>
          <iframe
            className="absolute top-0 left-0 w-full h-full"
            allow="autoplay *; encrypted-media *; fullscreen *"
            frameBorder="0"
            style={{ 
              width: '100%', 
              maxWidth: '660px', 
              overflow: 'hidden', 
              background: 'transparent',
              borderRadius: '10px'
            }}
            sandbox="allow-forms allow-popups allow-same-origin allow-scripts allow-storage-access-by-user-activation allow-top-navigation-by-user-activation"
            src={item.id}
          />
        </div>
      )
    default:
      return null
  }
})

// Update the ShopItem interface
export interface ShopItem {
  id: string;
  title: string;
  storeUrl: string;
  image: string;
  platform: 'shopify' | 'etsy' | 'gumroad' | 'bigcartel' | 'other';
}

// Simplified shop card
const ShopItemCard = ({ item, isEditing = false }: { item: ShopItem, isEditing?: boolean }) => {
  return (
    <Card className={`w-full overflow-hidden group ${isEditing ? 'max-w-sm' : ''}`}>
      <CardContent className="p-0">
        <a 
          href={item.storeUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="block"
        >
          <div className={`relative ${isEditing ? 'aspect-[3/2]' : 'aspect-[4/3]'} w-full bg-gray-800`}>
            <Image
              src={item.image || defaultProductImage}
              alt={item.title || 'Product image'}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              unoptimized
            />
          </div>
          <div className="p-4">
            <div className="font-semibold mb-2 text-lg">
              {item.title || 'Untitled Product'}
            </div>
            <div className="text-sm text-gray-400">
              Visit Store
            </div>
          </div>
        </a>
      </CardContent>
    </Card>
  )
}

function Navbar({ isAuthenticated, onLoginToggle }: NavbarProps) {
  return (
    <nav className="sticky top-0 z-40 bg-gray-900/95 backdrop-blur-sm py-6 px-8 flex items-center justify-between border-b border-gray-800">
      <div className="flex items-center">
        <Link href="/">
          <div className="w-20 h-8 relative">
            <Image
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Logotype_Main@1.5x-v0CzgGF3X0t7k4yaBbFQWerwN5bGdC.png"
              alt="mixmi"
              fill
              className="object-contain"
              priority
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
        </Link>
      </div>
      <div className="flex items-center space-x-4">
        <Button 
          variant="outline" 
          className="text-white border-white hover:bg-gray-800"
          onClick={onLoginToggle}
        >
          {isAuthenticated ? "Disconnect Wallet" : "Connect Wallet"}
        </Button>
      </div>
    </nav>
  )
}

// Add these helper functions
const extractMediaId = (url: string, type: MediaItem['type']): string => {
  try {
    switch (type) {
      case 'youtube':
        const ytRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/
        const ytMatch = url.match(ytRegex)
        return ytMatch ? ytMatch[1] : url

      case 'soundcloud':
      case 'soundcloud-playlist':
        const iframeSrcRegex = /src="([^"]+)"/
        const iframeMatch = url.match(iframeSrcRegex)
        if (iframeMatch) return iframeMatch[1]
        
        const scRegex = /soundcloud\.com\/([^\/]+\/(?:sets\/)?[^\/]+)/
        const scMatch = url.match(scRegex)
        return scMatch 
          ? `https://w.soundcloud.com/player/?url=https://soundcloud.com/${scMatch[1]}&color=%23ff5500&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true&visual=true`
          : url

      case 'spotify':
        const spRegex = /spotify\.com\/track\/([a-zA-Z0-9]+)/
        const spMatch = url.match(spRegex)
        return spMatch ? spMatch[1] : url

      case 'spotify-playlist':
        const spPlaylistRegex = /spotify\.com\/playlist\/([a-zA-Z0-9]+)/
        const spPlaylistMatch = url.match(spPlaylistRegex)
        return spPlaylistMatch ? spPlaylistMatch[1] : url

      case 'apple-music-album':
      case 'apple-music-playlist':
        try {
          const cleanUrl = url.replace(/^@/, '').trim()
          const match = cleanUrl.match(/music\.apple\.com\/([^\/]+)\/(album|playlist)\/([^\/]+)\/([^\/\?]+)/)
          if (match) {
            const [_, country, mediaType, name, id] = match
            return `https://embed.music.apple.com/${country}/${mediaType}/${id}`
          }
          return url
        } catch (error) {
          console.error('Error parsing Apple Music URL:', error)
          return url
        }

      default:
        return url
    }
  } catch (error) {
    console.error('Error parsing URL:', error)
    return url
  }
}

// Add this validation function
const isValidAppleMusicUrl = (url: string): boolean => {
  // Check for basic Apple Music URL structure
  const validUrlPattern = /^https:\/\/music\.apple\.com\/[a-z]{2}\/(album|playlist)\/[^\/]+\/[0-9]+(\?.*)?$/i
  return validUrlPattern.test(url)
}

// Add this helper function to detect media type from URL
const detectMediaType = (url: string): MediaItem['type'] => {
  if (url.includes('youtube.com') || url.includes('youtu.be')) {
    return 'youtube'
  }
  if (url.includes('soundcloud.com')) {
    return url.includes('/sets/') ? 'soundcloud-playlist' : 'soundcloud'
  }
  if (url.includes('spotify.com')) {
    return url.includes('/playlist/') ? 'spotify-playlist' : 'spotify'
  }
  if (url.includes('music.apple.com')) {
    return url.includes('/album/') ? 'apple-music-album' : 'apple-music-playlist'
  }
  return 'youtube' // default
}

const defaultStickerImage = "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/daisy-blue-1sqZRfemKwLyREL0Eo89EfmQUT5wst.png"

// Add these helper functions
const fetchMediaTitle = async (url: string, type: MediaItem['type']): Promise<string> => {
  try {
    switch (type) {
      case 'youtube':
        // Extract video ID and fetch title from YouTube oEmbed
        const videoId = extractMediaId(url, 'youtube')
        const response = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`)
        const data = await response.json()
        return data.title

      case 'spotify':
      case 'spotify-playlist':
        // Extract Spotify ID and use Spotify API (requires auth token)
        const spotifyId = extractMediaId(url, type)
        const mediaType = type === 'spotify' ? 'track' : 'playlist'
        return `${mediaType.charAt(0).toUpperCase() + mediaType.slice(1)} - ${spotifyId}`

      case 'apple-music-album':
      case 'apple-music-playlist':
        // Extract from URL
        const match = url.match(/\/(album|playlist)\/([^\/]+)/)
        return match ? decodeURIComponent(match[2]).replace(/-/g, ' ') : 'Apple Music'

      case 'soundcloud':
      case 'soundcloud-playlist':
        // Extract from URL
        const scMatch = url.match(/soundcloud\.com\/([^\/]+)(?:\/sets)?\/([^\/]+)/)
        return scMatch ? `${scMatch[1]} - ${decodeURIComponent(scMatch[2])}` : 'SoundCloud'

      default:
        return 'Media'
    }
  } catch (error) {
    console.error('Error fetching media title:', error)
    return 'Media'
  }
}

const getMediaDisplayName = (url: string, type: MediaItem['type']): string => {
  switch (type) {
    case 'youtube':
      return 'YouTube Video'
    case 'spotify':
      return 'Spotify Track'
    case 'spotify-playlist':
      return 'Spotify Playlist'
    case 'apple-music-album':
      return 'Apple Music Album'
    case 'apple-music-playlist':
      return 'Apple Music Playlist'
    case 'soundcloud':
      return 'SoundCloud Track'
    case 'soundcloud-playlist':
      return 'SoundCloud Playlist'
    default:
      return 'Media'
  }
}

export interface ShopItem {
  id: string;
  title: string;
  storeUrl: string;
  image: string;
  platform: 'shopify' | 'etsy' | 'gumroad' | 'bigcartel' | 'other';
}

const detectShopType = (url: string): ShopItem['type'] => {
  if (url.includes('shopify.com')) return 'shopify-product'
  if (url.includes('etsy.com')) return 'etsy-listing'
  if (url.includes('gumroad.com')) return 'gumroad-product'
  if (url.includes('bigcartel.com')) return 'bigcartel-product'
  return 'shopify-product'
}

const generateShopEmbed = (url: string, type: ShopItem['type']): string => {
  switch (type) {
    case 'shopify-product':
      // Convert product URL to embed URL
      return url.replace('/products/', '/products/embed/')
    case 'etsy-listing':
      // Extract listing ID and create embed URL
      const etsyMatch = url.match(/listing\/(\d+)/)
      return etsyMatch ? `https://www.etsy.com/listing/${etsyMatch[1]}/embed` : url
    case 'gumroad-product':
      // Convert to embed URL
      return url.replace('/l/', '/l/embed/')
    case 'bigcartel-product':
      // Convert to embed URL
      return url + '/embed'
    default:
      return url
  }
}

// Update the shop icon components
const ShopifyIcon = ({ className }: { className?: string }) => (
  <ShoppingBag className={className} />
)

const EtsyIcon = ({ className }: { className?: string }) => (
  <Store className={className} />
)

const GumroadIcon = ({ className }: { className?: string }) => (
  <Gift className={className} />
)

// Add this with other constants
const defaultProductImage = "/images/product-placeholder.png"

// Add history state
interface HistoryState {
  shopItems: ShopItem[];
  currentIndex: number;
  history: ShopItem[][];
}

export default function Component(): JSX.Element {
  const { isAuthenticated, userAddress, connectWallet, disconnectWallet } = useAuth()

  const saveToLocalStorage = (data: {
    profile: Profile;
    projects: Project[];
    mediaItems: MediaItem[];
    sticker: Sticker;
    shopItems: ShopItem[];
  }) => {
    try {
      const storageKey = `userProfile_${userAddress}`
      localStorage.setItem(storageKey, JSON.stringify(data))
    } catch (error) {
      console.error('Failed to save to localStorage:', error)
    }
  }

  const loadFromLocalStorage = () => {
    try {
      const storageKey = `userProfile_${userAddress}`
      const saved = localStorage.getItem(storageKey)
      if (saved) {
        const data = JSON.parse(saved)
        return {
          profile: data.profile || {
            name: "Your Name",
            title: "Your Role / Title",
            bio: "Tell your story here...",
            image: "/images/placeholder.png",
            socialLinks: [
              { platform: "youtube", url: "" },
              { platform: "spotify", url: "" },
              { platform: "soundcloud", url: "" },
              { platform: "instagram", url: "" }
            ],
            sectionVisibility: {
              projects: true,
              media: true,
              shop: true
            }
          },
          projects: data.projects || [],
          mediaItems: data.mediaItems || [],
          sticker: data.sticker || { enabled: true, image: defaultStickerImage },
          shopItems: Array.isArray(data.shopItems) ? data.shopItems : []
        }
      }
      return {
        profile: {
          name: "Your Name",
          title: "Your Role / Title",
          bio: "Tell your story here...",
          image: "/images/placeholder.png",
          socialLinks: [
            { platform: "youtube", url: "" },
            { platform: "spotify", url: "" },
            { platform: "soundcloud", url: "" },
            { platform: "instagram", url: "" }
          ],
          sectionVisibility: {
            projects: true,
            media: true,
            shop: true
          }
        },
        projects: [],
        mediaItems: [],
        sticker: { enabled: true, image: defaultStickerImage },
        shopItems: []
      }
    } catch (error) {
      console.error('Failed to load from localStorage:', error)
      return null
    }
  }

  const [isEditing, setIsEditing] = useState(false)
  const [formErrors, setFormErrors] = useState<FormErrors>({
    name: '',
    title: '',
    bio: '',
    socialLinks: []
  })
  
  const [sticker, setSticker] = useState<Sticker>({
    enabled: true,
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/daisy-blue-1sqZRfemKwLyREL0Eo89EfmQUT5wst.png"
  })

  const [imageLoading, setImageLoading] = useState(true)
  const [imageError, setImageError] = useState<string | null>(null)

  const [isTransitioning, setIsTransitioning] = useState(false)

  const [isLoading, setIsLoading] = useState(true)

  const [profile, setProfile] = useState<Profile>({
    name: "Your Name",
    title: "Your Role / Title",
    bio: "Tell your story here...",
    image: "/images/placeholder.png",
    socialLinks: [
      { platform: "youtube", url: "" },
      { platform: "spotify", url: "" },
      { platform: "soundcloud", url: "" },
      { platform: "instagram", url: "" }
    ],
    sectionVisibility: {
      projects: true,
      media: true,
      shop: true
    }
  })

  useEffect(() => {
    const saved = loadFromLocalStorage()
    if (saved) {
      console.log('Loading shop items:', saved.shopItems)
      setShopItems(saved.shopItems)
    }
    setIsLoading(false)
  }, [])

  const [projects, setProjects] = useState<Project[]>([
    {
      id: 1,
      title: "Beach Raves",
      description: "Dec 22, 2024",
      image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/monet-dj-ijo4Skv1UWUECLLODKs79m5V5SnPe0.png",
      link: "https://www.musicfestivalwizard.com/festivals/strings-sol-2024/"
    },
    {
      id: 2,
      title: "Loca",
      description: "Collab with Dimitri La Bruxa",
      image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/sound-to-paint-vOShTpAQOvRH7h1koaIWTeWJ9hixfJ.png",
      link: "https://music.apple.com/us/artist/dimitri-la-bruxa/1635695619"
    },
    {
      id: 3,
      title: "Is Bitcoin Still Money?",
      description: "Collab with Fluffy Toy",
      image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/money-city-VCzdAZl8Hro6VNu0u3rSDcKnHSbR9j.png",
      link: "https://youtu.be/-IjB8MSLmMo"
    }
  ])

  const [mediaItems, setMediaItems] = useState<MediaItem[]>([
    { 
      id: 'BFJu2NrIfx0', 
      type: 'youtube'
    },
    { 
      id: 'A3QlF7Myeco', 
      type: 'youtube'
    },
    { 
      id: 'rvGABUgyCOA', 
      type: 'youtube'
    }
  ])

  const handleLoginToggle = () => {
    setIsTransitioning(true)
    setTimeout(async () => {
      try {
        if (isAuthenticated) {
          await disconnectWallet()
          setProfile({
            name: "Your Name",
            title: "Your Role / Title",
            bio: "Tell your story here...",
            image: "/images/placeholder.png",
            socialLinks: [
              { platform: "youtube", url: "" },
              { platform: "spotify", url: "" },
              { platform: "soundcloud", url: "" },
              { platform: "instagram", url: "" }
            ],
            sectionVisibility: {
              projects: true,
              media: true,
              shop: true
            }
          })
          setProjects([])
          setMediaItems([])
          setSticker({ enabled: true, image: defaultStickerImage })
          setIsEditing(false)
          setShowCropDialog(false)
          setTempImage('')
          setImageError(null)
        } else {
          await connectWallet()
        }
      } catch (error) {
        console.error('Error handling wallet connection:', error)
      } finally {
        setImageLoading(false)
        setIsTransitioning(false)
      }
    }, 150)
  }

  const debouncedSave = useCallback(
    debounce((data: { 
      profile: Profile; 
      projects: Project[]; 
      mediaItems: MediaItem[]; 
      sticker: Sticker;
      shopItems: ShopItem[]; 
    }) => {
      saveToLocalStorage(data)
    }, 1000),
    []
  )

  const handleImageChange = async (file: File | null) => {
    try {
      if (!file) return

      setImageError(null)
      setImageLoading(true)

      const isGif = file.type === 'image/gif'
      const isValidImage = file.type.startsWith('image/')
      
      if (!isValidImage) {
        setImageError("Please upload an image file")
        setImageLoading(false)
        return
      }

      if (isGif) {
        try {
          if (file.size > 5 * 1024 * 1024) {
            setImageError("GIF must be less than 5MB")
            setImageLoading(false)
            return
          }

          const reader = new FileReader()
          reader.onloadend = () => {
            setProfile(prev => ({ ...prev, image: reader.result as string }))
            setImageLoading(false)
          }
          reader.readAsDataURL(file)
        } catch (error) {
          setImageError("Failed to process GIF. Please try again.")
          setImageLoading(false)
        }
        return
      }

      try {
        const reader = new FileReader()
        reader.onloadend = () => {
          const img = document.createElement('img')
          img.onload = () => {
            const isSquare = img.width === img.height
            
            setCropState(prev => ({
              ...prev,
              crop: {
                unit: '%',
                width: isSquare ? 100 : 90,
                height: isSquare ? 100 : 90,
                x: isSquare ? 0 : 5,
                y: isSquare ? 0 : 5,
                aspect: 1
              },
              imageRef: null
            }))
            
            setTempImage(reader.result as string)
            setShowCropDialog(true)
            setImageLoading(false)
          }
          img.src = reader.result as string
        }
        reader.onerror = () => {
          setImageError("Failed to read file")
          setImageLoading(false)
        }
        reader.readAsDataURL(file)
      } catch (error) {
        setImageError("Failed to load image")
        setImageLoading(false)
      }
    } catch (error) {
      console.error('Error handling image:', error)
      setImageError('Failed to process image. Please try again.')
      setImageLoading(false)
    }
  }

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    const newProfile = { ...profile, [name]: value }
    setProfile(newProfile)
    debouncedSave({
      profile: newProfile,
      projects,
      mediaItems,
      sticker,
      shopItems: []
    })
  }

  const handleSocialLinkChange = (index: number, field: string, value: string) => {
    setProfile(prev => ({
      ...prev,
      socialLinks: prev.socialLinks.map((link, i) => 
        i === index ? { ...link, [field]: value } : link
      )
    }))
  }

  const addSocialLink = () => {
    setProfile(prev => ({
      ...prev,
      socialLinks: [...prev.socialLinks, { platform: "", url: "" }]
    }))
  }

  const removeSocialLink = (index: number) => {
    setProfile(prev => ({
      ...prev,
      socialLinks: prev.socialLinks.filter((_, i) => i !== index)
    }))
  }

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    const file = e.dataTransfer.files[0]
    if (file) {
      handleImageChange(file)
    }
  }, [handleImageChange])

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
  }, [])

  const handleProjectChange = (index: number, field: keyof Project, value: string) => {
    setProjects(prev => prev.map((project, i) => 
      i === index ? { ...project, [field]: value } : project
    ))
  }

  const handleProjectImageChange = (index: number, file: File | null) => {
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setProjects(prev => prev.map((project, i) => 
          i === index ? { ...project, image: reader.result as string } : project
        ))
      }
      reader.readAsDataURL(file)
    }
  }

  const addProject = () => {
    setProjects(prev => [...prev, { id: Date.now(), title: "", description: "", image: "", link: "" }])
  }

  const removeProject = (index: number) => {
    setProjects(prev => prev.filter((_, i) => i !== index))
  }

  const handleMediaChange = async (index: number, field: string, value: string) => {
    if (field === 'id' && value) {
      const detectedType = detectMediaType(value)
      const displayName = getMediaDisplayName(value, detectedType)
      
      setMediaItems(prev => prev.map((item, i) => {
        if (i === index) {
          const extractedId = extractMediaId(value, detectedType)
          return {
            ...item,
            type: detectedType,
            id: extractedId,
            rawUrl: value
          }
        }
        return item
      }))
    } else {
      setMediaItems(prev => prev.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      ))
    }
  }

  const addMedia = () => {
    setMediaItems(prev => [...prev, { 
      id: '', 
      type: 'youtube',
      rawUrl: ''
    }])
  }

  const removeMedia = (index: number) => {
    setMediaItems(prev => prev.filter((_, i) => i !== index))
  }

  const handleStickerChange = (checked: boolean) => {
    setSticker(prev => ({
      ...prev,
      enabled: checked
    }))
  }

  const [showCropDialog, setShowCropDialog] = useState(false)
  const [tempImage, setTempImage] = useState<string>('')
  const [cropState, setCropState] = useState<CropState>({
    crop: {
      unit: '%',
      width: 90,
      height: 90,
      x: 5,
      y: 5
    },
    aspect: 1,
    imageRef: null,
    completedCrop: null
  })

  const handleCropComplete = async (crop: CropType) => {
    if (!cropState.imageRef || !crop.width || !crop.height) {
      console.error('Missing required crop data')
      return
    }

    try {
      const canvas = document.createElement('canvas')
      const scaleX = cropState.imageRef.naturalWidth / cropState.imageRef.width
      const scaleY = cropState.imageRef.naturalHeight / cropState.imageRef.height
      
      canvas.width = crop.width
      canvas.height = crop.height
      
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        console.error('Failed to get canvas context')
        return
      }

      ctx.drawImage(
        cropState.imageRef,
        crop.x * scaleX,
        crop.y * scaleY,
        crop.width * scaleX,
        crop.height * scaleY,
        0,
        0,
        crop.width,
        crop.height
      )

      const base64Image = canvas.toDataURL('image/jpeg', 0.9)
      setProfile(prev => ({ ...prev, image: base64Image }))
      
      setShowCropDialog(false)
      setTempImage('')
      setImageLoading(false)
      setImageError(null)
    } catch (error) {
      console.error('Failed to complete crop:', error)
      setImageError('Failed to crop image')
    }
  }

  const handleSave = async () => {
    try {
      console.log('Saving profile with shop items:', shopItems)
      saveToLocalStorage({
        profile,
        projects,
        mediaItems,
        sticker,
        shopItems
      })
      setIsEditing(false)
    } catch (error) {
      console.error('Error saving profile:', error)
    }
  }

  const ImageDisplay = () => (
    <div 
      className="relative w-32 h-32 overflow-hidden rounded-lg"
      role="img"
      aria-label={imageError ? "Error loading profile image" : "Profile image"}
    >
      {imageLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white" />
        </div>
      )}
      {imageError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-800 text-red-500">
          <p className="text-sm text-center px-2">{imageError}</p>
        </div>
      )}
      <Image 
        src={profile.image} 
        alt="Profile" 
        fill
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        className={`rounded-lg object-cover transition-opacity duration-300 ${
          imageLoading ? 'opacity-0' : 'opacity-100'
        }`}
        onLoad={() => setImageLoading(false)}
        onError={() => setImageError("Failed to load image")}
      />
    </div>
  )

  const [projectsLoading, setProjectsLoading] = useState(true)
  const [videosLoading, setVideosLoading] = useState(true)
  const [visibleProjects, setVisibleProjects] = useState(3)
  const [visibleVideos, setVisibleVideos] = useState(6)

  useEffect(() => {
    setTimeout(() => setProjectsLoading(false), 800)
    setTimeout(() => setVideosLoading(false), 1200)
  }, [])

  const loadMoreProjects = () => {
    setVisibleProjects(prev => Math.min(prev + 3, projects.length))
  }

  const [authLoading, setAuthLoading] = useState(true)

  useEffect(() => {
    setAuthLoading(false)
  }, [isAuthenticated])

  const [shopItems, setShopItems] = useState<ShopItem[]>([])

  const handleShopItemChange = (index: number, field: string, value: string) => {
    const updatedItems = shopItems.map((item, i) => 
      i === index ? {
        ...item,
        [field]: value,
        ...(field === 'storeUrl' ? {
          platform: (value.includes('shopify.com') ? 'shopify' :
                   value.includes('etsy.com') ? 'etsy' :
                   value.includes('gumroad.com') ? 'gumroad' :
                   value.includes('bigcartel.com') ? 'bigcartel' : 'other') as ShopItem['platform']
        } : {})
      } : item
    )
    
    setShopItems(updatedItems)
    debouncedSave({
      profile,
      projects,
      mediaItems,
      sticker,
      shopItems: updatedItems
    })
  }

  const addShopItem = () => {
    setShopItems(prev => [...prev, {
      id: Date.now().toString(),
      title: '',
      storeUrl: '',
      image: '',
      platform: 'other'
    }])
  }

  const removeShopItem = (index: number) => {
    setShopItems(prev => prev.filter((_, i) => i !== index))
  }

  const [previewMode, setPreviewMode] = useState(true);

  const exampleShopItems: ShopItem[] = [
    {
      id: '1',
      title: 'Wool Runner Mizzles',
      storeUrl: 'https://allbirds.com/products/mens-wool-runner-up-mizzles',
      image: 'https://cdn.allbirds.com/image/upload/f_auto,q_auto,w_1000,b_rgb:f5f5f5/cms/2WBWT1_1.jpg',
      platform: 'shopify'
    },
    {
      id: '2',
      title: 'Handmade Ceramic Mug',
      storeUrl: 'https://www.etsy.com/listing/1479574549/handmade-ceramic-mug',
      image: 'https://i.etsystatic.com/12345678/r/il/123456/1234567890/il_fullxfull.1234567890_abcd.jpg',
      platform: 'etsy'
    },
    {
      id: '3',
      title: 'Digital Art Course',
      storeUrl: 'https://gumroad.com/l/digital-art-course',
      image: 'https://public-files.gumroad.com/variants/123456/preview.jpg',
      platform: 'gumroad'
    }
  ];

  const displayShopItems = shopItems.length > 0 ? shopItems : exampleShopItems;

  const [shopLoading, setShopLoading] = useState(true)

  useEffect(() => {
    setTimeout(() => setProjectsLoading(false), 800)
    setTimeout(() => setVideosLoading(false), 1200)
    setTimeout(() => setShopLoading(false), 1000)
  }, [])

  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());

  const [history, setHistory] = useState<HistoryState>({
    shopItems: [],
    currentIndex: -1,
    history: []
  });

  return (
    <div className="dark min-h-screen bg-gray-900 text-gray-100">
      <Navbar 
        isAuthenticated={isAuthenticated} 
        onLoginToggle={handleLoginToggle}
      />
      {isLoading ? (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white" />
        </div>
      ) : (
        <>
          <style dangerouslySetInnerHTML={{
            __html: `
              @keyframes rotate {
                from { transform: rotate(0deg); }
                to { transform: rotate(360deg); }
              }
              .sticker-rotate {
                animation: rotate 20s linear infinite;
              }
              @keyframes fadeIn {
                from { opacity: 0; transform: translateY(10px); }
                to { opacity: 1; transform: translateY(0); }
              }
              .animate-fadeIn {
                animation: fadeIn 0.5s ease-out;
              }
            `
          }} />
          <div className="p-4 sm:p-8 md:p-12 lg:p-16 min-h-screen flex flex-col">
            <div className={`max-w-6xl mx-auto w-full flex-grow transition-opacity duration-150 ${
              isTransitioning ? 'opacity-0' : 'opacity-100'
            }`}>
              {isAuthenticated && isEditing ? (
                <div className="space-y-8 rounded-lg bg-gray-800/50 p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <h3 className="text-xl font-semibold">Profile Details</h3>
                    <div className="flex-grow border-t border-gray-700" />
                  </div>
                  <form 
                    onSubmit={(e) => { 
                      e.preventDefault()
                      handleSave()
                    }} 
                    className="space-y-16"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                      }
                    }}
                  >
                    <div className="space-y-8">
                      <div>
                        <Label htmlFor="profileImage">Profile Image</Label>
                        <div 
                          role="button"
                          aria-label="Upload profile image"
                          onDrop={handleDrop}
                          onDragOver={handleDragOver}
                          className="mt-2 border-2 border-dashed rounded-lg p-4 text-center cursor-pointer hover:border-primary transition-colors"
                        >
                          <div className="flex flex-col items-center space-y-2">
                            <ImageDisplay />
                            <p className="text-sm text-gray-300">
                              Drag & drop an image here, or click to select one
                            </p>
                            <Label htmlFor="fileInput" className="cursor-pointer">
                              <Button 
                                type="button" 
                                variant="outline" 
                                size="sm" 
                                className="mt-2" 
                                aria-label="Upload profile image"
                                onClick={() => {
                                  document.getElementById('fileInput')?.click()
                                }}
                              >
                                <Upload className="w-4 h-4 mr-2" aria-hidden="true" />
                                Upload Image
                              </Button>
                            </Label>
                            <Input 
                              id="fileInput" 
                              type="file" 
                              accept="image/*" 
                              onChange={(e) => {
                                const files = e.target.files
                                if (files && files.length > 0) {
                                  handleImageChange(files[0])
                                  e.target.value = ''
                                }
                              }} 
                              className="hidden"
                            />
                          </div>
                        </div>
                        {imageError && (
                          <p className="mt-2 text-sm text-red-500">{imageError}</p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="name">Name</Label>
                        <Input
                          id="name"
                          name="name"
                          value={profile.name}
                          onChange={handleProfileChange}
                          className={`mt-1 ${formErrors.name ? 'border-red-500' : ''}`}
                        />
                        {formErrors.name && <p className="text-red-500 text-sm mt-1">{formErrors.name}</p>}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="title">Title</Label>
                        <Input
                          id="title"
                          name="title"
                          value={profile.title}
                          onChange={handleProfileChange}
                          className={`mt-1 ${formErrors.title ? 'border-red-500' : ''}`}
                        />
                        <p className="text-sm text-gray-400">
                          Your role or profession (e.g., "Music Producer" or "Digital Artist")
                        </p>
                      </div>

                      <div>
                        <Label htmlFor="bio">Bio</Label>
                        <Textarea
                          id="bio"
                          name="bio"
                          value={profile.bio}
                          onChange={handleProfileChange}
                          rows={4}
                          className={`mt-1 ${formErrors.bio ? 'border-red-500' : ''}`}
                        />
                        {formErrors.bio && <p className="text-red-500 text-sm mt-1">{formErrors.bio}</p>}
                      </div>
                    </div>

                    <div className="space-y-8 pt-8 border-t border-gray-700">
                      <h3 className="text-xl font-semibold">Social Links</h3>
                      {profile.socialLinks.map((link, index) => (
                        <div key={index} className="flex items-center space-x-2 mb-2">
                          <Select
                            value={link.platform}
                            onValueChange={(value) => handleSocialLinkChange(index, 'platform', value)}
                          >
                            <SelectTrigger className="w-[180px]">
                              <SelectValue placeholder="Select platform" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="youtube">YouTube</SelectItem>
                              <SelectItem value="tiktok">TikTok</SelectItem>
                              <SelectItem value="instagram">Instagram</SelectItem>
                              <SelectItem value="twitter">Twitter</SelectItem>
                              <SelectItem value="spotify">Spotify</SelectItem>
                              <SelectItem value="soundcloud">SoundCloud</SelectItem>
                              <SelectItem value="linkedin">LinkedIn</SelectItem>
                            </SelectContent>
                          </Select>
                          <Input
                            value={link.url}
                            onChange={(e) => handleSocialLinkChange(index, 'url', e.target.value)}
                            placeholder="Profile URL"
                            className="flex-grow"
                          />
                          <Button type="button" variant="ghost" size="icon" onClick={() => removeSocialLink(index)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                      <Button type="button" onClick={addSocialLink} className="mt-2">
                        <Plus className="w-4 h-4 mr-2" /> Add Social Link
                      </Button>
                    </div>

                    <div className="space-y-8 pt-8 border-t border-gray-700">
                      <div>
                        <h3 className="text-xl font-semibold">Section Visibility</h3>
                        <p className="text-sm text-gray-400 mt-2">
                          Choose which sections to display on your profile
                        </p>
                      </div>
                      <div className="space-y-4">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="projects-visible"
                            checked={profile.sectionVisibility.projects}
                            onCheckedChange={(checked) => {
                              setProfile(prev => ({
                                ...prev,
                                sectionVisibility: {
                                  ...prev.sectionVisibility,
                                  projects: checked as boolean
                                }
                              }))
                            }}
                          />
                          <Label htmlFor="projects-visible">Show Projects and People section</Label>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="media-visible"
                            checked={profile.sectionVisibility.media}
                            onCheckedChange={(checked) => {
                              setProfile(prev => ({
                                ...prev,
                                sectionVisibility: {
                                  ...prev.sectionVisibility,
                                  media: checked as boolean
                                }
                              }))
                            }}
                          />
                          <Label htmlFor="media-visible">Show Media section</Label>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="shop-visible"
                            checked={profile.sectionVisibility.shop}
                            onCheckedChange={(checked) => {
                              setProfile(prev => ({
                                ...prev,
                                sectionVisibility: {
                                  ...prev.sectionVisibility,
                                  shop: checked as boolean
                                }
                              }))
                            }}
                          />
                          <Label htmlFor="shop-visible">Show Shop section</Label>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-8 pt-8 border-t border-gray-700">
                      <div>
                        <h3 className="text-xl font-semibold">Projects</h3>
                        <p className="text-sm text-gray-400 mt-2">
                          Add and manage your projects.
                        </p>
                      </div>
                      <Accordion type="single" collapsible className="w-full">
                        {projects.map((project, index) => (
                          <AccordionItem key={project.id} value={`item-${index}`}>
                            <AccordionTrigger className="text-left">
                              {project.title || `Project ${index + 1}`}
                            </AccordionTrigger>
                            <AccordionContent>
                              <Card className="mb-4 p-4 bg-gray-700">
                                <CardContent className="space-y-4">
                                  <div>
                                    <Label htmlFor={`project-title-${index}`}>Title</Label>
                                    <Input
                                      id={`project-title-${index}`}
                                      value={project.title}
                                      onChange={(e) => handleProjectChange(index, 'title', e.target.value)}
                                      className="mt-1"
                                    />
                                  </div>
                                  <div>
                                    <Label htmlFor={`project-description-${index}`}>Description</Label>
                                    <Textarea
                                      id={`project-description-${index}`}
                                      value={project.description}
                                      onChange={(e) => handleProjectChange(index, 'description', e.target.value)}
                                      className="mt-1"
                                    />
                                  </div>
                                  <div>
                                    <Label htmlFor={`project-link-${index}`}>Link</Label>
                                    <Input
                                      id={`project-link-${index}`}
                                      value={project.link}
                                      onChange={(e) => handleProjectChange(index, 'link', e.target.value)}
                                      className="mt-1"
                                    />
                                  </div>
                                  <div>
                                    <Label htmlFor={`project-image-${index}`}>Project Image</Label>
                                    <div className="mt-2 flex items-center space-x-4">
                                      {project.image && (
                                        <div className="relative w-24 h-24 rounded-lg overflow-hidden">
                                          <Image src={project.image} alt={project.title} fill className="object-cover" />
                                        </div>
                                      )}
                                      <Input
                                        id={`project-image-${index}`}
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => {
                                          const files = e.target.files
                                          if (files && files.length > 0) {
                                            handleProjectImageChange(index, files[0])
                                          }
                                        }}
                                      />
                                    </div>
                                  </div>
                                  <Button type="button" variant="destructive" onClick={() => removeProject(index)}>
                                    <Trash2 className="w-4 h-4 mr-2" /> Remove Project
                                  </Button>
                                </CardContent>
                              </Card>
                            </AccordionContent>
                          </AccordionItem>
                        ))}
                      </Accordion>
                      <Button type="button" onClick={addProject} className="mt-2">
                        <Plus className="w-4 h-4 mr-2" /> Add Project
                      </Button>
                    </div>

                    <div className="space-y-8 pt-8 border-t border-gray-700">
                      <div>
                        <h3 className="text-xl font-semibold">Media</h3>
                        <p className="text-sm text-gray-400 mt-2">
                          Share your music, videos, and playlists from YouTube, SoundCloud, Spotify, and Apple Music.
                        </p>
                      </div>
                      <Accordion type="single" collapsible className="w-full">
                        {mediaItems.map((media, index) => (
                          <AccordionItem key={index} value={`media-${index}`}>
                            <AccordionTrigger className="text-left">
                              {media.id ? getMediaDisplayName(media.rawUrl || '', media.type) : `New Media`}
                            </AccordionTrigger>
                            <AccordionContent>
                              <Card className="mb-4 p-4 bg-gray-700">
                                <CardContent className="space-y-4">
                                  <div>
                                    <Label htmlFor={`media-url-${index}`}>Media URL</Label>
                                    <div className="space-y-2">
                                      <Input
                                        id={`media-url-${index}`}
                                        value={media.rawUrl || media.id}
                                        onChange={(e) => handleMediaChange(index, 'id', e.target.value)}
                                        placeholder="Paste URL from YouTube, SoundCloud, Spotify, or Apple Music"
                                      />
                                      <p className="text-xs text-gray-400">
                                        Supports: YouTube videos, SoundCloud tracks & playlists, Spotify tracks & playlists, Apple Music playlists
                                      </p>
                                    </div>
                                    {media.id && (
                                      <div className="mt-4 border border-gray-700 rounded-lg overflow-hidden">
                                        <MediaEmbed item={media} />
                                      </div>
                                    )}
                                  </div>
                                  <Button type="button" variant="destructive" onClick={() => removeMedia(index)}>
                                    <Trash2 className="w-4 h-4 mr-2" /> Remove Media
                                  </Button>
                                </CardContent>
                              </Card>
                            </AccordionContent>
                          </AccordionItem>
                        ))}
                      </Accordion>
                      <Button type="button" onClick={addMedia} className="mt-2">
                        <Plus className="w-4 h-4 mr-2" /> Add Media
                      </Button>
                    </div>

                    <div className="space-y-8 pt-8 border-t border-gray-700">
                      <div>
                        <h3 className="text-xl font-semibold">Shop</h3>
                        <p className="text-sm text-gray-400 mt-2">
                          Connect your online store from Shopify, Etsy, or other platforms to showcase your products.
                        </p>
                      </div>
                      <Accordion type="single" collapsible>
                        {shopItems.map((item, index) => (
                          <AccordionItem key={item.id} value={`shop-${index}`}>
                            <AccordionTrigger className="flex justify-start gap-4 hover:no-underline">
                              <div className="flex items-center gap-2">
                                <span className="font-semibold">
                                  {item.title || `Store ${index + 1}`}
                                </span>
                              </div>
                            </AccordionTrigger>
                            <AccordionContent>
                              {/* Accordion content */}
                            </AccordionContent>
                          </AccordionItem>
                        ))}
                      </Accordion>
                      <Button type="button" onClick={addShopItem} className="mt-2">
                        <Plus className="w-4 h-4 mr-2" /> Add Store
                      </Button>
                    </div>

                    <div className="space-y-8 pt-8 border-t border-gray-700">
                      <div>
                        <h3 className="text-xl font-semibold">Profile Sticker</h3>
                        <div className="space-y-4">
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="sticker-enabled"
                              checked={sticker.enabled}
                              onCheckedChange={handleStickerChange}
                            />
                            <Label htmlFor="sticker-enabled">Enable profile sticker</Label>
                          </div>
                          {sticker.enabled && (
                            <div className="space-y-4">
                              <Select
                                value={sticker.image}
                                onValueChange={(value) => setSticker(prev => ({ ...prev, image: value }))}
                              >
                                <SelectTrigger className="w-[200px]">
                                  <SelectValue placeholder="Select a sticker" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/daisy-blue-1sqZRfemKwLyREL0Eo89EfmQUT5wst.png">
                                    <div className="flex items-center">
                                      <div className="w-8 h-8 mr-2 relative">
                                        <Image 
                                          src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/daisy-blue-1sqZRfemKwLyREL0Eo89EfmQUT5wst.png" 
                                          alt="Blue Daisy" 
                                          fill 
                                          className="object-contain"
                                          unoptimized
                                        />
                                      </div>
                                      Blue Daisy
                                    </div>
                                  </SelectItem>
                                  <SelectItem value="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/daisy-purple-zuy0TjRXzDx6hnayJ249A4Mgp8ktLy.png">
                                    <div className="flex items-center">
                                      <div className="w-8 h-8 mr-2 relative">
                                        <Image src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/daisy-purple-zuy0TjRXzDx6hnayJ249A4Mgp8ktLy.png" alt="Purple Daisy" fill className="object-contain" />
                                      </div>
                                      Purple Daisy
                                    </div>
                                  </SelectItem>
                                  <SelectItem value="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/daisy-white-sWezY97Qz4q7W6zenHPvu3ns9egGwH.png">
                                    <div className="flex items-center">
                                      <div className="w-8 h-8 mr-2 relative">
                                        <Image src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/daisy-white-sWezY97Qz4q7W6zenHPvu3ns9egGwH.png" alt="White Daisy" fill className="object-contain" />
                                      </div>
                                      White Daisy
                                    </div>
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                              
                              <div className="w-20 h-20 relative mx-auto sticker-rotate">
                                <Image
                                  src={sticker.image}
                                  alt="Selected sticker preview"
                                  fill
                                  className="object-contain"
                                  unoptimized
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="fixed bottom-0 left-0 right-0 bg-gray-900/95 backdrop-blur-sm border-t border-gray-800">
                      <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
                        <div className="flex items-center space-x-4">
                          <div className="text-sm text-gray-400">
                            Changes save automatically
                          </div>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            type="button"
                            onClick={() => setPreviewMode(!previewMode)}
                          >
                            {previewMode ? 'Exit Preview' : 'Preview'}
                          </Button>
                        </div>
                        <Button 
                          variant="outline" 
                          onClick={() => setIsEditing(false)}
                          className="px-6 py-2 text-lg border-2 border-cyan-300/60 hover:border-cyan-300/80 transition-colors"
                        >
                          Done Editing
                        </Button>
                      </div>
                    </div>
                  </form>
                  {showCropDialog && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                      <div className="bg-gray-800 p-6 rounded-lg max-w-2xl w-full max-h-[90vh] flex flex-col">
                        <h3 className="text-xl font-bold mb-4">Crop Image</h3>
                        <div className="relative flex-1 min-h-0 overflow-auto">
                          <ReactCrop
                            crop={cropState.crop}
                            onChange={(c: CropType) => setCropState(prev => ({ ...prev, crop: c }))}
                            onComplete={(c: CropType) => setCropState(prev => ({ ...prev, completedCrop: c }))}
                            aspect={cropState.aspect}
                          >
                            <img
                              src={tempImage}
                              onLoad={e => setCropState(prev => ({ ...prev, imageRef: e.currentTarget }))}
                              alt="Crop preview"
                              className="max-w-full max-h-[calc(90vh-12rem)] w-auto mx-auto object-contain"
                            />
                          </ReactCrop>
                        </div>
                        <div className="flex justify-end mt-4 space-x-2 pt-4 border-t border-gray-700">
                          <Button 
                            variant="outline" 
                            onClick={() => {
                              setShowCropDialog(false)
                              setTempImage('')
                            }}
                          >
                            Cancel
                          </Button>
                          <Button 
                            onClick={() => {
                              if (cropState.completedCrop) {
                                handleCropComplete(cropState.completedCrop)
                              }
                            }}
                          >
                            Apply
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8 lg:gap-16">
                    <div className="w-full lg:w-1/2 max-w-md mx-auto lg:mx-0">
                      <div className="relative aspect-square overflow-hidden border border-cyan-300 rounded-lg">
                        <Image
                          src={profile.image}
                          alt="Artist profile photo"
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          className="object-cover"
                          priority
                        />
                      </div>
                    </div>
                    
                    <div className="w-full lg:w-1/2 flex flex-col items-center lg:items-center text-center">
                      <div className="space-y-6 lg:space-y-8 max-w-sm">
                        <div>
                          <h1 className="text-3xl sm:text-4xl font-bold text-cyan-300">{profile.name}</h1>
                          <h2 className="text-lg sm:text-xl text-gray-200">{profile.title}</h2>
                        </div>
                        
                        <div>
                          <p className="text-sm sm:text-base text-gray-300">{profile.bio}</p>
                        </div>

                        <div className="flex justify-center gap-4">
                          {profile.socialLinks.map((link, index) => {
                            let Icon
                            switch (link.platform) {
                              case 'youtube':
                                Icon = Youtube
                                break
                              case 'spotify':
                                Icon = Music2
                                break
                              case 'soundcloud':
                                Icon = CloudRain
                                break
                              case 'twitter':
                                Icon = Twitter
                                break
                              case 'instagram':
                                Icon = Instagram
                                break
                              case 'linkedin':
                                Icon = Linkedin
                                break
                              case 'tiktok':
                                Icon = TikTokIcon
                                break
                              default:
                                Icon = User
                            }
                            
                            return (
                              <Button 
                                key={index} 
                                variant="ghost" 
                                size="icon" 
                                className={`w-10 h-10 sm:w-12 sm:h-12 group relative ${!link.url ? 'opacity-40 hover:opacity-100' : ''}`}
                                asChild={!!link.url}
                              >
                                {link.url ? (
                                  <a href={link.url} target="_blank" rel="noopener noreferrer" referrerPolicy="no-referrer">
                                    <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
                                    <span className="sr-only">{link.platform}</span>
                                  </a>
                                ) : (
                                  <div className="relative">
                                    <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
                                    <span className="sr-only">{link.platform}</span>
                                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                      Add {link.platform} link
                                    </div>
                                  </div>
                                )}
                              </Button>
                            )
                          })}
                        </div>

                        {isAuthenticated && (
                          <Button 
                            onClick={() => setIsEditing(true)} 
                            variant="outline" 
                            className="mt-4 border-cyan-300/30 hover:border-cyan-300/60 transition-colors"
                          >
                            <Edit2 className="mr-2 h-4 w-4" /> 
                            Edit Profile
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                  {profile.sectionVisibility.projects && (
                    <div className="mt-24 sm:mt-32 max-w-6xl mx-auto px-4 mb-24 opacity-0 animate-fadeIn" 
                         style={{ animationDelay: '150ms', animationFillMode: 'forwards' }}>
                      <h2 className="text-3xl font-semibold text-gray-100/90 text-center mb-12 tracking-wide">
                        PROJECTS and PEOPLE
                      </h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {projectsLoading ? (
                          Array(3).fill(0).map((_, i) => (
                            <Card key={i} className="bg-gray-800/50 border-gray-700 overflow-hidden min-h-[5rem] animate-pulse">
                              <div className="flex h-full">
                                <div className="w-24 bg-gray-700"></div>
                                <div className="p-3 flex-grow">
                                  <div className="h-4 bg-gray-700 rounded w-3/4 mb-2"></div>
                                  <div className="h-3 bg-gray-700 rounded w-1/2"></div>
                                </div>
                              </div>
                            </Card>
                          ))
                        ) : (
                          <>
                            {projects.slice(0, visibleProjects).map((project) => (
                              <Card 
                                key={project.id} 
                                className="bg-gray-800/50 border-gray-700 overflow-hidden min-h-[5rem] opacity-0 animate-fadeIn"
                                style={{
                                  animationDelay: `${project.id * 150}ms`,
                                  animationFillMode: 'forwards'
                                }}
                              >
                                <Link 
                                  href={project.link} 
                                  className="flex h-full group"
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  referrerPolicy="no-referrer"
                                >
                                  <div className="flex h-full">
                                    <div className="relative w-24 h-full p-1">
                                      <div className="relative w-full h-full rounded-[3px] overflow-hidden">
                                        <Image
                                          src={project.image}
                                          alt={project.title}
                                          fill
                                          className="object-cover"
                                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                        />
                                      </div>
                                    </div>
                                    <div className="p-3 flex flex-col justify-center flex-grow">
                                      <h3 className="text-lg font-bold text-white mb-1">{project.title}</h3>
                                      <p className="text-sm text-gray-300 line-clamp-2">{project.description}</p>
                                    </div>
                                  </div>
                                </Link>
                              </Card>
                            ))}
                            {visibleProjects < projects.length && (
                              <Button 
                                onClick={loadMoreProjects}
                                variant="ghost" 
                                className="col-span-full mx-auto mt-4"
                              >
                                Load More Projects
                              </Button>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  )}
                  {profile.sectionVisibility.media && (
                    <div className="mt-16 sm:mt-24 max-w-6xl mx-auto px-4 mb-24">
                      <h2 className="text-3xl font-semibold text-white text-center mb-12">
                        MEDIA
                      </h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {videosLoading ? (
                          Array(2).fill(0).map((_, i) => (
                            <Card key={i} className="w-full max-w-[560px] mx-auto animate-pulse">
                              <CardContent className="p-4">
                                <div className="aspect-video bg-gray-700 rounded mb-2"></div>
                                <div className="h-4 bg-gray-700 rounded w-3/4"></div>
                              </CardContent>
                            </Card>
                          ))
                        ) : (
                          mediaItems.slice(0, 6).map((video, index) => (
                            <Card key={index} className="w-full max-w-[560px] mx-auto">
                              <CardContent className="p-4">
                                <MediaEmbed item={video} />
                              </CardContent>
                            </Card>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                  {profile.sectionVisibility.shop && (
                    <div className="mt-16 sm:mt-24 max-w-6xl mx-auto px-4 mb-24">
                      <h2 className="text-3xl font-semibold text-white text-center mb-12">
                        SHOP
                      </h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {shopItems.map((item) => (
                          <ShopItemCard key={item.id} item={item} />
                        ))}
                      </div>
                    </div>
                  )}
                  {sticker.enabled && (
                    <div className="relative w-[200px] h-[200px] mx-auto mt-auto pt-8 pb-16">
                      <div className="sticker-rotate">
                        <Image
                          src={sticker.image}
                          alt="Profile sticker"
                          width={200}
                          height={200}
                          className="object-contain"
                        />
                      </div>
                    </div>
                  )}
                  <div className="max-w-2xl mx-auto border-t border-gray-800/50" />
                </>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}