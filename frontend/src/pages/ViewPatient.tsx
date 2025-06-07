import { useLocation, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Navigation from "@/components/Navigation";
import { Badge } from "@/components/ui/badge";

interface Patient {
  id: string;
  name: string;
  age: number;
  gender: string;
  phone: string;
  email: string;
  dob?: string;
  address?: string;
  chronicConditions?: string;
  allergies?: string;
  notes?: string;
  prescriptions: Array<{
    date: string;
    medication: string;
    dosage: string;
    notes?: string;
  }>;
  appointments: Array<{
    date: string;
    department: string;
    doctor: string;
  }>;
  created_at: string;
}

const ViewPatient = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const patient = location.state?.patient as Patient;

  if (!patient) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <Navigation />
        <main className="max-w-4xl mx-auto p-6">
          <div className="text-center py-12">
            <p className="text-gray-500">Patient not found</p>
            <Button 
              variant="outline" 
              onClick={() => navigate('/patients')}
              className="mt-4"
            >
              Back to Patients
            </Button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <Navigation />
      
      <main className="w-full p-6">
        <div className="flex items-center space-x-4 mb-8">
          <Button 
            variant="outline" 
            onClick={() => navigate(-1)}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back</span>
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">Patient Details</h1>
        </div>

        <div className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Patient ID</p>
                <p className="mt-1">{patient.id}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Name</p>
                <p className="mt-1">{patient.name}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Age</p>
                <p className="mt-1">{patient.age}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Gender</p>
                <p className="mt-1">
                  <Badge variant="outline" className="capitalize">
                    {patient.gender}
                  </Badge>
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Date of Birth</p>
                <p className="mt-1">{patient.dob || "Not specified"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Phone</p>
                <p className="mt-1">{patient.phone}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Email</p>
                <p className="mt-1">{patient.email || "Not specified"}</p>
              </div>
              <div className="md:col-span-2">
                <p className="text-sm font-medium text-gray-500">Address</p>
                <p className="mt-1">{patient.address || "Not specified"}</p>
              </div>
            </CardContent>
          </Card>

          {/* Medical Information */}
          <Card>
            <CardHeader>
              <CardTitle>Medical Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Chronic Conditions</p>
                <p className="mt-1">{patient.chronicConditions || "None"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Allergies</p>
                <p className="mt-1">{patient.allergies || "None"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Notes</p>
                <p className="mt-1">{patient.notes || "No additional notes"}</p>
              </div>
            </CardContent>
          </Card>

          {/* Prescriptions */}
          <Card>
            <CardHeader>
              <CardTitle>Current Prescriptions</CardTitle>
            </CardHeader>
            <CardContent>
              {patient.prescriptions && patient.prescriptions.length > 0 ? (
                <div className="space-y-4">
                  {patient.prescriptions.map((prescription, index) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm font-medium text-gray-500">Date</p>
                          <p className="mt-1">{new Date(prescription.date).toLocaleDateString()}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">Medication</p>
                          <p className="mt-1">{prescription.medication}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">Dosage</p>
                          <p className="mt-1">{prescription.dosage}</p>
                        </div>
                        {prescription.notes && (
                          <div>
                            <p className="text-sm font-medium text-gray-500">Notes</p>
                            <p className="mt-1">{prescription.notes}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No prescriptions found</p>
              )}
            </CardContent>
          </Card>

          {/* Appointments */}
          <Card>
            <CardHeader>
              <CardTitle>Appointments</CardTitle>
            </CardHeader>
            <CardContent>
              {patient.appointments && patient.appointments.length > 0 ? (
                <div className="space-y-4">
                  {patient.appointments.map((appointment, index) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <p className="text-sm font-medium text-gray-500">Date</p>
                          <p className="mt-1">{new Date(appointment.date).toLocaleDateString()}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">Department</p>
                          <p className="mt-1">{appointment.department}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">Doctor</p>
                          <p className="mt-1">{appointment.doctor}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No appointments found</p>
              )}
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-end space-x-4">
            <Button 
              variant="outline" 
              onClick={() => navigate('/patients')}
            >
              Back to List
            </Button>
            <Button 
              onClick={() => navigate('/add-patient', { state: { patient } })}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Edit Patient
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ViewPatient; 