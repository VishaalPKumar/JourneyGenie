
// no optimizations
module.exports.get_opt0 = function(uid, page, page_size) {
    return `WITH P AS (
        SELECT *, CASE
                WHEN diversity = 'similar' THEN 1
                WHEN diversity = 'indifferent' THEN 2
                WHEN diversity = 'different' THEN 3
                ELSE 2 END AS diversity_pref,
            CASE
                WHEN public_transportation = 'indifferent' THEN 2
                WHEN public_transportation = 'important' THEN 3
                ELSE 2 END AS public_transport_pref
    FROM UserPreferences
    WHERE user_id = ${uid}
),
listing_counts AS (
        SELECT City.city_id, COUNT(Listing.listing_id) AS listing_count
        FROM City LEFT JOIN Listing ON Listing.city_id = City.city_id
        GROUP BY city_id
        ),
population AS (
        SELECT CC.city_id, AVG(T.population) AS city_population
        FROM Tract T JOIN CityCounty CC ON T.county_id = CC.county_id
        GROUP BY CC.city_id
        HAVING city_population BETWEEN (SELECT P.low_population FROM P) * 0.25 AND (SELECT P.high_population FROM P) * 4
        ),
income AS (
        SELECT CC.city_id, AVG(T.avg_income) AS city_income
        FROM Tract T JOIN CityCounty CC ON T.county_id = CC.county_id
        GROUP BY CC.city_id
        HAVING city_income BETWEEN (SELECT P.avg_income FROM P) * 0.25 AND (SELECT P.avg_income FROM P) * 4
        ),
diversity AS (
        SELECT CC.city_id, ROUND(AVG(CASE
                                   WHEN T.diversity = 'low' THEN 1
                                   WHEN T.diversity = 'medium' THEN 2
                                   WHEN T.diversity = 'high' THEN 3
                                   ELSE 2 END
                           ), 0) AS city_diversity
        FROM Tract T
        JOIN CityCounty CC ON T.county_id = CC.county_id
        GROUP BY CC.city_id
        HAVING city_diversity BETWEEN (SELECT diversity_pref FROM P) - 1 AND (SELECT diversity_pref FROM P) + 1
        )
SELECT C.name AS city, S.name AS state, L.listing_count, C.city_id, D.city_diversity, I.city_income AS Avg_Income, P.city_population
FROM City C JOIN State S ON C.state_id = S.state_id
JOIN listing_counts L ON L.city_id = C.city_id
JOIN diversity D ON D.city_id = C.city_id
JOIN income I ON I.city_id = C.city_id
JOIN population P ON P.city_id = C.city_id
ORDER BY L.listing_count DESC
LIMIT ${page_size}
OFFSET ${page_size * (page - 1)};`
}

