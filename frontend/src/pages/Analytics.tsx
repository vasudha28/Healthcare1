import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, AreaChart, Area } from "recharts";
import Navigation from "@/components/Navigation";
import { TrendingUp, Users, Activity, Calendar } from "lucide-react";
import { toast } from "sonner";
import { API_ENDPOINTS } from '../config';

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

const Analytics = () => {
  const [loading, setLoading] = useState(true);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [conditionsData, setConditionsData] = useState<any[]>([]);
  const [medicationsData, setMedicationsData] = useState<any[]>([]);
  const [ageDistributionData, setAgeDistributionData] = useState<any[]>([]);
  const [visitsData, setVisitsData] = useState<any[]>([]);
  const [summaryStats, setSummaryStats] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(API_ENDPOINTS.PATIENTS.BASE);
        const data = await response.json();
        
        if (response.ok) {
          setPatients(data.patients);
          processData(data.patients);
        } else {
          throw new Error(data.detail || 'Failed to fetch analytics data');
        }
      } catch (error) {
        console.error('Error fetching analytics:', error);
        toast.error('Failed to load analytics data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const processData = (patients: Patient[]) => {
    // Process conditions data
    const conditions = patients
      .map(p => p.chronicConditions)
      .filter(Boolean)
      .join(',')
      .split(',')
      .map(c => c.trim())
      .filter(Boolean);

    const conditionCounts = conditions.reduce((acc: {[key: string]: number}, curr) => {
      acc[curr] = (acc[curr] || 0) + 1;
      return acc;
    }, {});

    const conditionsChartData = Object.entries(conditionCounts)
      .map(([name, count]) => ({
        name,
        value: Number(((count / patients.length) * 100).toFixed(1)),
        patients: count
      }))
      .sort((a, b) => b.value - a.value);

    // Process medications data
    const medications = patients
      .flatMap(p => p.prescriptions || [])
      .map(p => p.medication)
      .filter(Boolean);

    const medicationCounts = medications.reduce((acc: {[key: string]: number}, curr) => {
      acc[curr] = (acc[curr] || 0) + 1;
      return acc;
    }, {});

    const medicationsChartData = Object.entries(medicationCounts)
      .map(([name, prescriptions]) => ({
        name,
        prescriptions
      }))
      .sort((a, b) => b.prescriptions - a.prescriptions)
      .slice(0, 6);

    // Process age distribution
    const ageGroups = {
      '0-18': 0,
      '19-30': 0,
      '31-50': 0,
      '51-70': 0,
      '70+': 0
    };

    patients.forEach(patient => {
      if (patient.age <= 18) ageGroups['0-18']++;
      else if (patient.age <= 30) ageGroups['19-30']++;
      else if (patient.age <= 50) ageGroups['31-50']++;
      else if (patient.age <= 70) ageGroups['51-70']++;
      else ageGroups['70+']++;
    });

    const ageDistributionChartData = Object.entries(ageGroups).map(([range, count]) => ({
      range,
      count,
      percentage: ((count / patients.length) * 100).toFixed(1)
    }));

    // Process monthly visits
    const monthlyVisits = patients.reduce((acc: {[key: string]: number}, patient) => {
      const month = new Date(patient.created_at).toLocaleString('default', { month: 'short' });
      acc[month] = (acc[month] || 0) + 1;
      return acc;
    }, {});

    const visitsChartData = Object.entries(monthlyVisits)
      .map(([month, visits]) => ({
        month,
        visits
      }))
      .sort((a, b) => {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return months.indexOf(a.month) - months.indexOf(b.month);
      });

    // Calculate summary stats
    const mostCommonCondition = conditionsChartData[0] || { name: 'None', value: 0 };
    const averageAge = patients.reduce((sum, p) => sum + p.age, 0) / patients.length;
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    const lastMonthPatients = patients.filter(p => new Date(p.created_at) >= lastMonth).length;
    const growthRate = ((lastMonthPatients / patients.length) * 100).toFixed(1);
    const peakMonth = visitsChartData.reduce((max, curr) => 
      curr.visits > max.visits ? curr : max
    , visitsChartData[0]);

    setConditionsData(conditionsChartData);
    setMedicationsData(medicationsChartData);
    setAgeDistributionData(ageDistributionChartData);
    setVisitsData(visitsChartData);
    setSummaryStats([
      {
        title: "Most Common Condition",
        value: mostCommonCondition.name,
        percentage: `${mostCommonCondition.value}%`,
        icon: Activity,
        color: "blue"
      },
      {
        title: "Average Patient Age",
        value: `${averageAge.toFixed(1)} years`,
        change: `Based on ${patients.length} patients`,
        icon: Users,
        color: "green"
      },
      {
        title: "Monthly Growth",
        value: `${growthRate}%`,
        change: "New patient registrations",
        icon: TrendingUp,
        color: "purple"
      },
      {
        title: "Peak Visit Month",
        value: peakMonth?.month || "N/A",
        change: `${peakMonth?.visits || 0} total visits`,
        icon: Calendar,
        color: "orange"
      }
    ]);
  };

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#6B7280'];

  const getColorClasses = (color: string) => {
    const colors = {
      blue: "bg-blue-100 text-blue-600",
      green: "bg-green-100 text-green-600",
      orange: "bg-orange-100 text-orange-600",
      purple: "bg-purple-100 text-purple-600"
    };
    return colors[color as keyof typeof colors];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <Navigation />
        <main className="max-w-7xl mx-auto p-6">
          <div className="flex items-center justify-center h-64">
            <p className="text-gray-600">Loading analytics...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <Navigation />
      
      <main className="max-w-7xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Analytics Dashboard</h1>
          <p className="text-gray-600">Healthcare insights and patient statistics</p>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {summaryStats.map((stat, index) => (
            <Card key={index} className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    {stat.change && (
                      <p className="text-sm text-gray-600 mt-1">{stat.change}</p>
                    )}
                    {stat.percentage && (
                      <p className="text-sm text-green-600 mt-1">{stat.percentage} of all cases</p>
                    )}
                  </div>
                  <div className={`p-3 rounded-full ${getColorClasses(stat.color)}`}>
                    <stat.icon className="h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Medical Conditions Pie Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Activity className="h-5 w-5 text-blue-600" />
                <span>Patient Conditions Distribution</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={conditionsData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {conditionsData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value}%`, 'Percentage']} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Most Prescribed Medications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Activity className="h-5 w-5 text-green-600" />
                <span>Top Prescribed Medications</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={medicationsData} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={80} />
                  <Tooltip formatter={(value) => [value, 'Prescriptions']} />
                  <Bar dataKey="prescriptions" fill="#10B981" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Age Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-purple-600" />
                <span>Patient Age Distribution</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={ageDistributionData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="range" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`${value} patients`, 'Count']} />
                  <Bar dataKey="count" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Monthly Visits Trend */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="h-5 w-5 text-orange-600" />
                <span>Monthly Patient Registrations</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={visitsData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => [value, 'New Patients']} />
                  <Area 
                    type="monotone" 
                    dataKey="visits" 
                    stroke="#F59E0B" 
                    fill="#FEF3C7"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Insights Summary */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Key Insights</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-semibold text-blue-900 mb-2">Condition Trends</h4>
                <p className="text-blue-700 text-sm">
                  {conditionsData[0]?.name || 'No conditions'} is the most common condition, 
                  affecting {conditionsData[0]?.value || 0}% of patients. 
                  Consider implementing prevention programs.
                </p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <h4 className="font-semibold text-green-900 mb-2">Medication Usage</h4>
                <p className="text-green-700 text-sm">
                  {medicationsData[0]?.name || 'No medications'} is the most prescribed medication 
                  with {medicationsData[0]?.prescriptions || 0} prescriptions. 
                  Monitor for potential drug interactions.
                </p>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg">
                <h4 className="font-semibold text-purple-900 mb-2">Patient Demographics</h4>
                <p className="text-purple-700 text-sm">
                  The largest age group is {ageDistributionData[0]?.range || 'N/A'} with 
                  {ageDistributionData[0]?.count || 0} patients. 
                  Consider age-specific care protocols.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Analytics;
