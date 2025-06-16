"use client"

import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  UserPlus,
  Calendar,
  GraduationCap,
  TrendingUp,
  DollarSign,
  Search,
  Filter,
  AlertCircle
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import {
  getEmployees,
  getEmployeeStats,
  updateEmployeeStatus,
  getDepartments
} from "./employeeBackend";
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

export default function EmployeeManagementPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [employees, setEmployees] = useState<any[]>([]);
  const [employeeStats, setEmployeeStats] = useState<any>(null);
  const [departments, setDepartments] = useState<string[]>([]);
  const [filters, setFilters] = useState({
    search: '',
    department: 'all',
    status: 'all'
  });
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [employeesData, stats, depts] = await Promise.all([
          getEmployees(filters),
          getEmployeeStats(),
          getDepartments()
        ]);
        setEmployees(employeesData);
        setEmployeeStats(stats);
        setDepartments(depts);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch employee data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [filters]);

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleStatusChange = async (empId: string, newStatus: string) => {
    try {
      await updateEmployeeStatus(empId, newStatus);
      // Refresh employee data
      const employeesData = await getEmployees(filters);
      setEmployees(employeesData);
      toast({
        title: "Status updated successfully",
        description: `Employee status has been updated to ${newStatus}.`,
        variant: "default",
      });
    } catch (err) {
      toast({
        title: "Error updating status",
        description: err instanceof Error ? err.message : 'Failed to update status',
        variant: "destructive",
      });
    }
  };

  const filteredEmployees = employees.filter(employee => {
    if (activeTab === "all") return true;
    if (activeTab === "active") return employee.status === "Active";
    if (activeTab === "on-leave") return employee.status === "On Leave";
    return true;
  });

  if (loading) return (
      <DashboardLayout navigation={navigation} userRole="hr" userName="Loading...">
        <div className="space-y-6">
          <Skeleton className="h-8 w-[300px]" />
          <Skeleton className="h-4 w-[200px]" />
          <Skeleton className="h-24" />
          <Skeleton className="h-96" />
        </div>
      </DashboardLayout>
  );

  if (error) return (
      <DashboardLayout navigation={navigation} userRole="hr" userName="Error">
        <div className="flex items-center justify-center h-64">
          <div className="text-center space-y-2">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto" />
            <h2 className="text-xl font-bold">Error loading employee data</h2>
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
              <h1 className="text-2xl font-bold text-gray-900">Employee Management</h1>
              <p className="text-gray-600">View, edit, and manage employee records.</p>
            </div>

            {/* Search and Filter */}
            <Card>
              <CardContent className="pt-6">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                    <Input
                        type="search"
                        placeholder="Search employees..."
                        className="pl-8"
                        value={filters.search}
                        onChange={(e) => handleFilterChange('search', e.target.value)}
                    />
                  </div>
                  <div>
                    <Select
                        value={filters.department}
                        onValueChange={(value) => handleFilterChange('department', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Department" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Departments</SelectItem>
                        {departments.map(dept => (
                            <SelectItem key={dept} value={dept}>
                              {dept}
                            </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Select
                        value={filters.status}
                        onValueChange={(value) => handleFilterChange('status', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="Active">Active</SelectItem>
                        <SelectItem value="On Leave">On Leave</SelectItem>
                        <SelectItem value="Terminated">Terminated</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Button>
                      <Filter className="mr-2 h-4 w-4" />
                      Apply Filters
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Employee Records */}
            <Tabs defaultValue="all" className="w-full" onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
                <TabsTrigger value="all">All Employees</TabsTrigger>
                <TabsTrigger value="active">Active</TabsTrigger>
                <TabsTrigger value="on-leave">On Leave</TabsTrigger>
              </TabsList>
              <TabsContent value="all" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Employee Directory</CardTitle>
                    <CardDescription>
                      Managing total of {employeeStats?.totalEmployees || 0} employees
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="rounded-md border">
                      <div className="grid grid-cols-7 bg-gray-100 p-4 font-medium text-sm">
                        <div className="col-span-2">Employee</div>
                        <div>ID</div>
                        <div>Department</div>
                        <div>Position</div>
                        <div>Status</div>
                        <div>Actions</div>
                      </div>
                      <div className="divide-y">
                        {filteredEmployees.map((employee) => (
                            <div key={employee.empId} className="grid grid-cols-7 p-4 text-sm items-center">
                              <div className="col-span-2 flex items-center space-x-3">
                                <Avatar className="h-9 w-9">
                                  <AvatarImage src="/placeholder.svg" alt={`${employee.firstName} ${employee.lastName}`} />
                                  <AvatarFallback>
                                    {employee.firstName.charAt(0)}{employee.lastName.charAt(0)}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <div className="font-medium">{employee.firstName} {employee.lastName}</div>
                                  <div className="text-xs text-gray-500">{employee.email}</div>
                                </div>
                              </div>
                              <div>{employee.empId}</div>
                              <div>{employee.department}</div>
                              <div>{employee.position}</div>
                              <div>
                                <Badge
                                    variant={
                                      employee.status === "Active"
                                          ? "default"
                                          : employee.status === "On Leave"
                                              ? "secondary"
                                              : "destructive"
                                    }
                                >
                                  {employee.status}
                                </Badge>
                              </div>
                              <div className="flex space-x-2">
                                <Button variant="outline" size="sm">
                                  View
                                </Button>
                                <Button variant="outline" size="sm">
                                  Edit
                                </Button>
                              </div>
                            </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="active" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Active Employees</CardTitle>
                    <CardDescription>
                      Currently {employeeStats?.activeEmployees || 0} active employees in the company
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="rounded-md border">
                      <div className="grid grid-cols-7 bg-gray-100 p-4 font-medium text-sm">
                        <div className="col-span-2">Employee</div>
                        <div>ID</div>
                        <div>Department</div>
                        <div>Position</div>
                        <div>Status</div>
                        <div>Actions</div>
                      </div>
                      <div className="divide-y">
                        {filteredEmployees
                            .filter((emp) => emp.status === "Active")
                            .map((employee) => (
                                <div key={employee.empId} className="grid grid-cols-7 p-4 text-sm items-center">
                                  <div className="col-span-2 flex items-center space-x-3">
                                    <Avatar className="h-9 w-9">
                                      <AvatarImage src="/placeholder.svg" alt={`${employee.firstName} ${employee.lastName}`} />
                                      <AvatarFallback>
                                        {employee.firstName.charAt(0)}{employee.lastName.charAt(0)}
                                      </AvatarFallback>
                                    </Avatar>
                                    <div>
                                      <div className="font-medium">{employee.firstName} {employee.lastName}</div>
                                      <div className="text-xs text-gray-500">{employee.email}</div>
                                    </div>
                                  </div>
                                  <div>{employee.empId}</div>
                                  <div>{employee.department}</div>
                                  <div>{employee.position}</div>
                                  <div>
                                    <Badge variant="default">Active</Badge>
                                  </div>
                                  <div className="flex space-x-2">
                                    <Button variant="outline" size="sm">
                                      View
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleStatusChange(employee.empId, "On Leave")}
                                    >
                                      Mark Leave
                                    </Button>
                                  </div>
                                </div>
                            ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="on-leave" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Employees on Leave</CardTitle>
                    <CardDescription>
                      {employeeStats?.onLeaveEmployees || 0} employees currently on approved leave
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="rounded-md border">
                      <div className="grid grid-cols-7 bg-gray-100 p-4 font-medium text-sm">
                        <div className="col-span-2">Employee</div>
                        <div>ID</div>
                        <div>Department</div>
                        <div>Position</div>
                        <div>Status</div>
                        <div>Actions</div>
                      </div>
                      <div className="divide-y">
                        {filteredEmployees
                            .filter((emp) => emp.status === "On Leave")
                            .map((employee) => (
                                <div key={employee.empId} className="grid grid-cols-7 p-4 text-sm items-center">
                                  <div className="col-span-2 flex items-center space-x-3">
                                    <Avatar className="h-9 w-9">
                                      <AvatarImage src="/placeholder.svg" alt={`${employee.firstName} ${employee.lastName}`} />
                                      <AvatarFallback>
                                        {employee.firstName.charAt(0)}{employee.lastName.charAt(0)}
                                      </AvatarFallback>
                                    </Avatar>
                                    <div>
                                      <div className="font-medium">{employee.firstName} {employee.lastName}</div>
                                      <div className="text-xs text-gray-500">{employee.email}</div>
                                    </div>
                                  </div>
                                  <div>{employee.empId}</div>
                                  <div>{employee.department}</div>
                                  <div>{employee.position}</div>
                                  <div>
                                    <Badge variant="secondary">On Leave</Badge>
                                  </div>
                                  <div className="flex space-x-2">
                                    <Button variant="outline" size="sm">
                                      View
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleStatusChange(employee.empId, "Active")}
                                    >
                                      Mark Active
                                    </Button>
                                  </div>
                                </div>
                            ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Common employee management tasks</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                  <Button variant="outline" className="h-20 flex-col">
                    <UserPlus className="h-6 w-6 mb-2" />
                    Add Employee
                  </Button>
                  <Button variant="outline" className="h-20 flex-col">
                    <Calendar className="h-6 w-6 mb-2" />
                    Approve Leave
                  </Button>
                  <Button variant="outline" className="h-20 flex-col">
                    <DollarSign className="h-6 w-6 mb-2" />
                    Update Salary
                  </Button>
                  <Button variant="outline" className="h-20 flex-col">
                    <TrendingUp className="h-6 w-6 mb-2" />
                    Performance Review
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
  );
}