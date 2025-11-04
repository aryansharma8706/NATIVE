const axios = require('axios');

const API_BASE = 'http://localhost:5000/api';

async function setupDemoData() {
  try {
    console.log('🚀 Setting up demo data for Classroom Assignment Portal...\n');

    // 1. Login as Teacher (or create if doesn't exist)
    console.log('👨‍🏫 Logging in as teacher...');
    let teacherToken;
    try {
      const teacherResponse = await axios.post(`${API_BASE}/auth/login`, {
        email: 'teacher@demo.com',
        password: 'password123'
      });
      teacherToken = teacherResponse.data.token;
      console.log('✅ Teacher logged in: teacher@demo.com');
    } catch (error) {
      // If login fails, create new teacher
      const teacherResponse = await axios.post(`${API_BASE}/auth/register`, {
        email: 'teacher@demo.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Smith',
        role: 'teacher'
      });
      teacherToken = teacherResponse.data.token;
      console.log('✅ Teacher created: John Smith (teacher@demo.com)');
    }

    // 2. Create Student Accounts
    console.log('\n👨‍🎓 Creating student accounts...');
    const students = [
      { email: 'alice@student.com', firstName: 'Alice', lastName: 'Johnson' },
      { email: 'bob@student.com', firstName: 'Bob', lastName: 'Wilson' },
      { email: 'carol@student.com', firstName: 'Carol', lastName: 'Davis' },
      { email: 'david@student.com', firstName: 'David', lastName: 'Brown' }
    ];

    const studentTokens = [];
    for (const student of students) {
      try {
        // Try to login first
        const response = await axios.post(`${API_BASE}/auth/login`, {
          email: student.email,
          password: 'password123'
        });
        studentTokens.push(response.data.token);
        console.log(`✅ Student logged in: ${student.firstName} ${student.lastName}`);
      } catch (error) {
        // If login fails, create new student
        const response = await axios.post(`${API_BASE}/auth/register`, {
          ...student,
          password: 'password123',
          role: 'student'
        });
        studentTokens.push(response.data.token);
        console.log(`✅ Student created: ${student.firstName} ${student.lastName} (${student.email})`);
      }
    }

    // 3. Create Classrooms
    console.log('\n🏫 Creating classrooms...');
    const classrooms = [
      {
        name: 'Web Development Fundamentals',
        description: 'Learn HTML, CSS, JavaScript, and React',
        subject: 'Computer Science'
      },
      {
        name: 'Data Structures & Algorithms',
        description: 'Advanced programming concepts and problem solving',
        subject: 'Computer Science'
      }
    ];

    const createdClassrooms = [];
    for (const classroom of classrooms) {
      const response = await axios.post(`${API_BASE}/classrooms`, classroom, {
        headers: { Authorization: `Bearer ${teacherToken}` }
      });
      createdClassrooms.push(response.data.classroom);
      console.log(`✅ Classroom created: ${classroom.name} (Code: ${response.data.classroom.classCode})`);
    }

    // 4. Students Join Classrooms
    console.log('\n🎯 Students joining classrooms...');
    for (let i = 0; i < studentTokens.length; i++) {
      for (const classroom of createdClassrooms) {
        await axios.post(`${API_BASE}/classrooms/join`, {
          classCode: classroom.classCode
        }, {
          headers: { Authorization: `Bearer ${studentTokens[i]}` }
        });
      }
      console.log(`✅ ${students[i].firstName} joined all classrooms`);
    }

    // 5. Create Assignments
    console.log('\n📝 Creating assignments...');
    const assignments = [
      {
        title: 'HTML & CSS Portfolio',
        description: 'Create a personal portfolio website using HTML and CSS',
        classroom: createdClassrooms[0]._id,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
        maxPoints: 100,
        instructions: 'Create a responsive portfolio website with at least 3 pages: Home, About, and Projects. Use modern CSS techniques including Flexbox or Grid.',
        category: 'project',
        allowLateSubmissions: true,
        latePenalty: 10
      },
      {
        title: 'JavaScript Quiz',
        description: 'Test your knowledge of JavaScript fundamentals',
        classroom: createdClassrooms[0]._id,
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days from now
        maxPoints: 50,
        instructions: 'Complete the online quiz covering variables, functions, arrays, and objects in JavaScript.',
        category: 'quiz',
        allowLateSubmissions: false
      },
      {
        title: 'Binary Search Implementation',
        description: 'Implement binary search algorithm in your preferred language',
        classroom: createdClassrooms[1]._id,
        dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days from now
        maxPoints: 75,
        instructions: 'Write a function that implements binary search. Include time complexity analysis and test cases.',
        category: 'homework',
        allowLateSubmissions: true,
        latePenalty: 15
      }
    ];

    const createdAssignments = [];
    for (const assignment of assignments) {
      const response = await axios.post(`${API_BASE}/assignments`, assignment, {
        headers: { Authorization: `Bearer ${teacherToken}` }
      });
      createdAssignments.push(response.data.assignment);
      console.log(`✅ Assignment created: ${assignment.title}`);

      // Publish the assignment
      await axios.patch(`${API_BASE}/assignments/${response.data.assignment._id}/publish`, {
        isPublished: true
      }, {
        headers: { Authorization: `Bearer ${teacherToken}` }
      });
      console.log(`📢 Assignment published: ${assignment.title}`);
    }

    // 6. Create Sample Submissions
    console.log('\n📤 Creating sample submissions...');
    const submissions = [
      {
        assignmentId: createdAssignments[0]._id,
        content: 'I have created a responsive portfolio website with HTML5 semantic elements and modern CSS. The site includes a navigation menu, hero section, about page with my skills, and a projects gallery. I used CSS Grid for the layout and Flexbox for component alignment. The website is fully responsive and works on mobile devices.',
        studentIndex: 0
      },
      {
        assignmentId: createdAssignments[1]._id,
        content: 'Completed the JavaScript quiz. I scored well on variables and functions but need to review array methods and object destructuring. The quiz helped me identify areas for improvement.',
        studentIndex: 1
      },
      {
        assignmentId: createdAssignments[2]._id,
        content: 'Here is my binary search implementation:\n\nfunction binarySearch(arr, target) {\n  let left = 0;\n  let right = arr.length - 1;\n  \n  while (left <= right) {\n    const mid = Math.floor((left + right) / 2);\n    if (arr[mid] === target) return mid;\n    if (arr[mid] < target) left = mid + 1;\n    else right = mid - 1;\n  }\n  return -1;\n}\n\nTime Complexity: O(log n)\nSpace Complexity: O(1)',
        studentIndex: 2
      }
    ];

    for (const submission of submissions) {
      await axios.post(`${API_BASE}/submissions`, {
        assignmentId: submission.assignmentId,
        content: submission.content
      }, {
        headers: { Authorization: `Bearer ${studentTokens[submission.studentIndex]}` }
      });
      console.log(`✅ Submission created by ${students[submission.studentIndex].firstName}`);
    }

    // 7. Grade Some Submissions
    console.log('\n🎯 Grading submissions...');
    const submissionsResponse = await axios.get(`${API_BASE}/submissions/assignment/${createdAssignments[0]._id}`, {
      headers: { Authorization: `Bearer ${teacherToken}` }
    });

    if (submissionsResponse.data.length > 0) {
      const submissionToGrade = submissionsResponse.data[0];
      await axios.patch(`${API_BASE}/submissions/${submissionToGrade._id}/grade`, {
        grade: 92,
        feedback: 'Excellent work! Your portfolio demonstrates strong understanding of HTML5 semantic elements and CSS layout techniques. The responsive design works well across devices. Consider adding some CSS animations for enhanced user experience.'
      }, {
        headers: { Authorization: `Bearer ${teacherToken}` }
      });
      console.log('✅ Graded portfolio submission: 92/100');
    }

    console.log('\n🎉 Demo data setup complete!');
    console.log('\n📋 Demo Accounts Created:');
    console.log('👨‍🏫 Teacher: teacher@demo.com / password123');
    console.log('👨‍🎓 Students:');
    students.forEach(student => {
      console.log(`   ${student.email} / password123`);
    });
    
    console.log('\n🏫 Classrooms Created:');
    createdClassrooms.forEach(classroom => {
      console.log(`   ${classroom.name} (Code: ${classroom.classCode})`);
    });

    console.log('\n🌐 Access the portal at: http://localhost:3000');
    console.log('📊 Try the Analytics dashboard and all features!');

  } catch (error) {
    console.error('❌ Error setting up demo data:', error.response?.data?.message || error.message);
  }
}

setupDemoData();