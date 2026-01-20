let selectedMood = null;
let userAccount = null;

// ✅ Your Base Mainnet contract
const CONTRACT_ADDRESS = "0x730f889F90b0DbCB295704d05f8CD96c5514b1F5";

// Base Mainnet
const BASE_CHAIN_ID = "0x2105";

const CONTRACT_ABI = [
  "function mintCheckInNFT(address to, string tokenURI)"
];

function init() {
  document.getElementById("todayDate").textContent =
    new Date().toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric"
    });

  document
    .getElementById("connectWalletBtn")
    .addEventListener("click", connectWallet);
}

/* STEP 1: CONNECT WALLET */
async function connectWallet() {
  if (!window.ethereum) {
    alert("MetaMask not detected. Open in MetaMask browser.");
    return;
  }

  try {
    // ✅ First request accounts
    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts"
    });

    userAccount = accounts[0];

    // ✅ Then ensure Base network
    await ensureBaseNetwork();

    // ✅ Update UI
    document.getElementById("connectWalletBtn").textContent =
      "✅ Connected (Base)";

    const addr = document.getElementById("walletAddress");
    addr.textContent =
      `${userAccount.slice(0, 6)}...${userAccount.slice(-4)}`;
    addr.classList.remove("hidden");

  } catch (err) {
    console.error("Wallet connect error:", err);
    alert("Wallet connection cancelled or failed");
  }
}

/* STEP 2: ENSURE BASE NETWORK */
async function ensureBaseNetwork() {
  try {
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: BASE_CHAIN_ID }]
    });
  } catch (err) {
    // Chain not added
    if (err.code === 4902) {
      await window.ethereum.request({
        method: "wallet_addEthereumChain",
        params: [{
          chainId: BASE_CHAIN_ID,
          chainName: "Base Mainnet",
          nativeCurrency: {
            name: "Ethereum",
            symbol: "ETH",
            decimals: 18
          },
          rpcUrls: ["https://mainnet.base.org"],
          blockExplorerUrls: ["https://basescan.org"]
        }]
      });
    } else {
      throw err;
    }
  }
}

function selectMood(mood, event) {
  selectedMood = mood;
  document.querySelectorAll(".mood-btn").forEach(btn =>
    btn.classList.remove("selected")
  );
  event.currentTarget.classList.add("selected");
}

async function submitCheckIn() {
  if (!userAccount) return alert("Connect wallet first");
  if (!selectedMood) return alert("Select a mood");

  toggleLoading(true);

  try {
    await mintNFT();
    showSuccess();
  } catch (err) {
    if (err.reason?.includes("Already minted")) {
      alert("You already checked in today 🌙");
    } else {
      console.error(err);
      alert("Transaction failed");
    }
  }

  toggleLoading(false);
}

async function mintNFT() {
  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();

  const contract = new ethers.Contract(
    CONTRACT_ADDRESS,
    CONTRACT_ABI,
    signer
  );

  const metadata = {
    name: "Daily Check-In NFT",
    description: "One NFT per day emotional check-in",
    attributes: [
      { trait_type: "Mood", value: selectedMood },
      { trait_type: "Date", value: new Date().toDateString() }
    ]
  };

  const tokenURI =
    "data:application/json;base64," +
    btoa(JSON.stringify(metadata));

  const tx = await contract.mintCheckInNFT(userAccount, tokenURI);
  await tx.wait();
}

function toggleLoading(state) {
  document.getElementById("checkInForm").classList.toggle("hidden", state);
  document.getElementById("loadingState").classList.toggle("hidden", !state);
  document.getElementById("checkInBtn").disabled = state;
}

function showSuccess() {
  document.getElementById("successMessage").classList.remove("hidden");

  setTimeout(() => {
    document.getElementById("successMessage").classList.add("hidden");
    document.getElementById("checkInForm").classList.remove("hidden");
    selectedMood = null;
    document.querySelectorAll(".mood-btn").forEach(btn =>
      btn.classList.remove("selected")
    );
  }, 2500);
}

init();

