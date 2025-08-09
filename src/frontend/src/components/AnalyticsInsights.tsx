
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Legend } from 'recharts';
import { 
  Eye, 
  Users, 
  TrendingUp, 
  Download, 
  Share2, 
  Clock, 
  MapPin, 
  Smartphone, 
  Monitor, 
  Globe,
  Calendar,
  FileText,
  Heart,
  MessageCircle
} from 'lucide-react';

export const AnalyticsInsights: React.FC = () => {
  const [timeRange, setTimeRange] = useState('7d');
  const [selectedMetric, setSelectedMetric] = useState('views');

  // Mock analytics data
  const overviewStats = {
    totalViews: 1247,
    uniqueVisitors: 892,
    avgViewDuration: '2m 34s',
    bounceRate: '32%',
    shareCount: 45,
    downloadCount: 23
  };

  const chartConfig = {
    views: { label: 'Views', color: 'hsl(var(--primary))' },
    visitors: { label: 'Visitors', color: 'hsl(var(--secondary))' },
    duration: { label: 'Duration', color: 'hsl(var(--accent))' }
  };

  const viewsData = [
    { date: '2024-01-01', views: 45, visitors: 32, duration: 145 },
    { date: '2024-01-02', views: 52, visitors: 38, duration: 167 },
    { date: '2024-01-03', views: 48, visitors: 35, duration: 156 },
    { date: '2024-01-04', views: 61, visitors: 44, duration: 189 },
    { date: '2024-01-05', views: 55, visitors: 41, duration: 178 },
    { date: '2024-01-06', views: 67, visitors: 49, duration: 201 },
    { date: '2024-01-07', views: 58, visitors: 43, duration: 165 }
  ];

  const deviceData = [
    { name: 'Desktop', value: 65, color: '#8b5cf6' },
    { name: 'Mobile', value: 28, color: '#06b6d4' },
    { name: 'Tablet', value: 7, color: '#10b981' }
  ];

  const locationData = [
    { country: 'United States', views: 425, percentage: 34 },
    { country: 'United Kingdom', views: 287, percentage: 23 },
    { country: 'Canada', views: 198, percentage: 16 },
    { country: 'Australia', views: 156, percentage: 12 },
    { country: 'Germany', views: 123, percentage: 10 },
    { country: 'Others', views: 58, percentage: 5 }
  ];

  const trafficSources = [
    { source: 'Direct', views: 456, percentage: 37 },
    { source: 'LinkedIn', views: 298, percentage: 24 },
    { source: 'Google Search', views: 234, percentage: 19 },
    { source: 'Email', views: 156, percentage: 12 },
    { source: 'Social Media', views: 103, percentage: 8 }
  ];

  const topSections = [
    { section: 'Work Experience', viewTime: '45s', engagement: 85 },
    { section: 'Skills', viewTime: '32s', engagement: 78 },
    { section: 'Education', viewTime: '28s', engagement: 72 },
    { section: 'Projects', viewTime: '41s', engagement: 81 },
    { section: 'Certifications', viewTime: '22s', engagement: 65 }
  ];

  const recentActivity = [
    { action: 'Resume viewed', location: 'San Francisco, CA', time: '2 minutes ago', device: 'Desktop' },
    { action: 'Resume shared', location: 'London, UK', time: '15 minutes ago', device: 'Mobile' },
    { action: 'Resume downloaded', location: 'Toronto, CA', time: '1 hour ago', device: 'Desktop' },
    { action: 'Resume viewed', location: 'Sydney, AU', time: '2 hours ago', device: 'Tablet' },
    { action: 'Resume viewed', location: 'Berlin, DE', time: '3 hours ago', device: 'Desktop' }
  ];

  const exportAnalytics = () => {
    // Mock export functionality
    const data = {
      overview: overviewStats,
      views: viewsData,
      devices: deviceData,
      locations: locationData,
      sources: trafficSources,
      sections: topSections,
      activity: recentActivity,
      exportedAt: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `resume-analytics-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Analytics & Insights
            </CardTitle>
            <CardDescription>
              Track your resume performance and engagement metrics
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="24h">Last 24h</SelectItem>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" onClick={exportAnalytics}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="traffic">Traffic</TabsTrigger>
            <TabsTrigger value="engagement">Engagement</TabsTrigger>
            <TabsTrigger value="demographics">Demographics</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Eye className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Total Views</span>
                  </div>
                  <div className="text-2xl font-bold">{overviewStats.totalViews.toLocaleString()}</div>
                  <Badge variant="secondary" className="text-xs">+12% vs last period</Badge>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Unique Visitors</span>
                  </div>
                  <div className="text-2xl font-bold">{overviewStats.uniqueVisitors.toLocaleString()}</div>
                  <Badge variant="secondary" className="text-xs">+8% vs last period</Badge>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Avg Duration</span>
                  </div>
                  <div className="text-2xl font-bold">{overviewStats.avgViewDuration}</div>
                  <Badge variant="secondary" className="text-xs">+5% vs last period</Badge>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Bounce Rate</span>
                  </div>
                  <div className="text-2xl font-bold">{overviewStats.bounceRate}</div>
                  <Badge variant="secondary" className="text-xs">-3% vs last period</Badge>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Share2 className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Shares</span>
                  </div>
                  <div className="text-2xl font-bold">{overviewStats.shareCount}</div>
                  <Badge variant="secondary" className="text-xs">+15% vs last period</Badge>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Download className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Downloads</span>
                  </div>
                  <div className="text-2xl font-bold">{overviewStats.downloadCount}</div>
                  <Badge variant="secondary" className="text-xs">+22% vs last period</Badge>
                </CardContent>
              </Card>
            </div>

            {/* Views Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Views Over Time</CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-80">
                  <LineChart data={viewsData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line type="monotone" dataKey="views" stroke="var(--color-views)" strokeWidth={2} />
                    <Line type="monotone" dataKey="visitors" stroke="var(--color-visitors)" strokeWidth={2} />
                  </LineChart>
                </ChartContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="traffic" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Traffic Sources */}
              <Card>
                <CardHeader>
                  <CardTitle>Traffic Sources</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {trafficSources.map((source, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Globe className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{source.source}</span>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold">{source.views}</div>
                          <div className="text-sm text-muted-foreground">{source.percentage}%</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Device Breakdown */}
              <Card>
                <CardHeader>
                  <CardTitle>Device Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={chartConfig} className="h-64">
                    <PieChart>
                      <Pie
                        data={deviceData}
                        cx="50%" 
                        cy="50%" 
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {deviceData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Legend />
                    </PieChart>
                  </ChartContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="engagement" className="space-y-6">
            {/* Top Sections */}
            <Card>
              <CardHeader>
                <CardTitle>Section Performance</CardTitle>
                <CardDescription>
                  Which sections of your resume get the most attention
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topSections.map((section, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <div className="font-medium">{section.section}</div>
                          <div className="text-sm text-muted-foreground">
                            Avg time: {section.viewTime}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">{section.engagement}%</div>
                        <div className="text-sm text-muted-foreground">engagement</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="demographics" className="space-y-6">
            {/* Geographic Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Geographic Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {locationData.map((location, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{location.country}</span>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">{location.views}</div>
                        <div className="text-sm text-muted-foreground">{location.percentage}%</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="activity" className="space-y-6">
            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>
                  Latest interactions with your resume
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-start gap-4 p-4 border rounded-lg">
                      <div className="flex-shrink-0">
                        {activity.device === 'Desktop' ? (
                          <Monitor className="h-4 w-4 text-muted-foreground mt-1" />
                        ) : activity.device === 'Mobile' ? (
                          <Smartphone className="h-4 w-4 text-muted-foreground mt-1" />
                        ) : (
                          <Monitor className="h-4 w-4 text-muted-foreground mt-1" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium">{activity.action}</div>
                        <div className="text-sm text-muted-foreground">
                          {activity.location} • {activity.device}
                        </div>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {activity.time}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
