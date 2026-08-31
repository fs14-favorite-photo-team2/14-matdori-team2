import "./globals.css";
import Providers from "./providers";

export const metadata = {
  title: "맛도리마켓",
  description: "레시피 맛도리마켓",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}