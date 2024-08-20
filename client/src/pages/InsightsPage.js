import React, { useState } from "react";
import { Box, ButtonBase, Drawer, List, Toolbar, ListItemText, Typography } from "@mui/material";
import LazyTable from "../components/LazyTable";
import config from "../config";

const drawElements = [
    {
        id: 1,
        text: 'Job Opportunities',
        description: 'Cities with emerging job opportunities',
        route: `http://${config.server_host}:${config.server_port}/insight_job_opps`,
        columns: [
            {
                field: 'City',
                headerName: 'Cities',
                renderCell: (row) => <div>{String(row.City).length > 30 ? row.City.substring(0, 30) + '...' : row.City}</div>
            },
            {
                field: 'State',
                headerName: 'State',
                renderCell: (row) => <div>{row.State}</div>
            },
            {
                field: 'EmpGrowth',
                headerName: 'Employment Growth',
                renderCell: (row) => <div>{row.EmpGrowth}</div>
            }
        ]
    },
    {
        id: 2,
        text: 'Diversity',
        description: 'Top locations with a diverse job market and diverse demographics that have Airbnb availability.',
        route: `http://${config.server_host}:${config.server_port}/insight_diversity`,
        columns: [
            {
                field: 'Cities',
                headerName: 'Cities',
                renderCell: (row) => <div>{String(row.cities).length > 30 ? row.cities.substring(0, 30) + '...' : row.cities}</div>
            },
            {
                field: 'composite_score',
                headerName: 'Composite Score (AVG) ',
                renderCell: (row) => <div>{row.composite_score}</div>
            },
            {
                field: 'diversity_score',
                headerName: 'Diversity Score',
                renderCell: (row) => <div>{row.diversity_score}</div>
            },
            {
                field: 'job_score',
                headerName: 'Job Score',
                renderCell: (row) => <div>{row.job_score}</div>
            },
        ]
    },
    {
        id: 3,
        text: 'Retirement',
        description: 'Number and average price of Airbnb listings in tracts that are most attractive to retired folks',
        route: `http://${config.server_host}:${config.server_port}/insight_retirement`,
        columns: [
            {
                field: 'Tract',
                headerName: 'Tract ID',
                renderCell: (row) => <div>{row.Tract}</div>
            },
            {
                field: 'Listings',
                headerName: 'Number of Listings',
                renderCell: (row) => <div>{row.Listings}</div>
            },
            {
                field: 'Price',
                headerName: 'Price',
                renderCell: (row) => <div>{row.Price}</div>
            }
        ]

    },
    {
        id: 4,
        text: 'Walkability',
        description: 'Most walkable cities in the U.S.',
        route: `http://${config.server_host}:${config.server_port}/insight_walkability`,
        columns: [
            {
                field: 'City',
                headerName: 'City',
                renderCell: (row) => <div>{row.City}</div>
            },
            {
                field: 'Walkability',
                headerName: 'Walkability',
                renderCell: (row) => <div>{row.Walkability}</div>
            }
        ]
    },
    {
        id: 5,
        text: 'Young Professionals',
        description: 'Best cities for young professionals: wealthy tracts in California with emerging (work-from-home) job opportunities',
        route: `http://${config.server_host}:${config.server_port}/insight_young_professionals`,
        columns: [
            {
                field: 'Cities',
                headerName: 'Cities',
                renderCell: (row) => <div>{String(row.Cities).length > 30 ? row.Cities.substring(0, 30) + '...' : row.Cities}</div>
            },
            {
                field: 'County',
                headerName: 'County',
                renderCell: (row) => <div>{row.County}</div>
            },
            {
                field: 'EmpGrowth',
                headerName: 'EmpGrowth (%)',
                renderCell: (row) => <div>{row.EmpGrowth}</div>
            },
            {
                field: 'Num_Lisings',
                headerName: 'Number of Listings',
                renderCell: (row) => <div>{row.Num_Lisings}</div>
            },
        ]
    },
];


export default function InsightsPage() {
    const [selectedInsight, setSelectedInsight] = useState(drawElements[0]);

    return (
        <Box sx={{ display: 'flex', zIndex: 1 }}>
            <Drawer
                variant="permanent"
                sx={{
                    width: 240,
                    flexShrink: 0,
                    alignContent: 'center',
                    display: { xs: 'none', sm: 'block' },
                    [`& .MuiDrawer-paper`]: { width: 240, boxSizing: 'border-box', top: 80 },
                }}
            >
                <Toolbar />
                <List>
                    {drawElements.map((element) => (
                        <ButtonBase key={element.id}
                            onClick={() => setSelectedInsight(element)}
                            sx={{ width: 240 }}>
                            <ListItemText primary={element.text} />
                        </ButtonBase>
                    ))}
                </List>
            </Drawer>
            <Box component="main" sx={{ flexGrow: 1, p: 3, alignItems: 'center', display: 'flex', justifyContent: 'center' }}>
                <LazyTable route={selectedInsight.route} columns={selectedInsight.columns} defaultPageSize={5} rowsPerPageOptions={[5, 10, 25]} />
            </Box>
        </Box>
    );
}

