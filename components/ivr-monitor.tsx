"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { disasterAPI, IVRRequest, IVRStats } from "@/lib/disaster-api";
import { useAuth } from "@/lib/hooks/useAuth";
import {
  Phone,
  Clock,
  Users,
  RefreshCw,
  CheckCircle,
  XCircle,
} from "lucide-react";

interface IVRMonitorProps {
  className?: string;
}

export default function IVRMonitor({ className }: IVRMonitorProps) {
  const { isAuthenticated } = useAuth();
  const [requests, setRequests] = useState<IVRRequest[]>([]);
  const [stats, setStats] = useState<IVRStats["data"] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<
    "all" | "urgent" | "pending" | "completed"
  >("all");

  const loadIVRData = async () => {
    setIsLoading(true);
    try {
      // Load requests based on selected filter
      let requestsResponse;
      switch (selectedFilter) {
        case "urgent":
          requestsResponse = await disasterAPI.getUrgentIVRRequests(20);
          if (requestsResponse.success) {
            setRequests(requestsResponse.data);
          }
          break;
        case "pending":
          requestsResponse = await disasterAPI.getIVRRequests(
            "PENDING",
            undefined,
            20
          );
          if (requestsResponse.success) {
            setRequests(requestsResponse.data.requests);
          }
          break;
        case "completed":
          requestsResponse = await disasterAPI.getIVRRequests(
            "COMPLETED",
            undefined,
            20
          );
          if (requestsResponse.success) {
            setRequests(requestsResponse.data.requests);
          }
          break;
        default:
          requestsResponse = await disasterAPI.getIVRRequests(
            undefined,
            undefined,
            20
          );
          if (requestsResponse.success) {
            setRequests(requestsResponse.data.requests);
          }
      }

      // Load stats
      const statsResponse = await disasterAPI.getIVRStats();
      if (statsResponse.success) {
        setStats(statsResponse.data);
      }

      setLastUpdate(new Date());
    } catch (error) {
      console.error("Error loading IVR data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadIVRData();
  }, [selectedFilter]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(loadIVRData, 30000);
    return () => clearInterval(interval);
  }, [selectedFilter]);

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case "CRITICAL":
        return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400";
      case "HIGH":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400";
      case "MEDIUM":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400";
      case "LOW":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400";
      case "IN_PROGRESS":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400";
      case "COMPLETED":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400";
      case "FAILED":
        return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case "FAILED":
        return <XCircle className="w-4 h-4 text-red-600" />;
      case "IN_PROGRESS":
        return <Phone className="w-4 h-4 text-blue-600" />;
      default:
        return <Clock className="w-4 h-4 text-yellow-600" />;
    }
  };

  const handleRetryCall = async (requestId: string) => {
    try {
      await disasterAPI.retryIVRCall(requestId);
      loadIVRData(); // Refresh data
    } catch (error) {
      console.error("Error retrying call:", error);
    }
  };



  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <Phone className="w-4 h-4 text-blue-600" />
            IVR Call Monitor
            {isLoading && <RefreshCw className="w-3 h-3 animate-spin" />}
          </CardTitle>
          <Button
            size="sm"
            variant="ghost"
            className="h-6 w-6 p-0"
            onClick={loadIVRData}
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
            <div className="bg-yellow-50 dark:bg-yellow-950/20 p-2 rounded text-center">
              <div className="text-yellow-600 font-bold">
                {stats.pending_requests}
              </div>
              <div className="text-yellow-600">Pending</div>
            </div>
            <div className="bg-green-50 dark:bg-green-950/20 p-2 rounded text-center">
              <div className="text-green-600 font-bold">
                {stats.completed_requests}
              </div>
              <div className="text-green-600">Completed</div>
            </div>
            <div className="bg-red-50 dark:bg-red-950/20 p-2 rounded text-center">
              <div className="text-red-600 font-bold">
                {stats.critical_urgency_requests}
              </div>
              <div className="text-red-600">Critical</div>
            </div>
            <div className="bg-blue-50 dark:bg-blue-950/20 p-2 rounded text-center">
              <div className="text-blue-600 font-bold">
                {stats.success_rate_percentage.toFixed(1)}%
              </div>
              <div className="text-blue-600">Success Rate</div>
            </div>
          </div>
        )}

        {/* Filter Buttons */}
        <div className="flex gap-1">
          {[
            { key: "all", label: "All" },
            { key: "urgent", label: "Urgent" },
            { key: "pending", label: "Pending" },
            { key: "completed", label: "Completed" },
          ].map((filter) => (
            <Button
              key={filter.key}
              size="sm"
              variant={selectedFilter === filter.key ? "default" : "outline"}
              className="text-xs h-6 px-2"
              onClick={() =>
                setSelectedFilter(
                  filter.key as "all" | "urgent" | "pending" | "completed"
                )
              }
            >
              {filter.label}
            </Button>
          ))}
        </div>

        {/* Requests List */}
        <div className="h-64 overflow-y-auto">
          <div className="space-y-2">
            {requests.slice(0, 10).map((request) => (
              <div
                key={request.id}
                className={`p-2 rounded border ${
                  request.urgency === "CRITICAL"
                    ? "border-red-200 bg-red-50 dark:bg-red-950/20"
                    : request.urgency === "HIGH"
                    ? "border-orange-200 bg-orange-50 dark:bg-orange-950/20"
                    : "border-muted bg-background"
                }`}
              >
                <div className="flex items-start gap-2 mb-1">
                  {getStatusIcon(request.call_status)}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium">{request.victim_name}</p>
                    <p className="text-xs text-muted-foreground line-clamp-1">
                      {request.location}
                    </p>
                  </div>
                  <div className="flex flex-col gap-1">
                    <Badge
                      className={`text-xs ${getUrgencyColor(request.urgency)}`}
                    >
                      {request.urgency}
                    </Badge>
                    <Badge
                      className={`text-xs ${getStatusColor(
                        request.call_status
                      )}`}
                    >
                      {request.call_status}
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                  <div className="flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    <span>{request.family_count} family</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Phone className="w-3 h-3" />
                    <span>{request.call_attempts} attempts</span>
                  </div>
                </div>
                <div className="text-xs text-muted-foreground">
                  {request.victim_address && (
                    <p className="line-clamp-1 mb-1">
                      {request.victim_address}
                    </p>
                  )}
                  <div className="flex items-center justify-between">
                    <span>{new Date(request.created_at).toLocaleString()}</span>
                    {request.call_status === "FAILED" && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-5 px-2 text-xs"
                        onClick={() => handleRetryCall(request.id)}
                      >
                        Retry
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {requests.length === 0 && !isLoading && (
              <div className="text-center text-muted-foreground py-4">
                <Phone className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-xs">No IVR requests found</p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
