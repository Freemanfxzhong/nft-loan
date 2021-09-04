import Document, { Html, Head, Main, NextScript } from "next/document"; // Document

/**
 * Exports custom document to inject Head
 */
export default class PawnBankDocument extends Document {
  render() {
    return (
      <Html>
        {/* Custom Head */}
        <Head>
          {/* General Meta */}
          <title>HSBC NFT Collateralized Lending</title>
          <meta name="title" content="HSBC NFT Collateralized Lending" />
          <meta
            name="description"
            content="HSBC NFT Collateralized Lending is a platform for loans with valuable NFT. Borrow against your collection."
          />

          {/* Fonts */}
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link
            rel="preconnect"
            href="https://fonts.gstatic.com"
            crossOrigin="true"
          />
          <link
            href="https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;600;700&display=swap"
            rel="stylesheet"
          />

          {/* icon */}
          <link rel="shortcut icon" href="/hsbc.png" />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}
