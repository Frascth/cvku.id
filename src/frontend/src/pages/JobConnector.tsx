import { useState } from 'react';
import { Header } from '@/components/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { 
  Search, 
  MapPin, 
  Clock, 
  DollarSign, 
  Building, 
  Users, 
  Send, 
  Heart, 
  BookmarkPlus,
  Target,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  Eye
} from 'lucide-react';

const JobConnector = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedJob, setSelectedJob] = useState(null);

  const jobListings = [
    {
      id: 1,
      title: "Senior Frontend Developer",
      company: "TechCorp Indonesia",
      location: "Jakarta, Remote",
      salary: "Rp 15-25 juta",
      type: "Full-time",
      posted: "2 hari lalu",
      match: 92,
      skills: ["React", "TypeScript", "Next.js", "Tailwind"],
      description: "We're looking for an experienced frontend developer to join our growing team...",
      requirements: ["3+ years React experience", "TypeScript proficiency", "Team collaboration"],
      applied: false,
      saved: false
    },
    {
      id: 2,
      title: "UI/UX Designer",
      company: "StartupXYZ",
      location: "Bandung",
      salary: "Rp 8-15 juta",
      type: "Full-time",
      posted: "1 hari lalu",
      match: 85,
      skills: ["Figma", "Adobe XD", "Prototyping", "User Research"],
      description: "Join our design team to create amazing user experiences...",
      requirements: ["2+ years design experience", "Portfolio required", "Figma expertise"],
      applied: true,
      saved: true
    },
    {
      id: 3,
      title: "Digital Marketing Specialist",
      company: "MarketingPro",
      location: "Surabaya",
      salary: "Rp 6-12 juta",
      type: "Full-time",
      posted: "3 hari lalu",
      match: 78,
      skills: ["SEO", "Google Ads", "Analytics", "Content Marketing"],
      description: "Help us grow our digital presence and drive conversions...",
      requirements: ["Google Ads certification", "Analytics experience", "Creative thinking"],
      applied: false,
      saved: true
    }
  ];

  const applications = [
    {
      id: 1,
      jobTitle: "Senior Frontend Developer",
      company: "TechCorp Indonesia",
      appliedDate: "2024-01-15",
      status: "Interview Scheduled",
      statusColor: "bg-blue-500",
      nextStep: "Technical Interview - Jan 20, 2024",
      feedback: "Great portfolio! Looking forward to the technical discussion."
    },
    {
      id: 2,
      jobTitle: "UI/UX Designer",
      company: "StartupXYZ",
      appliedDate: "2024-01-10",
      status: "Under Review",
      statusColor: "bg-yellow-500",
      nextStep: "Waiting for HR review",
      feedback: "Application received and under review."
    },
    {
      id: 3,
      jobTitle: "Full Stack Developer",
      company: "DevStudio",
      appliedDate: "2024-01-05",
      status: "Rejected",
      statusColor: "bg-red-500",
      nextStep: "Application closed",
      feedback: "Thank you for your interest. We decided to move forward with other candidates."
    }
  ];

  const matchedJobs = [
    {
      title: "React Developer",
      company: "InnovateTech",
      match: 95,
      reason: "Perfect match for your React and TypeScript skills"
    },
    {
      title: "Frontend Engineer",
      company: "WebSolutions",
      match: 88,
      reason: "Your UI/UX background aligns well with this role"
    },
    {
      title: "JavaScript Developer",
      company: "CodeCraft",
      match: 82,
      reason: "Strong match for your frontend development experience"
    }
  ];

  const getStatusIcon = (status) => {
    switch (status) {
      case "Interview Scheduled":
        return <CheckCircle className="w-4 h-4 text-blue-500" />;
      case "Under Review":
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case "Rejected":
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Header />
      
      <div className="container mx-auto px-4 py-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Job Connector</h1>
          <p className="text-gray-600">Temukan pekerjaan yang sesuai dengan resume Anda</p>
        </div>

        <Tabs defaultValue="jobs" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="jobs">Job Listings</TabsTrigger>
            <TabsTrigger value="applications">My Applications</TabsTrigger>
            <TabsTrigger value="matches">Smart Matches</TabsTrigger>
            <TabsTrigger value="saved">Saved Jobs</TabsTrigger>
          </TabsList>

          <TabsContent value="jobs" className="space-y-6">
            {/* Search and Filters */}
            <Card>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input 
                      placeholder="Cari pekerjaan..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Lokasi" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="jakarta">Jakarta</SelectItem>
                      <SelectItem value="bandung">Bandung</SelectItem>
                      <SelectItem value="surabaya">Surabaya</SelectItem>
                      <SelectItem value="remote">Remote</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Kategori" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="tech">Technology</SelectItem>
                      <SelectItem value="design">Design</SelectItem>
                      <SelectItem value="marketing">Marketing</SelectItem>
                      <SelectItem value="sales">Sales</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Tipe" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fulltime">Full-time</SelectItem>
                      <SelectItem value="parttime">Part-time</SelectItem>
                      <SelectItem value="contract">Contract</SelectItem>
                      <SelectItem value="freelance">Freelance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Job Listings */}
            <div className="space-y-4">
              {jobListings.map((job) => (
                <Card key={job.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-xl font-semibold text-gray-900">{job.title}</h3>
                          <div className="flex items-center space-x-1 bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
                            <Target className="w-3 h-3" />
                            <span>{job.match}% Match</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                          <span className="flex items-center space-x-1">
                            <Building className="w-4 h-4" />
                            <span>{job.company}</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <MapPin className="w-4 h-4" />
                            <span>{job.location}</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <DollarSign className="w-4 h-4" />
                            <span>{job.salary}</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <Clock className="w-4 h-4" />
                            <span>{job.posted}</span>
                          </span>
                        </div>
                        <p className="text-gray-600 mb-3">{job.description}</p>
                        <div className="flex flex-wrap gap-2">
                          {job.skills.map((skill) => (
                            <Badge key={skill} variant="secondary">{skill}</Badge>
                          ))}
                        </div>
                      </div>
                      <div className="flex flex-col space-y-2 ml-4">
                        <Button 
                          size="sm" 
                          className={job.applied ? "bg-gray-500" : ""}
                          disabled={job.applied}
                        >
                          {job.applied ? "Applied" : "Apply Now"}
                        </Button>
                        <Button variant="outline" size="sm">
                          <BookmarkPlus className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="applications" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="text-2xl font-bold text-blue-600">12</div>
                  <div className="text-sm text-gray-600">Total Applications</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="text-2xl font-bold text-green-600">3</div>
                  <div className="text-sm text-gray-600">Interviews</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="text-2xl font-bold text-yellow-600">5</div>
                  <div className="text-sm text-gray-600">Under Review</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="text-2xl font-bold text-purple-600">25%</div>
                  <div className="text-sm text-gray-600">Response Rate</div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-4">
              {applications.map((app) => (
                <Card key={app.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold">{app.jobTitle}</h3>
                        <p className="text-gray-600">{app.company}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(app.status)}
                        <span className={`px-3 py-1 rounded-full text-white text-sm ${app.statusColor}`}>
                          {app.status}
                        </span>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Applied:</span> {app.appliedDate}
                      </div>
                      <div>
                        <span className="font-medium">Next Step:</span> {app.nextStep}
                      </div>
                      <div>
                        <Button variant="outline" size="sm">View Details</Button>
                      </div>
                    </div>
                    {app.feedback && (
                      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-600">{app.feedback}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="matches" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Target className="w-5 h-5 text-blue-600" />
                  <span>Smart Job Matches</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-6">
                  Berdasarkan analisis resume Anda, kami menemukan pekerjaan yang sangat cocok dengan skill dan pengalaman Anda.
                </p>
                <div className="space-y-4">
                  {matchedJobs.map((job, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-semibold">{job.title}</h4>
                        <p className="text-gray-600">{job.company}</p>
                        <p className="text-sm text-gray-500 mt-1">{job.reason}</p>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-600">{job.match}%</div>
                          <div className="text-xs text-gray-500">Match</div>
                        </div>
                        <Button size="sm">View Job</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Resume Optimization Tips</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start space-x-3">
                  <TrendingUp className="w-5 h-5 text-blue-600 mt-1" />
                  <div>
                    <h4 className="font-medium">Add more relevant skills</h4>
                    <p className="text-sm text-gray-600">Consider adding "Node.js" and "MongoDB" to increase matches by 15%</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Target className="w-5 h-5 text-green-600 mt-1" />
                  <div>
                    <h4 className="font-medium">Update job titles</h4>
                    <p className="text-sm text-gray-600">Use industry-standard titles to improve ATS compatibility</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="saved" className="space-y-6">
            <div className="text-center py-8">
              <BookmarkPlus className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No Saved Jobs</h3>
              <p className="text-gray-500 mb-4">Start saving jobs you're interested in to view them here</p>
              <Button asChild>
                <a href="#jobs">Browse Jobs</a>
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default JobConnector;