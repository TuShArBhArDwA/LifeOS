// Prestored answers generated from Groq for demographic examples.
// This allows immediate response times and zero API usage for demo examples.

export const PRESTORED_ANSWERS: Record<string, any> = {
  "example-all": {
    "orchestrator": {
      "intent": "general",
      "confidence": 0.98,
      "summary": "TCS NQT campus placement drive details (June 12), registration deadline (June 9), study topics, travel/print expenses, and HOD NOC request have been processed.",
      "invoke_agents": ["task", "schedule", "placement", "reminder", "expense", "study", "content"],
      "extracted": {
        "company": "TCS",
        "deadline": "2026-06-09",
        "deadlines": [
          { "label": "TCS NQT Registration", "date": "2026-06-09" }
        ],
        "eligibility": {
          "min_cgpa": 6.5,
          "branches": ["CSE"],
          "backlogs_allowed": false
        },
        "documents_required": ["Resume draft", "Marks card"],
        "event_title": "TCS NQT Placement Drive",
        "event_date": "2026-06-12",
        "subjects": ["Aptitude", "DBMS"],
        "raw_text": "ALERT: TCS NQT campus placement notice received! Registration deadline: June 9, 2026..."
      }
    },
    "tasks": [
      {
        "title": "Register for TCS NQT Drive",
        "description": "Complete the online registration form on the college portal before June 9, 2026.",
        "priority": 1,
        "due_date": "2026-06-09",
        "agent_source": "placement_agent"
      },
      {
        "title": "Get Marks Card and Update Resume",
        "description": "Prepare a hard copy of your college marks card and polish your resume draft.",
        "priority": 1,
        "due_date": "2026-06-09",
        "agent_source": "placement_agent"
      },
      {
        "title": "Study Aptitude (Quant, Logic, Verbal)",
        "description": "Review reasoning questions and practice verbal sections.",
        "priority": 2,
        "due_date": "2026-06-11",
        "agent_source": "study_agent"
      },
      {
        "title": "Revise DBMS Core Concepts",
        "description": "Review SQL Joins, Indexing, Normalization (1NF to BCNF), and ACID properties.",
        "priority": 2,
        "due_date": "2026-06-11",
        "agent_source": "study_agent"
      },
      {
        "title": "Submit NOC Request to HOD",
        "description": "Print the drafted NOC request letter and get signatures from the CSE HOD.",
        "priority": 1,
        "due_date": "2026-06-08",
        "agent_source": "content_agent"
      }
    ],
    "events": [
      {
        "title": "TCS NQT Registration Deadline",
        "start_time": "2026-06-09T23:59:00",
        "end_time": "2026-06-09T23:59:00",
        "event_type": "deadline",
        "description": "Final date to register online for the TCS placement drive."
      },
      {
        "title": "TCS NQT Placement Drive",
        "start_time": "2026-06-12T10:00:00",
        "end_time": "2026-06-12T14:00:00",
        "event_type": "interview",
        "description": "Attend the campus placement drive at Auditorium B starting 10:00 AM."
      },
      {
        "title": "Study Block: Aptitude Practice",
        "start_time": "2026-06-08T09:00:00",
        "end_time": "2026-06-08T11:00:00",
        "event_type": "study_block",
        "description": "Practice quantitative and logical reasoning puzzles."
      },
      {
        "title": "Study Block: DBMS Revision",
        "start_time": "2026-06-10T19:00:00",
        "end_time": "2026-06-10T21:00:00",
        "event_type": "study_block",
        "description": "Revise SQL joins, indexing techniques, and BCNF properties."
      }
    ],
    "placement": {
      "company": "TCS",
      "role": "Systems Engineer (NQT)",
      "registration_deadline": "2026-06-09",
      "eligibility": {
        "eligible": true,
        "cgpa_check": { "required": 6.5, "actual": 9.2, "passed": true },
        "branch_check": { "required": ["CSE"], "actual": "CSE", "passed": true },
        "backlog_check": { "backlogs_allowed": false, "message": "No active backlogs allowed. Student profile lists 0 active backlogs." },
        "overall_reasons": [
          "CGPA of 9.2 exceeds the minimum 6.5 cut-off.",
          "Branch is CSE, which matches eligibility criteria.",
          "No active backlogs reported on current record."
        ],
        "missing_criteria": []
      },
      "missing_documents": ["Resume draft", "Marks card"],
      "documents_checklist": [
        { "doc": "Resume draft", "status": "needs_update" },
        { "doc": "Marks card", "status": "required" },
        { "doc": "College ID", "status": "likely_available" }
      ],
      "prep_plan": [
        {
          "week": 1,
          "label": "Week 1",
          "focus": "Aptitude and Logical Reasoning",
          "tasks": ["Complete 30 logical puzzle tasks", "Attempt 2 mock aptitude tests"]
        },
        {
          "week": 2,
          "label": "Week 2",
          "focus": "DBMS and Core CS Fundamentals",
          "tasks": ["Review SQL inner/outer joins", "Revise 1NF to BCNF rules and ACID properties"]
        }
      ],
      "quick_tips": [
        "Be ready to present a concise 1-minute pitch about your React/TypeScript projects.",
        "Ensure your dress code is strictly formal for the drive at Auditorium B."
      ]
    },
    "reminders": [
      {
        "message": "Register for TCS NQT Drive (Deadline Tomorrow!)",
        "remind_at": "2026-06-08T09:00:00"
      },
      {
        "message": "TCS NQT Placement Drive is tomorrow. Make sure documents are ready!",
        "remind_at": "2026-06-11T09:00:00"
      }
    ],
    "expense": {
      "expenses": [
        {
          "merchant": "Auto travel",
          "amount": 90,
          "currency": "INR",
          "category": "transport",
          "date": "2026-06-06",
          "description": "Travel to college for HOD signatures"
        },
        {
          "merchant": "Xerox center",
          "amount": 30,
          "currency": "INR",
          "category": "books",
          "date": "2026-06-06",
          "description": "Photocopy and printouts of resume"
        }
      ],
      "total": 120,
      "summary": "Spent ₹120 for auto travel and photocopy printouts.",
      "budget_tip": "Save transport costs by pooling rides with other students visiting campus."
    },
    "study": {
      "subject": "DBMS and Aptitude Prep",
      "summary_points": [
        "SQL Joins link rows from multiple tables based on common matching columns.",
        "Indexing is a data structure helper used to retrieve records faster.",
        "Normalization levels (1NF, 2NF, 3NF, BCNF) minimize data redundancy.",
        "ACID properties (Atomicity, Consistency, Isolation, Durability) guarantee database transaction safety.",
        "Quantitative, logical, and verbal puzzles are crucial topics for NQT."
      ],
      "flashcards": [
        {
          "question": "What is SQL Inner Join?",
          "answer": "A join that returns records which have matching values in both tables."
        },
        {
          "question": "What are ACID Properties?",
          "answer": "Atomicity (all/nothing), Consistency (validation rules), Isolation (separate execution), Durability (permanent storage)."
        },
        {
          "question": "What is the key difference between SJF and SRTF?",
          "answer": "SJF is non-preemptive CPU scheduling, while SRTF (Shortest Remaining Time First) is the preemptive version."
        }
      ],
      "quiz": [
        {
          "question": "Which database normalization form strictly removes partial dependencies?",
          "options": ["1NF", "2NF", "3NF", "BCNF"],
          "correct": 1,
          "explanation": "Second Normal Form (2NF) ensures that all non-prime attributes are fully functionally dependent on the primary key, eliminating partial dependencies."
        },
        {
          "question": "What is the purpose of database Indexing?",
          "options": ["Minimize disk storage", "Speed up query operations", "Encrypt sensitive data", "Enforce referential integrity"],
          "correct": 1,
          "explanation": "Indexing creates pointer structures that help queries locate specific rows without performing full table scans."
        }
      ],
      "study_tip": "Use quick Venn diagrams to memorize the differences between Left, Right, Inner, and Full outer SQL joins."
    },
    "content": {
      "content_type": "noc_request",
      "subject": "Request for No Objection Certificate (NOC) to Attend Campus Placement Drive",
      "recipient": "The Head of Department, CSE",
      "draft": "To,\nThe Head of Department,\nComputer Science & Engineering Department,\niQOO Institute of Tech\n\nSubject: Request for No Objection Certificate (NOC) to Attend Campus Placement Drive\n\nRespected Sir/Madam,\n\nI, Guest Student, a student of 3rd year Computer Science & Engineering (CGPA: 9.2), have been shortlisted to attend the TCS NQT campus placement drive scheduled for June 12, 2026. The drive will be conducted at Auditorium B starting at 10:00 AM.\n\nTo participate in this placement process, I am required to submit a No Objection Certificate (NOC) from the department. I kindly request you to issue the certificate to enable my participation in the drive.\n\nThanking you.\n\nYours sincerely,\nGuest Student\nEmail: guest@lifeos.ai",
      "tone": "formal",
      "word_count": 125,
      "usage_tip": "Print this letter, sign it, and hand it to the CSE department office for verification."
    }
  },
  "example-tcs": {
    "orchestrator": {
      "intent": "placement_notice",
      "confidence": 0.99,
      "summary": "TCS NQT Drive details received. Registration deadline: June 7, 2026. Venue: Auditorium A.",
      "invoke_agents": ["task", "schedule", "placement", "reminder"],
      "extracted": {
        "company": "TCS",
        "deadline": "2026-06-07",
        "deadlines": [
          { "label": "TCS NQT Registration", "date": "2026-06-07" }
        ],
        "eligibility": {
          "min_percentage": 60,
          "backlogs_allowed": false
        },
        "documents_required": ["Updated resume", "College ID", "10th & 12th marksheets"],
        "event_title": "TCS NQT Drive",
        "event_date": "2026-06-07",
        "raw_text": "TCS NQT Drive — Register by June 7, 2026. Eligibility: 60% aggregate..."
      }
    },
    "tasks": [
      {
        "title": "Register for TCS NQT Drive",
        "description": "Submit registration details online before the June 7 deadline.",
        "priority": 1,
        "due_date": "2026-06-07",
        "agent_source": "placement_agent"
      },
      {
        "title": "Assemble TCS NQT Documents",
        "description": "Print College ID, 10th & 12th marksheets, and update your resume.",
        "priority": 1,
        "due_date": "2026-06-07",
        "agent_source": "placement_agent"
      },
      {
        "title": "Prepare Resume copy",
        "description": "Print copies of your latest updated resume for the reporting at Auditorium A.",
        "priority": 2,
        "due_date": "2026-06-07",
        "agent_source": "placement_agent"
      }
    ],
    "events": [
      {
        "title": "TCS NQT Registration Deadline",
        "start_time": "2026-06-07T23:59:00",
        "end_time": "2026-06-07T23:59:00",
        "event_type": "deadline",
        "description": "Final chance to submit details for the TCS placement drive."
      },
      {
        "title": "TCS NQT Drive (Auditorium A)",
        "start_time": "2026-06-07T09:00:00",
        "end_time": "2026-06-07T13:00:00",
        "event_type": "interview",
        "description": "Report at Auditorium A at 9:00 AM sharp with required documents."
      }
    ],
    "placement": {
      "company": "TCS",
      "role": "Systems Engineer (NQT)",
      "registration_deadline": "2026-06-07",
      "eligibility": {
        "eligible": true,
        "cgpa_check": { "required": null, "actual": 9.2, "passed": true },
        "branch_check": { "required": null, "actual": "CSE", "passed": true },
        "backlog_check": { "backlogs_allowed": false, "message": "No active backlogs allowed." },
        "overall_reasons": ["Student has 9.2 CGPA and 0 active backlogs, passing the eligibility requirements."],
        "missing_criteria": []
      },
      "missing_documents": ["Updated resume", "10th & 12th marksheets"],
      "documents_checklist": [
        { "doc": "Updated resume", "status": "needs_update" },
        { "doc": "College ID", "status": "likely_available" },
        { "doc": "10th & 12th marksheets", "status": "required" }
      ],
      "prep_plan": [
        {
          "week": 1,
          "label": "Final Revision",
          "focus": "Aptitude and coding basics",
          "tasks": ["Revise common aptitude problems", "Perform a mock interview run"]
        }
      ],
      "quick_tips": [
        "Arrive at Auditorium A by 8:30 AM to complete sign-in requirements smoothly.",
        "Carry all requested marksheets in a neat document folder."
      ]
    },
    "reminders": [
      {
        "message": "Reminder: Register for TCS NQT Drive by tomorrow!",
        "remind_at": "2026-06-06T09:00:00"
      }
    ],
    "expense": null,
    "study": null,
    "content": null
  },
  "example-assignment": {
    "orchestrator": {
      "intent": "assignment",
      "confidence": 0.99,
      "summary": "DBMS Mini Project submission deadline identified (this Friday). Requires prototype and 5-page report.",
      "invoke_agents": ["task", "schedule", "reminder"],
      "extracted": {
        "assignment_title": "DBMS Mini Project",
        "deadline": "2026-06-12",
        "raw_text": "DBMS Mini Project submission is due this Friday. You need to submit a working prototype + 5-page report..."
      }
    },
    "tasks": [
      {
        "title": "Complete DBMS Working Prototype",
        "description": "Code the core database functionality and UI screens for the mini project.",
        "priority": 1,
        "due_date": "2026-06-10",
        "agent_source": "task_agent"
      },
      {
        "title": "Write 5-page Project Report",
        "description": "Draft report detailing Schema Design, ER Diagrams, and query screenshots.",
        "priority": 1,
        "due_date": "2026-06-11",
        "agent_source": "task_agent"
      },
      {
        "title": "Submit DBMS Project to Portal",
        "description": "Zip the prototype code + PDF report and upload to college portal.",
        "priority": 1,
        "due_date": "2026-06-12",
        "agent_source": "task_agent"
      }
    ],
    "events": [
      {
        "title": "DBMS Project Submission Due",
        "start_time": "2026-06-12T23:59:00",
        "end_time": "2026-06-12T23:59:00",
        "event_type": "deadline",
        "description": "Submit prototype code zip + 5-page report PDF onto college portal."
      },
      {
        "title": "Study Block: DBMS Prototype Coding",
        "start_time": "2026-06-09T19:00:00",
        "end_time": "2026-06-09T21:00:00",
        "event_type": "study_block",
        "description": "Focus on database connection and key schema configurations."
      },
      {
        "title": "Study Block: Writing Report",
        "start_time": "2026-06-11T09:00:00",
        "end_time": "2026-06-11T11:00:00",
        "event_type": "study_block",
        "description": "Organize sections for ER diagrams and database schemas."
      }
    ],
    "placement": null,
    "reminders": [
      {
        "message": "DBMS Project Submission is due tomorrow! Finalize your report.",
        "remind_at": "2026-06-11T09:00:00"
      }
    ],
    "expense": null,
    "study": null,
    "content": null
  },
  "example-exam": {
    "orchestrator": {
      "intent": "exam",
      "confidence": 0.99,
      "summary": "End Semester Exam timetable parsed. Core papers from June 15 to June 22, 2026.",
      "invoke_agents": ["task", "schedule", "reminder"],
      "extracted": {
        "deadlines": [
          { "label": "Data Structures Exam", "date": "2026-06-15" },
          { "label": "Operating Systems Exam", "date": "2026-06-18" },
          { "label": "Computer Networks Exam", "date": "2026-06-20" },
          { "label": "DBMS Exam", "date": "2026-06-22" }
        ],
        "subjects": ["Data Structures", "Operating Systems", "Computer Networks", "DBMS"],
        "raw_text": "End Semester Exams start June 15, 2026. Data Structures: June 15, Operating Systems: June 18..."
      }
    },
    "tasks": [
      {
        "title": "Revise Data Structures Syllabus",
        "description": "Go through trees, graphs, sorting, and search algorithms.",
        "priority": 1,
        "due_date": "2026-06-14",
        "agent_source": "task_agent"
      },
      {
        "title": "Review Operating Systems Topics",
        "description": "Prepare CPU Scheduling, Semaphores, and Page Replacement policies.",
        "priority": 2,
        "due_date": "2026-06-17",
        "agent_source": "task_agent"
      },
      {
        "title": "Revise DBMS Definitions",
        "description": "Revise SQL joins, normalization rules, and transaction control commands.",
        "priority": 3,
        "due_date": "2026-06-21",
        "agent_source": "task_agent"
      }
    ],
    "events": [
      {
        "title": "Exam: Data Structures",
        "start_time": "2026-06-15T10:00:00",
        "end_time": "2026-06-15T13:00:00",
        "event_type": "deadline",
        "description": "End semester exam in Data Structures."
      },
      {
        "title": "Exam: Operating Systems",
        "start_time": "2026-06-18T10:00:00",
        "end_time": "2026-06-18T13:00:00",
        "event_type": "deadline",
        "description": "End semester exam in Operating Systems."
      },
      {
        "title": "Exam: Computer Networks",
        "start_time": "2026-06-20T10:00:00",
        "end_time": "2026-06-20T13:00:00",
        "event_type": "deadline",
        "description": "End semester exam in Computer Networks."
      },
      {
        "title": "Exam: DBMS",
        "start_time": "2026-06-22T10:00:00",
        "end_time": "2026-06-22T13:00:00",
        "event_type": "deadline",
        "description": "End semester exam in DBMS."
      },
      {
        "title": "Study Block: DS Revision",
        "start_time": "2026-06-14T09:00:00",
        "end_time": "2026-06-14T11:00:00",
        "event_type": "study_block",
        "description": "Focus on array, list, queue, and sorting questions."
      }
    ],
    "placement": null,
    "reminders": [
      {
        "message": "Data Structures Exam is tomorrow at 10 AM. Sleep early!",
        "remind_at": "2026-06-14T09:00:00"
      }
    ],
    "expense": null,
    "study": null,
    "content": null
  },
  "example-expense": {
    "orchestrator": {
      "intent": "expense_receipt",
      "confidence": 0.99,
      "summary": "Total expense of ₹505 tracked (Canteen, Auto, Xerox, DSA Book).",
      "invoke_agents": ["expense"],
      "extracted": {
        "fee_amount": null,
        "raw_text": "Spent today: Canteen lunch ₹80, Auto to college ₹45, Xerox of notes ₹30, Amazon order — DSA book ₹350. Total: ₹505."
      }
    },
    "tasks": [],
    "events": [],
    "placement": null,
    "reminders": [],
    "expense": {
      "expenses": [
        {
          "merchant": "Canteen",
          "amount": 80,
          "currency": "INR",
          "category": "food",
          "date": "2026-06-06",
          "description": "Lunch"
        },
        {
          "merchant": "Auto",
          "amount": 45,
          "currency": "INR",
          "category": "transport",
          "date": "2026-06-06",
          "description": "Ride to college"
        },
        {
          "merchant": "Xerox",
          "amount": 30,
          "currency": "INR",
          "category": "books",
          "date": "2026-06-06",
          "description": "Photocopy of class notes"
        },
        {
          "merchant": "Amazon",
          "amount": 350,
          "currency": "INR",
          "category": "books",
          "date": "2026-06-06",
          "description": "DSA reference book purchase"
        }
      ],
      "total": 505,
      "summary": "Spent ₹505 today across food, transport, and books.",
      "budget_tip": "Buying second-hand books or using college library copies can reduce book costs."
    },
    "study": null,
    "content": null
  },
  "example-study": {
    "orchestrator": {
      "intent": "study_notes",
      "confidence": 0.98,
      "summary": "CPU scheduling lecture notes parsed. Preemptive vs Non-Preemptive scheduling and performance metrics structured.",
      "invoke_agents": ["study"],
      "extracted": {
        "subjects": ["Operating Systems"],
        "raw_text": "CPU Scheduling Notes: Scheduling is the process of deciding which process gets CPU time..."
      }
    },
    "tasks": [],
    "events": [],
    "placement": null,
    "reminders": [],
    "expense": null,
    "study": {
      "subject": "Operating Systems (CPU Scheduling)",
      "summary_points": [
        "CPU Scheduling is the process of allocating CPU time to executing processes.",
        "Preemptive scheduling allows task interruption (e.g. Round Robin, SRTF).",
        "Non-preemptive scheduling finishes task execution uninterrupted (e.g. FCFS, SJF).",
        "Turnaround Time is defined as Completion Time minus Arrival Time.",
        "Waiting Time is Turnaround Time minus Burst Time, evaluated via Gantt charts."
      ],
      "flashcards": [
        {
          "question": "What is Preemptive Scheduling?",
          "answer": "A scheduling process that can interrupt and halt a running task to run a higher priority task."
        },
        {
          "question": "What is the formula for Turnaround Time?",
          "answer": "Turnaround Time (TAT) = Completion Time (CT) - Arrival Time (AT)."
        },
        {
          "question": "What is the formula for Waiting Time?",
          "answer": "Waiting Time (WT) = Turnaround Time (TAT) - Burst Time (BT)."
        }
      ],
      "quiz": [
        {
          "question": "Which of the following algorithms is strictly non-preemptive?",
          "options": ["Round Robin", "First Come First Served (FCFS)", "Shortest Remaining Time First (SRTF)", "Priority Scheduling (Preemptive)"],
          "correct": 1,
          "explanation": "First Come First Served (FCFS) allocates CPU strictly based on entry order and runs to completion without interruption."
        },
        {
          "question": "What chart is commonly used to visualize process execution over a timeline?",
          "options": ["Flowchart", "Gantt Chart", "Venn Diagram", "UML Class Diagram"],
          "correct": 1,
          "explanation": "Gantt charts map process execution blocks along a horizontal timeline to compute TAT and WT easily."
        }
      ],
      "study_tip": "Draw the Gantt timeline carefully. Double check that CPU idle gaps are correctly inserted if arrival times are staggered."
    },
    "content": null
  },
  "example-content": {
    "orchestrator": {
      "intent": "content_request",
      "confidence": 0.99,
      "summary": "Draft leave application request for CSE HOD created for June 8-9 wedding travel.",
      "invoke_agents": ["content"],
      "extracted": {
        "raw_text": "Draft a leave application to the HOD of CSE department requesting 2 days of leave (June 8th and 9th)..."
      }
    },
    "tasks": [],
    "events": [],
    "placement": null,
    "reminders": [],
    "expense": null,
    "study": null,
    "content": {
      "content_type": "leave_application",
      "subject": "Application for 2 Days Leave (June 8th and 9th)",
      "recipient": "The Head of Department, Computer Science & Engineering",
      "draft": "To,\nThe Head of Department,\nComputer Science & Engineering Department,\niQOO Institute of Tech\n\nSubject: Application for 2 Days Leave - June 8th and 9th\n\nRespected Sir/Madam,\n\nI, Guest Student, a student of 3rd year Computer Science & Engineering, am writing to request leave of absence for 2 days, on June 8 and June 9, 2026.\n\nI need to travel out of station with my family to attend my cousin's wedding ceremony. I will make sure to catch up on any missed lectures and complete academic submissions as soon as I return.\n\nI kindly request you to approve my leave application for these dates.\n\nThanking you.\n\nYours sincerely,\nGuest Student\nRoll No: Guest_01\nEmail: guest@lifeos.ai",
      "tone": "formal",
      "word_count": 118,
      "usage_tip": "Review details, print, sign, and submit this physical copy to the department office."
    }
  }
};
