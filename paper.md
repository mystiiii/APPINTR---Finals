**APPINTERN CASE STUDY**

**Member Name 1: Ansell A. Fajardo**  
**Member Name 2: Lei Ivan Villacorta**

**Overtime & Timesheet Approval System**

**1\. Title of the Project**

TimeSync: A Case Study on an Overtime & Timesheet Approval System Using Django API and Frontend Integration

**2\. Background of the Case Study**

Time tracking using manual logs has been identified as one of the biggest challenges affecting organizations. According to research studies, time theft costs employers in the US about $11 billion per year, with buddy punching contributing about $373 million to this loss (Lift HCM, 2025). Also, about 49% of employees who use manual logs are likely to manipulate their working hours (Lift HCM, 2025). Apart from this, manual logs are often subject to human error, missing break times, and untimely log entry, making payroll difficult to complete and exposing the organization to heavy fines due to overtime violations (WorkMax, 2025).

**3\. Problem Statement**

Currently, the organization uses manual logs in its process of tracking overtime. Manual logs are very prone to rounding, illegibility, and untimely submission of entries. Additionally, manual logs do not provide sufficient control, leading to frequent occurrences of erroneous entries and increased time spent on administrative duties by managers when reconciling this data (Lift HCM, 2025). Therefore, there is a lack of an effective tool that guarantees pre-approval of additional hours by managers before processing the same with the finance office.

**4\. Objective of the Case Study**

The objective of this case study is to present a simple API-based timesheet system where Django serves as the backend and the frontend consumes the data through API requests.

Specific Objectives:

* To create a backend API using Django.  
* To connect the frontend to the backend API.  
* To manage regular employees, line managers, payroll officers, and overtime records.  
* To demonstrate how frontend and backend communicate in one system.

**5\. Proposed Solution**

The proposed solution is TimeSync, a time and overtime tracking system with two main parts:

* Backend using Django and Django REST Framework.  
* Frontend using HTML, Tailwind CSS, and JavaScript.

The Django backend provides API endpoints for retrieving, adding, updating, and deleting data. The frontend consumes these APIs and displays the data to the user. For example, when an employee logs into the frontend and submits an "Overtime Request" (detailing the date, hours, and business reason), the data is sent to the Django API. The backend assigns this request a "Pending Approval" state, saves it in the database, and sends a response back to the frontend.

**6\. Scope of the Case Study**

This case study covers the development of a centralized platform for managing overtime requests and approvals. It focuses on the following:

* Employee Management: Handling profiles for Regular Employees, Line Managers, and Payroll Officers.   
* Overtime Lifecycle: Submission of requests, status tracking (Pending/Approved), and manager review.   
* API Integration: Real-time communication between the Django backend and the web frontend.

Limitations:

* Web-based Only: The system is designed for browser use and does not include a native mobile application.   
* Notifications: There is no advanced real-time notification feature (e.g., email or SMS alerts).   
* Reporting: Only basic reporting for Payroll Officers is included, with no advanced data analytics.

**7\. System Architecture**  
The system follows a decoupled architecture where the frontend and backend interact through standardized API calls.

**Flow:**

**Frontend → API Request → Django Backend** **→ Database**

* **Frontend**: Serves as the user interface (UI) where employees submit requests and managers view dashboards.  
* **Django Backend**: Acts as the logic layer that processes requests, validates data, and manages states.  
* **Database**: Stores persistent data including user credentials and overtime records.

**8\. Tools and Technologies Used**

The following technologies were used to build the TimeSync system:

* **Backend**: Django  
* **API Framework**: Django REST Framework  
* **Frontend**: HTML, Tailwind CSS, and JavaScript  
* **Database**:   
* **API Testing**:   
* **Code Editor**: 

**9\. Main Features of the System**

* User Management  
* Overtime Submission  
* Approval Dashboard  
* Payroll Reporting  
* Data Synchronization

**10\. Sample API Use in the Case Study**

The frontend consumes the following backend endpoints using JavaScript fetch() or Axios to manage data flow:

