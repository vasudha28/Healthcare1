import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Eye, Edit } from "lucide-react";
import { toast } from "sonner";

interface Patient {
  id: string;
  name: string;
  age: number;
  gender: string;
  chronicConditions: string;
  created_at: string;
}

const RecentPatients = () => {
  const navigate = useNavigate();
  const [recentPatients, setRecentPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecentPatients = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/patients/?limit=5');
        const data = await response.json();
        
        if (response.ok) {
          setRecentPatients(data.patients);
        } else {
          throw new Error(data.detail || 'Failed to fetch recent patients');
        }
      } catch (error) {
        console.error('Error fetching recent patients:', error);
        toast.error('Failed to load recent patients');
      } finally {
        setLoading(false);
      }
    };

    fetchRecentPatients();
  }, []);

  const handleViewPatient = (patient: Patient) => {
    navigate('/view-patient', { state: { patient } });
  };

  const handleEditPatient = (patient: Patient) => {
    navigate('/add-patient', { state: { patient, isEditing: true } });
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-xl font-semibold">Recent Patients</CardTitle>
        <Button 
          variant="outline" 
          onClick={() => navigate('/patients')}
          className="text-blue-600 border-blue-600 hover:bg-blue-50"
        >
          View All
        </Button>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-600">Patient ID</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Name</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Age</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Gender</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Last Visit</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Condition</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-4 text-center text-gray-500">
                    Loading recent patients...
                  </td>
                </tr>
              ) : recentPatients.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-4 text-center text-gray-500">
                    No recent patients found
                  </td>
                </tr>
              ) : (
                recentPatients.map((patient) => (
                  <tr key={patient.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4 font-medium text-blue-600">{patient.id}</td>
                    <td className="py-3 px-4 font-medium text-gray-900">{patient.name}</td>
                    <td className="py-3 px-4 text-gray-600">{patient.age}</td>
                    <td className="py-3 px-4 text-gray-600 capitalize">{patient.gender}</td>
                    <td className="py-3 px-4 text-gray-600">
                      {new Date(patient.created_at).toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric'
                      })}
                    </td>
                    <td className="py-3 px-4 text-gray-600">{patient.chronicConditions || "None"}</td>
                    <td className="py-3 px-4">
                      <div className="flex space-x-2">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="h-8 w-8 p-0"
                          onClick={() => handleViewPatient(patient)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="h-8 w-8 p-0"
                          onClick={() => handleEditPatient(patient)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};

export default RecentPatients;
