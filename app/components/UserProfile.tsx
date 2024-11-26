'use client'

import Image from "next/image"
import Link from "next/link"
import { useState, useCallback, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Youtube, Music2, CloudRain, Twitter, Edit2, Plus, Trash2, Upload, User, Linkedin, Instagram } from "lucide-react"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Checkbox } from "@/components/ui/checkbox"
import { debounce } from "lodash"
import ReactCrop, { Crop } from 'react-image-crop'
import 'react-image-crop/dist/ReactCrop.css'
import { parseGIF, decompressFrames } from 'gifuct-js'

interface NavbarProps {
  isLoggedIn: boolean;
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

export interface Video {
  id: string;
  title: string;
}

export interface Profile {
  name: string;
  title: string;
  bio: string;
  image: string;
  socialLinks: SocialLink[];
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
  crop: Crop
  aspect: number
  imageRef: HTMLImageElement | null
  completedCrop: Crop | null
}

function Navbar({ isLoggedIn, onLoginToggle }: NavbarProps) {
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
          {isLoggedIn ? "Disconnect Wallet" : "Connect Wallet"}
        </Button>
      </div>
    </nav>
  )
}

export default function Component() {
  // Move these functions to the top of the component
  const saveToLocalStorage = (data: Profile) => {
    try {
      localStorage.setItem('userProfile', JSON.stringify(data))
    } catch (error) {
      console.error('Failed to save to localStorage:', error)
    }
  }

  const loadFromLocalStorage = (): Profile | null => {
    try {
      const saved = localStorage.getItem('userProfile')
      return saved ? JSON.parse(saved) : null
    } catch (error) {
      console.error('Failed to load from localStorage:', error)
      return null
    }
  }

  // Now we can use loadFromLocalStorage in our state initialization
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [formErrors, setFormErrors] = useState<FormErrors>({
    name: '',
    title: '',
    bio: '',
    socialLinks: []
  })
  
  // Add back the sticker state
  const [sticker, setSticker] = useState<Sticker>({
    enabled: true,
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/daisy-blue-1sqZRfemKwLyREL0Eo89EfmQUT5wst.png"
  })

  // Add loading and error states
  const [imageLoading, setImageLoading] = useState(true)
  const [imageError, setImageError] = useState<string | null>(null)

  // Add isTransitioning state
  const [isTransitioning, setIsTransitioning] = useState(false)

  // Add a loading state
  const [isLoading, setIsLoading] = useState(true)

  // Modify the profile state initialization
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
    ]
  })

  // Add useEffect for localStorage
  useEffect(() => {
    const savedProfile = loadFromLocalStorage()
    if (savedProfile) {
      setProfile(savedProfile)
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

  const [videos, setVideos] = useState<Video[]>([
    { 
      id: 'BFJu2NrIfx0', 
      title: 'Primavera Sound'
    },
    { 
      id: 'A3QlF7Myeco', 
      title: 'Mighty Morfin Jungle Set Live Nairobi'
    },
    { 
      id: 'rvGABUgyCOA', 
      title: 'Salut Boiler Room London'
    }
  ])

  // Add these before the other handlers
  const handleLoginToggle = () => {
    setIsTransitioning(true)
    setTimeout(() => {
      setIsLoggedIn(prev => !prev)
      setIsEditing(false)
      setShowCropDialog(false)
      setTempImage('')
      setImageError(null)
      setImageLoading(false)
      setIsTransitioning(false)
    }, 150)
  }

  // Add the debounced save function
  const debouncedSave = useCallback(
    debounce((newProfile: Profile) => {
      saveToLocalStorage(newProfile)
    }, 1000),
    []
  )

  // Add the image handling function
  const handleImageChange = async (file: File | null) => {
    if (!file) return

    // Reset any previous errors
    setImageError(null)
    setImageLoading(true)

    // Check file type
    const isGif = file.type === 'image/gif'
    const isValidImage = file.type.startsWith('image/')
    
    if (!isValidImage) {
      setImageError("Please upload an image file")
      setImageLoading(false)
      return
    }

    // For GIFs, handle size check and optimization
    if (isGif) {
      try {
        // Check file size
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

    // For non-GIF images, show crop dialog
    try {
      const reader = new FileReader()
      reader.onloadend = () => {
        // Create a temporary image to get dimensions
        const img = document.createElement('img')
        img.onload = () => {
          const isSquare = img.width === img.height
          
          // Set initial crop based on image dimensions
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
  }

  // After the existing state declarations, add these handlers:

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    const newProfile = { ...profile, [name]: value }
    setProfile(newProfile)
    debouncedSave(newProfile)
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
  }, [])

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

  const handleVideoChange = (index: number, field: string, value: string) => {
    setVideos(prev => prev.map((video, i) => 
      i === index ? { ...video, [field]: value } : video
    ))
  }

  const addVideo = () => {
    setVideos(prev => [...prev, { id: '', title: '' }])
  }

  const removeVideo = (index: number) => {
    setVideos(prev => prev.filter((_, i) => i !== index))
  }

  const handleStickerChange = (checked: boolean) => {
    setSticker(prev => ({
      ...prev,
      enabled: checked
    }))
  }

  // Add these state declarations after the other states
  const [showCropDialog, setShowCropDialog] = useState(false)
  const [tempImage, setTempImage] = useState<string>('')
  const [cropState, setCropState] = useState<CropState>({
    crop: {
      unit: '%',
      width: 90,
      aspect: 1
    },
    aspect: 1,
    imageRef: null,
    completedCrop: null
  })

  // Update the handleCropComplete function
  const handleCropComplete = async (crop: Crop) => {
    if (!cropState.imageRef || !crop.width || !crop.height) {
      console.error('Missing required crop data')
      return
    }

    try {
      const canvas = document.createElement('canvas')
      const scaleX = cropState.imageRef.naturalWidth / cropState.imageRef.width
      const scaleY = cropState.imageRef.naturalHeight / cropState.imageRef.height
      
      // Set canvas dimensions to the cropped size
      canvas.width = crop.width
      canvas.height = crop.height
      
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        console.error('Failed to get canvas context')
        return
      }

      // Draw the cropped image
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

      // Convert to base64 and update profile
      const base64Image = canvas.toDataURL('image/jpeg', 0.9)
      setProfile(prev => ({ ...prev, image: base64Image }))
      
      // Clean up
      setShowCropDialog(false)
      setTempImage('')
      setImageLoading(false)
      setImageError(null)
    } catch (error) {
      console.error('Failed to complete crop:', error)
      setImageError('Failed to crop image')
    }
  }

  const handleSave = () => {
    // Reset previous errors
    setFormErrors({
      name: '',
      title: '',
      bio: '',
      socialLinks: []
    })

    let hasErrors = false

    // Validate name
    if (profile.name.trim() === '') {
      setFormErrors(prev => ({ ...prev, name: 'Name is required' }))
      hasErrors = true
    }

    // Validate title
    if (profile.title.trim() === '') {
      setFormErrors(prev => ({ ...prev, title: 'Title is required' }))
      hasErrors = true
    }

    // Validate bio
    if (profile.bio.trim() === '') {
      setFormErrors(prev => ({ ...prev, bio: 'Bio is required' }))
      hasErrors = true
    }

    if (hasErrors) {
      return
    }

    // Save to localStorage
    saveToLocalStorage(profile)
    setIsEditing(false)
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

  // Add these state declarations after the other states
  const [projectsLoading, setProjectsLoading] = useState(true)
  const [videosLoading, setVideosLoading] = useState(true)
  const [visibleProjects, setVisibleProjects] = useState(3) // Start with 3 projects
  const [visibleVideos, setVisibleVideos] = useState(3)    // Show all 3 videos initially

  // Add loading handlers
  useEffect(() => {
    // Simulate loading delay
    setTimeout(() => setProjectsLoading(false), 800)
    setTimeout(() => setVideosLoading(false), 1200)
  }, [])

  // Add load more handlers
  const loadMoreProjects = () => {
    setVisibleProjects(prev => Math.min(prev + 3, projects.length))
  }

  const loadMoreVideos = () => {
    setVisibleVideos(prev => Math.min(prev + 2, videos.length))
  }

  // Add back the return statement with all the JSX
  return (
    <div className="dark min-h-screen bg-gray-900 text-gray-100">
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
          <Navbar isLoggedIn={isLoggedIn} onLoginToggle={handleLoginToggle} />
          <div className="p-4 sm:p-8 md:p-12 lg:p-16">
            <div className={`max-w-6xl mx-auto transition-opacity duration-150 ${
              isTransitioning ? 'opacity-0' : 'opacity-100'
            }`}>
              {isLoggedIn && isEditing ? (
                // Edit Mode
                <div className="bg-gray-800 p-8 rounded-lg shadow-lg">
                  <h2 className="text-2xl font-bold mb-6">Edit Your Profile</h2>
                  <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="space-y-6">
                    <div>
                      <Label htmlFor="profileImage">Profile Image</Label>
                      <div 
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
                                // Programmatically click the hidden file input
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
                                // Reset the input value so the same file can be selected again
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

                    <div>
                      <Label htmlFor="title">Title</Label>
                      <Input
                        id="title"
                        name="title"
                        value={profile.title}
                        onChange={handleProfileChange}
                        className={`mt-1 ${formErrors.title ? 'border-red-500' : ''}`}
                      />
                      {formErrors.title && <p className="text-red-500 text-sm mt-1">{formErrors.title}</p>}
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

                    <div>
                      <h3 className="text-lg font-semibold mb-2">Social Links</h3>
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
                              <SelectItem value="instagram">Instagram</SelectItem>
                              <SelectItem value="twitter">Twitter</SelectItem>
                              <SelectItem value="linkedin">LinkedIn</SelectItem>
                              <SelectItem value="spotify">Spotify</SelectItem>
                              <SelectItem value="soundcloud">SoundCloud</SelectItem>
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

                    <div>
                      <h3 className="text-lg font-semibold mb-2">Projects and People</h3>
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

                    <div>
                      <h3 className="text-lg font-semibold mb-2">Videos</h3>
                      <Accordion type="single" collapsible className="w-full">
                        {videos.map((video, index) => (
                          <AccordionItem key={index} value={`video-${index}`}>
                            <AccordionTrigger className="text-left">
                              {video.title || `Video ${index + 1}`}
                            </AccordionTrigger>
                            <AccordionContent>
                              <Card className="mb-4 p-4 bg-gray-700">
                                <CardContent className="space-y-4">
                                  <div>
                                    <Label htmlFor={`video-id-${index}`}>YouTube Video ID</Label>
                                    <Input
                                      id={`video-id-${index}`}
                                      value={video.id}
                                      onChange={(e) => handleVideoChange(index, 'id', e.target.value)}
                                      className="mt-1"
                                      placeholder="Enter YouTube video ID"
                                    />
                                  </div>
                                  <div>
                                    <Label htmlFor={`video-title-${index}`}>Video Title</Label>
                                    <Input
                                      id={`video-title-${index}`}
                                      value={video.title}
                                      onChange={(e) => handleVideoChange(index, 'title', e.target.value)}
                                      className="mt-1"
                                      placeholder="Enter video title"
                                    />
                                  </div>
                                  <Button type="button" variant="destructive" onClick={() => removeVideo(index)}>
                                    <Trash2 className="w-4 h-4 mr-2" /> Remove Video
                                  </Button>
                                </CardContent>
                              </Card>
                            </AccordionContent>
                          </AccordionItem>
                        ))}
                      </Accordion>
                      <Button type="button" onClick={addVideo} className="mt-2">
                        <Plus className="w-4 h-4 mr-2" /> Add Video
                      </Button>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-2">Profile Sticker</h3>
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
                                      <Image src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/daisy-blue-1sqZRfemKwLyREL0Eo89EfmQUT5wst.png" alt="Blue Daisy" fill className="object-contain" />
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
                            
                            {/* Preview of selected sticker */}
                            <div className="w-20 h-20 relative mx-auto sticker-rotate">
                              <Image
                                src={sticker.image}
                                alt="Selected sticker preview"
                                fill
                                className="object-contain"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex justify-end space-x-4 mt-8">
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => {
                          setIsEditing(false)
                          setShowCropDialog(false)
                          setTempImage('')
                          setImageError(null)
                          setImageLoading(false)
                        }}
                      >
                        Cancel
                      </Button>
                      <Button type="submit">
                        Save Changes
                      </Button>
                    </div>
                  </form>
                  {showCropDialog && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                      <div className="bg-gray-800 p-6 rounded-lg max-w-2xl w-full max-h-[90vh] flex flex-col">
                        <h3 className="text-xl font-bold mb-4">Crop Image</h3>
                        <div className="relative flex-1 min-h-0 overflow-auto">
                          <ReactCrop
                            crop={cropState.crop}
                            onChange={(c: Crop) => setCropState(prev => ({ ...prev, crop: c }))}
                            onComplete={(c: Crop) => setCropState(prev => ({ ...prev, completedCrop: c }))}
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
                          <p className="text-lg sm:text-xl text-gray-200">{profile.title}</p>
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
                              default:
                                Icon = User
                            }
                            return link.url ? (
                              <Button key={index} variant="ghost" size="icon" className="w-10 h-10 sm:w-12 sm:h-12" asChild>
                                <a href={link.url} target="_blank" rel="noopener noreferrer">
                                  <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
                                  <span className="sr-only">{link.platform}</span>
                                </a>
                              </Button>
                            ) : null
                          })}
                        </div>

                        {isLoggedIn && (
                          <Button onClick={() => setIsEditing(true)} variant="outline" className="mt-4">
                            <Edit2 className="mr-2 h-4 w-4" /> Edit Profile
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="mt-16 sm:mt-24 max-w-6xl mx-auto px-4">
                    <h2 className="text-4xl font-bold text-white text-center mb-12">PROJECTS and PEOPLE</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                      {projectsLoading ? (
                        // Show skeleton loading cards
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
                  <div className="mt-16 sm:mt-24 max-w-6xl mx-auto px-4">
                    <h2 className="text-4xl font-bold text-white text-center mb-12">MEDIA</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                      {videosLoading ? (
                        // Show skeleton loading cards
                        Array(2).fill(0).map((_, i) => (
                          <Card key={i} className="w-full max-w-[560px] mx-auto animate-pulse">
                            <CardContent className="p-4">
                              <div className="aspect-video bg-gray-700 rounded mb-2"></div>
                              <div className="h-4 bg-gray-700 rounded w-3/4"></div>
                            </CardContent>
                          </Card>
                        ))
                      ) : (
                        <>
                          {videos.slice(0, visibleVideos).map((video, index) => (
                            <Card key={index} className="w-full max-w-[560px] mx-auto">
                              <CardContent className="p-4">
                                <div className="relative pb-[56.25%] h-0">
                                  <iframe
                                    className="absolute top-0 left-0 w-full h-full"
                                    width="100%"
                                    height="315"
                                    src={`https://www.youtube.com/embed/${video.id}`}
                                    frameBorder="0"
                                    allow="autoplay; encrypted-media"
                                    allowFullScreen
                                    loading="lazy"
                                    rel="noopener noreferrer"
                                  ></iframe>
                                </div>
                                <h3 className="mt-2 text-lg font-semibold text-white">{video.title}</h3>
                              </CardContent>
                            </Card>
                          ))}
                          {visibleVideos < videos.length && (
                            <Button 
                              onClick={loadMoreVideos}
                              variant="ghost" 
                              className="col-span-full mx-auto mt-4"
                            >
                              Load More Videos
                            </Button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                  {sticker.enabled && (
                    <div className="relative w-[200px] h-[200px] mx-auto mt-16">
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
                </>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}