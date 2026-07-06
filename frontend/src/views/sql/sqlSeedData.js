export const departmentsData = [
  { dept_id: 1, dept_name: "Engineering", location: "Bengaluru", budget: 5000000.00 },
  { dept_id: 2, dept_name: "Sales", location: "Mumbai", budget: 2000000.00 },
  { dept_id: 3, dept_name: "Marketing", location: "Delhi", budget: 1200000.00 },
  { dept_id: 4, dept_name: "HR", location: "Bengaluru", budget: 800000.00 },
  { dept_id: 5, dept_name: "Finance", location: "Mumbai", budget: 1500000.00 },
  { dept_id: 6, dept_name: "Customer Support", location: "Pune", budget: 900000.00 },
  { dept_id: 7, dept_name: "Legal", location: "Delhi", budget: 600000.00 },
  { dept_id: 8, dept_name: "R&D Satellite", location: "Hyderabad", budget: null }
];

export const employeesData = [
  { emp_id: 1, first_name: "Ravi", last_name: "Sharma", email: "ravi.sharma@np.com", dept_id: 1, manager_id: null, hire_date: "2015-03-01", job_title: "VP Engineering" },
  { emp_id: 2, first_name: "Anita", last_name: "Verma", email: "anita.verma@np.com", dept_id: 1, manager_id: 1, hire_date: "2016-06-15", job_title: "Engineering Manager" },
  { emp_id: 3, first_name: "Alex", last_name: "Kim", email: "alex.kim1@np.com", dept_id: 1, manager_id: 2, hire_date: "2017-01-10", job_title: "Senior Software Engineer" },
  { emp_id: 4, first_name: "Priya", last_name: "Nair", email: "priya.nair@np.com", dept_id: 1, manager_id: 2, hire_date: "2018-02-20", job_title: "Software Engineer" },
  { emp_id: 5, first_name: "Alex", last_name: "Kim", email: "alex.kim2@np.com", dept_id: 1, manager_id: 2, hire_date: "2019-07-01", job_title: "Software Engineer" },
  { emp_id: 6, first_name: "Divya", last_name: "Rao", email: null, dept_id: 1, manager_id: 3, hire_date: "2020-01-15", job_title: "Junior Engineer" },
  { emp_id: 7, first_name: "Karan", last_name: "Mehta", email: "karan.mehta@np.com", dept_id: 1, manager_id: 3, hire_date: "2021-03-22", job_title: "Junior Engineer" },
  { emp_id: 8, first_name: "Sneha", last_name: "Iyer", email: "sneha.iyer@np.com", dept_id: 1, manager_id: 3, hire_date: "2022-05-30", job_title: "QA Engineer" },
  { emp_id: 9, first_name: "Arjun", last_name: "Gupta", email: "arjun.gupta@np.com", dept_id: 1, manager_id: null, hire_date: "2023-08-01", job_title: "Intern" },
  { emp_id: 10, first_name: "Meera", last_name: "Pillai", email: "meera.pillai@np.com", dept_id: 2, manager_id: null, hire_date: "2014-11-01", job_title: "VP Sales" },
  { emp_id: 11, first_name: "Rohan", last_name: "Desai", email: "rohan.desai@np.com", dept_id: 2, manager_id: 10, hire_date: "2016-04-12", job_title: "Sales Manager" },
  { emp_id: 12, first_name: "Kavya", last_name: "Menon", email: "kavya.menon@np.com", dept_id: 2, manager_id: 11, hire_date: "2018-09-09", job_title: "Account Executive" },
  { emp_id: 13, first_name: "Vikram", last_name: "Joshi", email: "vikram.joshi@np.com", dept_id: 2, manager_id: 11, hire_date: "2019-10-10", job_title: "Account Executive" },
  { emp_id: 14, first_name: "Neha", last_name: "Kapoor", email: "neha.kapoor@np.com", dept_id: 2, manager_id: 11, hire_date: "2020-12-01", job_title: "Sales Development Rep" },
  { emp_id: 15, first_name: "Suresh", last_name: "Reddy", email: "suresh.reddy@np.com", dept_id: 2, manager_id: 11, hire_date: "2021-06-06", job_title: "Sales Development Rep" },
  { emp_id: 16, first_name: "Pooja", last_name: "Bhatt", email: "pooja.bhatt@np.com", dept_id: 3, manager_id: null, hire_date: "2015-05-05", job_title: "VP Marketing" },
  { emp_id: 17, first_name: "Aditya", last_name: "Chawla", email: "aditya.chawla@np.com", dept_id: 3, manager_id: 16, hire_date: "2017-07-07", job_title: "Marketing Manager" },
  { emp_id: 18, first_name: "Ishita", last_name: "Saxena", email: "ishita.saxena@np.com", dept_id: 3, manager_id: 17, hire_date: "2019-03-03", job_title: "Content Strategist" },
  { emp_id: 19, first_name: "Manish", last_name: "Trivedi", email: "manish.trivedi@np.com", dept_id: 3, manager_id: 17, hire_date: "2020-08-08", job_title: "SEO Specialist" },
  { emp_id: 20, first_name: "Ritu", last_name: "Chopra", email: "ritu.chopra@np.com", dept_id: 3, manager_id: 17, hire_date: "2022-02-02", job_title: "Marketing Analyst" },
  { emp_id: 21, first_name: "Deepak", last_name: "Malhotra", email: "deepak.malhotra@np.com", dept_id: 4, manager_id: null, hire_date: "2013-01-01", job_title: "HR Director" },
  { emp_id: 22, first_name: "Shreya", last_name: "Agarwal", email: "shreya.agarwal@np.com", dept_id: 4, manager_id: 21, hire_date: "2017-11-11", job_title: "HR Manager" },
  { emp_id: 23, first_name: "Nikhil", last_name: "Bose", email: "nikhil.bose@np.com", dept_id: 4, manager_id: 22, hire_date: "2020-04-04", job_title: "Recruiter" },
  { emp_id: 24, first_name: "Tanvi",  last_name: "Shah", email: "tanvi.shah@np.com", dept_id: 4, manager_id: 22, hire_date: "2021-09-09", job_title: "Recruiter" },
  { emp_id: 25, first_name: "Amitabh",last_name: "Sinha", email: "amitabh.sinha@np.com", dept_id: 5, manager_id: null, hire_date: "2012-01-01", job_title: "CFO" },
  { emp_id: 26, first_name: "Lakshmi",last_name: "Krishnan", email: "lakshmi.krishnan@np.com", dept_id: 5, manager_id: 25, hire_date: "2016-02-02", job_title: "Finance Manager" },
  { emp_id: 27, first_name: "Rahul",  last_name: "Bansal", email: "rahul.bansal@np.com", dept_id: 5, manager_id: 26, hire_date: "2019-05-05", job_title: "Financial Analyst" },
  { emp_id: 28, first_name: "Swati",  last_name: "Nambiar", email: "swati.nambiar@np.com", dept_id: 5, manager_id: 26, hire_date: "2021-01-01", job_title: "Financial Analyst" },
  { emp_id: 29, first_name: "Harish", last_name: "Pandey", email: "harish.pandey@np.com", dept_id: 6, manager_id: null, hire_date: "2018-06-06", job_title: "Support Lead" },
  { emp_id: 30, first_name: "Fatima", last_name: "Sheikh", email: "fatima.sheikh@np.com", dept_id: 6, manager_id: 29, hire_date: "2020-07-07", job_title: "Support Associate" },
  { emp_id: 31, first_name: "Yusuf",  last_name: "Ansari", email: "yusuf.ansari@np.com", dept_id: 6, manager_id: 29, hire_date: "2021-08-08", job_title: "Support Associate" },
  { emp_id: 32, first_name: "Gauri",  last_name: "Deshmukh", email: "gauri.deshmukh@np.com", dept_id: 6, manager_id: 29, hire_date: "2022-09-09", job_title: "Support Associate" },
  { emp_id: 33, first_name: "Rajesh", last_name: "Kulkarni", email: "rajesh.kulkarni@np.com", dept_id: 6, manager_id: 29, hire_date: "2023-10-10", job_title: "Support Associate" },
  { emp_id: 34, first_name: "Simran", last_name: "Chadha", email: "simran.chadha@np.com", dept_id: null, manager_id: null, hire_date: "2023-11-11", job_title: "Contractor" },
  { emp_id: 35, first_name: "Zoya",   last_name: "Khan", email: "zoya.khan@np.com", dept_id: null, manager_id: null, hire_date: "2024-01-01", job_title: "Contractor" },
  { emp_id: 36, first_name: "Tarun",  last_name: "Oberoi", email: "tarun.oberoi@np.com", dept_id: 1, manager_id: 3, hire_date: "2024-03-15", job_title: "Software Engineer" },
  { emp_id: 37, first_name: "Bhavna", last_name: "Rathi", email: "bhavna.rathi@np.com", dept_id: 1, manager_id: 3, hire_date: "2024-06-01", job_title: "Software Engineer" },
  { emp_id: 38, first_name: "Om",     last_name: "Prakash", email: "om.prakash@np.com", dept_id: 2, manager_id: 11, hire_date: "2015-01-01", job_title: "Account Executive" },
  { emp_id: 39, first_name: "Kiran",  last_name: "Suri", email: "kiran.suri@np.com", dept_id: 3, manager_id: 17, hire_date: "2016-01-01", job_title: "Content Strategist" },
  { emp_id: 40, first_name: "Nitin",  last_name: "Grover", email: "nitin.grover@np.com", dept_id: 5, manager_id: 26, hire_date: "2017-01-01", job_title: "Financial Analyst" }
];

