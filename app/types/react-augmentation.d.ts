import { ReactElement, ReactNode } from 'react'

declare module 'react' {
  interface ReactPortal {
    children?: ReactNode;
  }
  
  // This ensures that ForwardRefExoticComponent can be used as a JSX element
  type JSXElementConstructor<P> =
    | ((props: P) => ReactElement<any, any> | null)
    | (new (props: P) => Component<any, any>);
} 