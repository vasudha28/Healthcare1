import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Search, Eye, Edit, Trash2, UserPlus, Filter, Plus, MoreHorizontal } from "lucide-react";
import Navigation from "@/components/Navigation";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";

interface Patient {
  id: string;
  name: string;
  age: number;
  gender: string;
  phone: string;
  email: string;
  chronicConditions: string;
  dob?: string;
  address?: string;
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

const Patients = () => {
  const navigate = useNavigate();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [genderFilter, setGenderFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const patientsPerPage = 10;

  // Fetch patients from the backend
  const fetchPatients = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `http://localhost:8000/api/patients/?page=${currentPage}&search=${searchTerm}&gender=${genderFilter}`
      );
      const data = await response.json();
      if (response.ok) {
        setPatients(data.patients);
        setFilteredPatients(data.patients);
        setTotalPages(data.total_pages);
      } else {
        throw new Error(data.detail || 'Failed to fetch patients');
      }
    } catch (error) {
      console.error('Error fetching patients:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch patients');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, [currentPage, searchTerm, genderFilter]);

  const handleDeletePatient = async (patientId: string) => {
    if (window.confirm("Are you sure you want to delete this patient?")) {
      try {
        console.log('Attempting to delete patient with ID:', patientId);
        
        const response = await fetch(`http://localhost:8000/api/patients/${patientId}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.detail || 'Failed to delete patient');
        }

        // Remove the deleted patient from the state
        setPatients(patients.filter(patient => patient.id !== patientId));
        setFilteredPatients(filteredPatients.filter(patient => patient.id !== patientId));
        toast.success("Patient deleted successfully");
      } catch (error) {
        console.error('Error deleting patient:', error);
        toast.error(error instanceof Error ? error.message : 'Failed to delete patient');
      }
    }
  };

  const handleViewPatient = (patient: Patient) => {
    navigate('/view-patient', { state: { patient } });
  };

  const handleEditPatient = (patient: Patient) => {
    navigate('/add-patient', { state: { patient, isEditing: true } });
  };

  // Add useEffect to refresh data when returning from edit
  useEffect(() => {
    const handleBeforeUnload = () => {
      fetchPatients();
    };

    window.addEventListener('popstate', handleBeforeUnload);
    return () => {
      window.removeEventListener('popstate', handleBeforeUnload);
    };
  }, [currentPage, searchTerm]);

  // Pagination
  const indexOfLastPatient = currentPage * patientsPerPage;
  const indexOfFirstPatient = indexOfLastPatient - patientsPerPage;
  const currentPatients = filteredPatients.slice(indexOfFirstPatient, indexOfLastPatient);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchPatients();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <Navigation />
        <main className="max-w-7xl mx-auto p-6">
          <div className="flex items-center justify-center h-64">
            <p className="text-gray-600">Loading patients...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <Navigation />
      
      <main className="max-w-7xl mx-auto p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Patients</h1>
            <p className="text-gray-600">Manage and search patient records</p>
          </div>
          <Button 
            onClick={() => navigate('/add-patient')}
            className="mt-4 md:mt-0 bg-blue-600 hover:bg-blue-700 flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Add New Patient</span>
          </Button>
        </div>

        {/* Search and Filters */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search by name, ID, or condition..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Filter className="h-4 w-4 text-gray-400" />
                <Select value={genderFilter} onValueChange={setGenderFilter}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Genders</SelectItem>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results Summary */}
        <div className="mb-4">
          <p className="text-gray-600">
            Showing {currentPatients.length} of {filteredPatients.length} patients
          </p>
        </div>

        {/* Patients Table */}
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Age</TableHead>
                    <TableHead>Gender</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Conditions</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    // Loading skeleton
                    Array.from({ length: 5 }).map((_, index) => (
                      <TableRow key={index}>
                        <TableCell><Skeleton className="h-4 w-[200px]" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-[50px]" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-[80px]" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-[120px]" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-[180px]" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-[80px]" /></TableCell>
                      </TableRow>
                    ))
                  ) : currentPatients.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                        No patients found
                      </TableCell>
                    </TableRow>
                  ) : (
                    currentPatients.map((patient) => (
                      <TableRow 
                        key={patient.id}
                        className="hover:bg-gray-50"
                      >
                        <TableCell className="font-medium">{patient.name}</TableCell>
                        <TableCell>{patient.age}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">
                            {patient.gender}
                          </Badge>
                        </TableCell>
                        <TableCell>{patient.phone}</TableCell>
                        <TableCell>
                          {patient.chronicConditions || "None"}
                        </TableCell>
                        <TableCell>
                          {new Date(patient.created_at).toLocaleDateString('en-IN', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric'
                          })}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleViewPatient(patient)}
                              className="h-8 w-8 text-blue-600 hover:text-blue-700"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEditPatient(patient)}
                              className="h-8 w-8 text-yellow-600 hover:text-yellow-700"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeletePatient(patient.id)}
                              className="h-8 w-8 text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {currentPatients.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500">No patients found matching your criteria.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="flex justify-center items-center space-x-2 mt-6">
            <Button
              variant="outline"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <span className="text-sm text-gray-600">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        )}
      </main>
    </div>
  );
};

export default Patients;