// optimization 1 : restructured query
module.exports.get_opt1 = function(uid, page, page_size) {
    return `WITH P AS (
        SELECT *, CASE
                WHEN diversity = 'similar' THEN 1
                WHEN diversity = 'indifferent' THEN 2
                WHEN diversity = 'different' THEN 3
                ELSE 2 END AS diversity_pref,
            CASE
                WHEN public_transportation = 'indifferent' THEN 2
                WHEN public_transportation = 'important' THEN 3
                ELSE 2 END AS public_transport_pref
    FROM UserPreferences
    WHERE user_id = ${uid}
),
Cities AS (
        SELECT City.city_id, City.name AS city, COUNT(Listing.listing_id) AS listing_count
        FROM City LEFT JOIN Listing ON Listing.city_id = City.city_id
        GROUP BY city_id
        ),
RawScores AS (
        SELECT CC.city_id, ROUND(AVG(T.population), 0) AS city_population, ROUND(AVG(T.avg_income), 2) AS city_income, AVG(T.walkability) AS walk_score,
               ROUND(AVG(CASE
                        WHEN T.diversity = 'low' THEN 1
                        WHEN T.diversity = 'medium' THEN 2
                        WHEN T.diversity = 'high' THEN 3
                        ELSE 2 END
                    ), 0) AS city_diversity,
               ROUND (1.4 + 2 * AVG( CASE
                                    WHEN top_mode_of_transport = 'drive' THEN 0
                                    ELSE 1 END ), 0)  AS city_public_transport
        FROM Tract T JOIN CityCounty CC ON T.county_id = CC.county_id
        GROUP BY CC.city_id
        ),
CityScores AS (
        SELECT RawScores.city_id, State.name AS state_name, city_diversity, city_income, city_population, city_public_transport,
            ROUND(((walk_score - (SELECT MIN(walk_score) FROM RawScores)) /
            ((SELECT MAX(walk_score) FROM RawScores) - (SELECT MIN(walk_score) FROM RawScores))) * 9 + 1,
            0) AS city_walkability
        FROM RawScores
        JOIN City ON City.city_id = RawScores.city_id
        JOIN State ON State.state_id = City.state_id
        ),
Recs AS (
    SELECT city_id, state_name, city_diversity, city_income, city_population, city_public_transport, city_walkability
    FROM CityScores
    WHERE
        city_diversity BETWEEN (SELECT diversity_pref FROM P) - 1 AND (SELECT diversity_pref FROM P) + 1 AND
        city_income BETWEEN (SELECT P.avg_income FROM P) * 0.25 AND (SELECT P.avg_income FROM P) * 4 AND
        city_population BETWEEN (SELECT P.low_population FROM P) * 0.25 AND (SELECT P.high_population FROM P) * 4 AND
        city_walkability BETWEEN (SELECT P.walkability FROM P) - 5 AND (SELECT P.walkability FROM P) + 5 AND
        city_public_transport BETWEEN (SELECT P.public_transport_pref FROM P) - 1 AND (SELECT P.public_transport_pref FROM P) + 1
)
SELECT DISTINCT C.city_id, R.state_name, C.city, C.listing_count, R.city_income, R.city_walkability, R.city_public_transport, R.city_population, R.city_diversity
FROM Cities C
JOIN Recs R ON C.city_id = R.city_id
ORDER BY C.listing_count DESC
LIMIT ${page_size}
OFFSET ${page_size * (page - 1)};`;
}

// optimization 2 : caching results
module.exports.get_opt2 = function(uid, page, page_size) {
    return `WITH P AS (
        SELECT *, CASE
                WHEN diversity = 'similar' THEN 1
                WHEN diversity = 'indifferent' THEN 2
                WHEN diversity = 'different' THEN 3
                ELSE 2 END AS diversity_pref,
            CASE
                WHEN public_transportation = 'indifferent' THEN 2
                WHEN public_transportation = 'important' THEN 3
                ELSE 2 END AS public_transport_pref
    FROM UserPreferences
    WHERE user_id = ${uid}
),
Cities AS (
        SELECT City.city_id, City.name AS city, COUNT(Listing.listing_id) AS listing_count
        FROM City LEFT JOIN Listing ON Listing.city_id = City.city_id
        GROUP BY city_id
        ),
Recs AS (
    SELECT city_id, state_name, city_diversity, city_income, city_population, city_public_transport, city_walkability
    FROM CityScores
    WHERE
        city_diversity BETWEEN (SELECT diversity_pref FROM P) - 1 AND (SELECT diversity_pref FROM P) + 1 AND
        city_income BETWEEN (SELECT P.avg_income FROM P) * 0.25 AND (SELECT P.avg_income FROM P) * 4 AND
        city_population BETWEEN (SELECT P.low_population FROM P) * 0.25 AND (SELECT P.high_population FROM P) * 4 AND
        city_walkability BETWEEN (SELECT P.walkability FROM P) - 5 AND (SELECT P.walkability FROM P) + 5 AND
        city_public_transport BETWEEN (SELECT P.public_transport_pref FROM P) - 1 AND (SELECT P.public_transport_pref FROM P) + 1
)
SELECT DISTINCT C.city_id, R.state_name, C.city, C.listing_count, R.city_income, R.city_walkability, R.city_public_transport, R.city_population, R.city_diversity
FROM Cities C
JOIN Recs R ON C.city_id = R.city_id
ORDER BY C.listing_count DESC
LIMIT ${page_size}
OFFSET ${page_size * (page - 1)};`;
}