* **GET /api/overtime/**: Retrieves a list of all overtime records for the dashboard.  
* **POST /api/overtime/submit/**: Sends new overtime request data to the backend.  
* **PATCH /api/overtime/approve/{id}/**: Updates a specific request status to "Approved".  
* **GET /api/users/**: Manages and displays information for the different system users.

**11\. Simple Database Entities**

The system relies on related tables to ensure data integrity and tracking:

* **Users** (Employees, Managers, and Payroll Officers)  
* **Overtime\_Requests** (dates, hours, reasons, and current status)  
* **Roles**: Defines the permissions for each user type.  
* **Logs**: Tracks the history of approvals and submissions.

**12\. Github Link:** [https://github.com/mystiiii/APPINTR---Finals](https://github.com/mystiiii/APPINTR---Finals)

**13\. Conclusion**

This case study demonstrates the effectiveness of using an API-based architecture to solve manual time-tracking issues. By utilizing Django for the backend and a modern JavaScript-driven frontend, TimeSync provides a clear separation of concerns that ensures system stability and scalability. This approach minimizes human error and "time theft," providing a reliable tool for organizational payroll management.

**References**

Lift HCM. (2025, October 2). *7 common problems with manual time tracking and how to fix them*. Retrieved April 6, 2026, from [https://lifthcm.com/article/manual-time-tracking-problems](https://lifthcm.com/article/manual-time-tracking-problems)

WorkMax. (2025, August 20). *The limitations of manual time tracking*. Retrieved April 6, 2026, from [https://workmax.com/resources/blog/the-limitations-of-manual-time-tracking/](https://workmax.com/resources/blog/the-limitations-of-manual-time-tracking/)

**APPINTERN CASE STUDY**  
**GRADING SHEET**  
**Member Name 1: 									Member Name 2: **						

**BorrowBox: A Case Study on an Equipment Borrowing System Using Django API and Frontend Integration**

| Criteria | Excellent | Good | Fair | Poor | Points |
| :---- | :---- | :---- | :---- | :---- | :---- |
| **1\. Case Study Document – 20 pts.** |  |  |  |  |  |
| Complete Sections | All required sections are complete | 1 section missing | 2–3 sections missing | More than 3 sections missing |           /10 |
| Clarity & Organization | Very clear, well-structured, easy to follow | Mostly clear with minor issues | Some parts unclear or disorganized | Difficult to understand |             /5 |
| Relevance to API-Based System | Strong focus on API architecture | Mostly aligned with API concept | Some parts not aligned | Not aligned with API concept |             /5 |
| **Django Backend API – 25 pts** |  |  |  |  |  |
| Django Setup & Structure | Proper project structure, no issues | Minor structure issues | Some incorrect setup | Not properly set up |             /5 |
| Use of Django REST Framework | Fully implemented and functional | Minor issues | Partially implemented | Not used or incorrect |             /5 |
| Working API Endpoints (CRUD) | All CRUD endpoints working | Minor errors in endpoints | Some endpoints missing | Not working |           /10 |
| Data Handling (Models/Relationships) | Well-structured and normalized | Minor issues in relationships | Some incorrect relationships | Poor or no structure |             /5 |
| **Frontend Implementation – 20 pts** |  |  |  |  |  |
| UI Structure (Forms/Tables) | Clean, complete, user-friendly UI | Minor UI issues | Basic UI only | Poor or incomplete UI |             /5 |
| API Consumption (fetch/Axios) | Fully working API calls | Minor issues | Partially working | Not working |           /10 |
| Data Display & Interaction | Data properly displayed and interactive | Minor issues | Limited interaction | No proper display |             /5 |
| **Integration (Frontend ↔ Backend) – 15 pts** |  |  |  |  |  |
| API Connection | Fully connected, no errors | Minor connection issues | Intermittent connection | Not connected |             /5 |
| Data Flow (Create & Read) | Data successfully created & retrieved | Minor issues | Partial functionality | Not working |             /5 |
| System Stability | No major errors during demo | Minor bugs | Several issues | System not stable |             /5 |
| **GitHub Repository – 10 pts** |  |  |  |  |  |
| Project Completeness | Full backend \+ frontend uploaded | Minor missing files | Several missing files | Incomplete repo |             /4 |
| Folder Structure | Clean and organized | Minor issues | Some disorganization | Messy structure |             /3 |
| README.md | Complete with setup \+ API \+ description | Missing 1–2 parts | Minimal content | No README |             /3 |
| **Presentation / Demo – 10 pts** |  |  |  |  |  |
| Explanation of System | Very clear and confident | Mostly clear | Some confusion | Cannot explain properly |             /4 |
| API Flow Demonstration | Clearly shows frontend ↔ backend flow | Minor gaps | Partial demo | No clear demo |             /4 |
| Q\&A | Answers all questions correctly | Minor mistakes | Limited answers | Cannot answer |             /2 |

**Total:**