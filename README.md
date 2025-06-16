# 🚗 The Sixth Automotive - Employee Management System (EMS)

## 📋 Overview

**The Sixth Automotive EMS** is a comprehensive Employee Management System tailored to streamline HR operations, payroll processing, performance evaluation, and administrative reporting for automotive workshops. This system helps automate manual tasks, improve data security, and enhance employee satisfaction by delivering a transparent and intuitive digital HR platform.

## 🏢 About the Organization

**The Sixth Automotive** is a growing auto service and repair center committed to high-quality vehicle care. With a dedicated staff and increasing customer demand, the shop needed an effective solution to manage its employees, their payrolls, and internal HR processes seamlessly.

## 🎯 Project Objectives

* ✅ Centralized employee data management
* 📝 Digital leave request and approval workflow
* 💸 Automated salary and bonus calculation
* 📈 Performance tracking via KPIs
* 📊 Comprehensive report generation (OT, leave, training, salary, etc.)
* 🔒 Secured access and role-based dashboards
* 🧩 Scalable architecture to grow with the organization

## 👤 Users & Roles

| Role                  | Responsibilities                                                  |
| --------------------- | ----------------------------------------------------------------- |
| **Managing Director** | Overall system management and high-level decisions                |
| **HR Officer**        | Employee registration, leave and training management              |
| **Accountant**        | Salary processing, loan eligibility, bonus and increment handling |
| **Manager**           | Task assignments, performance reviews, and report generation      |
| **Employees**         | Apply for leave/loans, view pay slips, check tasks & promotions   |

## 🧩 Key Features

### 🔐 Authentication & Role-Based Access

* Secure login for different user types (Admin, HR, Accountant, Employee, etc.)

### 📅 Attendance & Leave Management

* Apply, approve, and track short leave, sick leave, half-day, maternity, and full-day leave.

### 💵 Salary & Financials

* Calculate monthly salary with OT, bonus, increments, no-pay deductions.
* EPF/ETF calculations with proper tracking.

### 📈 Performance Tracking

* KPI monitoring linked to tasks, attendance, and leave.
* Promotion eligibility and ranking.

### 🧾 Reports

* Monthly/Annual reports: Salary, OT, Attendance, NoPay, KPI, Loan Requests, Training, Leaves.

### 👨‍🏫 Training & Meetings

* Schedule and manage employee trainings and internal meetings.

## 🧪 Tech Stack

* **Frontend:** Next JS
* **Backend:** Supabase
* **Development Model:** Agile SDLC
* **Testing:** Unit, Integration, System, and User Acceptance Testing

## 🧠 Database Highlights

* `Employee` – Basic info, salary, leaves, OT, KPI
* `Attendance` – Daily logs with timestamps
* `Leave`, `Leave_Type` – All leave types and history
* `Salary`, `Bonus`, `Increment`, `NoPay` – Payroll details
* `Task`, `KPI`, `Promotion` – Performance-related tables
* `Training`, `Meeting` – Staff development and coordination
* `Loan_Request`, `Loan_Type` – Financial assistance tracking

## 📊 Sample Reports

* **OT Reports**
* **Leave & NoPay Reports**
* **Salary & Bonus Sheets**
* **KPI Rankings**
* **Loan & Training Records**

## 🚀 Future Enhancements

* Email/SMS notifications for approvals
* Mobile interface for on-the-go access
* Biometric integration for attendance
* Cloud deployment for remote access

## 📃 License

This project is developed for educational and operational enhancement purposes within **The Sixth Automotive**. Unauthorized distribution is prohibited.

## 🙏 Acknowledgements

Thanks to:

* Dinidu Lochana Dissanayake (https://github.com/lochanadinidu)
* Workshop staff who provided real-world insights
* Project Members
