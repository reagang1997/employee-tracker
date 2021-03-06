const ctable = require('console.table')
const mysql = require('mysql');
const inquirer = require('inquirer');
const { connect } = require('http2');
const { join } = require('path');


// Set the port of our application
// process.env.PORT lets the port be set by Heroku
const PORT = process.env.PORT || 8080;


const connection = mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: 'reagan01',
    database: 'emp_trackerdb',
});


const main = () => {
    inquirer.prompt(
        [
            {
                type: 'list',
                message: 'What would you like to do?',
                choices: ['View All Employees', 'View All Employees By Department', 'Add Employee', 'Remove Employee', 'Update Employee Role',
                    'Update Employee Manager', 'Add Department', 'View All Roles', 'Add Role', 'Remove Employee'],
                name: 'choice'
            }
        ]
    ).then(res => {
        const { choice } = res;
        switch (choice) {
            case 'View All Employees':
                //good
                getAllEmployees();
                break;
            case 'View All Employees By Department':
                //good
                viewByDepo();
                break;
            case 'Add Role':
                //good
                addRole();
                break;
            case 'Add Employee':
                //good
                addEmp();
                break;
            case 'Add Department':
                //good
                addDepo();
                break;
            case 'Update Employee Manager':
                //good
                updateEmployeeManager();
                break;
            case 'Update Employee Role':
                //good
                updateEmpRole();
                break;
            case 'View All Roles':
                viewAllRoles();
                break;
            case 'Remove Employee':
                removeEmployee();
                break;
        }
    })
}

const removeEmployee = () => {
    connection.query('select * from employee', (err, rows) => {
        if (err) throw err;
        const employess = [];
        rows.forEach(row => {
            let { first_name, last_name } = row;
            let fullName = first_name + " " + last_name;
            employess.push(fullName);
        });

        inquirer.prompt([
            {
                type: 'list',
                message: 'What employee would you like to delete?',
                choices: employess,
                name: 'emp'
            }
        ]).then(res => {
            let { emp } = res;
            emp = emp.split(" ");

            connection.query('delete from employee where first_name = ?', [emp[0]], (err, res) => {
                if (err) throw err;
                console.log('Employee Deleted!');
                main();
            })
        })
    })
}

const viewAllRoles = () => {
    connection.query('select * from role', (err, rows) => {
        if (err) throw err;
        console.table(rows);
        main();
    });
}

const updateEmpRole = () => {
    connection.query('select * from employee', (err, rows) => {
        if (err) throw err;
        let employees = []
        rows.forEach(row => {
            const { first_name, last_name } = row;
            const fullName = first_name + " " + last_name;
            employees.push(fullName);
        });

        let roles = [];
        connection.query('select * from role', (err, rows) => {
            const rolesRes = rows; 

            rows.forEach(row => {
                roles.push(row.title);
            });
            inquirer.prompt([
                {
                    type: 'list',
                    message: "Which employee needs a new Role?",
                    choices: employees,
                    name: 'empToChange'
                },
                {
                    type: 'list',
                    message: 'What is the new role?',
                    choices: roles,
                    name: 'newRole'
                }
            ]).then(res => {
                let id;
                let { empToChange, newRole } = res;
                empToChange = empToChange.split(" ");
                empToChange = empToChange[0];
                for (let i = 0; i < rolesRes.length; i++) {
                    if (rolesRes[i].title === newRole) {
                        id = rolesRes[i].id;
                    }
                }
                connection.query('update employee set role_id = ? where first_name = ?', [id, empToChange], (err, res) => {
                    if (err) throw err;
                    console.log('Role Updated!');
                    main();
                })
            })
        })



    });
}

const updateEmployeeManager = () => {
    connection.query('select * from employee', (err, rows) => {
        if (err) throw err;
        let employees = []
        rows.forEach(row => {
            const { first_name, last_name } = row;
            const fullName = first_name + " " + last_name;
            employees.push(fullName);
        });

        inquirer.prompt([
            {
                type: 'list',
                message: "Which employee needs a new manager?",
                choices: employees,
                name: 'empToChange'
            },
            {
                type: 'list',
                message: 'Who is the new manager?',
                choices: employees,
                name: 'newManager'
            }
        ]).then(res => {
            let { empToChange, newManager } = res;
            empToChange = empToChange.split(" ");
            empToChange = empToChange[0];

            newManagerFirst = newManager.split(" ");
            newManagerFirst = newManagerFirst[0];

            connection.query('select id from employee where first_name = ?', [newManagerFirst], (err, res) => {
                connection.query('update employee set manager_id = ? where first_name = ?', [res[0].id, empToChange], (err, res) => {
                    console.log("Manager Updated");
                    main();
                })
            })


        })
    })
}
const viewByManager = () => {
    connection.query('select * from employee where manager_id >= 1', (err, rows) => {
    })
}

