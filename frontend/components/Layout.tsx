import Link from "next/link"; // Dynamic routing
import { eth } from "@state/eth"; // State management
import type { ReactElement } from "react"; // Types
import NextNProgress from "nextjs-progressbar"; // Navigation progress bar
import styles from "@styles/components/Layout.module.scss"; // Component styles
import Jazzicon, { jsNumberForAddress } from "react-jazzicon"; // Jazzicon

/**
 * Layout wrapper for application
 * @param {ReactElement} children to inject into content section
 * @returns {ReactElement} containing layout
 */
export default function Layout({
  children,
}: {
  children: ReactElement;
}): ReactElement {
  return (
    <div>
      {/* Navigation progress bar */}
      <NextNProgress
        color="#db0011"
        startPosition={0.3}
        stopDelayMs={200}
        height={3}
        options={{
          showSpinner: false,
        }}
      />

      {/* Top header component */}
      <Header />

      {/* Content */}
      <div className={styles.layout__content}>{children}</div>

      {/* Bottom footer component */}
      <Footer />
    </div>
  );
}

/**
 * Top header
 * @returns {ReactElement} top header component
 */
function Header(): ReactElement {
  // Collect auth state and unlock function
  const { address, unlock }: { address: null | string; unlock: Function } =
    eth.useContainer();

  return (
    <div className={styles.layout__header}>
      {/* Layout: left logo */}
      <div className={styles.layout__header_logo}>
        <Link href="/">
          <a>
            <img src="/vectors/logo.png" alt="logo"  />
          </a>
        </Link>
      </div>

      {/* Layout: right actions */}
      <div className={styles.layout__header_actions}>
        {/* Create button, redirect to /create */}
        {/* <Link href="/create">
          <a>Apply</a>
        </Link> */}

        {/* Authenticate wallet button */}
        <button onClick={() => unlock()}>
          {address == null ? (
            // Else, if not unlocked, show prompt string
            "Unlock"
          ) : address == "0xec49447195F1E64ceca67db1b7b5c23ccFfa21AD" ? (
            
            <>
              {/* Render address */} 
              <span>
                HSBC Manager
                {/* {address.substr(0, 6) +
                  "..." +
                  address.slice(address.length - 4)} */}
              </span>

              {/* Render avatar */}
              <Jazzicon diameter={16} seed={jsNumberForAddress(address)} />
            </>
          ) : (
            <>
              {/* Render address */} 
              <span>
                HSBC Customer
              </span>

              {/* Render avatar */}
              <Jazzicon diameter={16} seed={jsNumberForAddress(address)} />
            </>
          )}
        </button>
      </div>
    </div>
  );
}

/**
 * Bottom footer
 * @returns {ReactElement} bottom footer component
 */
function Footer(): ReactElement {
  return (
    <div className={styles.layout__footer}>
      {/* Credits */}
      <span>
      HSBC NFT Collateralized Lending Platform
      </span>
    </div>
  );
}