export const salariesData = [
  { salary_id: 1, emp_id: 1, amount: 4500000, effective_date: "2015-03-01", currency: "USD" },
  { salary_id: 2, emp_id: 1, amount: 5200000, effective_date: "2020-01-01", currency: "USD" },
  { salary_id: 3, emp_id: 2, amount: 3200000, effective_date: "2016-06-15", currency: "USD" },
  { salary_id: 4, emp_id: 2, amount: 3800000, effective_date: "2021-01-01", currency: "USD" },
  { salary_id: 5, emp_id: 3, amount: 1800000, effective_date: "2017-01-10", currency: "USD" },
  { salary_id: 6, emp_id: 3, amount: 2200000, effective_date: "2020-01-01", currency: "USD" },
  { salary_id: 7, emp_id: 3, amount: 2600000, effective_date: "2023-01-01", currency: "USD" },
  { salary_id: 8, emp_id: 4, amount: 1500000, effective_date: "2018-02-20", currency: "USD" },
  { salary_id: 9, emp_id: 4, amount: 1900000, effective_date: "2021-01-01", currency: "USD" },
  { salary_id: 10, emp_id: 5, amount: 1500000, effective_date: "2019-07-01", currency: "USD" },
  { salary_id: 11, emp_id: 5, amount: 1900000, effective_date: "2022-01-01", currency: "USD" },
  { salary_id: 12, emp_id: 6, amount: 900000, effective_date: "2020-01-15", currency: "USD" },
  { salary_id: 13, emp_id: 7, amount: 950000, effective_date: "2021-03-22", currency: "USD" },
  { salary_id: 14, emp_id: 8, amount: 1000000, effective_date: "2022-05-30", currency: "USD" },
  { salary_id: 15, emp_id: 9, amount: 400000, effective_date: "2023-08-01", currency: "USD" },
  { salary_id: 16, emp_id: 10, amount: 4800000, effective_date: "2014-11-01", currency: "USD" },
  { salary_id: 17, emp_id: 10, amount: 5500000, effective_date: "2020-01-01", currency: "USD" },
  { salary_id: 18, emp_id: 11, amount: 3000000, effective_date: "2016-04-12", currency: "USD" },
  { salary_id: 19, emp_id: 11, amount: 3600000, effective_date: "2021-01-01", currency: "USD" },
  { salary_id: 20, emp_id: 12, amount: 1600000, effective_date: "2018-09-09", currency: "USD" },
  { salary_id: 21, emp_id: 13, amount: 1600000, effective_date: "2019-10-10", currency: "USD" },
  { salary_id: 22, emp_id: 14, amount: 1100000, effective_date: "2020-12-01", currency: "USD" },
  { salary_id: 23, emp_id: 15, amount: 1100000, effective_date: "2021-06-06", currency: "USD" },
  { salary_id: 24, emp_id: 16, amount: 4200000, effective_date: "2015-05-05", currency: "USD" },
  { salary_id: 25, emp_id: 17, amount: 2800000, effective_date: "2017-07-07", currency: "USD" },
  { salary_id: 26, emp_id: 18, amount: 1700000, effective_date: "2019-03-03", currency: "USD" },
  { salary_id: 27, emp_id: 19, amount: 1750000, effective_date: "2020-08-08", currency: "USD" },
  { salary_id: 28, emp_id: 20, amount: 1400000, effective_date: "2022-02-02", currency: "USD" },
  { salary_id: 29, emp_id: 21, amount: 4600000, effective_date: "2013-01-01", currency: "USD" },
  { salary_id: 30, emp_id: 22, amount: 2600000, effective_date: "2017-11-11", currency: "USD" },
  { salary_id: 31, emp_id: 23, amount: 1300000, effective_date: "2020-04-04", currency: "USD" },
  { salary_id: 32, emp_id: 24, amount: 1300000, effective_date: "2021-09-09", currency: "USD" },
  { salary_id: 33, emp_id: 25, amount: 6000000, effective_date: "2012-01-01", currency: "USD" },
  { salary_id: 34, emp_id: 26, amount: 2900000, effective_date: "2016-02-02", currency: "USD" },
  { salary_id: 35, emp_id: 27, amount: 1650000, effective_date: "2019-05-05", currency: "USD" },
  { salary_id: 36, emp_id: 28, amount: 1650000, effective_date: "2021-01-01", currency: "USD" },
  { salary_id: 37, emp_id: 29, amount: 1450000, effective_date: "2018-06-06", currency: "USD" },
  { salary_id: 38, emp_id: 30, amount: 1050000, effective_date: "2020-07-07", currency: "USD" },
  { salary_id: 39, emp_id: 31, amount: 1050000, effective_date: "2021-08-08", currency: "USD" },
  { salary_id: 40, emp_id: 32, amount: 1080000, effective_date: "2022-09-09", currency: "USD" },
  { salary_id: 41, emp_id: 33, amount: 1000000, effective_date: "2023-10-10", currency: "USD" },
  { salary_id: 42, emp_id: 34, amount: 1200000, effective_date: "2023-11-11", currency: "USD" },
  { salary_id: 43, emp_id: 35, amount: 1200000, effective_date: "2024-01-01", currency: "USD" },
  { salary_id: 44, emp_id: 36, amount: 1600000, effective_date: "2024-03-15", currency: "USD" },
  { salary_id: 45, emp_id: 37, amount: 1600000, effective_date: "2024-06-01", currency: "USD" },
  { salary_id: 46, emp_id: 38, amount: 1650000, effective_date: "2015-01-01", currency: "USD" },
  { salary_id: 47, emp_id: 39, amount: 1750000, effective_date: "2016-01-01", currency: "USD" },
  { salary_id: 48, emp_id: 40, amount: 1650000, effective_date: "2017-01-01", currency: "USD" }
];

