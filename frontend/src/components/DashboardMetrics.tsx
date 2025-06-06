import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Calendar, Activity, TrendingUp, UserCog, Users2 } from "lucide-react";
import { toast } from "sonner";

interface Patient {
  id: string;
  name: string;
  age: number;
  gender: string;
  chronicConditions: string;
  created_at: string;
  prescriptions: Array<{
    date: string;
    medication: string;
    dosage: string;
  }>;
}

interface Metrics {
  totalPatients: number;
  todayVisits: number;
  activeCases: number;
  commonDiagnosis: string;
  diagnosisStats: {
    topCondition: string;
    topConditionCount: number;
    totalConditions: number;
    topThree: Array<{
      condition: string;
      count: number;
      percentage: string;
    }>;
  };
  genderDistribution: {
    male: number;
    female: number;
    other: number;
  };
  ageDistribution: {
    under18: number;
    adult: number;
    senior: number;
  };
}

const DashboardMetrics = () => {
  const [metrics, setMetrics] = useState<Metrics>({
    totalPatients: 0,
    todayVisits: 0,
    activeCases: 0,
    commonDiagnosis: "None",
    diagnosisStats: {
      topCondition: "None",
      topConditionCount: 0,
      totalConditions: 0,
      topThree: []
    },
    genderDistribution: { male: 0, female: 0, other: 0 },
    ageDistribution: { under18: 0, adult: 0, senior: 0 }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/patients/');
        const data = await response.json();
        
        if (response.ok) {
          const patients = data.patients;
          
          // Calculate metrics
          const today = new Date().toISOString().split('T')[0];
          const todayVisits = patients.filter((p: Patient) => {
            const patientDate = new Date(p.created_at).toISOString().split('T')[0];
            return patientDate === today;
          }).length;

          // Count active cases (patients with prescriptions in the last 30 days)
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
          const activeCases = patients.filter((p: Patient) =>
            p.prescriptions?.some(pres => new Date(pres.date) > thirtyDaysAgo)
          ).length;

          // Find most common diagnosis
          const conditions = patients
            .map((p: Patient) => p.chronicConditions)
            .filter(Boolean)
            .join(',')
            .split(',')
            .map(c => c.trim())
            .filter(Boolean);

          const conditionCounts = conditions.reduce((acc: {[key: string]: number}, curr) => {
            acc[curr] = (acc[curr] || 0) + 1;
            return acc;
          }, {});

          // Get top 3 conditions
          const topConditions = Object.entries(conditionCounts)
            .sort(([,a]: [string, number], [,b]: [string, number]) => b - a)
            .slice(0, 3);

          const commonDiagnosis = topConditions.length > 0 ? topConditions[0][0] : "None";
          const diagnosisStats = {
            topCondition: commonDiagnosis,
            topConditionCount: topConditions.length > 0 ? Number(topConditions[0][1]) : 0,
            totalConditions: conditions.length,
            topThree: topConditions.map(([condition, count]) => ({
              condition,
              count: Number(count),
              percentage: ((Number(count) / patients.length) * 100).toFixed(1)
            }))
          };

          // Calculate gender distribution
          const genderDistribution = patients.reduce((acc: {[key: string]: number}, p: Patient) => {
            acc[p.gender.toLowerCase()] = (acc[p.gender.toLowerCase()] || 0) + 1;
            return acc;
          }, { male: 0, female: 0, other: 0 });

          // Calculate age distribution
          const ageDistribution = patients.reduce((acc: {[key: string]: number}, p: Patient) => {
            if (p.age < 18) acc.under18++;
            else if (p.age < 60) acc.adult++;
            else acc.senior++;
            return acc;
          }, { under18: 0, adult: 0, senior: 0 });

          setMetrics({
            totalPatients: patients.length,
            todayVisits,
            activeCases,
            commonDiagnosis: diagnosisStats.topCondition,
            diagnosisStats,
            genderDistribution,
            ageDistribution
          });
        } else {
          throw new Error(data.detail || 'Failed to fetch metrics');
        }
      } catch (error) {
        console.error('Error fetching metrics:', error);
        toast.error('Failed to load dashboard metrics');
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, []);

  const getColorClasses = (color: string) => {
    const colors = {
      blue: "bg-blue-100 text-blue-600",
      green: "bg-green-100 text-green-600",
      orange: "bg-orange-100 text-orange-600",
      purple: "bg-purple-100 text-purple-600",
      pink: "bg-pink-100 text-pink-600",
      indigo: "bg-indigo-100 text-indigo-600"
    };
    return colors[color as keyof typeof colors];
  };

  const dashboardMetrics = [
    {
      title: "Total Patients",
      value: metrics.totalPatients.toString(),
      icon: Users,
      change: `${((metrics.genderDistribution.female / metrics.totalPatients) * 100).toFixed(1)}% Female`,
      changeType: "neutral",
      color: "blue"
    },
    {
      title: "New Patients Today",
      value: metrics.todayVisits.toString(),
      icon: Calendar,
      change: `${((metrics.todayVisits / metrics.totalPatients) * 100).toFixed(1)}% of total`,
      changeType: "positive",
      color: "green"
    },
    {
      title: "Active Cases",
      value: metrics.activeCases.toString(),
      icon: Activity,
      change: `${((metrics.activeCases / metrics.totalPatients) * 100).toFixed(1)}% of total`,
      changeType: "neutral",
      color: "orange"
    },
    {
      title: "Common Diagnosis",
      value: metrics.commonDiagnosis,
      icon: TrendingUp,
      change: (
        <div className="space-y-1">
          <div className="flex justify-between">
            <span>Top Condition:</span>
            <span className="font-medium">{metrics.diagnosisStats.topCondition}</span>
          </div>
          <div className="flex justify-between">
            <span>Patients with condition:</span>
            <span className="font-medium">{metrics.diagnosisStats.topConditionCount}</span>
          </div>
          <div className="flex justify-between">
            <span>Percentage:</span>
            <span className="font-medium">
              {((metrics.diagnosisStats.topConditionCount / metrics.totalPatients) * 100).toFixed(1)}%
            </span>
          </div>
          {metrics.diagnosisStats.topThree.length > 1 && (
            <div className="mt-2 pt-2 border-t border-gray-200">
              <div className="text-xs text-gray-500 mb-1">Other Common Conditions:</div>
              {metrics.diagnosisStats.topThree.slice(1).map(({ condition, count, percentage }) => (
                <div key={condition} className="flex justify-between text-sm">
                  <span>{condition}:</span>
                  <span>{count} ({percentage}%)</span>
                </div>
              ))}
            </div>
          )}
        </div>
      ),
      changeType: "neutral",
      color: "purple"
    },
    {
      title: "Age Distribution",
      value: "Patient Groups",
      icon: Users2,
      change: (
        <div className="space-y-1">
          <div className="flex justify-between">
            <span>Under 18:</span>
            <span className="font-medium">{metrics.ageDistribution.under18}</span>
          </div>
          <div className="flex justify-between">
            <span>Adults (18-59):</span>
            <span className="font-medium">{metrics.ageDistribution.adult}</span>
          </div>
          <div className="flex justify-between">
            <span>Seniors (60+):</span>
            <span className="font-medium">{metrics.ageDistribution.senior}</span>
          </div>
        </div>
      ),
      changeType: "neutral",
      color: "pink"
    },
    {
      title: "Gender Distribution",
      value: "Patient Demographics",
      icon: UserCog,
      change: (
        <div className="space-y-1">
          <div className="flex justify-between">
            <span>Male:</span>
            <span className="font-medium">{metrics.genderDistribution.male}</span>
          </div>
          <div className="flex justify-between">
            <span>Female:</span>
            <span className="font-medium">{metrics.genderDistribution.female}</span>
          </div>
          <div className="flex justify-between">
            <span>Other:</span>
            <span className="font-medium">{metrics.genderDistribution.other}</span>
          </div>
        </div>
      ),
      changeType: "neutral",
      color: "indigo"
    }
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {[...Array(6)].map((_, index) => (
          <Card key={index} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-24 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
      {dashboardMetrics.map((metric, index) => (
        <Card key={index} className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">{metric.title}</p>
                <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
                {typeof metric.change === 'string' ? (
                  <p className={`text-sm mt-1 ${
                    metric.changeType === 'positive' ? 'text-green-600' : 
                    metric.changeType === 'negative' ? 'text-red-600' : 'text-gray-600'
                  }`}>
                    {metric.changeType !== 'neutral' && (metric.changeType === 'positive' ? '↗' : '↘')} {metric.change}
                  </p>
                ) : (
                  <div className="mt-2 text-sm text-gray-600">
                    {metric.change}
                  </div>
                )}
              </div>
              <div className={`p-3 rounded-full ${getColorClasses(metric.color)}`}>
                <metric.icon className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default DashboardMetrics;
