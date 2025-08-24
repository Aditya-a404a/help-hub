"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import { disasterAPI, SocialMediaPost, SocialMediaStats } from "@/lib/disaster-api";
import { useAuth } from "@/lib/hooks/useAuth";
import { MessageSquare, Clock, MapPin, Hash, AtSign, RefreshCw } from "lucide-react";

interface SocialMediaMonitorProps {
  className?: string;
}

export default function SocialMediaMonitor({ className }: SocialMediaMonitorProps) {
  const { isAuthenticated } = useAuth();
  const [posts, setPosts] = useState<SocialMediaPost[]>([]);
  const [stats, setStats] = useState<SocialMediaStats['data'] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'sos' | 'emergency' | 'high'>('all');

  const loadSocialMediaData = async () => {
    if (!isAuthenticated) {
      setPosts([]);
      setStats(null);
      return;
    }

    setIsLoading(true);
    try {
      // Load posts based on selected filter
      let postsResponse;
      switch (selectedFilter) {
        case 'sos':
          postsResponse = await disasterAPI.getSOSMessages(20);
          break;
        case 'emergency':
          postsResponse = await disasterAPI.getSocialMediaPosts('emergency', undefined, 'Chennai', 20);
          break;
        case 'high':
          postsResponse = await disasterAPI.getSocialMediaPosts(undefined, 'high', 'Chennai', 20);
          break;
        default:
          postsResponse = await disasterAPI.getRecentSocialMediaPosts(24, undefined, undefined, 20);
      }

      if (postsResponse.success) {
        setPosts(postsResponse.data);
      }

      // Load stats
      const statsResponse = await disasterAPI.getSocialMediaStats();
      if (statsResponse.success) {
        setStats(statsResponse.data);
      }

      setLastUpdate(new Date());
    } catch (error) {
      console.error('Error loading social media data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSocialMediaData();
  }, [isAuthenticated, selectedFilter]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    if (!isAuthenticated) return;

    const interval = setInterval(loadSocialMediaData, 30000);
    return () => clearInterval(interval);
  }, [isAuthenticated, selectedFilter]);

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'critical': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'high': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'low': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getMessageTypeIcon = (type: string) => {
    switch (type) {
      case 'sos': return <MessageSquare className="w-4 h-4 text-red-600" />;
      case 'emergency': return <MessageSquare className="w-4 h-4 text-orange-600" />;
      case 'update': return <MessageSquare className="w-4 h-4 text-blue-600" />;
      default: return <MessageSquare className="w-4 h-4 text-gray-600" />;
    }
  };

  if (!isAuthenticated) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-blue-600" />
            Social Media Monitor
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground py-4">
            <MessageSquare className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Sign in to view social media alerts</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-blue-600" />
            Social Media Monitor
            {isLoading && <RefreshCw className="w-3 h-3 animate-spin" />}
          </CardTitle>
          <Button
            size="sm"
            variant="ghost"
            className="h-6 w-6 p-0"
            onClick={loadSocialMediaData}
            disabled={isLoading}
          >
            <RefreshCw className="w-3 h-3" />
          </Button>
        </div>
        {lastUpdate && (
          <CardDescription className="text-xs">
            Last updated: {lastUpdate.toLocaleTimeString()}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Stats Overview */}
        {stats && (
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-red-50 dark:bg-red-950/20 p-2 rounded text-center">
              <div className="text-red-600 font-bold">{stats.sos_posts}</div>
              <div className="text-red-600">SOS</div>
            </div>
            <div className="bg-orange-50 dark:bg-orange-950/20 p-2 rounded text-center">
              <div className="text-orange-600 font-bold">{stats.emergency_posts}</div>
              <div className="text-orange-600">Emergency</div>
            </div>
            <div className="bg-blue-50 dark:bg-blue-950/20 p-2 rounded text-center">
              <div className="text-blue-600 font-bold">{stats.posts_last_24h}</div>
              <div className="text-blue-600">24h Posts</div>
            </div>
            <div className="bg-purple-50 dark:bg-purple-950/20 p-2 rounded text-center">
              <div className="text-purple-600 font-bold">{stats.posts_last_hour}</div>
              <div className="text-purple-600">Last Hour</div>
            </div>
          </div>
        )}

        {/* Filter Buttons */}
        <div className="flex gap-1">
          {[
            { key: 'all', label: 'All' },
            { key: 'sos', label: 'SOS' },
            { key: 'emergency', label: 'Emergency' },
            { key: 'high', label: 'High Priority' }
          ].map((filter) => (
            <Button
              key={filter.key}
              size="sm"
              variant={selectedFilter === filter.key ? 'default' : 'outline'}
              className="text-xs h-6 px-2"
              onClick={() => setSelectedFilter(filter.key as 'all' | 'sos' | 'emergency' | 'high')}
            >
              {filter.label}
            </Button>
          ))}
        </div>

        {/* Posts List */}
        <div className="h-64 overflow-y-auto">
          <div className="space-y-2">
            {posts.slice(0, 10).map((post) => (
              <div
                key={post._id}
                className={`p-2 rounded border ${
                  post.message_type === 'sos' ? 'border-red-200 bg-red-50 dark:bg-red-950/20' :
                  post.message_type === 'emergency' ? 'border-orange-200 bg-orange-50 dark:bg-orange-950/20' :
                  'border-muted bg-background'
                }`}
              >
                <div className="flex items-start gap-2 mb-1">
                  {getMessageTypeIcon(post.message_type)}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium line-clamp-2">{post.message}</p>
                  </div>
                  <Badge className={`text-xs ${getUrgencyColor(post.urgency_level)}`}>
                    {post.urgency_level}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    <span>{post.extracted_location}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{new Date(post.timestamp).toLocaleTimeString()}</span>
                  </div>
                </div>
                {(post.hashtags.length > 0 || post.mentions.length > 0) && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {post.hashtags.slice(0, 2).map((tag) => (
                      <span key={tag} className="inline-flex items-center gap-1 text-xs text-blue-600">
                        <Hash className="w-2 h-2" />
                        {tag}
                      </span>
                    ))}
                    {post.mentions.slice(0, 1).map((mention) => (
                      <span key={mention} className="inline-flex items-center gap-1 text-xs text-purple-600">
                        <AtSign className="w-2 h-2" />
                        {mention}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {posts.length === 0 && !isLoading && (
              <div className="text-center text-muted-foreground py-4">
                <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-xs">No posts found</p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}