import './globals.css';

export const metadata = {
  title: 'Evaluación de Stands',
  description: 'Evaluación de stands escolares'
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}