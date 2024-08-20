CREATE DATABASE GENIE;
USE GENIE;

CREATE TABLE Host (
    host_id INT PRIMARY KEY,
    name VARCHAR(255)
);

CREATE TABLE RoomType (
    room_type_id INT PRIMARY KEY,
    type VARCHAR(255) NOT NULL
);

CREATE TABLE State (
    state_id VARCHAR(10) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    abbr CHAR(2) NOT NULL
);

CREATE TABLE City (
    city_id VARCHAR(10) PRIMARY KEY,
    state_id VARCHAR (10),
    name VARCHAR(255) NOT NULL,
    FOREIGN KEY (state_id) REFERENCES State(state_id)
);

CREATE TABLE County (
    county_id VARCHAR(10) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    state_id VARCHAR(10),
    FOREIGN KEY (state_id) REFERENCES State(state_id)
);

CREATE TABLE CityCounty (
    city_id VARCHAR(10),
    county_id VARCHAR(10),
    state_id VARCHAR(10),
    PRIMARY KEY (city_id, county_id, state_id),
    FOREIGN KEY (city_id) REFERENCES City(city_id),
    FOREIGN KEY (county_id) REFERENCES County(county_id),
    FOREIGN KEY (state_id) REFERENCES State(state_id)
);

CREATE TABLE Tract (
    tract_id VARCHAR(11),
    year INT,
    county_id VARCHAR(10),
    state_id VARCHAR(10),
    population INT,
    employed_population INT,
    poverty_percent DECIMAL(10,2),
    walkability DECIMAL(10,2),
    avg_income DECIMAL(10,2),
    top_ethnicity VARCHAR(255),
    top_mode_of_transport VARCHAR(255),
    diversity ENUM('low', 'medium', 'high'),
    job_diverity ENUM('low', 'medium', 'high'),
    work_from_home ENUM('low', 'medium', 'high'),
    PRIMARY KEY (tract_id, year),
    FOREIGN KEY (county_id) REFERENCES County(county_id),
    FOREIGN KEY (state_id) REFERENCES State(state_id)
);

CREATE TABLE Listing (
    listing_id INT PRIMARY KEY,
    host_id INT,
    tract_id VARCHAR(11),
    city_id VARCHAR(10),
    state_id VARCHAR(10),
    price DECIMAL(10,2) NOT NULL,
    room_type_id INT NOT NULL,
    minimum_nights INT NOT NULL,
    number_of_reviews INT NOT NULL,
    days_available_year INT NOT NULL,
    description TEXT,
    FOREIGN KEY (host_id) REFERENCES Host(host_id),
    FOREIGN KEY (tract_id) REFERENCES Tract(tract_id),
    FOREIGN KEY (city_id) REFERENCES City(city_id),
    FOREIGN KEY (state_id) REFERENCES State(state_id),
    FOREIGN KEY (room_type_id) REFERENCES RoomType(room_type_id)
);

CREATE TABLE Weather (
    state_id VARCHAR(10),
    month INT,
    temperature DECIMAL(5, 2) NOT NULL,
    PRIMARY KEY (state_id, month),
    FOREIGN KEY (state_id) REFERENCES State(state_id)
);

CREATE TABLE UserCredentials (
    user_id INT PRIMARY KEY AUTO_INCREMENT,
    email_address VARCHAR(320) NOT NULL,
    password CHAR(64) NOT NULL,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    age INT NOT NULL
);

CREATE TABLE UserPreferences (
    user_id INT PRIMARY KEY,
    weather ENUM('hot', 'warm', 'cold'),
    min_cost_per_month FLOAT,
    max_cost_per_month FLOAT,
    low_population INT,
    high_population INT,
    employed_preferred ENUM('unemployed', 'employed', 'indifferent'),
    walkability INT,
    avg_income DECIMAL(10, 2),
    public_transportation ENUM('important', 'indifferent'),
    diversity ENUM('similar', 'different', 'indifferent'),
    room_type_id INT,
    FOREIGN KEY (user_id) REFERENCES UserCredentials(user_id)
);

