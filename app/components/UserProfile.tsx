'use client'

// Updated external links to open in new tabs - November 2024
// Added iframe optimizations - November 2024



import Image from "next/image"
import Link from "next/link"
import { useState, useCallback } from "react"
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

function Navbar({ isLoggedIn, onLoginToggle }: NavbarProps) {
  return (
    <nav className="bg-gray-900 py-6 px-8 flex items-center justify-between">
      <div className="flex items-center">
        <Link href="/">
          <div className="w-20 h-8 relative">
            <Image
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Logotype_Main@1.5x-v0CzgGF3X0t7k4yaBbFQWerwN5bGdC.png"
              alt="mixmi"
              layout="fill"
              objectFit="contain"
              className="mr-4"
              priority
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
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [profile, setProfile] = useState<Profile>({
    name: "Ima Faque",
    title: "Producer and DJ / Visual Artist",
    bio: "Mixing vibes pa' que lo sientas—electrónica, street beats callejeros, and visuals que te explotan la mente. Después de años explorando digital art, I'm here pa' romper lo tradicional y llevarte a un viaje audiovisual único.",
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/img%20for%20v0-LudcChqu5ygUdwcGxwg3afWZgwDhDO.png",
    socialLinks: [
      { platform: "youtube", url: "https://youtube.com/imafaque" },
      { platform: "spotify", url: "https://open.spotify.com/artist/imafaque" },
      { platform: "soundcloud", url: "https://soundcloud.com/imafaque" },
      { platform: "instagram", url: "https://instagram.com/imafaque" }
    ]
  })

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
    },
  ])

  const [sticker, setSticker] = useState<Sticker>({
    enabled: true,
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/daisy-blue-1sqZRfemKwLyREL0Eo89EfmQUT5wst.png"
  })

  const [formErrors, setFormErrors] = useState<FormErrors>({
    name: '',
    title: '',
    bio: '',
    socialLinks: []
  })

  const handleLoginToggle = () => {
    setIsLoggedIn(prev => !prev)
    setIsEditing(false)
  }

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setProfile(prev => ({ ...prev, [name]: value }))
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

  const handleImageChange = (file: File | null) => {
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setProfile(prev => ({ ...prev, image: reader.result as string }))
      }
      reader.readAsDataURL(file)
    }
  }

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file && file.type.startsWith('image/')) {
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

    // Validate social links
    const socialLinkErrors = profile.socialLinks.map(link => {
      if (link.platform === '' || link.url === '') {
        hasErrors = true
        return 'Both platform and URL are required'
      }
      if (!/^https?:\/\//.test(link.url)) {
        hasErrors = true
        return 'URL must start with http:// or https://'
      }
      return ''
    })
    setFormErrors(prev => ({ ...prev, socialLinks: socialLinkErrors }))

    if (hasErrors) {
      // If there are errors, don't proceed with saving
      return
    }

    // If no errors, proceed with saving
    setIsEditing(false)
    // Here you would typically save the data to your backend
  }

  const handleStickerChange = (checked: boolean) => {
    setSticker(prev => ({
      ...prev,
      enabled: checked
    }));
  };

  return (
    <div className="dark min-h-screen bg-gray-900 text-gray-100">
      <style jsx>{`
        @keyframes rotate {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        .sticker-rotate {
          animation: rotate 20s linear infinite;
        }
      `}</style>
      <Navbar isLoggedIn={isLoggedIn} onLoginToggle={handleLoginToggle} />
      <div className="p-4 sm:p-8 md:p-12 lg:p-16">
        <div className="max-w-6xl mx-auto">
          {isLoggedIn && isEditing ? (
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
                      <div className="relative w-32 h-32 overflow-hidden rounded-lg">
                        <Image 
                          src={profile.image} 
                          alt="Profile" 
                          layout="fill" 
                          objectFit="cover" 
                          className="rounded-lg"
                        />
                      </div>
                      <p className="text-sm text-gray-300">
                        Drag & drop an image here, or click to select one
                      </p>
                      <Label htmlFor="fileInput" className="cursor-pointer">
                        <Button type="button" variant="outline" size="sm" className="mt-2">
                          <Upload className="w-4 h-4 mr-2" />
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
                          }
                        }} 
                        className="hidden"
                      />
                    </div>
                  </div>
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
                      {formErrors.socialLinks[index] && (
                        <p className="text-red-500 text-sm">{formErrors.socialLinks[index]}</p>
                      )}
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
                                <Label htmlFor={`project-image-${index}`}>Project Image</Label>
                                <div className="mt-2 flex items-center space-x-4">
                                  {project.image && (
                                    <div className="relative w-24 h-24 rounded-lg overflow-hidden">
                                      <Image src={project.image} alt={project.title} layout="fill" objectFit="cover" />
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
                              <div>
                                <Label htmlFor={`project-link-${index}`}>Link</Label>
                                <Input
                                  id={`project-link-${index}`}
                                  value={project.link}
                                  onChange={(e) => handleProjectChange(index, 'link', e.target.value)}
                                  className="mt-1"
                                />
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
                  <h3 className="text-lg font-semibold mb-2">YouTube Videos</h3>
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
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="sticker-enabled"
                      checked={sticker.enabled}
                      onCheckedChange={handleStickerChange}
                    />
                    <Label htmlFor="sticker-enabled">Enable profile sticker</Label>
                  </div>
                  {sticker.enabled && (
                    <Select
                      value={sticker.image}
                      onValueChange={(value) => setSticker(prev => ({ ...prev, image: value }))}
                    >
                      <SelectTrigger className="w-[200px] mt-2">
                        <SelectValue placeholder="Select a sticker" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/daisy-blue-1sqZRfemKwLyREL0Eo89EfmQUT5wst.png">Blue Daisy</SelectItem>
                        <SelectItem value="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/daisy-purple-zuy0TjRXzDx6hnayJ249A4Mgp8ktLy.png">Purple Daisy</SelectItem>
                        <SelectItem value="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/daisy-white-sWezY97Qz4q7W6zenHPvu3ns9egGwH.png">White Daisy</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                </div>
                <div className="flex justify-end space-x-4">
                  <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
                  <Button type="submit">Save Profile</Button>
                </div>
              </form>
            </div>
          ) : (
            <>
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8 lg:gap-16">
                <div className="w-full lg:w-1/2 max-w-md mx-auto lg:mx-0">
                  <div className="relative aspect-square overflow-hidden border border-cyan-300 rounded-lg">
                    <Image
                      src={profile.image}
                      alt="Artist profile photo"
                      layout="fill"
                      objectFit="cover"
                      className="w-full h-full object-cover"
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
                        return (
                          <Button key={index} variant="ghost" size="icon" className="w-10 h-10 sm:w-12 sm:h-12" asChild>
                            <a href={link.url} target="_blank" rel="noopener noreferrer">
                              <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
                              <span className="sr-only">{link.platform}</span>
                            </a>
                          </Button>
                        )
                      })}
                    </div>
                  </div>
                  {isLoggedIn && (
                    <Button onClick={() => setIsEditing(true)} variant="outline" className="mt-4">
                      <Edit2 className="mr-2 h-4 w-4" /> Edit Profile
                    </Button>
                  )}
                </div>
              </div>

              <div className="mt-16 sm:mt-24">
                <h2 className="text-4xl font-bold text-white text-center mb-12">PROJECTS and PEOPLE</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {projects.map((project) => (
                    <Card key={project.id} className="bg-gray-800/50 border-gray-700 overflow-hidden min-h-[5rem]">
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
                                layout="fill"
                                objectFit="cover"
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
                </div>
              </div>

              <div className="mt-16 sm:mt-24">
                <h2 className="text-4xl font-bold text-white text-center mb-12">MEDIA</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
                  {videos.map((video, index) => (
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
                </div>
              </div>
              {sticker.enabled && (
                <div className="w-full max-w-6xl mx-auto mt-16"> {/* Updated class names */}
                  <div className="relative w-[200px] h-[200px] mx-auto">
                    <div className="sticker-rotate">
                      <Image
                        src={sticker.image}
                        alt="Profile sticker"
                        width={200}
                        height={200}
                        className="w-full h-full object-contain"
                      />
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}