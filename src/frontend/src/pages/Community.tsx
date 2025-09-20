import { useState } from 'react';
import { Header } from '@/components/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MessageCircle, Heart, Share, Eye, Plus, Search, TrendingUp, Users } from 'lucide-react';

const Community = () => {
  const [newPost, setNewPost] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const forumPosts = [
    {
      id: 1,
      title: "Tips untuk Resume Tech yang ATS-Friendly",
      content: "Setelah 3 bulan job hunting, akhirnya dapat offer! Mau share tips yang membantu resume saya lolos ATS...",
      author: "Sarah Tech",
      avatar: "ST",
      likes: 24,
      comments: 8,
      views: 156,
      tags: ["ATS", "Tech", "Tips"],
      time: "2 jam lalu"
    },
    {
      id: 2,
      title: "Review Resume untuk Fresh Graduate",
      content: "Mohon review untuk resume fresh graduate jurusan IT. Masih bingung cara highlight project dan skill...",
      author: "Ahmad Rizki",
      avatar: "AR",
      likes: 12,
      comments: 15,
      views: 89,
      tags: ["Fresh Graduate", "Review", "IT"],
      time: "4 jam lalu"
    },
    {
      id: 3,
      title: "Template Resume Marketing yang Effective",
      content: "Share template resume yang berhasil membuat saya diterima di 3 company marketing. Template ini fokus pada hasil metrics...",
      author: "Diana Marketing",
      avatar: "DM",
      likes: 45,
      comments: 22,
      views: 234,
      tags: ["Marketing", "Template", "Success"],
      time: "1 hari lalu"
    }
  ];

  const sharedResumes = [
    {
      id: 1,
      title: "Software Engineer Resume",
      author: "John Developer",
      avatar: "JD",
      industry: "Technology",
      experience: "3-5 tahun",
      views: 89,
      likes: 15,
      template: "Modern"
    },
    {
      id: 2,
      title: "Digital Marketing Specialist",
      author: "Lisa Marketing",
      avatar: "LM",
      industry: "Marketing",
      experience: "1-3 tahun",
      views: 67,
      likes: 12,
      template: "Professional"
    },
    {
      id: 3,
      title: "UI/UX Designer Portfolio",
      author: "Alex Design",
      avatar: "AD",
      industry: "Design",
      experience: "2-4 tahun",
      views: 123,
      likes: 28,
      template: "Creative"
    }
  ];

  const topContributors = [
    { name: "Sarah Tech", avatar: "ST", posts: 24, likes: 456 },
    { name: "Diana Marketing", avatar: "DM", posts: 18, likes: 389 },
    { name: "John Developer", avatar: "JD", posts: 15, likes: 234 }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Header />
      
      <div className="container mx-auto px-4 py-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Community</h1>
          <p className="text-gray-600">Berbagi pengalaman, tips, dan dapatkan feedback dari komunitas</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-3">
            <Tabs defaultValue="forum" className="space-y-6">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="forum">Forum Diskusi</TabsTrigger>
                <TabsTrigger value="resumes">Resume Gallery</TabsTrigger>
              </TabsList>

              <TabsContent value="forum" className="space-y-6">
                {/* Create New Post */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Plus className="w-5 h-5" />
                      <span>Buat Post Baru</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Input placeholder="Judul diskusi..." />
                    <Textarea 
                      placeholder="Ceritakan pengalaman, tanyakan sesuatu, atau bagikan tips..."
                      value={newPost}
                      onChange={(e) => setNewPost(e.target.value)}
                      rows={3}
                    />
                    <div className="flex space-x-2">
                      <Button>Post</Button>
                      <Button variant="outline">Draft</Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input 
                    placeholder="Cari diskusi..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>

                {/* Forum Posts */}
                <div className="space-y-4">
                  {forumPosts.map((post) => (
                    <Card key={post.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-start space-x-4">
                          <Avatar>
                            <AvatarFallback>{post.avatar}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <h3 className="font-semibold text-lg hover:text-blue-600 cursor-pointer">
                                {post.title}
                              </h3>
                              <span className="text-sm text-gray-500">{post.time}</span>
                            </div>
                            <p className="text-gray-600 mb-3">{post.content}</p>
                            <div className="flex items-center justify-between">
                              <div className="flex flex-wrap gap-2">
                                {post.tags.map((tag) => (
                                  <Badge key={tag} variant="secondary" className="text-xs">
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                              <div className="flex items-center space-x-4 text-sm text-gray-500">
                                <span className="flex items-center space-x-1">
                                  <Eye className="w-4 h-4" />
                                  <span>{post.views}</span>
                                </span>
                                <span className="flex items-center space-x-1">
                                  <Heart className="w-4 h-4" />
                                  <span>{post.likes}</span>
                                </span>
                                <span className="flex items-center space-x-1">
                                  <MessageCircle className="w-4 h-4" />
                                  <span>{post.comments}</span>
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center justify-between mt-4 pt-4 border-t">
                              <span className="text-sm text-gray-600">by {post.author}</span>
                              <div className="flex space-x-2">
                                <Button variant="ghost" size="sm">
                                  <Heart className="w-4 h-4 mr-1" />
                                  Like
                                </Button>
                                <Button variant="ghost" size="sm">
                                  <MessageCircle className="w-4 h-4 mr-1" />
                                  Comment
                                </Button>
                                <Button variant="ghost" size="sm">
                                  <Share className="w-4 h-4 mr-1" />
                                  Share
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="resumes" className="space-y-6">
                {/* Search Resumes */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input placeholder="Cari resume berdasarkan industri, posisi..." className="pl-10" />
                </div>

                {/* Shared Resumes */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {sharedResumes.map((resume) => (
                    <Card key={resume.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <h3 className="font-semibold text-lg">{resume.title}</h3>
                          <Badge>{resume.template}</Badge>
                        </div>
                        <div className="flex items-center space-x-3 mb-4">
                          <Avatar className="w-8 h-8">
                            <AvatarFallback className="text-xs">{resume.avatar}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium">{resume.author}</p>
                            <p className="text-xs text-gray-500">{resume.experience}</p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                          <Badge variant="outline">{resume.industry}</Badge>
                          <div className="flex items-center space-x-3">
                            <span className="flex items-center space-x-1">
                              <Eye className="w-4 h-4" />
                              <span>{resume.views}</span>
                            </span>
                            <span className="flex items-center space-x-1">
                              <Heart className="w-4 h-4" />
                              <span>{resume.likes}</span>
                            </span>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Button size="sm" className="flex-1">View Resume</Button>
                          <Button variant="outline" size="sm">
                            <Heart className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Community Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="w-5 h-5" />
                  <span>Statistik</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Total Member</span>
                  <span className="font-semibold">1,234</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Post Hari Ini</span>
                  <span className="font-semibold">47</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Resume Dibagikan</span>
                  <span className="font-semibold">892</span>
                </div>
              </CardContent>
            </Card>

            {/* Top Contributors */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="w-5 h-5" />
                  <span>Top Contributors</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {topContributors.map((contributor, index) => (
                  <div key={contributor.name} className="flex items-center space-x-3">
                    <div className="flex items-center justify-center w-6 h-6 bg-blue-100 text-blue-600 rounded-full text-xs font-medium">
                      {index + 1}
                    </div>
                    <Avatar className="w-8 h-8">
                      <AvatarFallback className="text-xs">{contributor.avatar}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{contributor.name}</p>
                      <p className="text-xs text-gray-500">{contributor.posts} posts • {contributor.likes} likes</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Popular Tags */}
            <Card>
              <CardHeader>
                <CardTitle>Popular Tags</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {["ATS", "Fresh Graduate", "Tech", "Marketing", "Design", "Tips", "Review", "Template"].map((tag) => (
                    <Badge key={tag} variant="secondary" className="cursor-pointer hover:bg-blue-100">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Community;