import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getSyncStatus, syncPendingFeedback, cleanupOldData } from "@/lib/offline-storage";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Link } from "react-router-dom";
import { ArrowLeft, RefreshCw, Trash2, Users, MessageSquare, TrendingUp } from "lucide-react";

interface FeedbackData {
  id: string;
  rating: number;
  name: string;
  email: string;
  phone: string;
  profession: string;
  comment: string;
  timestamp: string;
  deviceId: string;
  synced: boolean;
  attempts: number;
}

const Dashboard = () => {
  const [feedbackData, setFeedbackData] = useState<FeedbackData[]>([]);
  const [syncStatus, setSyncStatus] = useState<any>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    try {
      // Get all feedback from IndexedDB
      const db = await new Promise<IDBDatabase>((resolve, reject) => {
        const request = indexedDB.open("FeedbackKioskDB", 1);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });

      const transaction = db.transaction(["pendingFeedback"], "readonly");
      const store = transaction.objectStore("pendingFeedback");
      
      const allFeedback = await new Promise<FeedbackData[]>((resolve, reject) => {
        const request = store.getAll();
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });

      setFeedbackData(allFeedback.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
      
      // Get sync status
      const status = await getSyncStatus();
      setSyncStatus(status);
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      await syncPendingFeedback();
      await loadData();
    } catch (error) {
      console.error("Error syncing data:", error);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleCleanup = async () => {
    try {
      await cleanupOldData(7);
      await loadData();
    } catch (error) {
      console.error("Error cleaning up data:", error);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Prepare chart data
  const ratingCounts = feedbackData.reduce((acc, feedback) => {
    const emoji = ["😡", "😞", "😐", "😊", "😍"][feedback.rating - 1];
    acc[emoji] = (acc[emoji] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const chartData = Object.entries(ratingCounts).map(([emoji, count]) => ({
    emoji,
    count,
    rating: ["😡", "😞", "😐", "😊", "😍"].indexOf(emoji) + 1
  }));

  const pieData = chartData.map((item) => ({
    name: item.emoji,
    value: item.count,
    fill: `hsl(var(--chart-${item.rating}))`
  }));

  const averageRating = feedbackData.length > 0 
    ? (feedbackData.reduce((sum, f) => sum + f.rating, 0) / feedbackData.length).toFixed(1)
    : "0";

  const dailyStats = feedbackData.reduce((acc, feedback) => {
    const date = new Date(feedback.timestamp).toLocaleDateString();
    acc[date] = (acc[date] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const dailyChartData = Object.entries(dailyStats).map(([date, count]) => ({
    date,
    count
  })).slice(-7); // Last 7 days

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5">
      <div className="h-screen overflow-y-auto">
        <div className="max-w-7xl mx-auto space-y-6 p-4 pb-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Kiosk
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold">Feedback Dashboard</h1>
              <p className="text-muted-foreground">
                {feedbackData.length} total responses • {syncStatus.total || 0} pending sync
              </p>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleCleanup}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Cleanup Old Data
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleSync} 
              disabled={isSyncing}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
              {isSyncing ? 'Syncing...' : 'Sync Now'}
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Responses</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{feedbackData.length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{averageRating}/5</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Sync</CardTitle>
              <RefreshCw className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{syncStatus.total || 0}</div>
              <Badge variant={syncStatus.online ? "default" : "destructive"} className="mt-1">
                {syncStatus.online ? "Online" : "Offline"}
              </Badge>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">With Comments</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {feedbackData.filter(f => f.comment?.trim()).length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts and Data */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="responses">Recent Responses</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Rating Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle>Rating Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                   <ChartContainer
                    config={{
                      count: {
                        label: "Responses",
                        color: "hsl(var(--chart-1))",
                      },
                    }}
                    className="h-[350px] w-full"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="emoji" />
                        <YAxis />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Bar dataKey="count" fill="var(--color-count)" />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>

              {/* Daily Responses */}
              <Card>
                <CardHeader>
                  <CardTitle>Daily Responses (Last 7 Days)</CardTitle>
                </CardHeader>
                <CardContent>
                  <ChartContainer
                    config={{
                      count: {
                        label: "Responses",
                        color: "hsl(var(--chart-2))",
                      },
                    }}
                    className="h-[350px] w-full"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={dailyChartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Bar dataKey="count" fill="var(--color-count)" />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="responses" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Recent Feedback Responses</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {feedbackData.slice(0, 20).map((feedback) => (
                    <div key={feedback.id} className="border rounded-lg p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">
                            {["😡", "😞", "😐", "😊", "😍"][feedback.rating - 1]}
                          </span>
                          <div>
                            <p className="font-semibold">{feedback.name || "Anonymous"}</p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(feedback.timestamp).toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Badge variant={feedback.synced ? "default" : "secondary"}>
                            {feedback.synced ? "Synced" : "Pending"}
                          </Badge>
                          {feedback.attempts > 0 && (
                            <Badge variant="outline">
                              {feedback.attempts} attempts
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      {feedback.profession && (
                        <p className="text-sm text-muted-foreground">
                          {feedback.profession}
                        </p>
                      )}
                      
                      {feedback.comment && (
                        <p className="text-sm bg-muted p-2 rounded">
                          "{feedback.comment}"
                        </p>
                      )}
                      
                      {(feedback.email || feedback.phone) && (
                        <div className="text-xs text-muted-foreground">
                          {feedback.email && <span>Email: {feedback.email}</span>}
                          {feedback.email && feedback.phone && <span> • </span>}
                          {feedback.phone && <span>Phone: {feedback.phone}</span>}
                        </div>
                      )}
                    </div>
                  ))}
                  
                  {feedbackData.length === 0 && (
                    <p className="text-center text-muted-foreground py-8">
                      No feedback responses yet.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Rating Pie Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Rating Distribution (Pie)</CardTitle>
                </CardHeader>
                <CardContent>
                  <ChartContainer
                    config={{}}
                    className="h-[300px]"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>

              {/* Sync Status */}
              <Card>
                <CardHeader>
                  <CardTitle>Sync Status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Total Pending:</span>
                      <Badge variant="secondary">{syncStatus.total || 0}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Failed (Max Attempts):</span>
                      <Badge variant="destructive">{syncStatus.failed || 0}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Retrying:</span>
                      <Badge variant="outline">{syncStatus.retrying || 0}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Network Status:</span>
                      <Badge variant={syncStatus.online ? "default" : "destructive"}>
                        {syncStatus.online ? "Online" : "Offline"}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="pt-4 space-y-2">
                    <h4 className="font-semibold">Profession Breakdown</h4>
                    {Object.entries(
                      feedbackData
                        .filter(f => f.profession)
                        .reduce((acc, f) => {
                          acc[f.profession] = (acc[f.profession] || 0) + 1;
                          return acc;
                        }, {} as Record<string, number>)
                    ).map(([profession, count]) => (
                      <div key={profession} className="flex justify-between text-sm">
                        <span>{profession}:</span>
                        <span>{count}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;