'use client'

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Calculator, Clock, CreditCard, DollarSign, PiggyBank, TrendingUp } from "lucide-react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { useUser } from "@/context/user-context";
import {
  fetchEmployees,
  fetchBonusHistory,
  processBonus,
  calculateBonusAmount
} from "./bonusBackend";

const navigation = [
  { name: "Dashboard", href: "/accountant/dashboard", icon: Calculator },
  { name: "Salary Calculation", href: "/accountant/salary-calculation", icon: DollarSign },
  { name: "Bonus Calculation", href: "/accountant/bonus-calculation", icon: TrendingUp },
  { name: "OT Calculation", href: "/accountant/ot-calculation", icon: Clock },
  { name: "EPF/ETF Management", href: "/accountant/epf-etf-management", icon: PiggyBank },
  { name: "Increment Management", href: "/accountant/increment-management", icon: TrendingUp },
  { name: "Loan Eligibility Check", href: "/accountant/check-loan-eligibility", icon: CreditCard },
];

export default function BonusCalculation() {
  const { user } = useUser();
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [bonusType, setBonusType] = useState("");
  const [bonusAmount, setBonusAmount] = useState("");
  const [employees, setEmployees] = useState<any[]>([]);
  const [bonusHistory, setBonusHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState({
    employees: true,
    history: true,
    processing: false
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const [emps, history] = await Promise.all([
          fetchEmployees(),
          fetchBonusHistory()
        ]);
        setEmployees(emps);
        setBonusHistory(history);
      } catch (error) {
        console.error("Failed to load data:", error);
      } finally {
        setLoading(prev => ({ ...prev, employees: false, history: false }));
      }
    };

    loadData();
  }, []);

  const handleCalculateBonus = () => {
    const employee = employees.find((emp) => emp.id === selectedEmployee);
    if (!employee) return;

    const amount = calculateBonusAmount(
        employee.baseSalary,
        employee.performance,
        bonusType
    );
    setBonusAmount(amount.toString());
  };

  const handleProcessBonus = async () => {
    if (!selectedEmployee || !bonusType || !bonusAmount) return;

    setLoading(prev => ({ ...prev, processing: true }));
    try {
      const success = await processBonus(
          selectedEmployee,
          bonusType,
          parseFloat(bonusAmount)
      );

      if (success) {
        // Refresh bonus history
        const history = await fetchBonusHistory();
        setBonusHistory(history);
        // Reset form
        setSelectedEmployee("");
        setBonusType("");
        setBonusAmount("");
      }
    } catch (error) {
      console.error("Failed to process bonus:", error);
    } finally {
      setLoading(prev => ({ ...prev, processing: false }));
    }
  };

  const selectedEmployeeData = employees.find(emp => emp.id === selectedEmployee);

  return (
      <DashboardLayout
          navigation={navigation}
          userRole="accountant"
          userName={user?.name || "Accountant"}
      >
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Bonus Calculation</h1>
              <p className="text-muted-foreground">Calculate and manage employee bonuses</p>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="h-5 w-5" />
                  Calculate Bonus
                </CardTitle>
                <CardDescription>Calculate bonus for employees based on performance and type</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="employee">Select Employee</Label>
                  <Select
                      value={selectedEmployee}
                      onValueChange={setSelectedEmployee}
                      disabled={loading.employees}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose employee" />
                    </SelectTrigger>
                    <SelectContent>
                      {employees.map((emp) => (
                          <SelectItem key={emp.id} value={emp.id}>
                            {emp.name} - {emp.department}
                          </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bonusType">Bonus Type</Label>
                  <Select
                      value={bonusType}
                      onValueChange={setBonusType}
                      disabled={!selectedEmployee}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select bonus type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="performance">Performance Bonus</SelectItem>
                      <SelectItem value="festival">Festival Bonus</SelectItem>
                      <SelectItem value="annual">Annual Bonus</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="amount">Bonus Amount ($)</Label>
                  <Input
                      id="amount"
                      type="number"
                      value={bonusAmount}
                      onChange={(e) => setBonusAmount(e.target.value)}
                      placeholder="0.00"
                  />
                </div>

                <div className="flex gap-2">
                  <Button
                      onClick={handleCalculateBonus}
                      variant="outline"
                      className="flex-1"
                      disabled={!selectedEmployee || !bonusType}
                  >
                    Auto Calculate
                  </Button>
                  <Button
                      className="flex-1"
                      onClick={handleProcessBonus}
                      disabled={!selectedEmployee || !bonusType || !bonusAmount || loading.processing}
                  >
                    <DollarSign className="h-4 w-4 mr-2" />
                    {loading.processing ? "Processing..." : "Process Bonus"}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Employee Details</CardTitle>
              </CardHeader>
              <CardContent>
                {selectedEmployeeData ? (
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="font-medium">Employee ID:</span>
                        <span>{selectedEmployeeData.id}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Name:</span>
                        <span>{selectedEmployeeData.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Department:</span>
                        <span>{selectedEmployeeData.department}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Base Salary:</span>
                        <span>${selectedEmployeeData.baseSalary.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Performance:</span>
                        <Badge
                            variant={
                              selectedEmployeeData.performance === "Excellent"
                                  ? "default"
                                  : selectedEmployeeData.performance === "Good"
                                      ? "secondary"
                                      : "outline"
                            }
                        >
                          {selectedEmployeeData.performance}
                        </Badge>
                      </div>
                    </div>
                ) : (
                    <p className="text-muted-foreground">Select an employee to view details</p>
                )}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Bonus History</CardTitle>
              <CardDescription>Recent bonus calculations and approvals</CardDescription>
            </CardHeader>
            <CardContent>
              {loading.history ? (
                  <p>Loading bonus history...</p>
              ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Employee ID</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Bonus Type</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {bonusHistory.map((bonus) => (
                          <TableRow key={bonus.id}>
                            <TableCell>{bonus.employeeId}</TableCell>
                            <TableCell>{bonus.name}</TableCell>
                            <TableCell>{bonus.type}</TableCell>
                            <TableCell>${bonus.amount.toLocaleString()}</TableCell>
                            <TableCell>{bonus.date}</TableCell>
                            <TableCell>
                              <Badge variant={bonus.status === "Approved" ? "default" : "secondary"}>
                                {bonus.status}
                              </Badge>
                            </TableCell>
                          </TableRow>
                      ))}
                    </TableBody>
                  </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
  );
}