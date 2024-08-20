const express = require('express');
const cors = require('cors');
const config = require('./config');
const routes = require('./routes');

const app = express();
app.use(cors({
  origin: '*',
}));

app.use(express.urlencoded());
app.use(express.json());

app.listen(config.server_port, () => {
  console.log(`Server running at http://${config.server_host}:${config.server_port}/`)
});

// POST
app.post('/login', routes.login);
app.post('/create_account', routes.create_account);
app.post('/update_user_preferences', routes.update_user_preferences);

// GET
app.get('/get_user_data/:userId', routes.get_user_data);
app.get('/get_user_preferences/:userId', routes.get_user_preferences);
app.get('/get_map_info', routes.get_map_information);
app.get('/:userId/cities', routes.get_cities);
app.get('/:city/listings', routes.get_listings); // Get listings for a city based on user preferences
app.get('/get_state_info/:state', routes.get_state_info); // Get state information
app.get('/get_cities/:state', routes.get_cities_in_state); // Get cities in a state

// Insights
app.get('/insight_job_opps', routes.get_insight_job_opps); // Get cities with greatest job opportunities
app.get('/insight_retirement', routes.get_insight_retirement); // Get cities that are best for retirement
app.get('/insight_walkability', routes.get_insight_walkability); // Get cities with best walkability
app.get('/insight_diversity', routes.get_insight_diversity); // Get cities with best diversity both in terms of jobs and population
app.get('/insight_young_professionals', routes.get_insight_young_professionals); // Get cities in California that are best for young professionals

module.exports = app;
