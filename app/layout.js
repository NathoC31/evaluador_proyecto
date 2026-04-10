import './globals.css';

export const metadata = {
  title: 'Evaluación de Stands',
  description: 'Evaluación de stands escolares'
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>
        {children}
        <footer style={{ 
          position: "fixed", 
          bottom: 0, 
          left: 0, 
          right: 0, 
          padding: "0.75rem", 
          background: "#374151", 
          textAlign: "center", 
          color: "#f3f4f6",
          fontSize: "0.8rem",
          fontFamily: "'Inter', sans-serif"
        }}>
          Desarrollado por Nathaly Cuasapaz
        </footer>
      </body>
    </html>
  );
}