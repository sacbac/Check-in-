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

// -------- INIT --------

async function init() {
  document.getElementById("todayDate").innerText =
    new Date().toDateString();

  if (isBaseApp()) {
    // ✅ Base Mini App: wallet is implicit
    const context = await window.baseSdk.context;
    userAccount = context?.user?.custodyAddress;

    if (userAccount) {
      showWallet(userAccount);
    }
  } else {
    // Browser: show connect button
    document
      .getElementById("connectWalletBtn")
      .classList.remove("hidden");

    document
      .getElementById("connectWalletBtn")
      .addEventListener("click", connectBrowserWallet);
  }
}

// -------- UI --------

function showWallet(addr) {
  document.getElementById("walletAddress").innerText =
    addr.slice(0, 6) + "..." + addr.slice(-4);
  document.getElementById("walletAddress").classList.remove("hidden");
}

// -------- BROWSER WALLET --------

async function connectBrowserWallet() {
  if (!window.ethereum) {
    alert("Install MetaMask");
    return;
  }

  const accounts = await window.ethereum.request({
    method: "eth_requestAccounts"
  });

  userAccount = accounts[0];
  showWallet(userAccount);
  document.getElementById("connectWalletBtn").innerText = "✅ Connected";
}

// -------- MINT --------

async function submitCheckIn() {
  if (!userAccount) {
    alert("Wallet not available");
    return;
  }

  if (!selectedMood) {
    alert("Select a mood");
    return;
  }

  const tokenURI =
    "https://check-in-amber-pi.vercel.app/metadata.json";

  if (isBaseApp()) {
    // ✅ Base Mini App transaction
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
    // ✅ Browser MetaMask
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);

    const tx = await contract.mintCheckInNFT(userAccount, tokenURI);
    await tx.wait();

    alert("NFT minted 🎉");
  }
}

// -------- MOODS --------

function selectMood(mood, e) {
  selectedMood = mood;
  document.querySelectorAll(".moods button")
    .forEach(b => b.classList.remove("selected"));
  e.target.classList.add("selected");
}

init();
