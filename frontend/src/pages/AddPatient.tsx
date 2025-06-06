import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Save, ArrowLeft } from "lucide-react";
import Navigation from "@/components/Navigation";
import { toast } from "sonner";

const AddPatient = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isEditing = location.state?.isEditing;
  const existingPatient = location.state?.patient;

  const [formData, setFormData] = useState({
    name: "",
    age: "",
    gender: "",
    dob: "",
    phone: "",
    email: "",
    address: "",
    chronicConditions: "",
    allergies: "",
    notes: ""
  });

  const [prescriptions, setPrescriptions] = useState([
    { date: "", medication: "", dosage: "", notes: "" }
  ]);

  const [appointments, setAppointments] = useState([
    { date: "", department: "", doctor: "" }
  ]);

  useEffect(() => {
    if (isEditing && existingPatient) {
      setFormData({
        name: existingPatient.name || "",
        age: existingPatient.age?.toString() || "",
        gender: existingPatient.gender || "",
        dob: existingPatient.dob || "",
        phone: existingPatient.phone || "",
        email: existingPatient.email || "",
        address: existingPatient.address || "",
        chronicConditions: existingPatient.chronicConditions || "",
        allergies: existingPatient.allergies || "",
        notes: existingPatient.notes || ""
      });

      if (existingPatient.prescriptions?.length > 0) {
        setPrescriptions(existingPatient.prescriptions);
      }

      if (existingPatient.appointments?.length > 0) {
        setAppointments(existingPatient.appointments);
      }
    }
  }, [isEditing, existingPatient]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleGenderChange = (value: string) => {
    setFormData({
      ...formData,
      gender: value
    });
  };

  const addPrescription = () => {
    setPrescriptions([...prescriptions, { date: "", medication: "", dosage: "", notes: "" }]);
  };

  const addAppointment = () => {
    setAppointments([...appointments, { date: "", department: "", doctor: "" }]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.name || !formData.age || !formData.gender || !formData.phone) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      const patientData = {
        ...formData,
        age: parseInt(formData.age),
        prescriptions: prescriptions.filter(p => p.medication),
        appointments: appointments.filter(a => a.date)
      };

      let url = 'http://localhost:8000/api/patients/';
      let method = 'POST';

      if (isEditing && existingPatient?.id) {
        url = `http://localhost:8000/api/patients/${existingPatient.id}/`;
        method = 'PUT';
      }

      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(patientData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || `Failed to ${isEditing ? 'update' : 'add'} patient`);
      }

      toast.success(`Patient ${isEditing ? 'updated' : 'added'} successfully`);
      navigate('/patients');
    } catch (error) {
      console.error(`Error ${isEditing ? 'updating' : 'adding'} patient:`, error);
      toast.error(error instanceof Error ? error.message : `Failed to ${isEditing ? 'update' : 'add'} patient. Please try again.`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <Navigation />
      
      <main className="max-w-4xl mx-auto p-6">
        <div className="flex items-center space-x-4 mb-8">
          <Button 
            variant="outline" 
            onClick={() => navigate(-1)}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back</span>
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">
            {isEditing ? 'Edit Patient' : 'Add New Patient'}
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <span>Basic Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="mt-1"
                  placeholder="Enter patient's full name"
                />
              </div>
              
              <div>
                <Label htmlFor="age">Age *</Label>
                <Input
                  id="age"
                  name="age"
                  type="number"
                  value={formData.age}
                  onChange={handleInputChange}
                  required
                  className="mt-1"
                  placeholder="Enter age"
                />
              </div>

              <div>
                <Label htmlFor="gender">Gender *</Label>
                <Select 
                  value={formData.gender} 
                  onValueChange={handleGenderChange}
                  required
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="dob">Date of Birth</Label>
                <Input
                  id="dob"
                  name="dob"
                  type="date"
                  value={formData.dob}
                  onChange={handleInputChange}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                  className="mt-1"
                  placeholder="(555) 123-4567"
                />
              </div>

              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="mt-1"
                  placeholder="patient@email.com"
                />
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="address">Address</Label>
                <Textarea
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  className="mt-1"
                  placeholder="Enter full address"
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>

          {/* Medical History */}
          <Card>
            <CardHeader>
              <CardTitle>Medical History</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="chronicConditions">Chronic Conditions</Label>
                <Textarea
                  id="chronicConditions"
                  name="chronicConditions"
                  value={formData.chronicConditions}
                  onChange={handleInputChange}
                  className="mt-1"
                  placeholder="List any chronic conditions (diabetes, hypertension, etc.)"
                  rows={2}
                />
              </div>

              <div>
                <Label htmlFor="allergies">Allergies</Label>
                <Textarea
                  id="allergies"
                  name="allergies"
                  value={formData.allergies}
                  onChange={handleInputChange}
                  className="mt-1"
                  placeholder="List any known allergies"
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>

          {/* Prescriptions */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Current Prescriptions</CardTitle>
              <Button 
                type="button" 
                variant="outline" 
                size="sm"
                onClick={addPrescription}
                className="flex items-center space-x-2"
              >
                <Plus className="h-4 w-4" />
                <span>Add Prescription</span>
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {prescriptions.map((prescription, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 border rounded-lg">
                  <div>
                    <Label>Date</Label>
                    <Input
                      type="date"
                      value={prescription.date}
                      onChange={(e) => {
                        const newPrescriptions = [...prescriptions];
                        newPrescriptions[index].date = e.target.value;
                        setPrescriptions(newPrescriptions);
                      }}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>Medication</Label>
                    <Input
                      value={prescription.medication}
                      onChange={(e) => {
                        const newPrescriptions = [...prescriptions];
                        newPrescriptions[index].medication = e.target.value;
                        setPrescriptions(newPrescriptions);
                      }}
                      className="mt-1"
                      placeholder="Medication name"
                    />
                  </div>
                  <div>
                    <Label>Dosage</Label>
                    <Input
                      value={prescription.dosage}
                      onChange={(e) => {
                        const newPrescriptions = [...prescriptions];
                        newPrescriptions[index].dosage = e.target.value;
                        setPrescriptions(newPrescriptions);
                      }}
                      className="mt-1"
                      placeholder="e.g., 10mg twice daily"
                    />
                  </div>
                  <div>
                    <Label>Notes</Label>
                    <Input
                      value={prescription.notes}
                      onChange={(e) => {
                        const newPrescriptions = [...prescriptions];
                        newPrescriptions[index].notes = e.target.value;
                        setPrescriptions(newPrescriptions);
                      }}
                      className="mt-1"
                      placeholder="Additional notes"
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Doctor Notes */}
          <Card>
            <CardHeader>
              <CardTitle>Doctor Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  className="mt-1"
                  placeholder="Enter any additional notes or observations"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => navigate('/patients')}
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700"
            >
              <Save className="h-4 w-4" />
              <span>{isEditing ? 'Update Patient' : 'Save Patient'}</span>
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
};

export default AddPatient;
