import {CSSProperties} from 'react';
export type htmlProps = {
  id?: string;
  className?: string;
  ref?: any;
  style?: CSSProperties;
  type?: 'button' | 'submit';
  disabled?: boolean;

  onClick?: any;
  onKeyDown?: any;
  onBlur?: any;
  onMouseEnter?: any;
  onMouseLeave?: any;
  onMouseDown?: any;

  children?: React.ReactNode;
};
