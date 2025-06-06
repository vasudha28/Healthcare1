import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Heart, Lock, User, Mail } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Login = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isRegistering, setIsRegistering] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    role: ""
  });
  const [isLoading, setIsLoading] = useState(false);

  const roles = [
    { value: "doctor", label: "Doctor" },
    { value: "nurse", label: "Nurse" },
    { value: "receptionist", label: "Receptionist" },
    { value: "admin", label: "Admin" }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password || !formData.role) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    
    try {
      if (isRegistering) {
        // Registration
        if (!formData.username) {
          toast({
            title: "Error",
            description: "Username is required for registration",
            variant: "destructive"
          });
          return;
        }

        const response = await fetch('http://localhost:8000/api/auth/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            username: formData.username,
            email: formData.email,
            password: formData.password
          }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.detail || 'Registration failed');
        }

        toast({
          title: "Success",
          description: "Registration successful! Please login."
        });
        setIsRegistering(false);
      } else {
        // Login
        const response = await fetch('http://localhost:8000/api/auth/token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            username: formData.email,
            password: formData.password,
          }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.detail || 'Login failed');
        }

        const data = await response.json();
        localStorage.setItem('token', data.access_token);
        localStorage.setItem('user', JSON.stringify({
          email: formData.email,
          role: formData.role,
          isAuthenticated: true
        }));
        
        toast({
          title: "Success",
          description: `Welcome back, ${formData.role}!`
        });
        
        navigate('/');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || 'An error occurred',
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="bg-blue-600 p-3 rounded-xl">
              <Heart className="h-8 w-8 text-white" />
            </div>
            <span className="text-3xl font-bold text-gray-900">CareTrack</span>
          </div>
          <p className="text-gray-600">Healthcare Patient Management System</p>
        </div>

        {/* Login/Register Card */}
        <Card className="shadow-2xl border-0">
          <CardHeader className="space-y-1 pb-6">
            <CardTitle className="text-2xl font-bold text-center text-gray-900">
              {isRegistering ? "Create Account" : "Staff Login"}
            </CardTitle>
            <p className="text-center text-gray-600">
              {isRegistering ? "Register for a new account" : "Access your healthcare dashboard"}
            </p>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Username (only for registration) */}
              {isRegistering && (
                <div className="space-y-2">
                  <Label htmlFor="username" className="text-sm font-medium text-gray-700">
                    Username
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="username"
                      type="text"
                      placeholder="Choose a username"
                      value={formData.username}
                      onChange={(e) => handleInputChange('username', e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
              )}

              {/* Role Selection */}
              <div className="space-y-2">
                <Label htmlFor="role" className="text-sm font-medium text-gray-700">
                  Select Role
                </Label>
                <Select onValueChange={(value) => handleInputChange('role', value)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Choose your role" />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map((role) => (
                      <SelectItem key={role.value} value={role.value}>
                        {role.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                  Username or Email
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    name="email"
                    type="text"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>{isRegistering ? "Registering..." : "Signing in..."}</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4" />
                    <span>{isRegistering ? "Register" : "Sign In"}</span>
                  </div>
                )}
              </Button>

              {/* Toggle Register/Login */}
              <div className="text-center pt-4">
                <Button
                  type="button"
                  variant="link"
                  className="text-blue-600 hover:text-blue-700"
                  onClick={() => setIsRegistering(!isRegistering)}
                >
                  {isRegistering ? "Already have an account? Sign in" : "Don't have an account? Register"}
                </Button>
              </div>

              {/* Forgot Password (only show on login) */}
              {!isRegistering && (
                <div className="text-center">
                  <Button
                    type="button"
                    variant="link"
                    className="text-blue-600 hover:text-blue-700"
                    onClick={() => {
                      toast({
                        title: "Password Reset",
                        description: "Password reset functionality will be implemented with backend integration."
                      });
                    }}
                  >
                    Forgot your password?
                  </Button>
                </div>
              )}
            </form>
          </CardContent>
        </Card>

        {/* Demo Credentials */}
        <Card className="mt-6 bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <h3 className="font-semibold text-blue-800 mb-2">Demo Credentials</h3>
            <div className="text-sm text-blue-700 space-y-1">
              <p><strong>Email:</strong> any@email.com</p>
              <p><strong>Password:</strong> any password</p>
              <p><strong>Role:</strong> Select any role</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;