export const projectsData = [
  { project_id: 1, project_name: "Checkout Revamp", dept_id: 1, start_date: "2023-01-01", end_date: "2023-08-01", status: "Completed" },
  { project_id: 2, project_name: "Mobile App v2", dept_id: 1, start_date: "2023-06-01", end_date: null, status: "Active" },
  { project_id: 3, project_name: "Data Platform Migration", dept_id: 1, start_date: "2024-01-01", end_date: null, status: "Active" },
  { project_id: 4, project_name: "Q3 Sales Push", dept_id: 2, start_date: "2023-07-01", end_date: "2023-09-30", status: "Completed" },
  { project_id: 5, project_name: "CRM Overhaul", dept_id: 2, start_date: "2024-02-01", end_date: null, status: "Active" },
  { project_id: 6, project_name: "Brand Refresh", dept_id: 3, start_date: "2023-03-01", end_date: "2023-05-01", status: "Completed" },
  { project_id: 7, project_name: "SEO Revamp", dept_id: 3, start_date: "2024-01-01", end_date: null, status: "Active" },
  { project_id: 8, project_name: "Recruitment Drive 2024", dept_id: 4, start_date: "2024-01-01", end_date: "2024-06-01", status: "Completed" },
  { project_id: 9, project_name: "Budget Automation", dept_id: 5, start_date: "2023-05-01", end_date: "2023-12-01", status: "Completed" },
  { project_id: 10, project_name: "Support Ticket AI", dept_id: 6, start_date: "2024-03-01", end_date: null, status: "Active" },
  { project_id: 11, project_name: "Legacy Cleanup", dept_id: 1, start_date: "2022-01-01", end_date: "2022-03-01", status: "Cancelled" },
  { project_id: 12, project_name: "Unassigned Research", dept_id: null, start_date: "2024-01-01", end_date: null, status: "Planned" }
];

