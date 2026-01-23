let selectedMood = null;
let userAccount = null;

// OLD CONTRACT
const CONTRACT_ADDRESS = "0x730f889F90b0DbCB295704d05f8CD96c5514b1F5";
const ABI = [
  "function mintCheckInNFT(address to, string tokenURI)"
];

function isBaseApp() {
  return typeof window.baseSdk !== "undefined";
}

/* ---------- INIT ---------- */
window.addEventListener("DOMContentLoaded", init);

async function init() {
  document.getElementById("todayDate").innerText =
    new Date().toDateString();

  // Mood buttons
  document.querySelectorAll(".moods button").forEach(btn => {
    btn.addEventListener("click", () => {
      selectedMood = btn.dataset.mood;
      document.querySelectorAll(".moods button")
        .forEach(b => b.classList.remove("selected"));
      btn.classList.add("selected");
    });
  });

  // Mint button
  document.getElementById("mintBtn")
    .addEventListener("click", submitCheckIn);

  // Wallet logic
  if (isBaseApp()) {
    try {
      const ctx = await window.baseSdk.context;
      userAccount = ctx?.user?.custodyAddress;
      if (userAccount) showWallet(userAccount);
    } catch {}
  } else {
    const btn = document.getElementById("connectWalletBtn");
    btn.classList.remove("hidden");
    btn.addEventListener("click", connectBrowserWallet);
  }
}

/* ---------- UI ---------- */
function showWallet(addr) {
  const el = document.getElementById("walletAddress");
  el.innerText = addr.slice(0, 6) + "..." + addr.slice(-4);
  el.classList.remove("hidden");
}

/* ---------- BROWSER WALLET ---------- */
async function connectBrowserWallet() {
  if (!window.ethereum) {
    alert("Please install MetaMask");
    return;
  }

  const accounts = await window.ethereum.request({
    method: "eth_requestAccounts"
  });

  userAccount = accounts[0];
  showWallet(userAccount);
}

/* ---------- MINT ---------- */
async function submitCheckIn() {
  if (!userAccount) {
    alert("Wallet not connected");
    return;
  }

  if (!selectedMood) {
    alert("Please select a mood");
    return;
  }

  const tokenURI =
    "https://check-in-amber-pi.vercel.app/metadata.json";

  if (isBaseApp()) {
    // Base Mini App tx
    const iface = new ethers.Interface(ABI);
    const data = iface.encodeFunctionData(
      "mintCheckInNFT",
      [userAccount, tokenURI]
    );

    await window.baseSdk.wallet.sendTransaction({
      to: CONTRACT_ADDRESS,
      data
    });

    alert("NFT minted 🎉");
  } else {
    // Browser MetaMask
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);

    const tx = await contract.mintCheckInNFT(userAccount, tokenURI);
    await tx.wait();

    alert("NFT minted 🎉");
  }
}
