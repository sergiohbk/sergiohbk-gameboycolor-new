import * as PIXI from 'pixi.js';
import { useRef, useEffect } from 'react';
import GAMEBOYCOLOR from '../GAMEBOYCOLOR/gbc';
import { MyCard, MyCardContent, screenStyle } from '../styles';

function GbcScreen() {
  const PIXIref = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const app = new PIXI.Application({
      width: 160,
      height: 144,
      backgroundColor: 0x94a3b8,
    });

    if (PIXIref.current) {
      PIXIref.current.appendChild(app.view as HTMLCanvasElement);
    }

    GAMEBOYCOLOR.setPixiCanvas(app);

    return () => {
      app.destroy(true);
    };
  }, []);
  return (
    <MyCard square={true}>
      <MyCardContent>
        <div
          ref={PIXIref}
          className='screen'
          id='PIXIscreen'
          style={screenStyle}
        />
      </MyCardContent>
    </MyCard>
  );
}

export default GbcScreen;
