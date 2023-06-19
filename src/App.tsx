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

function App() {
  const theme = useTheme();
  return (
    <div className='App'>
      <Parallax
        style={{
          backgroundColor: theme.palette.background.default,
          height: '100vh',
          position: 'relative',
          padding: '1rem',
        }}
        strength={100}
      >
        <div className='grid-container'>
          <div className='item1'>
            <GbcPrincipalDataZone />
          </div>
          <div className='item2'>
            <GbcScreen />
          </div>
          <div className='item4'>
            <CPUdataZone />
          </div>
          <div></div>
          <div></div>
          <div></div>
          <div></div>
          <div>
            <GbcDebugConfig />
          </div>
          <div>
            <UploadBootromZone />
          </div>
          <div></div>
          <div></div>
        </div>
      </Parallax>
      <Parallax
        style={{
          backgroundColor: theme.palette.background.paper,
          height: '100vh',
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
