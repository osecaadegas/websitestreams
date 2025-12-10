import { createGlobalStyle } from 'styled-components';

export const GlobalStyles = createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  html, body {
    height: 100%;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
      'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
      sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  #root {
    height: 100%;
  }

  body {
    background: #0f0f23;
    color: #e2e8f0;
    line-height: 1.6;
  }

  button {
    font-family: inherit;
  }

  * {
    scrollbar-width: thin;
    scrollbar-color: #4a5568 #2d3748;
  }

  *::-webkit-scrollbar {
    width: 8px;
  }

  *::-webkit-scrollbar-track {
    background: #2d3748;
  }

  *::-webkit-scrollbar-thumb {
    background: #4a5568;
    border-radius: 4px;
  }

  *::-webkit-scrollbar-thumb:hover {
    background: #718096;
  }

  *::-webkit-scrollbar-thumb:hover {
    background: #a0aec0;
  }

  // Smooth transitions for all elements
  * {
    transition: margin 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  // Ensure body doesn't have horizontal scroll when sidebar is open
  body {
    overflow-x: hidden;
  }
`;