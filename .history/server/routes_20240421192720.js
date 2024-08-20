const mysql = require('mysql')
const config = require('./config.json')

const user_table = 'UserCredentials';
const preferences_table = 'UserPreferences';

const connection = mysql.createConnection({
    host: config.rds_host,
    user: config.rds_user,
    password: config.rds_password,
    port: config.rds_port,
    database: config.rds_db
});
connection.connect((err) => err && console.log(err));


// POST 
const login = async function (req, res) {
    const { email, password } = req.body;
    console.log('email', email);
    console.log('password', password);

    const query = `
        SELECT * FROM ${user_table} WHERE email_address = '${email}' AND password = '${password}'
    `;

    connection.query(query, function (err, result) {
        if (err) {
            console.log(err);
            res.status(500).send('error');
        } else {
            if (result.length === 0) {
                console.log('User not found');
                res.status(404).send(null);
            } else {
                console.log('User found', result[0].user_id.toString());
                res.send(result[0].user_id.toString());
            }
        }
    });
}

const create_account = function (req, res) {
    console.log('req.body', req.body.user.age);

    const { email, password, age, first_name, last_name } = req.body.user;
    const preferences = req.body.preferences;

    connection.beginTransaction(function (err) {
        if (err) {
            console.error(err);
            res.status(500).send('Error creating account');
        }

        const user_query = `
            INSERT INTO ${user_table} (email_address, password, age, first_name, last_name)
            VALUES (?, ?, ?, ?, ?);
        `;

        connection.query(user_query, [email, password, age, first_name, last_name], function (err, result) {
            if (err) {
                console.error(err);
                return connection.rollback(function () {
                    res.status(500).send('Error creating account');
                });
            }
            console.log('User created');

            const preferences_query = `
                INSERT INTO ${preferences_table} (
                    user_id, weather, min_cost_per_month, max_cost_per_month, 
                    low_population, high_population, employed_preferred, walkability, 
                    avg_income, public_transportation, mean_commute, diversity, room_type_id)
                VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?);
            `;

            connection.query(preferences_query, [
                result.insertId, preferences.weather, preferences.costPerMonth[0],
                preferences.costPerMonth[1], preferences.low_population, preferences.high_population,
                preferences.employed_preferred, preferences.walkability, preferences.avg_income,
                preferences.public_transportation, preferences.mean_commute, preferences.diversity,
                preferences.room_type
            ], function (err, result) {
                if (err) {
                    console.error(err);
                    return connection.rollback(function () {
                        res.status(500).send('Error inserting preferences');
                    });
                }
                console.log('Preferences created');
                connection.commit(function (err) {
                    if (err) {
                        console.error(err);
                        return connection.rollback(function () {
                            res.status(500).send('Error during commit');
                        });
                    }
                    console.log('Account created');
                    res.send({ user_id: result.insertId });
                });
            });
        });
    });
}

const get_user_data = function (req, res) {
    const user_id = req.params.userId;
    const query = `
        SELECT * FROM ${user_table} WHERE user_id = ${user_id};
    `;

    connection.query(query, function (err, result) {
        if (err) {
            console.error(err);
            res.status(500).send('Error retrieving user data');
        } else {
            res.send(result[0]);
        }
    });
}

const get_user_preferences = function (req, res) {
    const user_id = req.params.userId;
    const query = `
        SELECT * FROM ${preferences_table} WHERE user_id = ${user_id};
    `;

    connection.query(query, function (err, result) {
        if (err) {
            console.error(err);
            res.status(500).send('Error retrieving user preferences');
        } else {
            res.send(result[0]);
        }
    });
}

const update_user_preferences = function (req, res) {
    const user_id = req.body.userId;
    const preferences = req.body.preferences;

    const query = `
        UPDATE ${preferences_table} 
        SET weather = ?, min_cost_per_month = ?, max_cost_per_month = ?,
            low_population = ?, high_population = ?, employed_preferred = ?,
            walkability = ?, avg_income = ?, public_transportation = ?,
            mean_commute = ?, diversity = ?, room_type_id = ?
        WHERE user_id = ?;
    `;

    connection.query(query, [
        preferences.weather, preferences.min_cost_per_month, preferences.max_cost_per_month,
        preferences.low_population, preferences.high_population, preferences.employed_preferred,
        preferences.walkability, preferences.avg_income, preferences.public_transportation,
        preferences.mean_commute, preferences.diversity, preferences.room_type, user_id
    ], function (err, result) {
        if (err) {
            console.error(err);
            res.status(500).send('Error updating preferences');
        } else {
            res.send({ success: true });
        }
    });
}
// GET
const get_map_information = function (req, res) {
    const query = `
        SELECT name, abbr, pop, employed_pop, pov_perc, walk
        FROM
        (SELECT state_id, SUM(population) AS pop, SUM(employed_population) AS employed_pop,
            AVG(poverty_percent) AS pov_perc, AVG(walkability) AS walk
        FROM Tract
        WHERE year = 2017
        GROUP BY state_id) T LEFT JOIN State S ON T.state_id = S.state_id;
    `;

    connection.query(query, function (err, result) {
        if (err) {
            console.error(err);
            res.status(500).send('Error retrieving state map information');
        } else {
            res.send(result);
        }
    });
}

const get_cities = function (req, res) {
    const user_id = req.params.userId;

    const query = `
    WITH P AS (
        SELECT * FROM ${preferences_table}
        WHERE user_id = ${user_id}
    )
    SELECT DISTINCT C.name, AVG(L.price) AS Avg_Cost, AVG(T.avg_income) AS Avg_Income
    FROM Listing L
    JOIN City C ON L.city_id = C.city_id
    JOIN Tract T ON L.tract_id = T.tract_id
    GROUP BY C.city_id
    HAVING AVG(L.price) BETWEEN (SELECT P.min_cost_per_month FROM P) / 30 AND (SELECT P.max_cost_per_month FROM P) / 30
    AND AVG(T.avg_income) BETWEEN (SELECT P.avg_income FROM P) * 0.9 AND (SELECT P.avg_income FROM P) * 1.1;
    `;

    connection.query(query, function (err, result) {
        if (err) {
            console.error(err);
            res.status(500).send('Error retrieving listings');
        } else {
            res.send(result);
        }
    });
}

const get_city_info = function (req, res) {
    res.send('Not implemented');
}


// Insights
const get_insight_job_opps = function (req, res) {
    res.send('Not implemented');
}

const get_insight_retirement = function (req, res) {
    res.send('Not implemented');
}

const get_insight_walkability = function (req, res) {
    res.send('Not implemented');
}

const get_insight_diversity = function (req, res) {
    res.send('Not implemented');
}

const get_insight_diverse_job_opps = function (req, res) {
    res.send('Not implemented');
}


module.exports = {
    login, create_account,
    get_map_information,
    get_user_preferences, get_user_data,
    update_user_preferences,
    get_cities, get_city_info,
    get_insight_job_opps, get_insight_retirement,
    get_insight_walkability, get_insight_diversity,
    get_insight_diverse_job_opps
};