export const employeeProjectsData = [
  { emp_id: 3, project_id: 1, role: "Lead Developer", hours_logged: 420 },
  { emp_id: 4, project_id: 1, role: "Developer", hours_logged: 380 },
  { emp_id: 5, project_id: 1, role: "Developer", hours_logged: 350 },
  { emp_id: 3, project_id: 2, role: "Tech Lead", hours_logged: 200 },
  { emp_id: 6, project_id: 2, role: "Developer", hours_logged: 150 },
  { emp_id: 7, project_id: 2, role: "Developer", hours_logged: 140 },
  { emp_id: 36, project_id: 3, role: "Data Engineer", hours_logged: 90 },
  { emp_id: 37, project_id: 3, role: "Data Engineer", hours_logged: 85 },
  { emp_id: 2, project_id: 3, role: "Sponsor", hours_logged: 20 },
  { emp_id: 12, project_id: 4, role: "Account Lead", hours_logged: 300 },
  { emp_id: 13, project_id: 4, role: "Account Executive", hours_logged: 280 },
  { emp_id: 38, project_id: 4, role: "Account Executive", hours_logged: 270 },
  { emp_id: 11, project_id: 5, role: "Project Sponsor", hours_logged: 60 },
  { emp_id: 14, project_id: 5, role: "SDR", hours_logged: 220 },
  { emp_id: 15, project_id: 5, role: "SDR", hours_logged: 210 },
  { emp_id: 17, project_id: 6, role: "Marketing Lead", hours_logged: 180 },
  { emp_id: 18, project_id: 6, role: "Strategist", hours_logged: 170 },
  { emp_id: 19, project_id: 7, role: "SEO Lead", hours_logged: 140 },
  { emp_id: 39, project_id: 7, role: "Content", hours_logged: 130 },
  { emp_id: 22, project_id: 8, role: "HR Lead", hours_logged: 160 },
  { emp_id: 23, project_id: 8, role: "Recruiter", hours_logged: 150 },
  { emp_id: 24, project_id: 8, role: "Recruiter", hours_logged: 145 },
  { emp_id: 26, project_id: 9, role: "Finance Lead", hours_logged: 110 },
  { emp_id: 27, project_id: 9, role: "Analyst", hours_logged: 100 },
  { emp_id: 40, project_id: 9, role: "Analyst", hours_logged: 95 }
];

