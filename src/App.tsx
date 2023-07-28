import React from 'react';
import {
  GbcScreen,
  GbcPrincipalDataZone,
  CPUdataZone,
  UploadBootromZone,
  GbcDebugConfig,
} from './Components/firstpanel';
import { Parallax } from 'react-parallax';
import { useTheme } from '@mui/material/styles';
import './App.css';
import Grid from '@mui/material/Unstable_Grid2';
import Item from '@mui/material/Unstable_Grid2';

function App() {
  const theme = useTheme();
  return (
    <div className='App'>
      <Parallax
        style={{
          backgroundColor: theme.palette.background.default,
          height: '100%',
          position: 'relative',
          padding: '1rem',
        }}
        strength={100}
      >
        <Grid
          container
          spacing={3}
          display={'flex'}
          justifyContent={'center'}
          alignContent={'space-around'}
          height={'100%'}
          flexGrow={1}
        >
          <Grid xs={12} md={3} lg={2}>
            <Item>
              <GbcPrincipalDataZone />
            </Item>
          </Grid>
          <Grid xs={12} md={6} lg={8}>
            <Item>
              <GbcScreen />
            </Item>
          </Grid>
          <Grid xs={12} md={3} lg={2}>
            <Item>
              <CPUdataZone />
            </Item>
          </Grid>
          <Grid xs={12} md={3} lg={2}>
            <Item>
              <GbcDebugConfig />
            </Item>
          </Grid>
          <Grid xs={12} md={3} lg={2}>
            <Item>
              <UploadBootromZone />
            </Item>
          </Grid>
        </Grid>
      </Parallax>
      <Parallax
        style={{
          backgroundColor: theme.palette.background.paper,
          height: '100%',
          position: 'relative',
        }}
        strength={100}
      >
        <section></section>
      </Parallax>
    </div>
  );
}

export default App;
