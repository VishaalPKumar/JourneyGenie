const mysql = require('mysql')
const config = require('./config.json')
const city_query = require('./city_query')

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

        var userid = null;

        connection.query(user_query, [email, password, age, first_name, last_name], function (err, result) {
            if (err) {
                console.error(err);
                return connection.rollback(function () {
                    res.status(500).send('Error creating account');
                });
            }
            console.log('User created');
            userid = result.insertId;

            const preferences_query = `
                INSERT INTO ${preferences_table} (
                    user_id, weather, min_cost_per_month, max_cost_per_month, 
                    low_population, high_population, employed_preferred, walkability, 
                    avg_income, public_transportation, diversity, room_type_id)
                VALUES (?,?,?,?,?,?,?,?,?,?,?,?);
            `;

            connection.query(preferences_query, [
                result.insertId, preferences.weather, preferences.costPerMonth[0],
                preferences.costPerMonth[1], preferences.population[0], preferences.population[1],
                preferences.employed_preferred, preferences.walkability, preferences.avg_income,
                preferences.public_transportation, preferences.diversity,
                preferences.room_type
            ], function (err, result) {
                if (err) {
                    console.error(err);
                    return connection.rollback(function () {
                        res.status(500).send('Error inserting preferences');
                    });
                }
                console.log('Preferences created');
                console.log(userid);
                connection.commit(function (err) {
                    if (err) {
                        console.error(err);
                        return connection.rollback(function () {
                            res.status(500).send('Error during commit');
                        });
                    }
                    console.log('Account created');
                    res.send({ user_id: userid });
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
        SELECT user_id, weather, min_cost_per_month, max_cost_per_month, 
        low_population, high_population, employed_preferred, walkability, 
        avg_income, public_transportation, diversity, room_type_id AS room_type FROM ${preferences_table} WHERE user_id = ${user_id};
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
            walkability = ?, avg_income = ?, public_transportation = ?, diversity = ?, room_type_id = ?
        WHERE user_id = ?;
    `;

    connection.query(query, [
        preferences.weather, preferences.min_cost_per_month, preferences.max_cost_per_month,
        preferences.low_population, preferences.high_population, preferences.employed_preferred,
        preferences.walkability, preferences.avg_income, preferences.public_transportation, preferences.diversity, preferences.room_type, user_id
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

const get_cities_in_state = function (req, res) {
    const state = req.params.state;
    const page = req.query.page;
    const pageSize = req.query.page_size ?? 10;

    const query = `
    SELECT DISTINCT C.name AS City, Co.name AS County
    FROM CityCounty CC
        JOIN City C ON CC.city_id = C.city_id
        JOIN County Co ON CC.county_id = Co.county_id
    WHERE CC.state_id IN (
        SELECT state_id
        FROM State
        WHERE name = "${state}"
    )
    ORDER BY City
    LIMIT ${(page - 1) * pageSize}, ${pageSize}
    `;

    connection.query(query, function (err, result) {
        if (err) {
            console.error(err);
            res.status(500).send('Error retrieving cities');
        } else {
            res.send(result);
        }
    });
}

// This gets the recommended cities based on user preferences
const get_recommended_cities = function (req, res) {
    const user_id = req.params.userId;
    const page = req.query.page;
    const page_size = req.query.page_size;

    const query = city_query.get_opt2(user_id, page, page_size);

    console.log(query);

    connection.query(query, function (err, result) {
        if (err) {
            console.error(err);
            res.status(500).send('Error retrieving cities');
        } else {
            res.send(result);
        }
    });
}

const get_listings = function (req, res) {
    const city_id = req.query.city_id;
    const price_low = req.query.price_low;
    const price_high = req.query.price_high;
    const roomT = req.query.roomT;
    const page = req.query.page;
    const page_size = req.query.page_size;

    const query = `
    SELECT L.listing_id, L.description, H.name AS host_name, L.price
    FROM Listing L JOIN City C ON L.city_id = C.city_id
    JOIN Host H ON L.host_id = H.host_id
    WHERE   C.city_id = ${city_id}
    AND L.price BETWEEN ${price_low} AND ${price_high}
    AND L.room_type_id = ${roomT}`;

    console.log(query);

    connection.query(query, function (err, result) {
        if (err) {
            console.error(err);
            res.status(500).send('Error retrieving cities');
        } else {
            res.send(result);
        }
    });
}

const get_state_info = function (req, res) {
    const state = req.params.state;
    const query = `
    WITH StateAgg AS (
        SELECT
            state_id,
            year,
            SUM(population) AS total_population,
            SUM(employed_population) AS total_employed_population,
            AVG(poverty_percent) AS avg_poverty_percent,
            AVG(walkability) AS avg_walkability,
            AVG(avg_income) AS avg_avg_income,
            (
                SELECT top_ethnicity
                FROM Tract AS t2
                WHERE t2.state_id = t1.state_id AND t2.year = t1.year
                GROUP BY top_ethnicity
                ORDER BY COUNT(*) DESC
                LIMIT 1
            ) AS top_ethnicity,
            (
                SELECT top_mode_of_transport
                FROM Tract AS t3
                WHERE t3.state_id = t1.state_id AND t3.year = t1.year
                GROUP BY top_mode_of_transport
                ORDER BY COUNT(*) DESC
                LIMIT 1
            ) AS top_mode_of_transport,
            (
                SELECT diversity
                FROM Tract AS t3
                WHERE t3.state_id = t1.state_id AND t3.year = t1.year
                GROUP BY diversity
                ORDER BY COUNT(*) DESC
                LIMIT 1
            ) AS diversity,
            (
                SELECT job_diverity
                FROM Tract AS t3
                WHERE t3.state_id = t1.state_id AND t3.year = t1.year
                GROUP BY job_diverity
                ORDER BY COUNT(*) DESC
                LIMIT 1
            ) AS job_diversity,
            (
                SELECT work_from_home
                FROM Tract AS t3
                WHERE t3.state_id = t1.state_id AND t3.year = t1.year
                GROUP BY work_from_home
                ORDER BY COUNT(*) DESC
                LIMIT 1
            ) AS work_from_home
        FROM
            Tract AS t1
        GROUP BY
            state_id, year
    )
    SELECT *
    FROM StateAgg
        JOIN State ON StateAgg.state_id = State.state_id
    WHERE name = "${state}"
    `;

    connection.query(query, function (err, result) {
        if (err) {
            console.error(err);
            res.status(500).send('Error retrieving state information');
        } else {
            res.send(result);
        }
    });
}



// Insights
const get_insight_job_opps = function (req, res) {
    // const query = `
    // SELECT GROUP_CONCAT(C.name) AS City, S.name AS State,
    // (T1.employed_population - T0.employed_population) / T0.employed_population * 100 AS EmpGrowth
    // FROM Tract T0
    //     JOIN Tract T1 ON T0.tract_id = T1.tract_id
    //     JOIN CityCounty CC ON T1.county_id = CC.county_id
    //     JOIN City C ON CC.city_id = C.city_id
    //     JOIN State S ON C.state_id = S.state_id
    // WHERE T0.employed_population > 0 AND T1.year > T0.year
    // GROUP BY CC.county_id
    // HAVING EmpGrowth > 0
    // ORDER BY EmpGrowth DESC
    // LIMIT 10;
    // `;

    const query = `
    SELECT * FROM EmploymentGrowth
    LIMIT 10;
    `;

    connection.query(query, function (err, result) {
        if (err) {
            console.error(err);
            res.json([]);
        } else {
            res.json(result);
        }
    });
}

const get_insight_retirement = function (req, res) {
    const query = `
    WITH HottestStates AS (
        SELECT state_id
        FROM Weather
        GROUP BY state_id
        ORDER BY AVG(temperature) DESC
        LIMIT 20
     ), UnemploymentCounties AS (
        SELECT county_id, ((SUM(population) - SUM(employed_population))/SUM(population)) AS country_unemployment_rate
            FROM Tract sub
            GROUP BY sub.county_id)
     , HighUnemploymentTracts AS (
        SELECT t.tract_id, t.population, (t.population - t.employed_population)/t.population AS unemployment_rate
        FROM Tract t
        JOIN UnemploymentCounties c ON t.county_id = c.county_id
        WHERE (t.population - t.employed_population)/t.population > c.country_unemployment_rate
     ),
     LuxuriousListings AS (
        SELECT l.*
        FROM Listing l
        WHERE l.price BETWEEN (10000 / 30) AND (20000 / 30)
     )
     SELECT u.tract_id AS Tract, COUNT(*) AS Listings, AVG(ll.price) AS Price
     FROM HighUnemploymentTracts u
        JOIN LuxuriousListings ll ON u.tract_id = ll.tract_id
        JOIN HottestStates hs ON ll.state_id = hs.state_id
     GROUP BY u.tract_id
     LIMIT 10;
`;

    connection.query(query, function (err, result) {
        if (err) {
            console.error(err);
            res.status(500).send('Error retrieving retirement tracts');
        } else {
            res.send(result);
        }
    });
}

const get_insight_walkability = function (req, res) {
    const query = `
    SELECT C.name AS City, Avg(T.walkability) AS Walkability
    FROM City C
    JOIN CityCounty CC ON C.city_id = CC.city_id
    JOIN Tract T ON CC.county_id = T.county_id
    GROUP BY C.Name
    ORDER BY walkability DESC
    LIMIT 10
    `;

    connection.query(query, function (err, result) {
        if (err) {
            console.error(err);
            res.status(500).send('Error retrieving walkability insights');
        } else {
            res.send(result);
        }
    });
}

const get_insight_diversity = function (req, res) {
    const page = req.query.page;
    const page_size = req.query.page_size;
    const query = `
    SELECT * FROM InsightDiversity
    LIMIT ${page_size}
    OFFSET ${page_size * (page - 1)};
    `;

    console.log(query);

    connection.query(query, function (err, result) {
        if (err) {
            console.error(err);
            res.json([]);
        } else {
            res.json(result);
        }
    });
}

const get_insight_young_professionals = function (req, res) {
    const query = `
    SELECT
        GROUP_CONCAT(DISTINCT J.City) AS Cities,
        W.County,
        AVG(J.EmpGrowth) AS EmpGrowth,
        AVG(LM.num) AS Num_Lisings
    FROM
        JobGrowthView J
        JOIN CityCounty CC ON J.city_id = CC.city_id
        JOIN WealthyTractsView W ON CC.county_id = W.county_id
        JOIN Num_ListingView LM ON W.tract_id = LM.tract_id
    GROUP BY W.County
    ORDER BY
    J.EmpGrowth DESC,
    LM.num DESC;
    `;

    connection.query(query, function (err, result) {
        if (err) {
            console.error(err);
            res.json([]);
        } else {
            res.json(result);
        }
    });
}



module.exports = {
    login, create_account,
    get_map_information,
    get_user_preferences, get_user_data,
    update_user_preferences,
    get_cities: get_recommended_cities,
    get_insight_job_opps, get_insight_retirement,
    get_insight_walkability, get_insight_diversity, get_listings,
    get_state_info, get_cities_in_state, get_insight_young_professionals
};