const addDepo = () => {
    inquirer.prompt([
        {
            type: 'input',
            message: 'What is the departments name?',
            name: 'newDepo'
        }
    ]).then(res => {
        const { newDepo } = res;
        connection.query('insert into department (name) values (?)', [newDepo], (err, res) => {
            console.log("Added new Department!");
            main();
        })
    })
}

const addEmp = () => {
    connection.query('select title, first_name, last_name from role full join employee', (err, rows) => {
        let employess = [];
        let roles = [];
        rows.forEach(row => {
            let { title, first_name, last_name } = row;
            let full_name = first_name + " " + last_name;
            if (employess.indexOf(full_name) === -1) {
                employess.push(full_name);
            }

            if (roles.indexOf(title) === -1) {
                roles.push(title);
            }
        });
        employess.push('None');

        let departments = []
        connection.query('select name from department', (err, rows) => {
            rows.forEach(row => {
                let { name } = row;
                departments.push(name);
            });
            inquirer.prompt([
                {
                    type: 'input',
                    message: 'What is the employess first name?',
                    name: 'first_name'
                },
                {
                    type: 'input',
                    message: 'What is the employees last name?',
                    name: 'last_name'
                },
                {
                    type: 'list',
                    message: 'What role does the employee belong to?',
                    choices: roles,
                    name: 'role'
                },
                {
                    type: 'list',
                    message: 'Who does the employee report to?',
                    choices: employess,
                    name: 'boss'
                }
            ]).then(res => {
                const { first_name, last_name, role, boss } = res;
                const newEmployee = {
                    first_name: first_name,
                    last_name: last_name
                };

                connection.query('select id from role where title = ?', [role], (err, res) => {
                    newEmployee.role_id = res[0].id;

                    let bossFirstName = boss.split(" ");
                    bossFirstName = bossFirstName[0];
                    console.log(bossFirstName);
                    if (bossFirstName != 'None') {
                        connection.query('select id from employee where first_name = ?', [bossFirstName], (err, res) => {
                            if (err) throw err;
                            newEmployee.manager_id = res[0].id;

                            connection.query('insert into employee set ?', [newEmployee], (err, row) => {
                                if (err) throw err;
                                main();
                            })
                        })
                    }
                    else {
                        connection.query('insert into employee set ?', [newEmployee], (err, row) => {
                            if (err) throw err;
                            main();
                        })
                    }

                })
            })
        })

    })
}

const addRole = () => {
    connection.query('select name from department', (err, rows) => {
        if (err) throw err;
        departments = rows;
        inquirer.prompt([
            {
                type: 'input',
                message: 'What is the name of the new role?',
                name: 'roleName'
            },
            {
                type: 'input',
                message: 'What is the roles salary?',
                name: 'roleSalary'
            },
            {
                type: 'list',
                message: 'What department does this role belong to?',
                choices: departments,
                name: 'depo'
            }

        ]).then(res1 => {
            const { roleName, roleSalary, depo } = res1;
            connection.query('select id from department where name = ?', [depo], (err, row) => {
                if (err) throw err;
                connection.query('insert into role (title, salary, department_id) values (?,?,?)', [roleName, roleSalary, row[0].id], (err, res) => {
                    if (err) throw err;
                    console.log("new role added");
                    main();
                })
            })
        })
    })

}

const getAllEmployees = () => {
    connection.query(`SELECT employee.id, employee.first_name, employee.last_name, role.title, department.name, role.salary, employee.manager_id
    FROM ((employee
        INNER JOIN role on employee.role_id = role.id)
        INNER JOIN department on role.department_id = department.id)`, (err, rows) => {
        if (err) throw err;
        console.table(rows);
        main();
    })
}

const viewByDepo = () => {
    connection.query('select * from department', (err, rows) => {
        if (err) throw err;
        const depos = [];
        rows.forEach(row => {
            depos.push(row.name);
        });

        inquirer.prompt(
            [
                {
                    type: 'list',
                    message: 'Select a Department',
                    choices: depos,
                    name: 'depo'
                }
            ]
        ).then(res => {
            const { depo } = res;
            connection.query(`SELECT employee.id, employee.first_name, employee.last_name, role.title, department.name, role.salary, employee.manager_id
    FROM ((employee
        INNER JOIN role on employee.role_id = role.id)
        INNER JOIN department on role.department_id = department.id) where department.name = ?`, [depo], (err, rows) => {
                if (err) throw err;
                console.table(rows);
                main();
            })
        })
    })
}


connection.connect((err) => {
    if (err) throw err;
    console.log(`connected as id ${connection.threadId}`);
    main();
});