export const fullSqlScript = `-- =========================================================================
-- NORTHPEAK CORP COMPLETE DATABASE SETUP SCRIPT (DDL & DML SEED)
-- =========================================================================

-- 1. CLEANUP PREVIOUS TABLES (ORDER MATTERS DUE TO FOREIGN KEY CONSTRAINTS)
DROP TABLE IF EXISTS employee_projects CASCADE;
DROP TABLE IF EXISTS salaries CASCADE;
DROP TABLE IF EXISTS projects CASCADE;
DROP TABLE IF EXISTS employees CASCADE;
DROP TABLE IF EXISTS departments CASCADE;

-- 2. CREATE DEPARTMENTS SCHEMA
CREATE TABLE departments (
    dept_id     INT PRIMARY KEY,
    dept_name   VARCHAR(50) NOT NULL UNIQUE,
    location    VARCHAR(50),
    budget      NUMERIC(12,2) CHECK (budget >= 0)
);

-- 3. CREATE EMPLOYEES SCHEMA
CREATE TABLE employees (
    emp_id      INT PRIMARY KEY,
    first_name  VARCHAR(30) NOT NULL,
    last_name   VARCHAR(30) NOT NULL,
    email       VARCHAR(100) UNIQUE,
    dept_id     INT REFERENCES departments(dept_id),
    manager_id  INT REFERENCES employees(emp_id),
    hire_date   DATE NOT NULL,
    job_title   VARCHAR(50)
);

-- 4. CREATE SALARIES SCHEMA
CREATE TABLE salaries (
    salary_id      INT PRIMARY KEY,
    emp_id         INT NOT NULL REFERENCES employees(emp_id),
    amount         NUMERIC(10,2) CHECK (amount > 0),
    effective_date DATE NOT NULL,
    currency       VARCHAR(3) DEFAULT 'USD'
);

-- 5. CREATE PROJECTS SCHEMA
CREATE TABLE projects (
    project_id    INT PRIMARY KEY,
    project_name  VARCHAR(100) NOT NULL,
    dept_id       INT REFERENCES departments(dept_id),
    start_date    DATE NOT NULL,
    end_date      DATE,                      -- NULL = ongoing
    status        VARCHAR(20) CHECK (status IN ('Planned','Active','Completed','Cancelled'))
);

-- 6. CREATE EMPLOYEE PROJECTS BRIDGE SCHEMA
CREATE TABLE employee_projects (
    emp_id        INT REFERENCES employees(emp_id),
    project_id    INT REFERENCES projects(project_id),
    role          VARCHAR(50),
    hours_logged  INT DEFAULT 0,
    PRIMARY KEY (emp_id, project_id)
);

-- =========================================================================
-- SEED DATA INSERTS
-- =========================================================================

-- Insert Departments
INSERT INTO departments (dept_id, dept_name, location, budget) VALUES
(1, 'Engineering', 'Bengaluru', 5000000.00),
(2, 'Sales', 'Mumbai', 2000000.00),
(3, 'Marketing', 'Delhi', 1200000.00),
(4, 'HR', 'Bengaluru', 800000.00),
(5, 'Finance', 'Mumbai', 1500000.00),
(6, 'Customer Support', 'Pune', 900000.00),
(7, 'Legal', 'Delhi', 600000.00),
(8, 'R&D Satellite', 'Hyderabad', NULL);

-- Insert Employees
INSERT INTO employees (emp_id, first_name, last_name, email, dept_id, manager_id, hire_date, job_title) VALUES
(1,  'Ravi',   'Sharma',   'ravi.sharma@np.com',   1, NULL, '2015-03-01', 'VP Engineering'),
(2,  'Anita',  'Verma',    'anita.verma@np.com',   1, 1,    '2016-06-15', 'Engineering Manager'),
(3,  'Alex',   'Kim',      'alex.kim1@np.com',     1, 2,    '2017-01-10', 'Senior Software Engineer'),
(4,  'Priya',  'Nair',     'priya.nair@np.com',    1, 2,    '2018-02-20', 'Software Engineer'),
(5,  'Alex',   'Kim',      'alex.kim2@np.com',     1, 2,    '2019-07-01', 'Software Engineer'),
(6,  'Divya',  'Rao',      NULL,                   1, 3,    '2020-01-15', 'Junior Engineer'),
(7,  'Karan',  'Mehta',    'karan.mehta@np.com',   1, 3,    '2021-03-22', 'Junior Engineer'),
(8,  'Sneha',  'Iyer',     'sneha.iyer@np.com',    1, 3,    '2022-05-30', 'QA Engineer'),
(9,  'Arjun',  'Gupta',    'arjun.gupta@np.com',   1, NULL, '2023-08-01', 'Intern'),
(10, 'Meera',  'Pillai',   'meera.pillai@np.com',  2, NULL, '2014-11-01', 'VP Sales'),
(11, 'Rohan',  'Desai',    'rohan.desai@np.com',   2, 10,   '2016-04-12', 'Sales Manager'),
(12, 'Kavya',  'Menon',    'kavya.menon@np.com',   2, 11,   '2018-09-09', 'Account Executive'),
(13, 'Vikram', 'Joshi',    'vikram.joshi@np.com',  2, 11,   '2019-10-10', 'Account Executive'),
(14, 'Neha',   'Kapoor',   'neha.kapoor@np.com',   2, 11,   '2020-12-01', 'Sales Development Rep'),
(15, 'Suresh', 'Reddy',    'suresh.reddy@np.com',  2, 11,   '2021-06-06', 'Sales Development Rep'),
(16, 'Pooja',  'Bhatt',    'pooja.bhatt@np.com',   3, NULL, '2015-05-05', 'VP Marketing'),
(17, 'Aditya', 'Chawla',   'aditya.chawla@np.com', 3, 16,   '2017-07-07', 'Marketing Manager'),
(18, 'Ishita', 'Saxena',   'ishita.saxena@np.com', 3, 17,   '2019-03-03', 'Content Strategist'),
(19, 'Manish', 'Trivedi',  'manish.trivedi@np.com',3, 17,   '2020-08-08', 'SEO Specialist'),
(20, 'Ritu',   'Chopra',   'ritu.chopra@np.com',   3, 17,   '2022-02-02', 'Marketing Analyst'),
(21, 'Deepak', 'Malhotra', 'deepak.malhotra@np.com',4, NULL, '2013-01-01', 'HR Director'),
(22, 'Shreya', 'Agarwal',  'shreya.agarwal@np.com',4, 21,   '2017-11-11', 'HR Manager'),
(23, 'Nikhil', 'Bose',     'nikhil.bose@np.com',   4, 22,   '2020-04-04', 'Recruiter'),
(24, 'Tanvi',  'Shah',     'tanvi.shah@np.com',    4, 22,   '2021-09-09', 'Recruiter'),
(25, 'Amitabh','Sinha',    'amitabh.sinha@np.com', 5, NULL, '2012-01-01', 'CFO'),
(26, 'Lakshmi','Krishnan', 'lakshmi.krishnan@np.com',5, 25,  '2016-02-02', 'Finance Manager'),
(27, 'Rahul',  'Bansal',   'rahul.bansal@np.com',  5, 26,   '2019-05-05', 'Financial Analyst'),
(28, 'Swati',  'Nambiar',  'swati.nambiar@np.com', 5, 26,   '2021-01-01', 'Financial Analyst'),
(29, 'Harish', 'Pandey',   'harish.pandey@np.com', 6, NULL, '2018-06-06', 'Support Lead'),
(30, 'Fatima', 'Sheikh',   'fatima.sheikh@np.com', 6, 29,   '2020-07-07', 'Support Associate'),
(31, 'Yusuf',  'Ansari',   'yusuf.ansari@np.com',  6, 29,   '2021-08-08', 'Support Associate'),
(32, 'Gauri',  'Deshmukh', 'gauri.deshmukh@np.com',6, 29,   '2022-09-09', 'Support Associate'),
(33, 'Rajesh', 'Kulkarni', 'rajesh.kulkarni@np.com',6, 29,   '2023-10-10', 'Support Associate'),
(34, 'Simran', 'Chadha',   'simran.chadha@np.com', NULL, NULL, '2023-11-11', 'Contractor'),
(35, 'Zoya',   'Khan',     'zoya.khan@np.com',     NULL, NULL, '2024-01-01', 'Contractor'),
(36, 'Tarun',  'Oberoi',   'tarun.oberoi@np.com',  1, 3,    '2024-03-15', 'Software Engineer'),
(37, 'Bhavna', 'Rathi',    'bhavna.rathi@np.com',  1, 3,    '2024-06-01', 'Software Engineer'),
(38, 'Om',     'Prakash',  'om.prakash@np.com',    2, 11,   '2015-01-01', 'Account Executive'),
(39, 'Kiran',  'Suri',     'kiran.suri@np.com',    3, 17,   '2016-01-01', 'Content Strategist'),
(40, 'Nitin',  'Grover',   'nitin.grover@np.com',  5, 26,   '2017-01-01', 'Financial Analyst');

-- Insert Salaries
INSERT INTO salaries (salary_id, emp_id, amount, effective_date, currency) VALUES
(1,1,4500000,'2015-03-01','USD'),(2,1,5200000,'2020-01-01','USD'),
(3,2,3200000,'2016-06-15','USD'),(4,2,3800000,'2021-01-01','USD'),
(5,3,1800000,'2017-01-10','USD'),(6,3,2200000,'2020-01-01','USD'),(7,3,2600000,'2023-01-01','USD'),
(8,4,1500000,'2018-02-20','USD'),(9,4,1900000,'2021-01-01','USD'),
(10,5,1500000,'2019-07-01','USD'),(11,5,1900000,'2022-01-01','USD'),
(12,6,900000,'2020-01-15','USD'),
(13,7,950000,'2021-03-22','USD'),
(14,8,1000000,'2022-05-30','USD'),
(15,9,400000,'2023-08-01','USD'),
(16,10,4800000,'2014-11-01','USD'),(17,10,5500000,'2020-01-01','USD'),
(18,11,3000000,'2016-04-12','USD'),(19,11,3600000,'2021-01-01','USD'),
(20,12,1600000,'2018-09-09','USD'),
(21,13,1600000,'2019-10-10','USD'),
(22,14,1100000,'2020-12-01','USD'),
(23,15,1100000,'2021-06-06','USD'),
(24,16,4200000,'2015-05-05','USD'),
(25,17,2800000,'2017-07-07','USD'),
(26,18,1700000,'2019-03-03','USD'),
(27,19,1750000,'2020-08-08','USD'),
(28,20,1400000,'2022-02-02','USD'),
(29,21,4600000,'2013-01-01','USD'),
(30,22,2600000,'2017-11-11','USD'),
(31,23,1300000,'2020-04-04','USD'),
(32,24,1300000,'2021-09-09','USD'),
(33,25,6000000,'2012-01-01','USD'),
(34,26,2900000,'2016-02-02','USD'),
(35,27,1650000,'2019-05-05','USD'),
(36,28,1650000,'2021-01-01','USD'),
(37,29,1450000,'2018-06-06','USD'),
(38,30,1050000,'2020-07-07','USD'),
(39,31,1050000,'2021-08-08','USD'),
(40,32,1080000,'2022-09-09','USD'),
(41,33,1000000,'2023-10-10','USD'),
(42,34,1200000,'2023-11-11','USD'),
(43,35,1200000,'2024-01-01','USD'),
(44,36,1600000,'2024-03-15','USD'),
(45,37,1600000,'2024-06-01','USD'),
(46,38,1650000,'2015-01-01','USD'),
(47,39,1750000,'2016-01-01','USD'),
(48,40,1650000,'2017-01-01','USD');

-- Insert Projects
INSERT INTO projects (project_id, project_name, dept_id, start_date, end_date, status) VALUES
(1,'Checkout Revamp',1,'2023-01-01','2023-08-01','Completed'),
(2,'Mobile App v2',1,'2023-06-01',NULL,'Active'),
(3,'Data Platform Migration',1,'2024-01-01',NULL,'Active'),
(4,'Q3 Sales Push',2,'2023-07-01','2023-09-30','Completed'),
(5,'CRM Overhaul',2,'2024-02-01',NULL,'Active'),
(6,'Brand Refresh',3,'2023-03-01','2023-05-01','Completed'),
(7,'SEO Revamp',3,'2024-01-01',NULL,'Active'),
(8,'Recruitment Drive 2024',4,'2024-01-01','2024-06-01','Completed'),
(9,'Budget Automation',5,'2023-05-01','2023-12-01','Completed'),
(10,'Support Ticket AI',6,'2024-03-01',NULL,'Active'),
(11,'Legacy Cleanup',1,'2022-01-01','2022-03-01','Cancelled'),
(12,'Unassigned Research',NULL,'2024-01-01',NULL,'Planned');

-- Insert Employee Projects
INSERT INTO employee_projects (emp_id, project_id, role, hours_logged) VALUES
(3,1,'Lead Developer',420),(4,1,'Developer',380),(5,1,'Developer',350),
(3,2,'Tech Lead',200),(6,2,'Developer',150),(7,2,'Developer',140),
(36,3,'Data Engineer',90),(37,3,'Data Engineer',85),(2,3,'Sponsor',20),
(12,4,'Account Lead',300),(13,4,'Account Executive',280),(38,4,'Account Executive',270),
(11,5,'Project Sponsor',60),(14,5,'SDR',220),(15,5,'SDR',210),
(17,6,'Marketing Lead',180),(18,6,'Strategist',170),
(19,7,'SEO Lead',140),(39,7,'Content',130),
(22,8,'HR Lead',160),(23,8,'Recruiter',150),(24,8,'Recruiter',145),
(26,9,'Finance Lead',110),(27,9,'Analyst',100),(40,9,'Analyst',95);
`;
