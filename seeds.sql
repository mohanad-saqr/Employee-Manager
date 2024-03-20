USE employee_db;

INSERT INTO department (name) VALUES ('Sales'), ('Engineering'), ('Finance'), ('Marketing');

INSERT INTO role (title, salary, department_id) VALUES 
('Sales Lead', 100000.00, (SELECT id FROM department WHERE name = 'Sales')),
('Software Engineer', 80000.00, (SELECT id FROM department WHERE name = 'Engineering')),
('Accountant', 70000.00, (SELECT id FROM department WHERE name = 'Finance'));

INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES 
('John', 'Doe', (SELECT id FROM role WHERE title = 'Sales Lead'), NULL),
('Jane', 'Smith', (SELECT id FROM role WHERE title = 'Software Engineer'), (SELECT id FROM employee WHERE first_name = 'John'));
