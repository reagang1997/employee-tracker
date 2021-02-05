const ctable = require('console.table')
const mysql = require('mysql');
const inquirer = require('inquirer');


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
                choices: ['View All Employees', 'View All Employees By Department', 'View All Employees By Manager', 'Add Employee', 'Remove Employee', 'Update Employee Role',
                    'Update Employee Manager', 'View All Roles', 'Add Role', 'Remove Role'],
                name: 'choice'
            }
        ]
    ).then(res => {
        const { choice } = res;
        switch (choice) {
            case 'View All Employees':
                getAllEmployees();
                break;
            case 'View All Employees By Department':
                viewByDepo();
                break;
            case 'Add Role':
                addRole();
                break;
        }
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
                console.log(row[0].id);
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
            console.log(depo)
        })
    })
}


connection.connect((err) => {
    if (err) throw err;
    console.log(`connected as id ${connection.threadId}`);
    main();
});
