import { styled, keyframes } from '@mui/material';

const pingAnimation = keyframes`
  0% {
    transform: scale(1);
    opacity: 0.8;
  }
  100% {
    transform: scale(3);
    opacity: 0;
  }
`;

export const PingDot = styled('span')(() => ({
  display: 'inline-block',
  width: 6,
  height: 6,
  backgroundColor: '#84cc16',
  borderRadius: '50%',
  position: 'relative',
  margin: 6,
  boxShadow: '0 0 10px #84cc16',
  '&::before': {
    content: '""',
    position: 'absolute',
    inset: 0,
    backgroundColor: '#84cc16',
    borderRadius: '50%',
    animation: `${pingAnimation} 3s cubic-bezier(0, 0, 0.2, 1) infinite`,
  },
}));
