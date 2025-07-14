
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Users, FileText, Search, MoreHorizontal, Eye, Trash2, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';

interface User {
  id: string;
  name: string;
  email: string;
  status: 'active' | 'inactive';
  cvCount: number;
  joinDate: string;
}

interface CV {
  id: string;
  title: string;
  owner: string;
  template: string;
  privacy: 'public' | 'private';
  lastModified: string;
}

const Admin = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'users' | 'cvs'>('users');

  // Mock data
  const [users] = useState<User[]>([
    {
      id: '1',
      name: 'John Doe',
      email: 'john@example.com',
      status: 'active',
      cvCount: 3,
      joinDate: '2024-01-15',
    },
    {
      id: '2',
      name: 'Jane Smith',
      email: 'jane@example.com',
      status: 'active',
      cvCount: 1,
      joinDate: '2024-02-20',
    },
    {
      id: '3',
      name: 'Mike Johnson',
      email: 'mike@example.com',
      status: 'inactive',
      cvCount: 2,
      joinDate: '2024-01-30',
    },
  ]);

  const [cvs] = useState<CV[]>([
    {
      id: '1',
      title: 'Senior Developer Resume',
      owner: 'John Doe',
      template: 'modern',
      privacy: 'public',
      lastModified: '2024-03-01',
    },
    {
      id: '2',
      title: 'Marketing Manager CV',
      owner: 'Jane Smith',
      template: 'professional',
      privacy: 'private',
      lastModified: '2024-02-28',
    },
    {
      id: '3',
      title: 'UX Designer Portfolio',
      owner: 'Mike Johnson',
      template: 'minimal',
      privacy: 'public',
      lastModified: '2024-02-25',
    },
  ]);

  const handleUserAction = (action: string, userId: string) => {
    toast({
      title: `User ${action}`,
      description: `Action ${action} performed on user ${userId}`,
    });
  };

  const handleCVAction = (action: string, cvId: string) => {
    toast({
      title: `CV ${action}`,
      description: `Action ${action} performed on CV ${cvId}`,
    });
  };

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredCVs = cvs.filter(cv =>
    cv.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cv.owner.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    totalUsers: users.length,
    activeUsers: users.filter(u => u.status === 'active').length,
    totalCVs: cvs.length,
    publicCVs: cvs.filter(cv => cv.privacy === 'public').length,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">CV</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">CvKu.id Admin</h1>
                <p className="text-sm text-gray-500">Dashboard</p>
              </div>
            </div>
            <Button
              onClick={() => navigate('/')}
              variant="outline"
            >
              Back to App
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Users</CardTitle>
              <Users className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeUsers}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total CVs</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalCVs}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Public CVs</CardTitle>
              <FileText className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.publicCVs}</div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs and Search */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
            <Button
              variant={activeTab === 'users' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('users')}
            >
              Users
            </Button>
            <Button
              variant={activeTab === 'cvs' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('cvs')}
            >
              CVs
            </Button>
          </div>
          <div className="relative w-full sm:w-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder={`Search ${activeTab}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full sm:w-80"
            />
          </div>
        </div>

        {/* Content */}
        <Card>
          <CardHeader>
            <CardTitle>{activeTab === 'users' ? 'User Management' : 'CV Management'}</CardTitle>
          </CardHeader>
          <CardContent>
            {activeTab === 'users' ? (
              <div className="space-y-4">
                {filteredUsers.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                        <Users className="w-5 h-5 text-gray-600" />
                      </div>
                      <div>
                        <h3 className="font-medium">{user.name}</h3>
                        <p className="text-sm text-gray-500">{user.email}</p>
                        <p className="text-xs text-gray-400">Joined: {user.joinDate}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Badge variant={user.status === 'active' ? 'default' : 'secondary'}>
                        {user.status}
                      </Badge>
                      <span className="text-sm text-gray-500">{user.cvCount} CVs</span>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem onClick={() => handleUserAction('view', user.id)}>
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleUserAction('settings', user.id)}>
                            <Settings className="mr-2 h-4 w-4" />
                            Settings
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleUserAction('delete', user.id)}
                            className="text-red-600"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete User
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredCVs.map((cv) => (
                  <div key={cv.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <FileText className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-medium">{cv.title}</h3>
                        <p className="text-sm text-gray-500">by {cv.owner}</p>
                        <p className="text-xs text-gray-400">Modified: {cv.lastModified}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Badge variant="outline">{cv.template}</Badge>
                      <Badge variant={cv.privacy === 'public' ? 'default' : 'secondary'}>
                        {cv.privacy}
                      </Badge>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem onClick={() => handleCVAction('view', cv.id)}>
                            <Eye className="mr-2 h-4 w-4" />
                            View CV
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleCVAction('settings', cv.id)}>
                            <Settings className="mr-2 h-4 w-4" />
                            Settings
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleCVAction('delete', cv.id)}
                            className="text-red-600"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete CV
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Admin;
