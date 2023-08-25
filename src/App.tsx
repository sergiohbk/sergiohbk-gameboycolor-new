import Screen from './Components/main';
import UploadBootrom from './Components/loadroms';
import Grid from '@mui/material/Unstable_Grid2';
import Item from '@mui/material/Unstable_Grid2';
import CpuData from './Components/cpudata';
import { useState, useEffect } from 'react';
import { debugengine as DEBUGENGINE } from './GAMEBOYCOLOR/components';
import PpuData from './Components/ppudata';
import MemoryData from './Components/memorydata';
import UploadGame from './Components/loadgame';

function App() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(DEBUGENGINE.DEBUG);
  }, [visible]);

  return (
    <div>
      <div style={{ width: '100%' }}>
        <Screen />
      </div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        <Grid
          container
          spacing={3}
          height={'100%'}
          columns={3}
          minHeight={160}
          margin={2}
        >
          <Grid display='flex' justifyContent='center' alignItems='center'>
            <Item>
              <PpuData />
            </Item>
          </Grid>
          <Grid display='flex' justifyContent='center' alignItems='center'>
            <Item>
              <UploadBootrom />
            </Item>
          </Grid>
          <Grid display='flex' justifyContent='center' alignItems='center'>
            <Item>
              <UploadGame />
            </Item>
          </Grid>

          <Grid
            justifyContent='center'
            alignItems='center'
            display={visible ? 'flex' : 'none'}
          >
            <Item>
              <CpuData />
            </Item>
          </Grid>
          <Grid
            justifyContent='center'
            alignItems='center'
            display={visible ? 'flex' : 'none'}
          >
            <Item>
              <MemoryData />
            </Item>
          </Grid>
        </Grid>
      </div>
    </div>
  );
}

export default App;
