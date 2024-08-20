import { AppBar, Container, Toolbar, Typography } from '@mui/material'
import { NavLink, useLocation } from 'react-router-dom';

function NavText({ href, text, isMain }) {
  return (
    <Typography
      variant={isMain ? 'h5' : 'h7'}
      noWrap
      style={{
        marginRight: '30px',
        fontFamily: 'Eczar',
        fontWeight: 100,
        letterSpacing: '.1rem',
      }}
    >
      <NavLink
        to={href}
        style={{
          color: '#FCF6F5',
          textDecoration: 'none',
        }}
      >
        {text}
      </NavLink>
    </Typography>
  )
}


export default function NavBar() {
  const pathName = useLocation();
  const routesWithoutNavBar = ['/', '/create-account', '/logout'];

  if (routesWithoutNavBar.includes(pathName.pathname)) {
    return null;
  }

  return (
    <AppBar position='static' sx={{zIndex: 1000}}>
      <Container maxWidth='xl'>
        <Toolbar disableGutters>
          <NavText href='/home' text='Journey Genie' isMain />
          <NavText href='/explore' text='Explore US' />
          <NavText href='/insights' text='Insights' />
          <NavText href='/edit-profile' text='Profile' />
          <NavText href='/logout' text='Logout' />
        </Toolbar>
      </Container>
    </AppBar>
  );
}
