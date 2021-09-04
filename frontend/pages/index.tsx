import axios from "axios"; // Axios
import Link from "next/link"; // Routing
import { eth } from "@state/eth"; // State: ETH
import Layout from "@components/Layout"; // Layout wrapper
import LoanCard from "@components/LoanCard"; // LoanCard component
import styles from "@styles/pages/Home.module.scss"; // Component styles
import { useRouter } from "next/dist/client/router"; // Router
import type { LoanWithMetadata } from "@utils/types"; // Types
import { ReactElement, useState, useEffect } from "react"; // React
import { loan } from "@state/loan";

/**
 * Home page
 * @returns {ReactElement}
 */
export default function Home(): ReactElement {
  // Navigation
  const router = useRouter();
  // Collect auth state and unlock function
  const { address, unlock }: { address: null | string; unlock: Function } =
  eth.useContainer();
  // Loan loading status
  const [loading, setLoading] = useState<boolean>(true);
  // My Active loan count
  const [count, setLoanCount] = useState<number>(0);
  // Individual loans retrieved from chain
  const [loans, setLoans] = useState<LoanWithMetadata[]>([]);
  /**
   * Collect loans from chain
   */
  async function collectLoans(): Promise<void> {
    setLoading(true); // Toggle loading
    //alert("begin loading")

    // Update data
    const { data } = await axios.get("/api/loans");
    setLoans(data);
    // loans.map((loan, i,) => {
    //   alert("i = " + i)
    //   if (address == loan.tokenOwner) {
    //     setLoanCount(count + 1)
    //     alert(count)
    //   }
    // })

    setLoading(false); // Toggle loading
  }

  // --> Lifecycle: collect loans on mount
  useEffect(() => {
    collectLoans();
  }, []);

  return (
    <Layout>
      <div>
        {/* Call to action header */}
        <div className={styles.home__cta}>
          <h1>Get loan with your NFTS</h1>
          <p>
          HSBC NFT Collateralized Lending is a platform for loans with valuable NFT. Borrow against your collection
          </p>

          {/* CTA action buttons */}
          <div>
            {/* Direct to create page */}
            { address == null ? (
              <Link href="#"><a onClick={() => unlock()}> Login </a></Link>
            ) : address == "0xec49447195F1E64ceca67db1b7b5c23ccFfa21AD" ? (
              <div/>
            ) : (
              <Link href="/create">
              <a>Apply Now</a>
              </Link>
            )}
          </div>
        </div>

        {/* Feature section of open loans */}
        <div className={styles.home__feature}>
          <div className="sizer">
            { address == null ? (
                <>
                <h2> Please Login </h2>
                <div className={styles.home__feature_text}>
                      <h3>No Loan Found</h3>
                      <p>Login here to apply for your first NFT loan.</p>
                </div>
                </>
              ) : address == "0xec49447195F1E64ceca67db1b7b5c23ccFfa21AD" ? (
                <>
                <h2> All Loan Applications </h2>
                <p>Total: {loans.length} loan applications.</p>
                { loading ? (
                    <div className={styles.home__feature_text}>
                      <h3>Loading loans...</h3>
                      <p>Please wait as we collect the loans from chain.</p>
                    </div>
                  ) : loans.length == 0 ? (
                    <div className={styles.home__feature_text}>
                      <h3>No Application Found</h3>
                      <p>No loan application found from chain.</p>
                    </div>
                  ) : (
                    <div className={styles.home__feature_loans}>
                    {
                      loans.map((loan, i,) => {
                        return (
                          <LoanCard
                            key={i}
                            name={loan.name}
                            description={loan.description}
                            contractAddress={loan.tokenAddress}
                            tokenOwner = {loan.tokenOwner}
                            imageURL={loan.imageURL}
                            tokenId={loan.tokenId.toString()}
                            onClickHandler={() => router.push(`/loan/${loan.loanId}`)}
                            loanDetails={{
                              interest: loan.interestRate,
                              amount: loan.loanAmount,
                              max: loan.maxLoanAmount,
                            }}
                          />
                        );
                      })
                    }
                    </div>
                  )
                }
                </>
              ) : (
                <>
                <h2> My Loans </h2>
                { loading ? (
                    <div className={styles.home__feature_text}>
                      <h3>Loading loans...</h3>
                      <p>Please wait as we collect the loans from chain.</p>
                    </div>
                  ) : loans.length == 0 ? (
                    <div className={styles.home__feature_text}>
                      <h3>No Loan Found</h3>
                      <p>Get Started to apply for your first NFT loan!.</p>
                    </div>
                  ) : (
                    <>
                    <p>Current: {count} loan is in effect.</p>
                    {count == 0 ? (
                      <div className={styles.home__feature_text}>
                        <h3>No Active Loan Found</h3>
                        <p>Your loan may already have been repaid, cheers!</p>
                      </div>
                    ) : (
                      <></>
                    )}
                    <div className={styles.home__feature_loans}>
                    {
                      loans.map((loan, i,) => {
                        if (address != loan.tokenOwner) return
                        return (
                          <LoanCard
                            key={i}
                            name={loan.name}
                            description={loan.description}
                            contractAddress={loan.tokenAddress}
                            tokenOwner = {loan.tokenOwner}
                            imageURL={loan.imageURL}
                            tokenId={loan.tokenId.toString()}
                            onClickHandler={() => router.push(`/loan/${loan.loanId}`)}
                            loanDetails={{
                              interest: loan.interestRate,
                              amount: loan.loanAmount,
                              max: loan.maxLoanAmount,
                            }}
                          />
                        );
                      })
                    }
                    </div>
                  </>
                  )
                }
                </>
              )
            }
            
          </div>
        </div>
      </div>
    </Layout>
  );
}
