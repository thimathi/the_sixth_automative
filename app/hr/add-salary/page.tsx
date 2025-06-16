"use client"

import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  UserPlus,
  Calendar,
  GraduationCap,
  TrendingUp,
  DollarSign,
  Search,
  Plus,
  AlertCircle
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  getEmployeeSalaries,
  getSalaryHistory,
  getSalaryGrades,
  getEmployeesForSelection,
  addOrUpdateSalary,
  getPayrollStats
} from "./salaryBackend";
import { Skeleton } from "@/components/ui/skeleton";
import ProtectedRoute from "@/components/protectedRoute";

const navigation = [
  { name: "Dashboard", href: "/hr/dashboard", icon: Users },
  { name: "Employee Management", href: "/hr/employee-management", icon: Users },
  { name: "Employee Registration", href: "/hr/employee-registration", icon: UserPlus },
  { name: "Leave Arrangement", href: "/hr/leave-arrangement", icon: Calendar },
  { name: "Training Arrangement", href: "/hr/training-arrangement", icon: GraduationCap },
  { name: "KPI Generation", href: "/hr/kpi-generation", icon: TrendingUp },
  { name: "Add Salary", href: "/hr/add-salary", icon: DollarSign },
];

export default function AddSalaryPage() {
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [employeeSalaries, setEmployeeSalaries] = useState<any[]>([]);
  const [salaryHistory, setSalaryHistory] = useState<any[]>([]);
  const [salaryGrades, setSalaryGrades] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [payrollStats, setPayrollStats] = useState<any>(null);
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [formData, setFormData] = useState({
    basicSalary: "",
    allowances: "",
    overtimeRate: "",
    effectiveDate: "",
    salaryGrade: ""
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [salaries, history, grades, employees, stats] = await Promise.all([
          getEmployeeSalaries(),
          getSalaryHistory(),
          getSalaryGrades(),
          getEmployeesForSelection(),
          getPayrollStats()
        ]);
        setEmployeeSalaries(salaries);
        setSalaryHistory(history);
        setSalaryGrades(grades);
        setEmployees(employees);
        setPayrollStats(stats);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: value
    }));
  };

  const handleSalaryUpdate = async () => {
    try {
      if (!selectedEmployee) {
        throw new Error("Please select an employee");
      }
      if (!formData.basicSalary || !formData.effectiveDate) {
        throw new Error("Basic salary and effective date are required");
      }

      setSubmitting(true);

      await addOrUpdateSalary({
        empId: selectedEmployee,
        basicSalary: parseFloat(formData.basicSalary),
        allowances: parseFloat(formData.allowances) || 0,
        overtimeRate: parseFloat(formData.overtimeRate) || 0,
        effectiveDate: formData.effectiveDate,
        salaryGrade: formData.salaryGrade
      });

      // Refresh data
      const [salaries, history] = await Promise.all([
        getEmployeeSalaries(),
        getSalaryHistory()
      ]);
      setEmployeeSalaries(salaries);
      setSalaryHistory(history);

      toast({
        title: "Salary updated successfully",
        description: "Employee salary has been updated in the system.",
        variant: "default",
      });
      setDialogOpen(false);
      setFormData({
        basicSalary: "",
        allowances: "",
        overtimeRate: "",
        effectiveDate: "",
        salaryGrade: ""
      });
    } catch (err) {
      toast({
        title: "Error updating salary",
        description: err instanceof Error ? err.message : 'Failed to update salary',
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
      <DashboardLayout navigation={navigation} userRole="hr" userName="Loading...">
        <div className="space-y-6">
          <Skeleton className="h-8 w-[300px]" />
          <Skeleton className="h-4 w-[200px]" />

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-32" />
            ))}
          </div>

          <Skeleton className="h-96" />
        </div>
      </DashboardLayout>
  );

  if (error) return (
      <DashboardLayout navigation={navigation} userRole="hr" userName="Error">
        <div className="flex items-center justify-center h-64">
          <div className="text-center space-y-2">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto" />
            <h2 className="text-xl font-bold">Error loading salary data</h2>
            <p className="text-gray-600">{error}</p>
            <Button variant="outline" onClick={() => window.location.reload()}>
              Retry
            </Button>
          </div>
        </div>
      </DashboardLayout>
  );

  return (
      <ProtectedRoute allowedRoles={['hr']}>
        <DashboardLayout navigation={navigation} userRole="hr" userName="Michael Chen">
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Salary Management</h1>
              <p className="text-gray-600">Add and manage employee salary information.</p>
            </div>

            {/* Salary Overview */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Payroll</CardTitle>
                  <DollarSign className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    ${(payrollStats?.totalPayroll || 0).toLocaleString()}
                  </div>
                  <p className="text-xs text-muted-foreground">Annual payroll</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Average Salary</CardTitle>
                  <TrendingUp className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    ${(payrollStats?.averageSalary || 0).toLocaleString()}
                  </div>
                  <p className="text-xs text-muted-foreground">Company average</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Salary Reviews</CardTitle>
                  <Calendar className="h-4 w-4 text-orange-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{payrollStats?.pendingReviews || 0}</div>
                  <p className="text-xs text-muted-foreground">Due this month</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Budget Utilization</CardTitle>
                  <TrendingUp className="h-4 w-4 text-purple-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{payrollStats?.budgetUtilization || 0}%</div>
                  <p className="text-xs text-muted-foreground">Of allocated budget</p>
                </CardContent>
              </Card>
            </div>

            {/* Search and Add */}
            <div className="flex flex-col md:flex-row gap-4 justify-between">
              <div className="relative w-full md:w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                <Input type="search" placeholder="Search employees..." className="pl-8" />
              </div>

              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Add/Update Salary
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[550px]">
                  <DialogHeader>
                    <DialogTitle>Add/Update Employee Salary</DialogTitle>
                    <DialogDescription>
                      Enter salary details for the selected employee.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="employee">Select Employee</Label>
                      <Select
                          value={selectedEmployee}
                          onValueChange={setSelectedEmployee}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Choose an employee" />
                        </SelectTrigger>
                        <SelectContent>
                          {employees.map(emp => (
                              <SelectItem key={emp.id} value={emp.id}>
                                {emp.name} - {emp.position}
                              </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="basicSalary">Basic Salary</Label>
                        <Input
                            id="basicSalary"
                            type="number"
                            placeholder="Enter basic salary"
                            value={formData.basicSalary}
                            onChange={handleInputChange}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="allowances">Allowances</Label>
                        <Input
                            id="allowances"
                            type="number"
                            placeholder="Enter allowances"
                            value={formData.allowances}
                            onChange={handleInputChange}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="overtimeRate">Overtime Rate</Label>
                        <Input
                            id="overtimeRate"
                            type="number"
                            placeholder="Per hour rate"
                            value={formData.overtimeRate}
                            onChange={handleInputChange}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="effectiveDate">Effective Date</Label>
                        <Input
                            id="effectiveDate"
                            type="date"
                            value={formData.effectiveDate}
                            onChange={handleInputChange}
                        />
                      </div>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="salaryGrade">Salary Grade</Label>
                      <Select
                          value={formData.salaryGrade}
                          onValueChange={(value) => setFormData(prev => ({ ...prev, salaryGrade: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select grade" />
                        </SelectTrigger>
                        <SelectContent>
                          {salaryGrades.map(grade => (
                              <SelectItem key={grade.grade} value={grade.grade}>
                                {grade.grade} ({grade.level})
                              </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={() => {
                          setDialogOpen(false);
                          setFormData({
                            basicSalary: "",
                            allowances: "",
                            overtimeRate: "",
                            effectiveDate: "",
                            salaryGrade: ""
                          });
                        }}
                    >
                      Cancel
                    </Button>
                    <Button
                        onClick={handleSalaryUpdate}
                        disabled={submitting}
                    >
                      {submitting ? "Processing..." : "Update Salary"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            {/* Salary Management Tabs */}
            <Tabs defaultValue="current" className="w-full">
              <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
                <TabsTrigger value="current">Current Salaries</TabsTrigger>
                <TabsTrigger value="history">Salary History</TabsTrigger>
                <TabsTrigger value="grades">Salary Grades</TabsTrigger>
              </TabsList>
              <TabsContent value="current" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Current Employee Salaries</CardTitle>
                    <CardDescription>Active salary information for all employees</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="rounded-md border">
                      <div className="grid grid-cols-8 bg-gray-100 p-4 font-medium text-sm">
                        <div className="col-span-2">Employee</div>
                        <div>Basic Salary</div>
                        <div>Allowances</div>
                        <div>OT Rate</div>
                        <div>Total Salary</div>
                        <div>Last Updated</div>
                        <div>Actions</div>
                      </div>
                      <div className="divide-y">
                        {employeeSalaries.map((employee) => (
                            <div key={employee.salaryId} className="grid grid-cols-8 p-4 text-sm items-center">
                              <div className="col-span-2 flex items-center space-x-3">
                                <Avatar className="h-9 w-9">
                                  <AvatarImage src="/placeholder.svg" alt={employee.name} />
                                  <AvatarFallback>{employee.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div>
                                  <div className="font-medium">{employee.name}</div>
                                  <div className="text-xs text-gray-500">{employee.position}</div>
                                </div>
                              </div>
                              <div>${employee.basicSalary.toLocaleString()}</div>
                              <div>${employee.allowances.toLocaleString()}</div>
                              <div>${employee.overtimeRate.toLocaleString()}</div>
                              <div className="font-medium">${employee.totalSalary.toLocaleString()}</div>
                              <div>{new Date(employee.lastUpdated).toLocaleDateString()}</div>
                              <div className="flex space-x-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      setSelectedEmployee(employee.empId);
                                      setFormData({
                                        basicSalary: employee.basicSalary.toString(),
                                        allowances: employee.allowances.toString(),
                                        overtimeRate: employee.overtimeRate.toString(),
                                        effectiveDate: employee.lastUpdated,
                                        salaryGrade: employee.salaryGrade
                                      });
                                      setDialogOpen(true);
                                    }}
                                >
                                  Edit
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      // Navigate to history tab with filter for this employee
                                    }}
                                >
                                  History
                                </Button>
                              </div>
                            </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="history" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Salary History</CardTitle>
                    <CardDescription>Historical salary changes and adjustments</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {salaryHistory.map((history) => (
                          <div key={history.historyId} className="border rounded-lg p-4">
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <h4 className="font-medium">{history.name}</h4>
                                <p className="text-sm text-gray-600">{history.changeType}</p>
                              </div>
                              <Badge variant={history.status === "Approved" ? "default" : "secondary"}>
                                {history.status}
                              </Badge>
                            </div>
                            <div className="grid grid-cols-3 gap-4 text-sm">
                              <div>
                                <span className="text-gray-500">Previous: </span>
                                <span>${history.previousSalary.toLocaleString()}</span>
                              </div>
                              <div>
                                <span className="text-gray-500">Current: </span>
                                <span className="font-medium">${history.currentSalary.toLocaleString()}</span>
                              </div>
                              <div>
                                <span className="text-gray-500">Effective: </span>
                                <span>{new Date(history.effectiveDate).toLocaleDateString()}</span>
                              </div>
                            </div>
                          </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="grades" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Salary Grade Structure</CardTitle>
                    <CardDescription>Company salary grades and ranges</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {salaryGrades.map((grade) => (
                          <div key={grade.grade} className="border rounded-lg p-4">
                            <div className="flex justify-between items-center">
                              <div>
                                <h4 className="font-medium">{grade.grade}</h4>
                                <p className="text-sm text-gray-600">{grade.level}</p>
                              </div>
                              <div className="text-right">
                                <div className="font-medium">
                                  ${grade.min.toLocaleString()} - ${grade.max.toLocaleString()}
                                </div>
                                <div className="text-sm text-gray-600">{grade.employees} employees</div>
                              </div>
                            </div>
                          </div>
                      ))}
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" className="w-full">
                      Update Salary Structure
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
  );
}