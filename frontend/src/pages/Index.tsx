
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, UserPlus, Calendar, Activity, TrendingUp, Heart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import DashboardMetrics from "@/components/DashboardMetrics";
import RecentPatients from "@/components/RecentPatients";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <Navigation />
      
      <main className="max-w-7xl mx-auto p-6">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome to CareTrack
          </h1>
          <p className="text-gray-600">
            Healthcare Patient Management System - Dashboard Overview
          </p>
        </div>

        {/* Dashboard Metrics */}
        <DashboardMetrics />

        {/* Action Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer border-l-4 border-l-blue-500"
                onClick={() => navigate('/add-patient')}>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="bg-blue-100 p-3 rounded-full">
                  <UserPlus className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Add New Patient</h3>
                  <p className="text-sm text-gray-600">Register a new patient</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer border-l-4 border-l-green-500"
                onClick={() => navigate('/patients')}>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="bg-green-100 p-3 rounded-full">
                  <Users className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">View Patients</h3>
                  <p className="text-sm text-gray-600">Search and manage patients</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer border-l-4 border-l-purple-500"
                onClick={() => navigate('/analytics')}>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="bg-purple-100 p-3 rounded-full">
                  <TrendingUp className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Analytics</h3>
                  <p className="text-sm text-gray-600">View insights and reports</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Patients */}
        <RecentPatients />
      </main>
    </div>
  );
};

export default Index;
