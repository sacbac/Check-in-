let selectedMood = null;
let userAccount = null;
let rawProvider = null;

// ✅ Your Base Mainnet contract
const CONTRACT_ADDRESS = "0x730f889F90b0DbCB295704d05f8CD96c5514b1F5";
const BASE_CHAIN_ID_HEX = "0x2105";

const CONTRACT_ABI = [
  "function mintCheckInNFT(address to, string tokenURI)"
];

async function init() {
  document.getElementById("todayDate").textContent =
    new Date().toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric"
    });

  document
    .getElementById("connectWalletBtn")
    .addEventListener("click", connectWallet);

  // ✅ Tell Base Mini App we are ready
  if (window.baseSdk?.actions?.ready) {
    try {
      await window.baseSdk.actions.ready();
    } catch {}
  }
}

/* 🔑 GET ETH PROVIDER (BASE MINI APP OR METAMASK) */
async function getEthereumProvider() {
  // ✅ Base Mini App wallet
  if (window.baseSdk?.wallet?.getEthereumProvider) {
    return await window.baseSdk.wallet.getEthereumProvider();
  }

  // ✅ Normal browser MetaMask
  if (window.ethereum) {
    return window.ethereum;
  }

  throw new Error("No Ethereum wallet found");
}

/* 🔌 CONNECT WALLET */
async function connectWallet() {
  try {
    rawProvider = await getEthereumProvider();

    const accounts = await rawProvider.request({
      method: "eth_requestAccounts"
    });

    userAccount = accounts[0];

    // 🔁 Switch to Base (safe)
    try {
      await rawProvider.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: BASE_CHAIN_ID_HEX }]
      });
    } catch {}

    document.getElementById("connectWalletBtn").textContent =
      "✅ Wallet Connected";

    const addr = document.getElementById("walletAddress");
    addr.textContent =
      `${userAccount.slice(0, 6)}...${userAccount.slice(-4)}`;
    addr.classList.remove("hidden");

  } catch (err) {
    console.error(err);
    alert("Wallet connection failed");
  }
}

function selectMood(mood, event) {
  selectedMood = mood;
  document.querySelectorAll(".mood-btn").forEach(btn =>
    btn.classList.remove("selected")
  );
  event.currentTarget.classList.add("selected");
}

/* 🪙 MINT NFT */
async function submitCheckIn() {
  if (!userAccount) return alert("Connect wallet first");
  if (!selectedMood) return alert("Select a mood");

  toggleLoading(true);

  try {
    await mintNFT();
    showSuccess();
  } catch (err) {
    if (err?.reason?.includes("Already")) {
      alert("Already minted today 🌙");
    } else {
      console.error(err);
      alert("Mint failed");
    }
  }

  toggleLoading(false);
}

async function mintNFT() {
  const provider = new ethers.BrowserProvider(rawProvider);
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

/* 🎛 UI HELPERS */
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
