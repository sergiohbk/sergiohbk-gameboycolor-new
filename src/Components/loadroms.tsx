import { useState } from 'react';
import { Button } from '@mui/material';
import { MyCard, MyCardContent } from '../styles';
import GAMEBOYCOLOR from '../GAMEBOYCOLOR/gbc';

function UploadBootromZone() {
  const [bootromactive, setBootromactive] = useState(false);
  const handlebootClick = () => {
    const element = document.getElementById('bootromload');
    if (element) element.click();
    else console.log('no element');
  };

  const handlebootChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const buffer = e.target?.result;
        if (buffer) {
          GAMEBOYCOLOR.loadBootrom(buffer as ArrayBuffer);
        }
      };
      reader.readAsArrayBuffer(file);
      setBootromactive(true);
    }
  };

  return (
    <MyCard>
      <MyCardContent>
        {!bootromactive ? (
          <div style={{ display: 'inline-block' }}>
            <input
              type='file'
              accept='.bin , .rom , .gb , .gbc'
              id='bootromload'
              title='upload bootrom'
              style={{ display: 'none' }}
              onChange={handlebootChange}
            />
            <Button
              onClick={handlebootClick}
              variant='contained'
            >
              Cargar Bootrom
            </Button>
          </div>
        ) : (
          <div>
            bootrom cargada
            <Button
              variant='contained'
              onClick={() => {
                GAMEBOYCOLOR.start();
              }}
            >
              Iniciar
            </Button>
          </div>
        )}
      </MyCardContent>
    </MyCard>
  );
}

export default UploadBootromZone;
