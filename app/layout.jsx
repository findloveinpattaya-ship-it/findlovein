import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export const metadata = {
  title: 'FindLoveIn (Pattaya)',
  description: 'MVP'
};

export default function RootLayout({ children }){
  return (
    <html lang="hu">
      <body>
        <Header />
        <main className="p-6 max-w-3xl mx-auto">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
