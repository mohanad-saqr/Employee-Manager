const mysql = require('mysql2');
const inquirer = require('inquirer');
require('console.table');

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'admin',
  database: 'employee_db'
});

connection.connect(err => {
  if (err) throw err;
  console.log('Connected to the employee_db database.');
  runPrompt();
});

function runPrompt() {
  inquirer.prompt([
    {
      type: 'list',
      name: 'action',
      message: 'What would you like to do?',
      choices: [
        'View all departments',
        'View all roles',
        'View all employees',
        'Add a department',
        'Add a role',
        'Add an employee',
        'Update an employee role',
        'Exit'
      ]
    }
  ]).then(answers => {
    switch (answers.action) {
      case 'View all departments':
        viewDepartments();
        break;
      case 'View all roles':
        viewRoles();
        break;
      case 'View all employees':
        viewEmployees();
        break;
      case 'Add a department':
        addDepartment();
        break;
      case 'Add a role':
        addRole();
        break;
      case 'Add an employee':
        addEmployee();
        break;
      case 'Update an employee role':
        updateEmployeeRole();
        break;
      default:
        connection.end();
        break;
    }
  });
}

function viewDepartments() {
  connection.promise().query('SELECT * FROM department')
    .then(([rows]) => {
      console.table(rows);
      runPrompt();
    })
    .catch(err => console.log(err));
}

function viewRoles() {
  connection.promise().query(`
    SELECT role.id, role.title, department.name AS department, role.salary
    FROM role
    JOIN department ON role.department_id = department.id`)
    .then(([rows]) => {
      console.table(rows);
      runPrompt();
    })
    .catch(err => console.log(err));
}

function viewEmployees() {
  connection.promise().query(`
    SELECT e.id, e.first_name, e.last_name, role.title, department.name AS department, role.salary, CONCAT(m.first_name, ' ', m.last_name) AS manager
    FROM employee e
    LEFT JOIN role ON e.role_id = role.id
    LEFT JOIN department ON role.department_id = department.id
    LEFT JOIN employee m ON e.manager_id = m.id`)
    .then(([rows]) => {
      console.table(rows);
      runPrompt();
    })
    .catch(err => console.log(err));
}

function addDepartment() {
  inquirer.prompt([
    {
      type: 'input',
      name: 'name',
      message: 'What is the name of the department?'
    }
  ]).then(answer => {
    connection.promise().query('INSERT INTO department (name) VALUES (?)', answer.name)
      .then(() => {
        console.log(`Added ${answer.name} to the database`);
        runPrompt();
      })
      .catch(err => console.log(err));
  });
}

function addRole() {
  connection.promise().query('SELECT * FROM department')
    .then(([rows]) => {
      const departments = rows.map(department => ({
        name: department.name,
        value: department.id
      }));
      inquirer.prompt([
        {
          type: 'input',
          name: 'title',
          message: 'What is the title of the role?'
        },
        {
          type: 'input',
          name: 'salary',
          message: 'What is the salary of the role?'
        },
        {
          type: 'list',
          name: 'department_id',
          message: 'Which department does the role belong to?',
          choices: departments
        }
      ]).then(answer => {
        connection.promise().query('INSERT INTO role (title, salary, department_id) VALUES (?, ?, ?)', [answer.title, answer.salary, answer.department_id])
          .then(() => {
            console.log(`Added ${answer.title} role to the database`);
            runPrompt();
          })
          .catch(err => console.log(err));
      });
    })
    .catch(err => console.log(err));
}

function addEmployee() {
  getRoles().then(roles => {
    getEmployees().then(employees => {
      inquirer.prompt([
        {
          type: 'input',
          name: 'first_name',
          message: "What is the employee's first name?"
        },
        {
          type: 'input',
          name: 'last_name',
          message: "What is the employee's last name?"
        },
        {
          type: 'list',
          name: 'role_id',
          message: "What is the employee's role?",
          choices: roles
        },
        {
          type: 'list',
          name: 'manager_id',
          message: "Who is the employee's manager?",
          choices: employees
        }
      ]).then(answer => {
        connection.promise().query('INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES (?, ?, ?, ?)', [answer.first_name, answer.last_name, answer.role_id, answer.manager_id])
          .then(() => {
            console.log(`Added ${answer.first_name} ${answer.last_name} to the database`);
            runPrompt();
          })
          .catch(err => console.log(err));
      });
    });
  });
}

function updateEmployeeRole() {
  getEmployees().then(employees => {
    getRoles().then(roles => {
      inquirer.prompt([
        {
          type: 'list',
          name: 'employee_id',
          message: "Which employee's role do you want to update?",
          choices: employees
        },
        {
          type: 'list',
          name: 'role_id',
          message: "Which is the new role?",
          choices: roles
        }
      ]).then(answer => {
        connection.promise().query('UPDATE employee SET role_id = ? WHERE id = ?', [answer.role_id, answer.employee_id])
          .then(() => {
            console.log(`Updated employee's role in the database`);
            runPrompt();
          })
          .catch(err => console.log(err));
      });
    });
  });
}

function getRoles() {
  return connection.promise().query('SELECT id, title FROM role')
    .then(([rows]) => {
      return rows.map(role => ({
        name: role.title,
        value: role.id
      }));
    });
}

function getEmployees() {
  return connection.promise().query('SELECT id, CONCAT(first_name, " ", last_name) AS name FROM employee')
    .then(([rows]) => {
      return rows.concat([{ name: 'None', value: null }]);
    });
}
