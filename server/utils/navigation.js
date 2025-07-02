import {
    Calculate as CalculatorIcon,
    AttachMoney as DollarSignIcon,
    TrendingUp as TrendingUpIcon,
    Description as FileTextIcon,
    AccountBalance as PiggyBankIcon,
    AccessTime as ClockIcon,
    CreditCard as CreditCardIcon
} from "@mui/icons-material";

export const accountantNavigation = (userId: string) => [
    {
        name: "Dashboard",
        href: `/accountant/dashboard?empId=${userId || "0"}`,
        icon: CalculatorIcon
    },
    {
        name: "Salary Calculation",
        href: `/accountant/salary-calculation?empId=${userId || "0"}`,
        icon: DollarSignIcon
    },
    {
        name: "Bonus Calculation",
        href: `/accountant/bonus-calculation?empId=${userId || "0"}`,
        icon: TrendingUpIcon
    },
    {
        name: "OT Calculation",
        href: `/accountant/ot-calculation?empId=${userId || "0"}`,
        icon: ClockIcon
    },
    {
        name: "EPF/ETF Management",
        href: `/accountant/epf-etf-management?empId=${userId || "0"}`,
        icon: PiggyBankIcon
    },
    {
        name: "Increment Management",
        href: `/accountant/increment-management?empId=${userId || "0"}`,
        icon: TrendingUpIcon
    },
    {
        name: "Loan Eligibility Check",
        href: `/accountant/check-loan-eligibility?empId=${userId || "0"}`,
        icon: CreditCardIcon
    },
];