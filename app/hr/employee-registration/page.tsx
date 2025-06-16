"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { Users, UserPlus, Calendar, GraduationCap, TrendingUp, DollarSign, Upload } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { registerEmployee } from "./employeeRegistrationBackend"

const navigation = [
  { name: "Dashboard", href: "/hr/dashboard", icon: Users },
  { name: "Employee Management", href: "/hr/employee-management", icon: Users },
  { name: "Employee Registration", href: "/hr/employee-registration", icon: UserPlus },
  { name: "Leave Arrangement", href: "/hr/leave-arrangement", icon: Calendar },
  { name: "Training Arrangement", href: "/hr/training-arrangement", icon: GraduationCap },
  { name: "KPI Generation", href: "/hr/kpi-generation", icon: TrendingUp },
  { name: "Add Salary", href: "/hr/add-salary", icon: DollarSign },
]

export default function EmployeeRegistrationPage() {
  const { toast } = useToast()
  const [formStep, setFormStep] = useState(0)
  const [formData, setFormData] = useState({
    // Personal Information
    firstName: '',
    lastName: '',
    dob: '',
    gender: '',
    email: '',
    phone: '',
    address: '',
    photo: null as File | null,

    // Employment Information
    employeeId: '',
    joiningDate: '',
    department: '',
    position: '',
    employmentType: '',
    reportingManager: '',
    workLocation: '',

    // Financial Information
    basicSalary: '',
    bankName: '',
    accountNumber: '',
    epfNumber: '',

    // Documents
    resume: null as File | null,
    idProof: null as File | null,
    addressProof: null as File | null,
    otherDocuments: [] as File[],
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target
    setFormData(prev => ({ ...prev, [id]: value }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
    if (e.target.files) {
      if (field === 'otherDocuments') {
        setFormData(prev => ({
          ...prev,
          [field]: Array.from(e.target.files as FileList)
        }))
      } else {
        setFormData(prev => ({
          ...prev,
          [field]: e.target.files?.[0] || null
        }))
      }
    }
  }

  const handleSelectChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const nextStep = () => {
    setFormStep((prev) => prev + 1)
  }

  const prevStep = () => {
    setFormStep((prev) => prev - 1)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      await registerEmployee(formData)

      toast({
        title: "Employee registered successfully",
        description: "The new employee has been added to the system.",
        variant: "default",
      })

      // Reset form
      setFormStep(0)
      setFormData({
        firstName: '',
        lastName: '',
        dob: '',
        gender: '',
        email: '',
        phone: '',
        address: '',
        photo: null,
        employeeId: '',
        joiningDate: '',
        department: '',
        position: '',
        employmentType: '',
        reportingManager: '',
        workLocation: '',
        basicSalary: '',
        bankName: '',
        accountNumber: '',
        epfNumber: '',
        resume: null,
        idProof: null,
        addressProof: null,
        otherDocuments: [],
      })
    } catch (error) {
      toast({
        title: "Registration failed",
        description: error instanceof Error ? error.message : "An error occurred during registration",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
      <DashboardLayout navigation={navigation} userRole="hr" userName="Michael Chen">
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Employee Registration</h1>
            <p className="text-gray-600">Register a new employee in the system.</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Registration Form</CardTitle>
              <CardDescription>Please fill out all the required information</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit}>
                {formStep === 0 && (
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <h3 className="text-lg font-medium">Personal Information</h3>
                        <Separator />
                      </div>

                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="firstName">First Name*</Label>
                          <Input
                              id="firstName"
                              required
                              value={formData.firstName}
                              onChange={handleInputChange}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="lastName">Last Name*</Label>
                          <Input
                              id="lastName"
                              required
                              value={formData.lastName}
                              onChange={handleInputChange}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="dob">Date of Birth*</Label>
                          <Input
                              id="dob"
                              type="date"
                              required
                              value={formData.dob}
                              onChange={handleInputChange}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="gender">Gender*</Label>
                          <Select
                              required
                              value={formData.gender}
                              onValueChange={(value) => handleSelectChange('gender', value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select gender" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="male">Male</SelectItem>
                              <SelectItem value="female">Female</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                              <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="email">Email Address*</Label>
                          <Input
                              id="email"
                              type="email"
                              required
                              value={formData.email}
                              onChange={handleInputChange}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="phone">Phone Number*</Label>
                          <Input
                              id="phone"
                              type="tel"
                              required
                              value={formData.phone}
                              onChange={handleInputChange}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="address">Address*</Label>
                        <Textarea
                            id="address"
                            required
                            value={formData.address}
                            onChange={handleInputChange}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="photo">Profile Photo</Label>
                        <div className="flex items-center space-x-4">
                          <div className="h-24 w-24 rounded-full bg-gray-100 flex items-center justify-center">
                            {formData.photo ? (
                                <img
                                    src={URL.createObjectURL(formData.photo)}
                                    alt="Profile preview"
                                    className="h-full w-full rounded-full object-cover"
                                />
                            ) : (
                                <Upload className="h-8 w-8 text-gray-400" />
                            )}
                          </div>
                          <input
                              type="file"
                              id="photo"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => handleFileChange(e, 'photo')}
                          />
                          <Button
                              variant="outline"
                              type="button"
                              onClick={() => document.getElementById('photo')?.click()}
                          >
                            {formData.photo ? 'Change Photo' : 'Upload Photo'}
                          </Button>
                        </div>
                      </div>
                    </div>
                )}

                {formStep === 1 && (
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <h3 className="text-lg font-medium">Employment Information</h3>
                        <Separator />
                      </div>

                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="employeeId">Employee ID*</Label>
                          <Input
                              id="employeeId"
                              required
                              value={formData.employeeId}
                              onChange={handleInputChange}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="joiningDate">Joining Date*</Label>
                          <Input
                              id="joiningDate"
                              type="date"
                              required
                              value={formData.joiningDate}
                              onChange={handleInputChange}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="department">Department*</Label>
                          <Select
                              required
                              value={formData.department}
                              onValueChange={(value) => handleSelectChange('department', value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select department" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="service">Service Department</SelectItem>
                              <SelectItem value="sales">Sales Department</SelectItem>
                              <SelectItem value="parts">Parts Department</SelectItem>
                              <SelectItem value="finance">Finance Department</SelectItem>
                              <SelectItem value="hr">Human Resources</SelectItem>
                              <SelectItem value="management">Management</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="position">Position/Title*</Label>
                          <Input
                              id="position"
                              required
                              value={formData.position}
                              onChange={handleInputChange}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="employmentType">Employment Type*</Label>
                          <Select
                              required
                              value={formData.employmentType}
                              onValueChange={(value) => handleSelectChange('employmentType', value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="full-time">Full-Time</SelectItem>
                              <SelectItem value="part-time">Part-Time</SelectItem>
                              <SelectItem value="contract">Contract</SelectItem>
                              <SelectItem value="internship">Internship</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="reportingManager">Reporting Manager*</Label>
                          <Select
                              required
                              value={formData.reportingManager}
                              onValueChange={(value) => handleSelectChange('reportingManager', value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select manager" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="david-wilson">David Wilson</SelectItem>
                              <SelectItem value="sarah-johnson">Sarah Johnson</SelectItem>
                              <SelectItem value="michael-chen">Michael Chen</SelectItem>
                              <SelectItem value="robert-anderson">Robert Anderson</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="workLocation">Work Location*</Label>
                        <Input
                            id="workLocation"
                            required
                            value={formData.workLocation}
                            onChange={handleInputChange}
                        />
                      </div>
                    </div>
                )}

                {formStep === 2 && (
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <h3 className="text-lg font-medium">Financial Information</h3>
                        <Separator />
                      </div>

                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="basicSalary">Basic Salary*</Label>
                          <Input
                              id="basicSalary"
                              type="number"
                              required
                              value={formData.basicSalary}
                              onChange={handleInputChange}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="bankName">Bank Name*</Label>
                          <Input
                              id="bankName"
                              required
                              value={formData.bankName}
                              onChange={handleInputChange}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="accountNumber">Account Number*</Label>
                          <Input
                              id="accountNumber"
                              required
                              value={formData.accountNumber}
                              onChange={handleInputChange}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="epfNumber">EPF Number</Label>
                          <Input
                              id="epfNumber"
                              value={formData.epfNumber}
                              onChange={handleInputChange}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <h3 className="text-lg font-medium">Documents</h3>
                        <Separator />
                      </div>

                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="resume">Resume/CV*</Label>
                          <div className="flex items-center space-x-2">
                            <Input
                                id="resume"
                                type="file"
                                className="w-full"
                                required
                                onChange={(e) => handleFileChange(e, 'resume')}
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="idProof">ID Proof*</Label>
                          <div className="flex items-center space-x-2">
                            <Input
                                id="idProof"
                                type="file"
                                className="w-full"
                                required
                                onChange={(e) => handleFileChange(e, 'idProof')}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="addressProof">Address Proof*</Label>
                          <div className="flex items-center space-x-2">
                            <Input
                                id="addressProof"
                                type="file"
                                className="w-full"
                                required
                                onChange={(e) => handleFileChange(e, 'addressProof')}
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="otherDocuments">Other Documents</Label>
                          <div className="flex items-center space-x-2">
                            <Input
                                id="otherDocuments"
                                type="file"
                                multiple
                                className="w-full"
                                onChange={(e) => handleFileChange(e, 'otherDocuments')}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                )}
              </form>
            </CardContent>
            <CardFooter className="flex flex-col sm:flex-row justify-between space-y-2 sm:space-y-0">
              <div className="flex items-center space-x-2">
                <span className={`h-3 w-3 rounded-full ${formStep >= 0 ? "bg-blue-600" : "bg-gray-300"}`}></span>
                <span className={`h-3 w-3 rounded-full ${formStep >= 1 ? "bg-blue-600" : "bg-gray-300"}`}></span>
                <span className={`h-3 w-3 rounded-full ${formStep >= 2 ? "bg-blue-600" : "bg-gray-300"}`}></span>
              </div>

              <div className="flex space-x-2">
                {formStep > 0 && (
                    <Button type="button" variant="outline" onClick={prevStep}>
                      Previous
                    </Button>
                )}
                {formStep < 2 ? (
                    <Button type="button" onClick={nextStep}>
                      Next
                    </Button>
                ) : (
                    <Button type="submit" onClick={handleSubmit} disabled={isSubmitting}>
                      {isSubmitting ? "Submitting..." : "Submit Registration"}
                    </Button>
                )}
              </div>
            </CardFooter>
          </Card>
        </div>
      </DashboardLayout>
  )
}