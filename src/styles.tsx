import {
  Card,
  CardContent,
  styled,
  TableCell,
  TableContainer,
  TableRow,
} from '@mui/material';

export const MyTableRow = styled(TableRow)(({ theme }) => ({
  '&:nth-of-type(odd)': {
    backgroundColor: theme.TablePalette.odd,
  },
  '&:nth-of-type(even)': {
    backgroundColor: theme.TablePalette.even,
  },
  '&:last-child td, &:last-child th': {
    border: 0,
  },
}));

export const MyHeaderTableRow = styled(TableRow)(({ theme }) => ({
  backgroundColor: theme.TablePalette.header,
}));

export const MyTableCell = styled(TableCell)(({ theme }) => ({
  fontSize: '0.65rem',
  fontWeight: 'bold',
}));

export const MyHeaderTableCell = styled(TableCell)(({ theme }) => ({
  fontSize: '0.8rem',
  fontWeight: '800',
  borderBottom: '1px solid rgba(255,255,255, 0.8)',
}));

export const MyCard = styled(Card)(({ theme }) => ({
  borderRadius: '1.5rem',
  flexGrow: 1,
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  height: '100%',
}));

export const MyCardContent = styled(CardContent)(() => ({
  height: '100%',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  padding: '1rem',
}));

export const MyTableContainer = styled(TableContainer)(() => ({
  height: '100%',
}));

export const screenStyle = {
  display: 'flex',
  border: '1px solid white',
  boxShadow:
    '0px 0px 3px 1px rgba(0,0,0,0.75), inset 0px 0px 3px 0px rgba(0,0,0,0.45)',
};

export const menuStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'flex-start',
  alignItems: 'flex-start',
  flexDirection: 'column',
  color: '#FFF',
  gap: '.7rem',
};

export const spanStyle: React.CSSProperties = {
  color: '#22c55e',
  fontWeight: 'bold',
  fontSize: '1.2rem',
};

export const smallSpanStyle: React.CSSProperties = {
  color: '#22c55e',
  fontWeight: 'bold',
  fontSize: '.8rem',
};
