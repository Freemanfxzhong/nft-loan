import axios from "axios"; // Axios requests
import { eth } from "@state/eth"; // State: ETH
import { loan } from "@state/loan"; // State: Loans
import { toast } from "react-toastify"; // Toast notifications
import Layout from "@components/Layout"; // Layout wrapper
import DatePicker from "react-datepicker"; // Datepicker
import LoanCard from "@components/LoanCard"; // Component: Loancard
import styles from "@styles/pages/Create.module.scss"; // Component styles
import { ReactElement, useEffect, useState } from "react"; // State management
import { NextRouter, useRouter } from "next/dist/client/router"; // Next router

/**
 * Selection states
 */
enum State {
  selectNFT = 0,
  setTerms = 1,
  evaluating = 2,
}

export default function Create() {
  // Page navigation router
  const router: NextRouter = useRouter();

  // Global state
  const { address, unlock }: { address: string | null; unlock: Function } =
    eth.useContainer();
  const { createLoan }: { createLoan: Function } = loan.useContainer();

  // Current page state (Select / Set)
  const [state, setState] = useState<number>(State.selectNFT);
  // Number of retrieved NFTs (used for pagination)
  const [numOSNFTs, setNumOSNFTs] = useState<number>(0);
  // List of ERC721 NFTs
  const [NFTList, setNFTList] = useState<Object[]>([]);
  // Loading status (for retrieval and buttons)
  const [loading, setLoading] = useState<boolean>(false);
  // Currently selected NFT details
  const [selected, setSelected] = useState<Object | null>(null);
  // Parameter: Interest to pay
  const [interest, setInterest] = useState<number>(10);
  // Parameter: Maximum amount to loan (bid ceiling)
  const [maxAmount, setMaxAmount] = useState<number>(30000);
  // Parameter: Timestamp of loan completion
  const [loanCompleted, setLoanCompleted] = useState<number>(
    new Date().setDate(new Date().getDate() + 90)
  );

  /**
   * Renders button based on current state
   * @returns {ReactElement} button
   */
  function renderActionButton() {
    if (!address) {
      // Not authenticated
      return <button onClick={() => unlock()}>Login</button>;
    } else if (state === State.selectNFT && selected) {
      // NFT selected
      return (
        <button onClick={() => {setState(State.evaluating); setTimeout(function () {setState(State.setTerms)}, 5000)}}>Go to evaluate</button>
      );
    } else if (state === State.evaluating) {
      return (
        // <button onClick={() => setState(State.setTerms)}>evaluating</button>
        <></>
      );
    } else if (state === State.selectNFT) {
      // No NFT selected
      return <button disabled>Must select NFT</button>;
    } else if (
      state === State.setTerms &&
      (!interest || !maxAmount || !loanCompleted)
    ) {
      // Missing terms
      return <button disabled>Must enter terms</button>;
    } else if (state === State.setTerms && !loading) {
      // Ready to create loan
      return <button onClick={createLoanWithLoading}>Confirm</button>;
    } else if (state === State.setTerms) {
      // Pending loan creation
      return <button disabled>Processing in the chain...</button>;
    }
  }

  /**
   * Filters array of all NFTs to only ERC721 schema qualifiers
   * @param {Object[]} assets all NFTs
   * @returns {Object[]} filtered ERC721 assets
   */
  function filter721(assets: Object[]): Object[] {
    return assets.filter(
      // Match for schema_name === "ERC721"
      (asset) => asset.asset_contract.schema_name === "ERC721"
    );
  }

  /**
   * Collects ERC721 NFTs from OpenSea API
   */
  async function collectNFTs(): Promise<void> {
    setLoading(true); // Toggle loading

    // Collect NFTs from OpenSea
    try {
      const response = await axios.get(
        `https://rinkeby-api.opensea.io/api/v1/assets?owner=${address}&order_direction=desc&offset=${numOSNFTs}&limit=9`
      );
      setNumOSNFTs(response.data.assets.length); // Update number of retrieved NFTs
      // Update ERC721 nfts
      setNFTList([...NFTList, ...filter721(response.data.assets)]);
    } catch {
      // Toast error if retrieval fails
      toast.error("Error when collecting wallet NFT's.");
    }

    setLoading(false); // Toggle loading
  }

  /**
   * Creates a loan, with toggled loading
   */
  async function createLoanWithLoading(): Promise<void> {
    setLoading(true); // Toggle loading

    try {
      // Create loan
      const loanId = await createLoan(
        selected.asset_contract.address,
        selected.token_id,
        interest,
        maxAmount/10000,
        loanCompleted,
        {
          imageURL: selected.image_preview_url ?? "",
          name: selected.name ?? "Untitled",
          description: selected.description ?? "No Description",
        }
      );
      // Prompt success
      toast.success("Successfully created loan! Redirecting...");
      // Reroute to loan page
      router.push(`/loan/${loanId}`);
    } catch {
      // On error, prompt
      toast.error("Error when attempting to create loan.");
    }

    setLoading(false); // Toggle loading
  }

  // -> Lifecycle: on address update
  useEffect(() => {
    // Collect NFTs if authenticated
    if (address) collectNFTs();
  }, [address]);

  return (
    <Layout>
      <div className="sizer">
        <div className={styles.create}>
          {/* Create page title */}
          <h1>Loan Application</h1>
          <p>Select an NFT and choose your terms.</p>

          <div className={styles.create__action}>
            {/* Action card phases */}
            <div className={styles.create__action_phase}>
              {/* Select NFT */}
              <div
                className={
                  state == State.selectNFT
                    ? styles.create__action_active
                    : undefined
                }
              >
                <span>Select NFT</span>
              </div>

              {/* Evaluating */}
              <div
                className={
                  state == State.evaluating
                    ? styles.create__action_active
                    : undefined
                }
              >
                <span>Evaluating</span>
              </div>

              {/* Set Terms */}
              <div
                className={
                  state == State.setTerms
                    ? styles.create__action_active
                    : undefined
                }
              >
                <span>Set Terms</span>
              </div>
            </div>

            {/* Action card content */}
            <div className={styles.create__action_content}>
              {address ? (
                // If user is authenticated
                state === State.selectNFT ? (
                  // If the current state is NFT selection
                  <div className={styles.create__action_select}>
                    {NFTList.length > 0 ? (
                      // If > 0 NFTs exist in user wallet
                      <>
                        <div className={styles.create__action_select_list}>
                          {NFTList.map((nft, i) => {
                            // Render each NFT
                            return (
                              <LoanCard
                                key={i}
                                onClickHandler={() => setSelected(nft)}
                                selected={
                                  selected?.token_id === nft.token_id &&
                                  selected?.asset_contract?.address ===
                                    nft.asset_contract.address
                                }
                                imageURL={nft.image_preview_url}
                                name={nft.name ?? "Untitled"}
                                description={
                                  nft.description ?? "No description"
                                }
                                contractAddress={nft.asset_contract.address}
                                tokenId={nft.token_id}
                              />
                            );
                          })}
                        </div>

                        {numOSNFTs % 9 == 0 && !loading ? (
                          // If user capped limit of OpenSea pull, allow pulling more
                          <div className={styles.create__action_select_more}>
                            <button onClick={collectNFTs}>
                              Load more NFTs
                            </button>
                          </div>
                        ) : null}
                      </>
                    ) : (
                      // If user does not own NFTs
                      <NoOwnedNFTs />
                    )}
                    {loading ? (
                      // If user NFTs are being loaded
                      <CreateLoadingNFTs />
                    ) : null}
                  </div>
                ) : state == State.setTerms ? (
                  // Enable user input of terms
                  <div className={styles.create__action_terms}>
                    {/* Prefilled NFT Contract Address */}
                    <div>
                      <h3>NFT Contract Address</h3>
                      <p>Contract address for ERC721-compliant NFT.</p>
                      <input
                        type="text"
                        value={selected.asset_contract.address}
                        disabled
                      />
                    </div>

                    {/* Prefilled NFT ID */}
                    <div>
                      <h3>NFT ID</h3>
                      <p>Unique identifier for your NFT.</p>
                      <input type="text" value={selected.token_id} disabled />
                    </div>

                    {/* User input: Interest Rate */}
                    <div>
                      <h3>Interest Rate (%)</h3>
                      <p>
                      Interest rate calculated based on the term of the loan you choose and the evaluated market value of your NFT
                      </p>
                      <input
                        id="interstInput"
                        type="number"
                        step="0.01"
                        placeholder="9"
                        min="0.01"
                        value={interest}
                        disabled
                        onChange={(e) => setInterest(Number(e.target.value))}
                      />
                    </div>

                    {/* User input: max loan amount */}
                    <div>
                      <h3>Max Loan Amount (USD)</h3>
                      <p>
                      Maximum loan amount calculated based on the evaluated market value of your NFT
                      </p>
                      <input
                        type="number"
                        placeholder="30000"
                        step="1000"
                        min="10000"
                        max="30000"
                        value={maxAmount}
                        onChange={(e) => setMaxAmount(Number(e.target.value))}
                      />
                    </div>

                    {/* User input: Loan termination date */}
                    <div>
                      <h3>Loan Term</h3>
                      <p>The loan term you may choose</p>
                      {/* <DatePicker
                        selected={loanCompleted}
                        onChange={(date) => setLoanCompleted(date)}
                        showTimeSelect
                        minDate={new Date()}
                      /> */}
                      <select name="terms" 
                      onChange={(e) => {
                        setLoanCompleted(new Date().setDate(new Date().getDate() + Number(e.target.value)));
                        setInterest(Math.round(Number(e.target.value) / 180 + 9));
                        }}>
                          <option value="90">3 Month (Interest Rate: 10%)</option>
                          <option value="180">6 Month (Interest Rate: 10%)</option>
                          <option value="365">1 Year (Interest Rate: 11%)</option>
                          <option value="730">2 Year (Interest Rate: 13%)</option>
                      </select>
                    </div>
                  </div>
                ) : (
                  <>
                  <img src="/loading red 5.gif" alt="loading"  />
                  <p>Evaluating your NFT Now, Please wait.</p>
                  </>
                  
                )
              ) : (
                // If user is unauthenticated
                <CreateUnauthenticated />
              )}
            </div>
          </div>

          {/* Render action buttons */}
          <div className={styles.create__button}>{renderActionButton()}</div>
        </div>
      </div>
    </Layout>
  );
}

/**
 * State when user has not authenticated
 * @returns {ReactElement}
 */
function CreateUnauthenticated(): ReactElement {
  return (
    <div className={styles.create__action_content_unauthenticated}>
      <img src="/vectors/unlock.svg" height="30px" alt="Unlock" />
      <h3>Login wallet</h3>
      <p>Please connect your wallet to get started.</p>
    </div>
  );
}

/**
 * State when user's NFTs are loading
 * @returns {ReactElement}
 */
function CreateLoadingNFTs(): ReactElement {
  return (
    <div className={styles.create__action_loading}>
      <span>Loading NFTs...</span>
    </div>
  );
}

/**
 * State when user does not own any ERC721 NFTs
 * @returns {ReactElement}
 */
function NoOwnedNFTs(): ReactElement {
  return (
    <div className={styles.create__action_content_unauthenticated}>
      <img src="/vectors/empty.svg" alt="Empty" height="30px" />
      <h3>No NFTs in wallet.</h3>
      <p>Please mint NFTs before trying to create loan.</p>
    </div>
  );
}
