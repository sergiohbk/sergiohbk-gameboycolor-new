import { useState } from 'react';
import { Button } from '@mui/material';
import { MyCard, MyCardContent } from '../styles';
import GAMEBOYCOLOR from '../GAMEBOYCOLOR/gbc';

function UploadGame() {
  const [romActive, setRomActive] = useState(false);
  const handlebootClick = () => {
    const element = document.getElementById('romLoad');
    if (element) element.click();
    else console.log('no element');
  };

  const handlebootChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const buffer = e.target?.result;
        if (buffer) {
          GAMEBOYCOLOR.load(buffer as ArrayBuffer);
        }
      };
      reader.readAsArrayBuffer(file);
      setRomActive(true);
    }
  };

  return (
    <MyCard>
      <MyCardContent>
        {!romActive ? (
          <div style={{ display: 'inline-block' }}>
            <input
              type='file'
              accept='.gb , .gbc'
              id='romLoad'
              title='upload bootrom'
              style={{ display: 'none' }}
              onChange={handlebootChange}
            />
            <Button onClick={handlebootClick} variant='contained'>
              Cargar Juego
            </Button>
          </div>
        ) : (
          <div>
            ROM CARGADA
            <Button
              variant='contained'
              onClick={() => {
                GAMEBOYCOLOR.start();
              }}
            >
              Iniciar sin bootrom
            </Button>
          </div>
        )}
      </MyCardContent>
    </MyCard>
  );
}

export default UploadGame;
